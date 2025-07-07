import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Save, X, Edit3, Mail, Phone, MapPin, Calendar, ArrowLeft, Upload, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService, UserInfo } from '../services/userService';
import { refreshUserInfoGlobally } from '../hooks/useUserInfo';
import logo from "../assets/Name_Logo_3x.png";

interface ProfileData {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar_url: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await userService.getCurrentUser();
      const userData = response.data.user;
      setUserInfo(userData);
      setProfileData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        bio: userData.bio || '',
        avatar_url: userData.avatar_url || ''
      });
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError(null);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewAvatar(previewUrl);      // Upload avatar to server
      const uploadResponse = await userService.uploadAvatar(file);
      const avatarUrl = uploadResponse.data.avatar_url;
      
      // Create full URL for avatar
      const fullAvatarUrl = `http://localhost:5000${avatarUrl}`;
      
      // Update profile data with new avatar URL
      setProfileData(prev => ({
        ...prev,
        avatar_url: fullAvatarUrl
      }));

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      setPreviewAvatar(null);      setSuccessMessage('Avatar đã được cập nhật thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh user info globally
      refreshUserInfoGlobally();

    } catch (err: any) {
      setError(err.message || 'Không thể upload avatar');
      setPreviewAvatar(null);
    } finally {
      setUploadingAvatar(false);
    }
  };
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields
      if (!profileData.full_name.trim()) {
        setError('Họ và tên không được để trống');
        return;
      }

      if (!profileData.email.trim()) {
        setError('Email không được để trống');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        setError('Email không hợp lệ');
        return;
      }

      // Update profile via API
      await userService.updateProfile({
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url
      });      setIsEditing(false);
      setSuccessMessage('Thông tin đã được cập nhật thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Refresh user info globally
      refreshUserInfoGlobally();
      
      // Update userInfo state
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url
        });
      }

    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userInfo) {
      setProfileData({
        full_name: userInfo.full_name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        address: userInfo.address || '',
        bio: userInfo.bio || '',
        avatar_url: userInfo.avatar_url || ''
      });
    }
    setPreviewAvatar(null);
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Không tìm thấy thông tin người dùng</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src={logo}
                alt="UniPlan"
                className="h-7 sm:h-8 md:h-10 lg:h-12 xl:h-20 2xl:h-24 w-auto"
              />
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {profileData.avatar_url ? (
                    <img 
                      src={profileData.avatar_url} 
                      alt="Avatar" 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {profileData.full_name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <Check className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay về
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Hồ sơ cá nhân</h1>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Cover Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 sm:h-40"></div>
            
            {/* Avatar and Basic Info */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16 sm:-mt-20">
                {/* Avatar */}
                <div className="relative">
                  <div 
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center overflow-hidden ${
                      isEditing ? 'cursor-pointer hover:opacity-80' : ''
                    }`}
                    onClick={handleAvatarClick}
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    ) : (profileData.avatar_url || previewAvatar) ? (
                      <img 
                        src={previewAvatar || profileData.avatar_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                    )}
                  </div>
                  
                  {isEditing && (
                    <button
                      onClick={handleAvatarClick}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Basic Info */}
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{profileData.full_name}</h2>
                  <p className="text-lg text-gray-600">{profileData.email}</p>
                  {profileData.bio && (
                    <p className="text-gray-500 mt-2">{profileData.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profileData.full_name || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập email"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profileData.email || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profileData.phone || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập địa chỉ"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profileData.address || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới thiệu bản thân
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Viết một vài dòng về bản thân..."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                    <span className="text-gray-900">{profileData.bio || 'Chưa có thông tin giới thiệu'}</span>
                  </div>
                )}
              </div>

              {/* Account Info */}
              {!isEditing && userInfo && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày tham gia</p>
                        <p className="text-gray-900">
                          {userInfo.created_at 
                            ? new Date(userInfo.created_at).toLocaleDateString('vi-VN')
                            : 'Không rõ'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Loại tài khoản</p>
                        <p className="text-gray-900">
                          {userInfo.current_plan_type === 'free' && 'Miễn phí'}
                          {userInfo.current_plan_type === 'free_trial' && 'Dùng thử'}
                          {userInfo.current_plan_type === 'monthly' && 'Gói tháng'}
                          {userInfo.current_plan_type === 'yearly' && 'Gói năm'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
