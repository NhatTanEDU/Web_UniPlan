// backend/controllers/personalMemberList.controller.js
const PersonalMemberList = require('../models/personalMemberList.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Lấy danh sách thành viên cá nhân của user hiện tại
exports.getPersonalMembers = async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.user.id);

        // 1. ĐỌC TẤT CẢ THAM SỐ TỪ QUERY
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'added_at', // Mặc định sắp xếp theo ngày thêm
            sortOrder = 'desc'  // Mặc định mới nhất lên đầu
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // 2. XÂY DỰNG LOGIC $match VÀ $sort ĐỘNG
        let matchStage = { 
            owner_user_id: ownerId,
            is_active: true  // Chỉ lấy thành viên active
        };

        // Xây dựng object sắp xếp động
        const sort = {};
        const sortFieldMapping = {
            'name': 'member_user_data.full_name', // Sắp xếp theo tên của user được populate
            'added_at': 'added_at'
        };
        const mappedSortField = sortFieldMapping[sortBy] || 'added_at';
        sort[mappedSortField] = sortOrder === 'asc' ? 1 : -1;

        // Bắt đầu xây dựng pipeline
        let pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'member_user_id',
                    foreignField: '_id',
                    as: 'member_user_data'
                }
            },
            {
                $unwind: "$member_user_data" // Chuyển mảng thành object để dễ truy vấn
            }
        ];

        // Thêm điều kiện tìm kiếm nếu có
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'member_user_data.full_name': { $regex: search, $options: 'i' } },
                        { 'member_user_data.email': { $regex: search, $options: 'i' } },
                        { 'custom_role': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Pipeline để đếm tổng số kết quả (trước khi phân trang)
        const countPipeline = [...pipeline, { $count: "total" }];

        // 3. THÊM LOGIC SẮP XẾP VÀ PHÂN TRANG VÀO PIPELINE CHÍNH
        pipeline.push(
            { $sort: sort }, // <-- Áp dụng sắp xếp động
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $project: { // Chỉ lấy những trường cần thiết
                    _id: 1,
                    custom_role: 1,
                    notes: 1,
                    is_active: 1,
                    added_at: 1,
                    member_user_id: "$member_user_data" // Lấy toàn bộ object user đã populate
                }
            }
        );

        // Chạy cả hai pipeline song song với timeout để tăng tốc
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 25000)
        );
        
        const [members, totalResult] = await Promise.race([
            Promise.all([
                PersonalMemberList.aggregate(pipeline),
                PersonalMemberList.aggregate(countPipeline)
            ]),
            timeoutPromise
        ]);

        const total = totalResult.length > 0 ? totalResult[0].total : 0;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách thành viên thành công',
            data: members,
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_items: total,
                items_per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách thành viên:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách thành viên',
                error: error.message
            });
        }
    }
};

// Thêm thành viên mới vào danh sách cá nhân
exports.addPersonalMember = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { member_user_id, custom_role, notes } = req.body;
        console.log('🔍 DEBUG addPersonalMember - ownerId:', ownerId);
        console.log('🔍 DEBUG addPersonalMember - member_user_id:', member_user_id);
        console.log('🔍 DEBUG addPersonalMember - body:', req.body);

        // Kiểm tra input
        if (!member_user_id) {
            return res.status(400).json({
                success: false,
                message: 'ID thành viên là bắt buộc'
            });
        }

        // Kiểm tra member_user_id có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(member_user_id)) {
            return res.status(400).json({
                success: false,
                message: 'ID thành viên không hợp lệ'
            });
        }

        // Kiểm tra user tồn tại
        const memberUser = await User.findById(member_user_id);
        if (!memberUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng với ID này'
            });
        }

        // Kiểm tra không cho phép thêm chính mình
        if (ownerId === member_user_id) {
            return res.status(400).json({
                success: false,
                message: 'Không thể thêm chính mình vào danh sách thành viên'
            });
        }

        // Kiểm tra thành viên đã tồn tại chưa
        const existingMember = await PersonalMemberList.findOne({
            owner_user_id: ownerId,
            member_user_id: member_user_id
        });

        if (existingMember) {
            if (existingMember.is_active) {
                return res.status(409).json({
                    success: false,
                    message: 'Thành viên này đã có trong danh sách của bạn'
                });
            } else {
                // Nếu đã tồn tại nhưng is_active = false, thì kích hoạt lại
                existingMember.is_active = true;
                existingMember.custom_role = custom_role || existingMember.custom_role;
                existingMember.notes = notes || existingMember.notes;
                existingMember.added_at = new Date();
                
                await existingMember.save();
                  const populatedMember = await PersonalMemberList.findById(existingMember._id)
                    .populate('member_user_id', 'name full_name email avatar_url online_status role');

                return res.status(200).json({
                    success: true,
                    message: 'Đã kích hoạt lại thành viên trong danh sách',
                    data: populatedMember
                });
            }
        }

        // Tạo thành viên mới
        const newMember = new PersonalMemberList({
            owner_user_id: ownerId,
            member_user_id,
            custom_role,
            notes
        });

        await newMember.save();        // Populate để trả về thông tin đầy đủ
        const populatedMember = await PersonalMemberList.findById(newMember._id)
            .populate('member_user_id', 'name full_name email avatar_url online_status role');

        res.status(201).json({
            success: true,
            message: 'Thêm thành viên vào danh sách thành công',
            data: populatedMember
        });
    } catch (error) {
        console.error('Lỗi khi thêm thành viên:', error);
        
        // Kiểm tra response đã được gửi chưa
        if (res.headersSent) {
            return;
        }
        
        // Xử lý lỗi unique constraint
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Thành viên này đã có trong danh sách của bạn'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm thành viên',
            error: error.message
        });
    }
};

// Cập nhật thông tin thành viên trong danh sách
exports.updatePersonalMember = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { id } = req.params;
        const { custom_role, notes, is_active } = req.body;

        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        // Tìm và cập nhật
        const member = await PersonalMemberList.findOneAndUpdate(
            { 
                _id: id, 
                owner_user_id: ownerId 
            },
            { 
                custom_role, 
                notes, 
                is_active,
                ...(is_active !== undefined && { added_at: new Date() })
            },
            { new: true }
        ).populate('member_user_id', 'name email avatar_url online_status role');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên trong danh sách của bạn'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành viên thành công',
            data: member
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật thành viên:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật thành viên',
                error: error.message
            });
        }
    }
};

// Xóa thành viên khỏi danh sách (soft delete)
exports.removePersonalMember = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { id } = req.params;

        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        // Soft delete - chỉ set is_active = false
        const member = await PersonalMemberList.findOneAndUpdate(
            { 
                _id: id, 
                owner_user_id: ownerId 
            },
            { 
                is_active: false 
            },
            { new: true }
        ).populate('member_user_id', 'name email avatar_url online_status role');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên trong danh sách của bạn'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa thành viên khỏi danh sách',
            data: member
        });
    } catch (error) {
        console.error('Lỗi khi xóa thành viên:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa thành viên',
                error: error.message
            });
        }
    }
};

// Xóa vĩnh viễn thành viên khỏi danh sách
exports.permanentDeletePersonalMember = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { id } = req.params;

        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        // Xóa vĩnh viễn
        const member = await PersonalMemberList.findOneAndDelete({
            _id: id,
            owner_user_id: ownerId
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên trong danh sách của bạn'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa vĩnh viễn thành viên khỏi danh sách',
            data: { id: member._id }
        });
    } catch (error) {
        console.error('Lỗi khi xóa vĩnh viễn thành viên:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa vĩnh viễn thành viên',
                error: error.message
            });
        }
    }
};

// Tìm kiếm người dùng để thêm vào danh sách
exports.searchUsersToAdd = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { query, page = 1, limit = 10 } = req.query;

        console.log('🔍 DEBUG searchUsersToAdd - ownerId:', ownerId);
        console.log('🔍 DEBUG searchUsersToAdd - query:', query);

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'
            });
        }

        const skip = (page - 1) * limit;

        // Tìm kiếm user theo tên hoặc email
        const searchRegex = new RegExp(query.trim(), 'i');
        
        // Lấy danh sách ID của những người đã có trong danh sách
        const existingMemberIds = await PersonalMemberList.find({
            owner_user_id: ownerId,
            is_active: true
        }).distinct('member_user_id');
        
        console.log('🔍 DEBUG searchUsersToAdd - existingMemberIds:', existingMemberIds);
        
        // Thêm chính owner vào danh sách loại trừ
        existingMemberIds.push(new mongoose.Types.ObjectId(ownerId));
        
        // Xây dựng điều kiện tìm kiếm - thử cả isActive và is_active
        const searchConditions = {
            _id: { $nin: existingMemberIds },
            $and: [
                {
                    $or: [
                        { isActive: true },
                        { is_active: true },
                        { isActive: { $ne: false } },
                        { is_active: { $ne: false } }
                    ]
                }
            ],
            $or: [
                { full_name: searchRegex },
                { name: searchRegex },
                { email: searchRegex }
            ]
        };

        console.log('🔍 DEBUG searchUsersToAdd - searchConditions:', JSON.stringify(searchConditions, null, 2));

        // Tạo timeout promise
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Search query timeout')), 15000)
        );

        // Tìm kiếm users với timeout
        const [users, total] = await Promise.race([
            Promise.all([
                User.find(searchConditions)
                    .select('full_name name email avatar_url online_status role isActive is_active')
                    .skip(skip)
                    .limit(parseInt(limit))
                    .sort({ full_name: 1 }),
                User.countDocuments(searchConditions)
            ]),
            timeoutPromise
        ]);
        
        console.log('🔍 DEBUG searchUsersToAdd - found users:', users.length);
        if (users.length > 0) {
            console.log('🔍 DEBUG searchUsersToAdd - first user:', users[0]);
        }

        console.log('🔍 DEBUG searchUsersToAdd - total count:', total);

        res.status(200).json({
            success: true,
            message: 'Tìm kiếm người dùng thành công',
            data: users,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_items: total,
                items_per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Lỗi khi tìm kiếm người dùng:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi tìm kiếm người dùng',
                error: error.message
            });
        }
    }
};

// Lấy chi tiết một thành viên trong danh sách
exports.getPersonalMemberDetail = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { id } = req.params;

        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID không hợp lệ'
            });
        }

        const member = await PersonalMemberList.findOne({
            _id: id,
            owner_user_id: ownerId
        }).populate('member_user_id', 'name email avatar_url online_status role current_plan_type');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên trong danh sách của bạn'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy chi tiết thành viên thành công',
            data: member
        });
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết thành viên:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy chi tiết thành viên',
                error: error.message
            });
        }
    }
};
