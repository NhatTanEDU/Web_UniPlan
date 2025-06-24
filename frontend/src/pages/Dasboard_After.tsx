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
import GanttTab from "../components/After/tab/gantt/GanttTab"; // "Gantt Nhỏ" - cho một dự án cụ thể
import ProjectPortfolioGanttPage from "../components/After/tab/gantt/gantt"; // "Gantt Lớn" - tổng quan tất cả dự án
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import { useUserInfo } from "../hooks/useUserInfo";

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

const DashboardAfter: React.FC = () => {
    const [widgets, setWidgets] = useState<WidgetItem[]>([]);
    const { userId } = useParams<{ userId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Use the custom hook instead of local state
    const { userInfo: loggedInUser } = useUserInfo();

    const currentView = searchParams.get('view');
    const projectId = searchParams.get('projectId'); // Vẫn giữ lại nếu cần cho các view khác

    // DEBUGGING: Log thông tin quan trọng
    useEffect(() => {
      console.log('🎛️ [Dashboard_After] Component Mounted/Updated');
      console.log('🎛️ [Dashboard_After] User ID from URL params:', userId);
      console.log('🎛️ [Dashboard_After] Current view from searchParams:', currentView);
      console.log('🎛️ [Dashboard_After] Project ID from searchParams:', projectId);
    }, [userId, currentView, projectId]);

    useEffect(() => {
        if (userId) {
            console.log("🎛️ [Dashboard_After] Dashboard của người dùng có ID:", userId);
        } else {
            console.warn("🎛️ [Dashboard_After] Không có userId trên URL dashboard. Điều hướng...");
            const userFromStorage = localStorage.getItem('user');
            if (userFromStorage) {
                const parsedUser = JSON.parse(userFromStorage);
                if (parsedUser && parsedUser.id) {
                    navigate(`/dashboard/${parsedUser.id}`);
                } else {
                    console.error("🎛️ [Dashboard_After] User từ localStorage không hợp lệ.");
                    navigate('/');
                }
            } else {
                console.warn("🎛️ [Dashboard_After] Không có user trong localStorage. Điều hướng về trang chủ.");
                navigate('/');
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
                    component: <WidgetIntroduce userName={loggedInUser.full_name} />,
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
                    <Breadcrumb /> 
                    
                    {/* Nội dung chính co giãn */}
                    <main className="flex-1 overflow-y-auto p-4">
                        {/* Conditional rendering based on view */}
                        {currentView === 'portfolio-gantt' ? (
                            <ProjectPortfolioGanttPage />
                        ) : currentView === 'gantt' && projectId ? (
                            <GanttTab />
                        ) : (
                            <>
                                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                    Chào mừng đến Dashboard, {loggedInUser?.full_name || 'bạn'}!
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