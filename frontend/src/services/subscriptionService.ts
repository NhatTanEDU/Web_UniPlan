import api from './api';

export interface SubscriptionStatus {
  subscriptionType: 'free' | 'free_trial' | 'monthly' | 'yearly' | 'expired';
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  daysRemaining?: number;
  isActive: boolean;
  isPremium: boolean;
  trialUsed: boolean;
}

export interface SubscriptionPlan {
  type: 'monthly' | 'yearly';
  price: number;
  currency: string;
  duration: number;
  features: string[];
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PaymentHistory {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  planType: 'monthly' | 'yearly';
  createdAt: Date;
  completedAt?: Date;
  momoTransId?: string;
}

export interface SubscriptionHistory {
  _id: string;
  subscriptionType: 'free' | 'free_trial' | 'monthly' | 'yearly' | 'expired';
  startDate: Date;
  endDate?: Date;
  isDowngrade: boolean;
  reason?: string;
  createdAt: Date;
}

export interface CreatePaymentData {
  planType: 'monthly' | 'yearly';
  amount: number;
  returnUrl: string;
  notifyUrl: string;
}

export interface PaymentVerificationData {
  orderId: string;
  resultCode: string;
}

export interface PlanUpgradeData {
  planType: string;
}

class SubscriptionService {  // Lấy trạng thái subscription hiện tại
  async getSubscriptionStatus(forceRefresh = false): Promise<SubscriptionStatus> {
    try {
      const token = localStorage.getItem('token');
      console.log('🔐 [subscriptionService] Token exists:', !!token);
      console.log('🔐 [subscriptionService] Token preview:', token?.substring(0, 30) + '...');
      console.log('🔄 [subscriptionService] Force refresh:', forceRefresh);
      
      console.log('🚀 [subscriptionService] Making request to: /subscription/status');
      
      const config = forceRefresh ? {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        params: {
          _t: Date.now() // Cache bust parameter
        }
      } : {};
      
      const response = await api.get('/subscription/status', config);
      
      console.log('✅ [subscriptionService] Response status:', response.status);
      console.log('✅ [subscriptionService] Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [subscriptionService] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.config?.headers
      });
      throw error;
    }
  }

  // Lấy danh sách gói dịch vụ
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get('/subscription/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Tạo thanh toán MoMo
  async createPayment(data: CreatePaymentData): Promise<any> {
    try {
      const response = await api.post('/payment/create', data);
      return response.data;
    } catch (error) {
      console.error('Error creating MoMo payment:', error);
      throw error;
    }
  }

  // Xác thực thanh toán MoMo
  async verifyPayment(data: { orderId: string; resultCode: string }): Promise<any> {
    try {
      const response = await api.post('/payment/verify', data);
      return response.data;
    } catch (error) {
      console.error('Error verifying MoMo payment:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(orderId: string): Promise<{
    status: 'pending' | 'completed' | 'failed' | 'expired';
    subscriptionUpdated?: boolean;
  }> {
    try {
      const response = await api.get(`/payment/status/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  // Lấy lịch sử thanh toán
  async getPaymentHistory(): Promise<PaymentHistory[]> {
    try {
      const response = await api.get('/payment/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Lấy lịch sử thay đổi subscription
  async getSubscriptionHistory(): Promise<SubscriptionHistory[]> {
    try {
      const response = await api.get('/subscription/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      throw error;
    }
  }

  // Lấy thông báo
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get('/subscription/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Đánh dấu thông báo đã đọc
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/subscription/notifications/${notificationId}/read`, {});
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Đánh dấu tất cả thông báo đã đọc
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await api.patch('/subscription/notifications/read-all', {});
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Hủy subscription (downgrade về free_trial nếu còn hạn hoặc expired)
  async cancelSubscription(reason: string): Promise<any> {
    try {
      await api.post('/subscription/cancel', { reason });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Demo upgrade without real payment
  async upgradeFake(): Promise<{ message: string; plan: string }> {
    try {
      console.log('🚀 [subscriptionService] Calling upgrade-fake endpoint');
      const response = await api.post('/subscription/upgrade-fake');
      console.log('✅ [subscriptionService] Fake upgrade response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [subscriptionService] Error during fake upgrade:', error);
      throw error;
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
