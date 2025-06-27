import React from "react";
import { motion } from "framer-motion";
import { CalendarClock, Move3D, Link2, LineChart } from "lucide-react";
// import GanttImage from "../assets/Gantt.jpg"; // <-- Loại bỏ import ảnh tĩnh

import { COLORS } from "../constants/colors"; // Import COLORS
import videoGantt from "../assets/video/Video_Nền_HeroGantt_Đã_Sẵn_Sàng.mp4"; // <-- Import video Gantt

// Rút gọn text cho các tính năng
const features = [
	{
		icon: <CalendarClock className="w-6 h-6" />,
		title: "Tổng quan thời gian",
		desc: "Hiển thị dự án theo dòng thời gian.",
	},
	{
		icon: <Move3D className="w-6 h-6" />,
		title: "Kéo thả trực quan",
		desc: "Điều chỉnh nhiệm vụ dễ dàng.",
	},
	{
		icon: <Link2 className="w-6 h-6" />,
		title: "Thiết lập phụ thuộc",
		desc: "Quản lý thứ tự công việc.",
	},
	{
		icon: <LineChart className="w-6 h-6" />,
		title: "Tiến độ tự động",
		desc: "Luôn đồng bộ với thời gian thực.",
	},
];

const HeroGantt = () => {
	const handleViewGanttClick = () => {
		console.log("Xem biểu đồ Gantt được click!");
		// Thêm logic điều hướng hoặc mở công cụ Gantt
	};

	return (
		// Section chính: Định nghĩa màu nền và padding tại đây
		<section
			className="py-20 md:py-32 relative overflow-hidden flex flex-col justify-center items-center" // Thêm flex để căn giữa nội dung
			style={{
				backgroundColor: COLORS.primary, // Màu nền dự phòng nếu video lỗi
			}}
		>
			{/* Video Background */}
			<video
				className="absolute inset-0 w-full h-full object-cover z-0"
				autoPlay
				loop
				muted
				playsInline
				src={videoGantt} // Sử dụng video Gantt của bạn
			>
				Your browser does not support the video tag.
			</video>

			{/* Overlay để làm mờ video và giúp chữ dễ đọc */}
			<div
				className="absolute inset-0 z-10"
				style={{
					background: `linear-gradient(180deg, ${COLORS.primary}D0 0%, ${COLORS.secondary}B0 100%)`, // Overlay màu primary/secondary
				}}
			></div>

			{/* Nội dung trung tâm (tiêu đề, mô tả, CTA) */}
			<div className="max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px] mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 relative z-20 text-center w-full">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
					viewport={{ once: true, amount: 0.5 }}
					className="max-w-4xl mx-auto space-y-4 sm:space-y-6 mb-8 md:mb-12 lg:mb-16"
				>
					<motion.h1
						className="text-xl xs:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 uppercase tracking-wide"
						style={{
							color: COLORS.accent,
							textShadow: `1px 1px 0 ${COLORS.primary}55, 0 2px 4px ${COLORS.textDark}10`,
						}}
						viewport={{ once: true, amount: 0.5 }}
					>
						LỊCH GANTT
					</motion.h1>
					<motion.h2
						className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 break-words"
						style={{
							color: COLORS.surface,
							textShadow: `2px 2px 0 ${COLORS.accent}, 0 5px 15px ${COLORS.textDark}20`,
						}}
						viewport={{ once: true, amount: 0.5 }}
					>
						Tổng quan dự án,{" "}
						<span style={{ color: COLORS.accent }}>mọi lúc, mọi nơi</span>
					</motion.h2>
					<motion.p
						className="text-base xs:text-lg md:text-xl opacity-90 max-w-xl mx-auto"
						style={{
							color: COLORS.surface,
						}}
						viewport={{ once: true, amount: 0.5 }}
					>
						UniPlan với biểu đồ Gantt trực quan giúp bạn nắm bắt toàn bộ dòng
						thời gian dự án, dễ dàng quản lý nhiệm vụ và sự phụ thuộc.
					</motion.p>
				</motion.div>

				{/* Nút CTA */}
				<motion.button
					onClick={handleViewGanttClick}
					className="mt-8 xs:mt-10 px-6 xs:px-8 py-3 xs:py-4 text-lg xs:text-xl font-bold rounded-xl transition-all shadow-xl
            hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 w-full xs:w-auto min-w-[180px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
					style={{
						backgroundColor: COLORS.accent,
						color: COLORS.surface,
						boxShadow: `0 6px 20px ${COLORS.accent}60`,
					}}
					aria-label="Xem biểu đồ Gantt"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
					viewport={{ once: true, amount: 0.5 }}
				>
					Xem biểu đồ Gantt chi tiết!
				</motion.button>

				{/* Feature cards (bây giờ sẽ được đặt ở cuối section, trên nền video) */}
				<div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 mt-10 md:mt-16 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 relative z-20">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{
								delay: index * 0.1 + 0.9,
								duration: 0.5,
								ease: "easeOut",
							}}
							viewport={{ once: true, amount: 0.5 }}
							className="flex flex-col items-center gap-3 sm:gap-4 bg-white rounded-xl shadow-lg border p-4 sm:p-6 text-center
                hover:scale-105 hover:shadow-xl transition-all duration-300 min-w-[140px]"
							style={{
								borderColor: COLORS.secondary,
								color: COLORS.textDark,
							}}
						>
							<div className="mt-1" style={{ color: COLORS.accent }}>
								{feature.icon}
							</div>
							<div>
								<h4
									className="font-semibold text-base sm:text-lg mb-1"
									style={{ color: COLORS.textDark }}
								>
									{feature.title}
								</h4>
								<p
									className="text-xs sm:text-sm opacity-80"
									style={{ color: COLORS.textLight }}
								>
									{feature.desc}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HeroGantt;