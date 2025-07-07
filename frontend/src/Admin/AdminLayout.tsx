import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LucideUsers, LucideLayoutDashboard } from 'lucide-react';

const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="bg-gray-800 text-white w-64 fixed top-0 left-0 h-full py-8 px-4">
                <div className="text-2xl font-semibold mb-6">Admin Panel</div>
                <nav className="space-y-2">
                    <Link to="/admin" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-700">
                        <LucideLayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link to="/admin/users" className="flex items-center py-2 px-3 rounded-md hover:bg-gray-700">
                        <LucideUsers className="mr-2 h-4 w-4" />
                        User Management
                    </Link>
                    {/* Thêm các link quản lý khác nếu cần */}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="ml-64 py-8 px-6">
                <Outlet /> {/* Nơi các route con sẽ được render */}
            </div>
        </div>
    );
};

export default AdminLayout;