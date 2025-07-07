import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Folder, ListChecks, BarChart3, Hammer } from "lucide-react";

// 👇 Định nghĩa props
interface WidgetIntroduceProps {
  userName?: string;
}

// 👇 Component chính
const WidgetIntroduce: React.FC<WidgetIntroduceProps> = ({ userName = "Tân" }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [reminder, setReminder] = useState("");
  const [quote, setQuote] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // 👉 Hàm xác định buổi trong ngày và quote
  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting("Chào buổi sáng");
      setReminder("☀️ Hôm nay có gì cần ưu tiên không?");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Chào buổi chiều");
      setReminder("🌤️ Đã check tiến độ dự án chưa?");
    } else {
      setGreeting("Chào buổi tối");
      setReminder("🌙 Hãy điểm lại thành quả ngày hôm nay nhé.");
    }

    const quotes = [
      "🚀 Chìa khóa của thành công là bắt đầu. – Mark Twain",
      "🌱 Mỗi ngày là một cơ hội mới để phát triển.",
      "💡 Thành công không đến từ những gì bạn làm thỉnh thoảng, mà đến từ những gì bạn làm đều đặn.",
      "🔥 Hãy làm việc như thể đó là ngày cuối cùng để tạo ra điều vĩ đại.",
    ];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);

    const now = new Date();
    const formattedTime = now.toLocaleString("vi-VN", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    setCurrentTime(formattedTime);
  }, []);

  // 👉 Dữ liệu mô phỏng
  const totalProjects = 5;
  const taskDoing = 10;
  const tasksDueSoon = 3;
  const progressPercent = 80;

  const toggleDetail = () => setShowDetail(!showDetail);

  return (
    <>
      <h3 className="font-bold text-sm text-gray-700 dark:text-white mb-2">WIDGET: TỔNG QUAN</h3>

      <div className="text-sm space-y-1">
        <p>👋 {greeting}, <strong>{userName}</strong>!</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{currentTime}</p>
        <p className="italic">{reminder}</p>
        <p className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded text-sm font-medium italic shadow-sm">
          {quote}
        </p>


        <InfoLine icon={<Folder size={14} />} label="Dự án" value={`${totalProjects}`} />
        <InfoLine icon={<Hammer size={14} />} label="Task đang làm" value={`${taskDoing}`} />
        <InfoLine icon={<ListChecks size={14} />} label="Sắp hạn" value={`${tasksDueSoon}`} />
        <InfoLine icon={<BarChart3 size={14} />} label="Tiến độ" value={`${progressPercent}%`} />
      </div>

      <button
        onClick={toggleDetail}
        className="text-xs text-blue-500 hover:underline flex items-center mt-2"
      >
        {showDetail ? "Ẩn chi tiết" : "Xem chi tiết"}
        {showDetail ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />}
      </button>

      {showDetail && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p>- Bạn có tổng cộng {totalProjects} dự án đang tham gia.</p>
          <p>- Có {taskDoing} task đang thực hiện.</p>
          <p>- Có {tasksDueSoon} task sắp hết hạn.</p>
          <p>- Tiến độ tổng thể là {progressPercent}% hoàn thành.</p>
        </div>
      )}
    </>
  );
};

// 👇 InfoLine giữ nguyên
interface InfoLineProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoLine: React.FC<InfoLineProps> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-2">
    <span className="text-blue-500 dark:text-blue-300">{icon}</span>
    <span>{label}:</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default WidgetIntroduce;
