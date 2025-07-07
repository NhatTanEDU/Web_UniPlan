/* eslint-disable @typescript-eslint/no-unused-vars */
// pages/Admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../components/Admin/types'; // Import type User từ các file components
import adminApi from '../../services/admin'; // Import API quản lý người dùng
import { LucideEdit, LucideTrash2, X } from 'lucide-react'; // Import các icon từ lucide-react
import { format } from 'date-fns'; // Import thư viện định dạng ngày tháng

const AdminUserManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]); // State lưu danh sách người dùng
    const [loading, setLoading] = useState(true); // State theo dõi trạng thái đang tải dữ liệu
    const [error, setError] = useState<string | null>(null); // State lưu lỗi nếu có
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle'); // Trạng thái kết nối với backend
    const [editingUser, setEditingUser] = useState<User | null>(null); // User đang chỉnh sửa
    const [editFormData, setEditFormData] = useState<Partial<User>>({}); // Dữ liệu form chỉnh sửa
    const [message, setMessage] = useState<string | null>(null); // Thông báo thành công
    const [userToDelete, setUserToDelete] = useState<User | null>(null); // Dữ liệu người dùng đang xoá

    // useEffect để tải danh sách người dùng khi trang load
    useEffect(() => {
        fetchUsersWithStatus();
    }, []);

    // Hàm tải danh sách người dùng từ backend
    const fetchUsersWithStatus = async () => {
        setLoading(true); // Set loading true khi bắt đầu gọi API
        setError(null); // Reset lỗi
        setConnectionStatus('idle'); // Set trạng thái kết nối là idle
        try {
            const response = await adminApi.getUsers(); // Gọi API lấy danh sách người dùng
            setUsers(response); // Lưu danh sách người dùng vào state
            setConnectionStatus('success'); // Set kết nối thành công
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi'); // Set lỗi nếu có
            setConnectionStatus('error'); // Set kết nối thất bại
        } finally {
            setLoading(false); // Set loading false sau khi gọi API xong
        }
    };

    // Hàm xử lý khi click vào nút chỉnh sửa người dùng
    const handleEdit = (user: User) => {
        setEditingUser(user); // Set người dùng cần chỉnh sửa
        setEditFormData({ name: user.name, email: user.email }); // Lấy dữ liệu người dùng vào form
        setMessage(null); // Reset thông báo thành công
        setError(null); // Reset lỗi
    };

    // Hàm xử lý thay đổi input khi chỉnh sửa thông tin người dùng
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value })); // Cập nhật dữ liệu form khi có thay đổi
    };

    // Hàm xử lý cập nhật người dùng sau khi chỉnh sửa
    const handleUpdate = async () => {
        if (!editingUser?._id) return; // Kiểm tra xem có id người dùng để update không
        try {
            await adminApi.updateUser(editingUser._id, editFormData); // Gọi API để cập nhật thông tin người dùng
            setMessage('User updated successfully!'); // Thông báo cập nhật thành công
            setError(null); // Reset lỗi
            fetchUsersWithStatus(); // Lấy lại danh sách người dùng
            setEditingUser(null); // Reset người dùng đang chỉnh sửa
            setEditFormData({}); // Reset dữ liệu form
        } catch (err: any) {
            setError(err.message || 'Cập nhật thất bại'); // Thông báo lỗi nếu có
            setMessage(null); // Reset thông báo thành công
        }
    };

    // Hàm xử lý xóa người dùng
    const handleDelete = async (id: string) => {
        try {
            await adminApi.deleteUser(id); // Gọi API để xóa người dùng theo id
            setMessage('User deleted successfully!'); // Thông báo xóa thành công
            setError(null); // Reset lỗi
            fetchUsersWithStatus(); // Lấy lại danh sách người dùng
            setUserToDelete(null); // Reset người dùng đang xóa
        } catch (err: any) {
            setError(err.message || 'Xoá thất bại'); // Thông báo lỗi nếu có
            setMessage(null); // Reset thông báo thành công
        }
    };

    // Nếu đang tải dữ liệu, hiển thị thông báo
    if (loading) return <p className="text-gray-600 p-4">Đang tải người dùng...</p>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">User Management</h2>

            {/* Hiển thị thông báo kết nối thành công */}
            {connectionStatus === 'success' && (
                <div className="bg-green-100 text-green-800 border border-green-300 rounded px-4 py-2 mb-4">
                    ✅ Kết nối với Backend thành công!
                </div>
            )}

            {/* Hiển thị thông báo kết nối thất bại */}
            {connectionStatus === 'error' && (
                <div className="bg-red-100 text-red-800 border border-red-300 rounded px-4 py-2 mb-4">
                    ❌ Không thể kết nối với Backend.
                    {error && <p className="text-sm mt-1">{error}</p>}
                </div>
            )}

            {/* Thông báo thành công khi cập nhật hoặc xóa */}
            {message && <p className="text-green-600 mb-4">{message}</p>}
            {/* Thông báo lỗi */}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="overflow-x-auto rounded-lg shadow border bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Thêm thẻ tiêu đề cho các cột */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Hiển thị danh sách người dùng */}
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                {/* Hiển thị thông tin người dùng */}
                                <td className="px-4 py-2 text-sm text-gray-800">{user._id}</td> {/* Sửa ID để hiển thị đầy đủ */}
                                <td className="px-4 py-2 text-sm text-gray-800">{user.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{user.email}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                    {user.createdAt && format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')} {/* Hiển thị thời gian tạo */}
                                </td>
                                <td className="px-4 py-2 text-sm text-right space-x-2">
                                    {/* Các nút hành động: Chỉnh sửa và Xóa */}
                                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800">
                                        <LucideEdit className="inline w-4 h-4" />
                                    </button>
                                    <button onClick={() => setUserToDelete(user)} className="text-red-600 hover:text-red-800">
                                        <LucideTrash2 className="inline w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal xác nhận xoá */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={() => setUserToDelete(null)}
                            aria-label="Đóng hộp thoại xác nhận"
                            title="Đóng"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Xác nhận xoá người dùng</h2>
                        <p className="text-gray-700 mb-4">
                            Bạn có chắc chắn muốn xoá người dùng <strong>{userToDelete.name}</strong>?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setUserToDelete(null)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={() => handleDelete(userToDelete._id)}
                            >
                                Xác nhận xoá
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagementPage;
