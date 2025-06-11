const ProjectType = require('../models/projectType.model.js');
const Project = require('../models/project.model.js');

/**
 * Lấy tất cả phân loại dự án
 */
exports.getAllProjectTypes = async (req, res) => {
    try {
        const projectTypes = await ProjectType.find().lean();
        res.json(projectTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Tạo phân loại dự án mới
 * Yêu cầu có token (verifyToken middleware)
 */
exports.createProjectType = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId; // Lấy userId từ token

        // Kiểm tra phân loại đã tồn tại
        const existingType = await ProjectType.findOne({ name, userId });
        if (existingType) {
            return res.status(400).json({ message: "Phân loại này đã tồn tại" });
        }

        const projectType = new ProjectType({ name, userId });
        const savedType = await projectType.save();

        // Emit sự kiện socket
        if (req.server && req.server.io && userId) {
            req.server.io.to(userId).emit('project_type_changed');
        }

        res.status(201).json(savedType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Lấy tất cả phân loại kèm dự án
 */
exports.getAllProjectTypesWithProjects = async (req, res) => {
    try {
        const projectTypes = await ProjectType.find().lean();

        const results = await Promise.all(projectTypes.map(async (type) => {
            const projects = await Project.find({ project_type_id: type._id }).lean();
            return { ...type, projects };
        }));

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Lấy phân loại theo id kèm danh sách dự án
 */
exports.getProjectTypeWithProjectsById = async (req, res) => {
    try {
        const projectType = await ProjectType.findById(req.params.id).lean();
        if (!projectType) {
            return res.status(404).json({ message: "Không tìm thấy phân loại dự án" });
        }

        const projects = await Project.find({ project_type_id: projectType._id }).lean();
        res.json({ ...projectType, projects });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Xóa phân loại dự án
 * Yêu cầu token (verifyToken middleware)
 * Nếu có force=true sẽ cập nhật dự án sang phân loại mặc định trước khi xóa
 */
exports.deleteProjectType = async (req, res) => {
    try {
        const { id } = req.params;
        const { force } = req.body;
        const userId = req.user.userId;

        const projectType = await ProjectType.findOne({ _id: id, userId });
        if (!projectType) {
            return res.status(404).json({ message: "Không tìm thấy phân loại hoặc không có quyền" });
        }

        const relatedProjects = await Project.find({ project_type_id: id });

        if (relatedProjects.length > 0 && !force) {
            return res.status(400).json({ message: "Phân loại này đang được sử dụng. Không thể xóa!" });
        }

        if (relatedProjects.length > 0 && force) {
            const defaultType = await exports.getDefaultProjectType(userId);
            await Project.updateMany({ project_type_id: id }, { project_type_id: defaultType._id });
        }

        await ProjectType.deleteOne({ _id: id });

        if (req.server && req.server.io) {
            req.server.io.to(userId).emit('project_type_changed');
        }

        res.json({ message: "Đã xóa phân loại thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa phân loại", error: error.message });
    }
};

/**
 * Lấy hoặc tạo phân loại mặc định "Không phân loại" cho user
 */
exports.getDefaultProjectType = async (userId) => {
    try {
        let defaultType = await ProjectType.findOne({ name: "Không phân loại", userId }).lean();

        if (!defaultType) {
            defaultType = await ProjectType.create({
                name: "Không phân loại",
                userId,
                description: "Phân loại mặc định cho các dự án"
            });
        }

        return defaultType;
    } catch (error) {
        console.error('Lỗi khi tạo phân loại mặc định:', error);
        throw error;
    }
};
