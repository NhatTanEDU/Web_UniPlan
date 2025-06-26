import React from 'react';
import subscriptionService from '../services/subscriptionService';

const PayDemoButton: React.FC = () => {
  const handleDemoPay = async () => {
    try {
      const res = await subscriptionService.upgradeFake();
      alert(`[32m${res.message}: ${res.plan}[39m`);
      window.location.reload();
    } catch (err) {
      console.error('Demo payment failed', err);
      alert('Demo payment thất bại');
    }
  };

  return (
    <button onClick={handleDemoPay} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Demo thanh toán Pro
    </button>
  );
};

export default PayDemoButton;