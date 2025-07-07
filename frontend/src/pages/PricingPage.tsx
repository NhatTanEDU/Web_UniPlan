import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "../components/ui/button";
import Footer from "../components/Footer";
import Headerbefore from "../components/Before/Header_before";
import ScrollTrigger from "../components/ScrollTrigger";
import { COLORS } from "../constants/colors";

// Dữ liệu bảng giá
const features = [
  { name: "Quản lý người dùng", values: [true, false, false] },
  { name: "Dự án không giới hạn", values: [true, true, false] },
  { name: "Công việc không giới hạn", values: [true, true, false] },
  { name: "Chat thời gian thực không giới hạn", values: [true, true, "5 tin/ngày"] },
  { name: "Upload file lớn", values: [true, "50–100MB", "5MB"] },
  { name: "Gantt kéo-thả", values: [true, true, "chỉ xem"] },
  { name: "Báo cáo nâng cao", values: [true, true, false] },
  { name: "AI Chatbot", values: [true, true, false] },
  { name: "Email nâng cao", values: [true, true, false] },
  { name: "Kiểm thử hệ thống", values: [true, false, false] },
];

const plans = [
  { name: "Admin", price: "Liên hệ", featured: true },
  { name: "Paid User", price: "499.000đ/M", featured: false },
  { name: "Free User", price: "Miễn phí", featured: false }
];

// Component hiển thị icon
const getIcon = (value: boolean | string) => {
  if (value === true) return <Check className="text-green-500 w-5 h-5" />;
  if (value === false) return <X className="text-red-500 w-5 h-5" />;
  return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
};

export default function PricingPage() {
  // Hàm onNavigate "giả" để đáp ứng prop bắt buộc của Headerbefore
  const handleNavigate = (path: string) => {
    console.log("Điều hướng đến:", path);
    // Bạn có thể thêm logic điều hướng thực tế ở đây (ví dụ: useNavigate() của react-router-dom)
  };

  return (
    <div className="flex flex-col min-h-screen font-poppins" style={{ backgroundColor: COLORS.background }}>
      <Headerbefore onNavigate={handleNavigate} />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề với hiệu ứng ScrollTrigger */}
        <ScrollTrigger delay={0.1}>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold dark:text-white mb-4" style={{ color: COLORS.textDark }}>
              Lựa chọn gói phù hợp với bạn
            </h2>
            <p className="text-lg dark:text-gray-400 max-w-2xl mx-auto" style={{ color: COLORS.textLight }}>
              UniPlan cung cấp các giải pháp quản lý dự án mạnh mẽ cho mọi quy mô doanh nghiệp
            </p>
          </div>
        </ScrollTrigger>

        {/* Bảng giá với hiệu ứng */}
        <ScrollTrigger delay={0.2}>
          <div className="max-w-6xl mx-auto">
            {/* Các gói dịch vụ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={`rounded-xl shadow-lg overflow-hidden border`}
                  style={{
                    backgroundColor: COLORS.surface, // Nền card
                    borderColor: plan.featured ? COLORS.primary : COLORS.border, // Viền featured
                    // Chỉ giữ một định nghĩa boxShadow
                    boxShadow: plan.featured 
                      ? `0 0 0 2px ${COLORS.primary}1A, 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` 
                      : undefined 
                  }}
                >
                  <div className="p-6 text-center" style={{ backgroundColor: plan.featured ? `${COLORS.primary}10` : 'transparent' }}>
                    <h3 className="text-xl font-bold dark:text-white" style={{ color: COLORS.textDark }}>
                      {plan.name}
                    </h3>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold dark:text-white" style={{ color: COLORS.textDark }}>
                        {plan.price}
                      </span>
                    </div>
                    <Button
                      className={`w-full text-white font-semibold`}
                      style={{
                        backgroundColor: plan.featured ? COLORS.primary : COLORS.textDark, // Màu nền nút
                        transition: "background-color 0.2s ease-in-out", // Thêm transition cho hover
                      }}
                      onMouseEnter={(e) => {
                        if (plan.featured) {
                          e.currentTarget.style.backgroundColor = COLORS.secondary;
                        } else {
                          // Để làm cho nút thường có hiệu ứng hover, bạn có thể chọn một màu khác hoặc làm tối/sáng màu hiện tại
                          // Ở đây tôi chọn một màu xám đậm hơn một chút
                          e.currentTarget.style.backgroundColor = COLORS.textDark; // Giữ nguyên màu nền nếu không phải featured
                          e.currentTarget.style.opacity = '0.9'; // Hoặc làm mờ đi một chút
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (plan.featured) {
                          e.currentTarget.style.backgroundColor = COLORS.primary;
                        } else {
                          e.currentTarget.style.backgroundColor = COLORS.textDark;
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
                    >
                      {plan.featured ? "Liên hệ ngay" : "Đăng ký ngay"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bảng so sánh tính năng */}
            <div className="overflow-x-auto shadow-lg rounded-xl border dark:border-gray-700" style={{ borderColor: COLORS.border, backgroundColor: COLORS.surface }}>
              <table className="min-w-full divide-y dark:divide-gray-700" style={{ borderColor: COLORS.border }}>
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold dark:text-white" style={{ color: COLORS.textDark, backgroundColor: `${COLORS.background}80` }}>
                      Tính năng
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.name}
                        className="px-6 py-4 text-center text-sm font-semibold dark:text-white"
                        style={{ color: COLORS.textDark, backgroundColor: `${COLORS.background}80` }}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700" style={{ borderColor: COLORS.border }}>
                  {features.map((feature, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      whileInView={{
                        opacity: 1,
                        transition: { delay: idx * 0.05 }
                      }}
                      viewport={{ once: true }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white" style={{ color: COLORS.textDark }}>
                        {feature.name}
                      </td>
                      {feature.values.map((value, i) => (
                        <td
                          key={i}
                          className={`px-6 py-4 text-center text-sm`}
                          style={{ backgroundColor: i === 0 ? `${COLORS.primary}08` : 'transparent' }} // Nhấn mạnh cột admin/featured
                        >
                          {getIcon(value)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollTrigger>

        {/* Câu kết thúc */}
        <ScrollTrigger delay={0.3}>
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold dark:text-white mb-4" style={{ color: COLORS.textDark }}>
              Bạn cần tư vấn gói phù hợp?
            </h3>
            <Button
              className="rounded-xl px-8 py-3 text-sm font-semibold text-white"
              style={{
                backgroundColor: COLORS.primary,
                transition: "background-color 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.secondary}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
            >
              Liên hệ với chúng tôi
            </Button>
          </div>
        </ScrollTrigger>
      </main>
      <Footer />
    </div>
  );
}