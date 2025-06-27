import React from "react";
import { motion } from "framer-motion";
import { BrainCog, ListChecks, AlarmClockCheck, Sparkles } from "lucide-react";
// import AI_Assistant_Image from "../assets/AI_Assitant.png"; // <-- Loại bỏ import ảnh tĩnh

import { COLORS } from "../constants/colors"; // Import COLORS
import videoAIAssistant from "../assets/video/Video_Nền_AI_Assistant_Tạo_Sẵn.mp4"; // <-- Import video AI Assistant

// Rút gọn text cho các tính năng
const features = [
	{
		icon: <BrainCog className="w-6 h-6" />,
		title: "Gợi ý công việc thông minh",
		desc: "Phân tích dự án, đề xuất task/subtask.",
	},
	{
		icon: <ListChecks className="w-6 h-6" />,
		title: "Viết mô tả nhanh chóng",
		desc: "Tạo nội dung chỉ từ vài prompt.",
	},
	{
		icon: <AlarmClockCheck className="w-6 h-6" />,
		title: "Cảnh báo trễ tiến độ",
		desc: "Dự đoán rủi ro, đề xuất điều chỉnh.",
	},
	{
		icon: <Sparkles className="w-6 h-6" />,
		title: "Tối ưu lịch trình",
		desc: "Phân bổ thời gian hiệu quả nhất.",
	},
];

const HeroAIAssistant = () => {
	const handleExploreAIClick = () => {
		console.log("Khám phá trợ lý AI được click!");
		// Thêm logic điều hướng hoặc mở công cụ AI Assistant
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
				src={videoAIAssistant} // Sử dụng video AI Assistant của bạn
			>
				Your browser does not support the video tag.
			</video>

			{/* Overlay để làm mờ video và giúp chữ dễ đọc */}
			<div
				className="absolute inset-0 z-10"
				style={{
					background: `linear-gradient(160deg, ${COLORS.primary}D0 0%, ${COLORS.secondary}B0 100%)`, // Overlay màu primary/secondary
				}}
			></div>

			{/* Nội dung Hero Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
				{" "}
				{/* Tăng z-index */}
				<div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-center justify-between">
					{/* Nội dung bên trái (text và feature list dọc) */}
					<div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
							viewport={{ once: true, amount: 0.5 }}
						>
							{/* Tiêu đề phụ */}
							<h1
								className="text-2xl md:text-3xl font-extrabold mb-3 uppercase tracking-wide"
								style={{
									color: COLORS.accent, // Màu accent (cam) cho tiêu đề phụ
									textShadow: `1px 1px 0 ${COLORS.surface}55, 0 2px 4px ${COLORS.textDark}10`, // Shadow sáng hơn
								}}
							>
								TRỢ LÝ AI
							</h1>
							{/* Tiêu đề chính */}
							<h2
								className="text-4xl md:text-6xl font-bold leading-tight mb-6"
								style={{
									color: COLORS.surface, // Chữ trắng trên nền tối
									textShadow: `2px 2px 0 ${COLORS.accent}, 0 5px 15px ${COLORS.textDark}20`, // Shadow với màu accent
								}}
							>
								AI đồng hành,{" "}
								<span style={{ color: COLORS.surface }}>
									hiệu suất vượt trội
								</span>
							</h2>
							<p
								className="text-lg md:text-xl opacity-90 max-w-xl mx-auto md:mx-0"
								style={{
									color: COLORS.surface, // Chữ trắng trên nền tối
								}}
							>
								UniPlan AI không chỉ là công cụ, mà là trợ lý cá nhân giúp bạn
								tối ưu mọi quy trình, từ ý tưởng đến hoàn thiện.
							</p>
						</motion.div>

						{/* Feature list dạng cột dọc, khác biệt */}
						<div className="flex flex-col gap-6 pt-6 text-left mx-auto md:mx-0 max-w-md md:max-w-none">
							{features.map((feature, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, x: -30 }}
									whileInView={{ opacity: 1, x: 0 }}
									transition={{
										delay: index * 0.1 + 0.3,
										duration: 0.5,
										ease: "easeOut",
									}}
									viewport={{ once: true, amount: 0.5 }}
									className="flex items-start gap-4 bg-white rounded-xl shadow-lg border p-5 sm:p-6
                             hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
									style={{
										borderColor: COLORS.accent, // Viền màu accent (cam)
										color: COLORS.textDark, // Màu text mặc định (có thể đổi sang COLORS.surface)
									}}
								>
									<div
										className="mt-1 flex-shrink-0"
										style={{ color: COLORS.primary }}
									>
										{feature.icon}
									</div>{" "}
									{/* Icon màu primary */}
									<div>
										<h4
											className="font-semibold text-lg mb-1"
											style={{ color: COLORS.textDark }}
										>
											{feature.title}
										</h4>{" "}
										{/* Chữ textDark */}
										<p
											className="text-sm opacity-80"
											style={{ color: COLORS.textLight }}
										>
											{feature.desc}
										</p>{" "}
										{/* Chữ textLight (hoặc COLORS.surface) */}
									</div>
								</motion.div>
							))}
						</div>

						{/* Nút CTA */}
						<motion.button
							onClick={handleExploreAIClick}
							className="mt-10 px-6 xs:px-8 py-3 xs:py-4 text-lg xs:text-xl font-bold rounded-xl transition-all shadow-xl
                hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 w-full xs:w-auto min-w-[180px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
							style={{
								backgroundColor: COLORS.accent,
								color: COLORS.surface,
								boxShadow: `0 6px 20px ${COLORS.accent}60`,
							}}
							aria-label="Khám phá trợ lý AI"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
							viewport={{ once: true, amount: 0.5 }}
						>
							Khám phá trợ lý AI của bạn!
						</motion.button>
					</div>

					{/* Hình minh họa (trước đây) đã bị loại bỏ vì đã có video nền */}
					{/*
          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end mt-12 lg:mt-0 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.5 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border w-full max-w-xl aspect-video lg:aspect-auto"
              style={{
                borderColor: COLORS.accent,
                boxShadow: `0 12px 40px ${COLORS.textDark}40`
              }}
            >
              <img
                src={AI_Assistant_Image}
                alt="AI Assistant"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </motion.div>
          </div>
          */}
				</div>
			</div>
		</section>
	);
};

export default HeroAIAssistant;