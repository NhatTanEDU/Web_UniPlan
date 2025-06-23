import React, { useState, useEffect } from 'react';
import { User, Calendar, Crown, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService, UserInfo } from '../services/userService';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await userService.getCurrentUser();
      setUserInfo(response.data.user);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  };

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
            <p>{error}</p>
            <button 
              onClick={fetchUserInfo}
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
  const daysRemaining = getDaysRemaining(endDate);
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay về
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              {userInfo.avatar_url ? (
                <img 
                  src={userInfo.avatar_url} 
                  alt="Avatar" 
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{userInfo.full_name}</h1>
              <p className="text-gray-600">{userInfo.email}</p>
            </div>
          </div>
        </div>

        {/* Plan Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Crown className="h-6 w-6 text-yellow-500 mr-2" />
              Thông tin gói dịch vụ
            </h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(userInfo.current_plan_type)}`}>
              {getPlanDisplayName(userInfo.current_plan_type)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Ngày bắt đầu</p>
                <p className="text-sm text-gray-600">{formatDate(startDate)}</p>
              </div>
            </div>

            {/* End Date */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Ngày kết thúc</p>
                <p className="text-sm text-gray-600">{formatDate(endDate)}</p>
                {daysRemaining !== null && (
                  <p className={`text-xs mt-1 ${daysRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : 'Đã hết hạn'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar for Trial/Subscription */}
          {startDate && endDate && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Tiến trình sử dụng</span>
                <span>
                  {daysRemaining !== null && daysRemaining > 0 
                    ? `${daysRemaining} ngày còn lại` 
                    : 'Đã hết hạn'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                {(() => {
                  const start = new Date(startDate).getTime();
                  const end = new Date(endDate).getTime();
                  const now = Date.now();
                  const total = end - start;
                  const used = now - start;
                  const percentage = Math.max(0, Math.min(100, (used / total) * 100));
                  
                  return (
                    <div 
                      className={`h-2 rounded-full ${percentage < 100 ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            Trạng thái thanh toán
          </h2>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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

          {/* Upgrade Button */}
          {(userInfo.current_plan_type === 'free' || userInfo.current_plan_type === 'expired') && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 mb-3">Nâng cấp gói để sử dụng đầy đủ tính năng UniPlan</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Nâng cấp ngay
              </button>
            </div>
          )}

          {/* Trial Ending Soon Warning */}
          {userInfo.current_plan_type === 'free_trial' && daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 mb-3">
                Gói dùng thử của bạn sẽ hết hạn trong {daysRemaining} ngày
              </p>
              <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                Nâng cấp để tiếp tục
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
