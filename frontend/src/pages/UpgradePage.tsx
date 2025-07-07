// src/pages/UpgradePage.tsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/After/Header";
import Footer from "../components/Footer";
import { CheckCircle, XCircle, Crown, Zap, Headphones, FileText } from "lucide-react";

// Component UpgradePage
const UpgradePage: React.FC = () => {
  // Đồng bộ theme với localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme || savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Hàm xử lý khi click vào footer
  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };

  // Danh sách lợi ích của Pro
  const proBenefits = [
    {
      icon: <Crown size={24} className="text-yellow-500" />,
      title: "Truy cập tất cả dự án",
      description: "Mở khóa toàn bộ dự án, bao gồm các dự án Pro độc quyền.",
    },
    {
      icon: <Zap size={24} className="text-yellow-500" />,
      title: "Công cụ AI nâng cao",
      description: "Sử dụng AI để phân tích và quản lý dự án hiệu quả hơn.",
    },
    {
      icon: <Headphones size={24} className="text-yellow-500" />,
      title: "Hỗ trợ ưu tiên 24/7",
      description: "Nhận hỗ trợ nhanh chóng từ đội ngũ chuyên nghiệp.",
    },
    {
      icon: <FileText size={24} className="text-yellow-500" />,
      title: "Không giới hạn tài liệu",
      description: "Tải lên và quản lý tài liệu không giới hạn.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Nâng cấp lên Pro để mở khóa toàn bộ tính năng!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Truy cập tất cả dự án, công cụ AI nâng cao, hỗ trợ 24/7 và nhiều hơn nữa.
          </p>
          <Link
            to="/payment"
            className="inline-block bg-primary hover:bg-yellow-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md transition-all hover:shadow-lg"
            aria-label="Nâng cấp ngay"
          >
            Nâng cấp ngay
          </Link>
        </section>

        {/* So sánh Plan */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            So sánh Free và Pro
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-gray-900 dark:text-white font-semibold">Tính năng</th>
                  <th className="p-4 text-gray-900 dark:text-white font-semibold text-center">
                    Free Plan
                  </th>
                  <th className="p-4 text-gray-900 dark:text-white font-semibold text-center">
                    Pro Plan
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    Truy cập dự án không Pro
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle size={20} className="text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle size={20} className="text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    Truy cập dự án Pro
                  </td>
                  <td className="p-4 text-center">
                    <XCircle size={20} className="text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle size={20} className="text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    Công cụ AI nâng cao
                  </td>
                  <td className="p-4 text-center">
                    <XCircle size={20} className="text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle size={20} className="text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    Hỗ trợ ưu tiên 24/7
                  </td>
                  <td className="p-4 text-center">
                    <XCircle size={20} className="text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle size={20} className="text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-4 text-gray-700 dark:text-gray-300">
                    Tải lên tài liệu
                  </td>
                  <td className="p-4 text-center text-gray-700 dark:text-gray-300">
                    Giới hạn 5 tài liệu
                  </td>
                  <td className="p-4 text-center text-gray-700 dark:text-gray-300">
                    Không giới hạn
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Lợi ích chi tiết */}
        <section>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            Tại sao nên chọn Pro?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {proBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA cuối trang */}
        <section className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Sẵn sàng nâng cấp?
          </h2>
          <Link
            to="/payment"
            className="inline-block bg-primary hover:bg-yellow-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md transition-all hover:shadow-lg"
            aria-label="Nâng cấp ngay"
          >
            Nâng cấp ngay
          </Link>
        </section>
      </main>

      {/* Footer */}
      <Footer onFooterClick={handleFooterClick} />
    </div>
  );
};

export default UpgradePage;