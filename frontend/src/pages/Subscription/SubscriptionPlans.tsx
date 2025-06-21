import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/context/AuthContext'; // Import useAuth
import subscriptionService from '../../services/subscriptionService';
import toast from 'react-hot-toast';

const SubscriptionPlans: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const navigate = useNavigate();
    const { userId } = useAuth();

    const handleSelectPlan = async (planType: string, amount: number) => {
        setSelectedPlan(planType);

        if (amount === 0) {
            // Handle free plan
            toast.success("Bạn đã chọn gói Miễn phí.");
            // Potentially call an API to set the user to the free plan
        } else {            if (!userId) {
                toast.error("Bạn cần đăng nhập để nâng cấp gói.");
                navigate('/login');
                return;
            }            try {
                const response = await subscriptionService.createPayment({
                    planType: planType as 'monthly' | 'yearly',
                    amount: amount,
                    returnUrl: `${window.location.origin}/payment/result`,
                    notifyUrl: `${window.location.origin}/api/payment/notify`,
                });
                
                console.log('Payment response:', response);
                
                // Backend trả về { success: true, data: { payUrl: "..." } }
                if (response && response.data && response.data.payUrl) {
                    console.log('Redirecting to MoMo payment URL:', response.data.payUrl);
                    window.location.href = response.data.payUrl;
                } else {
                    console.error('PayUrl not found in response:', response);
                    toast.error("Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.");
                    setSelectedPlan(null); // Reset button state
                }            } catch (error: any) {
                console.error("Payment creation failed:", error);
                
                // Xử lý trường hợp có giao dịch pending (status 409)
                if (error.response && error.response.status === 409) {
                    const errorData = error.response.data;
                    if (errorData.existingPayment && errorData.existingPayment.payUrl) {
                        console.log('Found existing pending payment, redirecting to existing payUrl:', errorData.existingPayment.payUrl);
                        toast.success("Bạn có giao dịch đang chờ thanh toán. Đang chuyển hướng...");
                        window.location.href = errorData.existingPayment.payUrl;
                        return;
                    } else {
                        toast.error(errorData.message || "Bạn đã có giao dịch đang chờ thanh toán.");
                    }
                } else {
                    toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
                }
                setSelectedPlan(null); // Reset button state
            }
        }
    };

    const plans = [
        {
            name: 'Miễn phí',
            price: '0đ',
            features: ['Quản lý 1 dự án', 'Tối đa 5 thành viên', 'Dung lượng 100MB'],
            planType: 'free',
            amount: 0,
            buttonText: 'Chọn gói',
        },
        {
            name: '1 Tháng',
            price: '500.000đ',
            features: ['Quản lý 5 dự án', 'Tối đa 20 thành viên', 'Dung lượng 1GB', 'Hỗ trợ ưu tiên'],
            planType: 'monthly',
            amount: 500000,
            buttonText: 'Nâng cấp',
        },
        {
            name: '1 Năm',
            price: '3.000.000đ',
            features: ['Quản lý không giới hạn dự án', 'Không giới hạn thành viên', 'Dung lượng 10GB', 'Hỗ trợ 24/7'],
            planType: 'yearly',
            amount: 3000000,
            buttonText: 'Nâng cấp',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800">Chọn gói dịch vụ phù hợp với bạn</h1>
                <p className="text-lg text-gray-600 mt-2">Bắt đầu miễn phí, nâng cấp khi bạn phát triển.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <div key={plan.name} className="bg-white rounded-lg shadow-lg p-8 flex flex-col">
                        <h2 className="text-2xl font-bold text-center text-gray-800">{plan.name}</h2>
                        <p className="text-4xl font-extrabold text-center my-4 text-indigo-600">{plan.price}</p>
                        <ul className="text-gray-600 mb-8 space-y-2">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSelectPlan(plan.planType, plan.amount)}
                            className="mt-auto w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 disabled:bg-gray-400"
                            disabled={selectedPlan === plan.planType}
                        >
                            {selectedPlan === plan.planType ? 'Đang xử lý...' : plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPlans;
