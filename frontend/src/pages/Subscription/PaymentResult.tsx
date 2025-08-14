import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import subscriptionService from 'services/subscriptionService';
import toast from 'react-hot-toast';

const PaymentResult: React.FC = () => {
    const [message, setMessage] = useState('Đang xác thực thanh toán...');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const orderId = params.get('orderId');
        const resultCode = params.get('resultCode');

        if (orderId && resultCode) {
            subscriptionService.verifyPayment({ orderId, resultCode })
                .then((response: any) => {
                    if (response.code === 0) {
                        setMessage('Thanh toán thành công! Bạn sẽ được chuyển hướng về trang chủ.');
                        toast.success('Nâng cấp gói thành công!');
                        // You might want to refresh user/subscription context here
                        setTimeout(() => navigate('/home'), 3000);
                    } else {
                        setMessage(`Thanh toán thất bại: ${response.message}`);
                        toast.error(`Thanh toán thất bại: ${response.message}`);
                    }
                })
                .catch((err: any) => {
                    setMessage('Có lỗi xảy ra khi xác thực thanh toán.');
                    toast.error('Có lỗi xảy ra khi xác thực thanh toán.');
                    console.error(err);
                });
        } else {
            setMessage('Thông tin thanh toán không hợp lệ.');
            toast.error('URL không hợp lệ, thiếu thông tin thanh toán.');
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Kết quả thanh toán</h1>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default PaymentResult;
