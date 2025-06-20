import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface SubscriptionStatus {
  subscriptionType: 'free_trial' | 'monthly' | 'yearly' | 'expired';
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
  id: string;
  type: 'subscription_expiring' | 'subscription_expired' | 'payment_success' | 'payment_failed' | 'welcome_trial';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface SubscriptionHistory {
  _id: string;
  fromPlan: string;
  toPlan: string;
  changeType: 'upgrade' | 'downgrade' | 'renewal' | 'expiry' | 'admin_upgrade';
  reason?: string;
  adminId?: string;
  createdAt: Date;
}

export interface PaymentHistory {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  subscriptionType: 'monthly' | 'yearly';
  status: 'pending' | 'completed' | 'failed' | 'expired';
  momoTransId?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface CreatePaymentData {
  amount: number;
  orderInfo: string;
  userId: string;
  planType: string;
}

class SubscriptionService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Lấy trạng thái subscription hiện tại
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/subscription/status`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  }

  // Lấy danh sách gói dịch vụ
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/subscription/plans`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Tạo thanh toán MoMo
  async createPayment(data: CreatePaymentData): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/create`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating MoMo payment:', error);
      throw error;
    }
  }

  // Xác thực thanh toán MoMo
  async verifyPayment(data: { orderId: string; resultCode: string }): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payment/verify`, data, {
        headers: this.getAuthHeaders(),
      });
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
      const response = await axios.get(`${API_BASE_URL}/api/payment/status/${orderId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  // Lấy lịch sử thanh toán
  async getPaymentHistory(): Promise<PaymentHistory[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/payment/history`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Lấy lịch sử thay đổi subscription
  async getSubscriptionHistory(): Promise<SubscriptionHistory[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/subscription/history`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      throw error;
    }
  }

  // Lấy thông báo
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/subscription/notifications`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Đánh dấu thông báo đã đọc
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await axios.patch(`${API_BASE_URL}/api/subscription/notifications/${notificationId}/read`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Đánh dấu tất cả thông báo đã đọc
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await axios.patch(`${API_BASE_URL}/api/subscription/notifications/read-all`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Hủy subscription (downgrade về free_trial nếu còn hạn hoặc expired)
  async cancelSubscription(reason: string): Promise<any> {
    try {
      await axios.post(`${API_BASE_URL}/api/subscription/cancel`, { reason }, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
