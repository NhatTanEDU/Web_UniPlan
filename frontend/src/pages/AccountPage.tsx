import React, { useState, useEffect } from 'react';
import { User, Calendar, Crown, Clock, CheckCircle, ArrowLeft, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService, UserInfo } from '../services/userService';
import { useUserInfo } from '../hooks/useUserInfo';
import logo from "../assets/Name_Logo_3x.png";

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, loading } = useUserInfo();
  const [error, setError] = useState<string | null>(null);

  // Remove the old useEffect and fetchUserInfo since we're using the hook now

  const getPlanDisplayName = (planType: string) => {
    const planNames: { [key: string]: string } = {
      'free': 'Miễn phí',
      'free_trial': 'Dùng thử 7 ngày',
      'monthly': 'Gói tháng',
      'yearly': 'Gói năm',
      'expired': 'Đã hết hạn'
    };
    return planNames[planType] || planType;
  };

  const getPlanColor = (planType: string) => {
    const colors: { [key: string]: string } = {
      'free': 'bg-gray-100 text-gray-800',
      'free_trial': 'bg-blue-100 text-blue-800',
      'monthly': 'bg-green-100 text-green-800',
      'yearly': 'bg-purple-100 text-purple-800',
      'expired': 'bg-red-100 text-red-800'
    };
    return colors[planType] || 'bg-gray-100 text-gray-800';
  };

  const getStartDate = (userInfo: UserInfo) => {
    if (userInfo.current_plan_type === 'free_trial') {
      return userInfo.trial_start_date;
    }
    return userInfo.subscription_start_date;
  };

  const getEndDate = (userInfo: UserInfo) => {
    if (userInfo.current_plan_type === 'free_trial') {
      return userInfo.trial_end_date;
    }
    return userInfo.subscription_end_date;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Lỗi</p>
            <p>{error}</p>            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Không tìm thấy thông tin tài khoản</div>
      </div>
    );
  }
  const startDate = getStartDate(userInfo);
  const endDate = getEndDate(userInfo);
  const daysRemaining = getDaysRemaining(endDate);  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Header with Logo - Responsive */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between h-16">            {/* Logo */}            <div className="flex items-center">
              <img
                src={logo}
                alt="UniPlan"
                className="h-7 sm:h-8 md:h-10 lg:h-12 xl:h-20 2xl:h-24 w-auto"
              />
            </div>
              {/* User Avatar/Menu bên phải - Responsive */}
            <div className="flex items-center space-x-4">
              {userInfo && (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {userInfo.avatar_url ? (
                      <img 
                        src={userInfo.avatar_url} 
                        alt="Avatar" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {userInfo.full_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Nút Quay về và Tiêu đề Trang - Responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 shadow-sm mb-4 sm:mb-0 sm:mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay về
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 sm:mt-0">Thông tin tài khoản</h1>
          </div>          {/* User Profile Card - Responsive */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 sm:p-6 mb-6 transform hover:scale-[1.005] transition-transform duration-200 ease-out">
            <div className="flex items-center justify-between mb-4">              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200 overflow-hidden">
                  {userInfo.avatar_url ? (
                    <img 
                      src={userInfo.avatar_url} 
                      alt="Avatar" 
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{userInfo.full_name}</h2>
                  <p className="text-sm sm:text-lg text-gray-600">{userInfo.email}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
              >
                <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Chỉnh sửa hồ sơ</span>
                <span className="sm:hidden">Sửa</span>
              </button>
            </div>
          </div>{/* Plan Information - Responsive */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center mb-2 sm:mb-0">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mr-2" />
              Thông tin gói dịch vụ
            </h2>
            <span className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-sm font-semibold ${getPlanColor(userInfo.current_plan_type)}`}>
              {getPlanDisplayName(userInfo.current_plan_type)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 sm:gap-y-6 sm:gap-x-8">
            {/* Start Date */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">Ngày bắt đầu</p>
                <p className="text-sm sm:text-base text-gray-600">{formatDate(startDate)}</p>
              </div>
            </div>

            {/* End Date */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">Ngày kết thúc</p>
                <p className="text-sm sm:text-base text-gray-600">{formatDate(endDate)}</p>
                {daysRemaining !== null && (
                  <p className={`text-xs mt-1 font-medium ${daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : 'Đã hết hạn'}
                  </p>
                )}
              </div>
            </div>
          </div>          {/* Progress Bar for Trial/Subscription - Responsive */}
          {startDate && endDate && (
            <div className="mt-6 pt-5 sm:mt-8 sm:pt-6 border-t border-gray-100">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2 font-medium">
                <span>Tiến trình sử dụng</span>
                <span className={`${daysRemaining !== null && daysRemaining <= 0 ? 'text-red-600' : ''}`}>
                  {daysRemaining !== null && daysRemaining > 0 
                    ? `${daysRemaining} ngày còn lại` 
                    : 'Đã hết hạn'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                {(() => {
                  const start = new Date(startDate).getTime();
                  const end = new Date(endDate).getTime();
                  const now = Date.now();
                  const total = end - start;
                  const used = now - start;
                  const percentage = Math.max(0, Math.min(100, (used / total) * 100));
                  
                  let barColor = 'bg-blue-500';
                  if (percentage >= 100 || (daysRemaining !== null && daysRemaining <= 0)) {
                    barColor = 'bg-red-500';
                  } else if (daysRemaining !== null && daysRemaining <= 7) {
                    barColor = 'bg-orange-400';
                  }
                  
                  return (
                    <div 
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>        {/* Payment Status - Responsive */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center mb-4 pb-3 border-b border-gray-100">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mr-2" />
            Trạng thái thanh toán
          </h2>
          
          <div className="flex items-center space-x-3 mb-4">
            <span className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-sm font-semibold ${
              userInfo.payment_status === 'completed' 
                ? 'bg-green-100 text-green-800'
                : userInfo.payment_status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : userInfo.payment_status === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {userInfo.payment_status === 'completed' && 'Đã thanh toán'}
              {userInfo.payment_status === 'pending' && 'Đang xử lý'}
              {userInfo.payment_status === 'failed' && 'Thanh toán thất bại'}
              {(!userInfo.payment_status || userInfo.payment_status === 'none') && 'Chưa thanh toán'}
            </span>
          </div>

          {/* Upgrade Button - Responsive */}
          {(userInfo.current_plan_type === 'free' || userInfo.current_plan_type === 'expired') && (
            <div className="mt-5 p-4 sm:p-5 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm sm:text-base text-blue-800 mb-3 sm:mb-4">Nâng cấp gói để sử dụng đầy đủ tính năng UniPlan</p>
              <button className="bg-blue-600 text-white px-6 py-2 sm:px-8 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md w-full sm:w-auto">
                Nâng cấp ngay
              </button>
            </div>
          )}          {/* Trial Ending Soon Warning - Responsive */}
          {userInfo.current_plan_type === 'free_trial' && daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0 && (
            <div className="mt-5 p-4 sm:p-5 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-sm sm:text-base text-yellow-800 mb-3 sm:mb-4">
                Gói dùng thử của bạn sẽ hết hạn trong <span className="font-bold">{daysRemaining}</span> ngày
              </p>
              <button className="bg-yellow-600 text-white px-6 py-2 sm:px-8 sm:py-2.5 rounded-lg hover:bg-yellow-700 transition-colors duration-200 shadow-md w-full sm:w-auto">
                Nâng cấp để tiếp tục
              </button>
            </div>
          )}
        </div>

        {/* Account Information - Responsive */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center mb-4 pb-3 border-b border-gray-100">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mr-2" />
            Thông tin tài khoản
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">            {/* Ngày tham gia */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Ngày tham gia</p>
                <p className="text-gray-900">
                  {(() => {
                    // Debug: Log all possible date fields
                    console.log('🔍 User Info for Date Debug:', {
                      created_at: userInfo.created_at,
                      createdAt: userInfo.createdAt,
                      updatedAt: userInfo.updatedAt,
                      _id: userInfo._id,
                      fullUserInfo: userInfo
                    });
                    
                    // Try multiple possible field names
                    const dateValue = userInfo.created_at || userInfo.createdAt || userInfo.updatedAt;
                    
                    if (dateValue) {
                      try {
                        return new Date(dateValue).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      } catch (error) {
                        console.error('🔍 Date parsing error:', error, 'for value:', dateValue);
                        return 'Lỗi định dạng ngày';
                      }
                    }
                    
                    return 'Không rõ';
                  })()}
                </p>
              </div>
            </div>
            
            {/* Loại tài khoản */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Crown className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Loại tài khoản</p>
                <p className="text-gray-900">
                  {getPlanDisplayName(userInfo.current_plan_type)}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
