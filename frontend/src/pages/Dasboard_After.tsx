import React, { useState, useCallback, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import Header from "../components/After/Header";
import Sidebar from "../components/After/Sidebar";
import Footer from "../components/Footer";
import TopButton from "../components/TopButton";
import Breadcrumb from "../components/After/Breadcrumb";
import WidgetIntroduce from "../components/widget/introduce";
import WidgetSchedule from "../components/widget/schedule";
import WidgetCustomize from "../components/widget/customize";
import GanttTab from "../components/After/tab/gantt/GanttTab";
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'; // Import useSearchParams

// Định nghĩa kiểu cho các widget có sẵn
type AvailableWidgets = {
    [key: string]: {
        label: string;
        component: React.ReactNode;
    };
};

const availableWidgets: AvailableWidgets = {
    burndown: {
        label: "Biểu đồ Burn-down",
        component: (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 h-full">
                <h3 className="font-bold text-sm text-gray-700 dark:text-white mb-2">WIDGET: BIỂU ĐỒ BURN-DOWN</h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Biểu đồ burn-down sẽ hiển thị ở đây</p>
                </div>
            </div>
        )
    },
    taskStats: {
        label: "Thống kê Task",
        component: (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 h-full">
                <h3 className="font-bold text-sm text-gray-700 dark:text-white mb-2">WIDGET: THỐNG KÊ TASK</h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Thống kê task sẽ hiển thị ở đây</p>
                </div>
            </div>
        )
    },
    timeTracking: {
        label: "Time Tracking",
        component: (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 h-full">
                <h3 className="font-bold text-sm text-gray-700 dark:text-white mb-2">WIDGET: TIME TRACKING</h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Time tracking sẽ hiển thị ở đây</p>
                </div>
            </div>
        )
    },
    customReport: {
        label: "Báo cáo tùy chỉnh",
        component: (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 h-full">
                <h3 className="font-bold text-sm text-gray-700 dark:text-white mb-2">WIDGET: BÁO CÁO TÙY CHỈNH</h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Báo cáo tùy chỉnh sẽ hiển thị ở đây</p>
                </div>
            </div>
        )
    },
};

// Định nghĩa kiểu cho widget item
interface WidgetItem {
    id: string;
    type: string;
    component: React.ReactNode;
}

interface User {
    id: string;
    name: string;
    email: string;
}

const DashboardAfter: React.FC = () => {
    const [widgets, setWidgets] = useState<WidgetItem[]>([]);
    const { userId } = useParams<{ userId: string }>(); // Lấy userId từ URL
    const [searchParams] = useSearchParams(); // Lấy search params
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const navigate = useNavigate();

    // Lấy thông tin breadcrumb từ URL params
    const currentView = searchParams.get('view'); // gantt, projects, documents, etc.
    const projectId = searchParams.get('projectId');

    console.log('📊 [Dashboard_After] Current view:', currentView);
    console.log('📊 [Dashboard_After] Project ID:', projectId);

    useEffect(() => {
        // Kiểm tra xem có userId trên URL hay không
        if (userId) {
            // Nếu có userId, bạn có thể fetch thông tin người dùng chi tiết (nếu cần)
            console.log("Dashboard của người dùng có ID:", userId);
            // Ở đây bạn có thể gọi API để lấy thông tin người dùng dựa trên userId
            const userFromStorage = localStorage.getItem('user');
            if (userFromStorage) {
                setLoggedInUser(JSON.parse(userFromStorage));
            }
        } else {
            // Nếu không có userId trên URL, có thể chuyển hướng về trang chủ hoặc trang lỗi
            console.log("Không có userId trên URL dashboard");
            const userFromStorage = localStorage.getItem('user');
            if (userFromStorage) {
                navigate(`/dashboard/${JSON.parse(userFromStorage).id}`);
            } else {
                navigate('/'); // Hoặc một trang lỗi
            }
        }
    }, [userId, navigate]);

    // Sử dụng useCallback để tránh recreate function
    const handleAddWidget = useCallback((type: string) => {
        const newWidget: WidgetItem = {
            id: `${type}-${Date.now()}`,
            type: type,
            component: availableWidgets[type]?.component || <div>Widget không tồn tại</div>,
        };
        setWidgets(prev => [...prev, newWidget]);
    }, []);

    // Khởi tạo widgets ban đầu sau khi đã định nghĩa handleAddWidget và có thông tin user
    useEffect(() => {
        if (loggedInUser) {
            setWidgets([
                {
                    id: "introduce-1",
                    type: "introduce",
                    component: <WidgetIntroduce userName={loggedInUser.name} />,
                },
                {
                    id: "schedule-1",
                    type: "schedule",
                    component: <WidgetSchedule />,
                },
                {
                    id: "customize-1",
                    type: "customize",
                    component: <WidgetCustomize onAddWidget={handleAddWidget} />,
                },
            ]);
        }
    }, [handleAddWidget, loggedInUser]);

    const handleFooterClick = (item: string) => {
        console.log(`Đã click vào ${item}`);
    };    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const reordered = Array.from(widgets);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        setWidgets(reordered);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header full width */}
            <Header />
            
            {/* Main area: sidebar + content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar cố định bên trái */}
                <div className="flex-shrink-0">
                    <Sidebar />
                </div>
                
                {/* Content chính co giãn responsive */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    {/* Breadcrumb dưới header */}
                    <Breadcrumb items={
                        currentView === 'gantt' ? 
                        ["Dashboard", "Dự án", "Biểu đồ Gantt"] : 
                        ["Dashboard"]
                    } />
                    
                    {/* Nội dung chính co giãn */}
                    <main className="flex-1 overflow-y-auto p-4">
                        {/* Conditional rendering based on view */}
                        {currentView === 'gantt' ? (
                            <GanttTab />
                        ) : (
                            <>
                                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    Chào mừng đến Dashboard
                                </h1>
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    {/* Grid responsive tự điều chỉnh */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-max">
                                        {widgets.map((widget) => (
                                            <div
                                                key={widget.id}
                                                className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 h-fit"
                                                data-drag-id={widget.id}
                                            >
                                                {widget.component}
                                            </div>
                                        ))}

                                        {/* Placeholder cho widget mới */}
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[150px] h-fit">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                                                Kéo widget vào đây hoặc thêm từ Widget Tùy chỉnh
                                            </p>
                                        </div>
                                    </div>
                                </DragDropContext>
                            </>
                        )}
                    </main>
                </div>
            </div>
            
            {/* Footer full width */}
            <Footer onFooterClick={handleFooterClick} />
            <TopButton />
        </div>
    );
};

export default DashboardAfter;