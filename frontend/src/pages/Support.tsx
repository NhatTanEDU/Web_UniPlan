import React from "react";
import { motion } from "framer-motion";

/**
 * Component hỗ trợ cuộn mượt + hiệu ứng khi hiện ra
 */
const ScrollFade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay } }}
    viewport={{ once: true, amount: 0.1 }}
  >
    {children}
  </motion.div>
);

export default function Support() {
  return (
    <div className="bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 font-poppins">
      {/* Hero section */}
      <section className="py-20 text-center px-6">
        <ScrollFade>
          <h1 className="text-4xl font-bold mb-4">Bạn cần hỗ trợ?</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng đồng hành cùng bạn. Tìm câu hỏi thường gặp hoặc gửi yêu cầu trực tiếp cho đội ngũ UniPlan.
          </p>
        </ScrollFade>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <ScrollFade delay={0.2}>
          <h2 className="text-2xl font-semibold mb-6">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            <details className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm cursor-pointer">
              <summary className="font-medium">Làm thế nào để bắt đầu với UniPlan?</summary>
              <p className="mt-2 text-sm">Bạn chỉ cần đăng ký miễn phí và bắt đầu tạo dự án đầu tiên ngay trên Dashboard.</p>
            </details>
            <details className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm cursor-pointer">
              <summary className="font-medium">Tôi có thể nâng cấp tài khoản như thế nào?</summary>
              <p className="mt-2 text-sm">Truy cập trang "Giá cả", chọn gói bạn muốn và tiến hành thanh toán qua nền tảng tích hợp.</p>
            </details>
            <details className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm cursor-pointer">
              <summary className="font-medium">Tôi gặp lỗi, cần hỗ trợ kỹ thuật?</summary>
              <p className="mt-2 text-sm">Bạn có thể điền form bên dưới hoặc gửi email đến <b>support@uniplan.app</b>.</p>
            </details>
          </div>
        </ScrollFade>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <ScrollFade delay={0.4}>
          <h2 className="text-2xl font-semibold mb-6 text-center">Gửi yêu cầu hỗ trợ</h2>
          <form className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <input
              type="text"
              placeholder="Họ tên của bạn"
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
            />
            <input
              type="email"
              placeholder="Email liên hệ"
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
            />
            <textarea
              placeholder="Nội dung yêu cầu..."
              rows={5}
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-900"
            />
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-md transition"
            >
              Gửi yêu cầu
            </button>
          </form>
        </ScrollFade>
      </section>

      {/* Footer Contact */}
      <section className="text-center text-sm pb-12 px-4">
        <p>
          Hoặc gửi email đến{" "}
          <a href="mailto:support@uniplan.app" className="underline text-yellow-600 hover:text-yellow-700">
            support@uniplan.app
          </a>
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Chúng tôi sẽ phản hồi trong vòng 24h làm việc.</p>
      </section>
    </div>
  );
}
