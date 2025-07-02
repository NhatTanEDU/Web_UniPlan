import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Bell, AtSign, Users } from "lucide-react";
// import GiaotieptrongteamImage from "../assets/giaotieptrongteam.png"; // <-- Loại bỏ import ảnh cũ

import { COLORS } from "../constants/colors"; // Import COLORS
import communicationImage from "../assets/Communication.png"; // <-- Import ảnh mới: Communication.png

// Rút gọn text cho các tính năng
const features = [
	{
		icon: <MessageCircle className="w-6 h-6" />,
		title: "Trò chuyện tức thì",
		desc: "Trao đổi trực tiếp trong từng dự án.",
	},
	{
		icon: <AtSign className="w-6 h-6" />,
		title: "@Mention thông minh",
		desc: "Gắn thẻ để không bỏ lỡ thông tin.",
	},
	{
		icon: <Bell className="w-6 h-6" />,
		title: "Thông báo tự động",
		desc: "Cập nhật mọi thay đổi trạng thái.",
	},
	{
		icon: <Users className="w-6 h-6" />,
		title: "Gắn kết toàn đội",
		desc: "Phối hợp hiệu quả, tăng cường kết nối.",
	},
];

const HeroCommunicate = () => {
	const handleStartChattingClick = () => {
		console.log("Bắt đầu trò chuyện được click!");
		// Thêm logic điều hướng hoặc mở modal/chatbot
	};

	return (
		<section
			className="py-20 md:py-32 relative overflow-hidden"
			style={{
				background: `linear-gradient(120deg, ${COLORS.surface} 0%, ${COLORS.background} 100%)`,
			}}
		>
			<div className="max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px] mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="flex flex-col-reverse lg:flex-row items-center gap-10 md:gap-16 lg:gap-24 justify-between">
					{/* Visual bên phải (đổi vị trí để khác bố cục) */}
					<div className="lg:w-1/2 w-full flex justify-center lg:justify-start order-2 lg:order-1">
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							whileInView={{ opacity: 1, scale: 1 }}
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
							viewport={{ once: true, amount: 0.5 }}
							className="relative rounded-2xl overflow-hidden shadow-2xl border w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl aspect-video lg:aspect-auto"
							style={{
								borderColor: COLORS.primary,
								boxShadow: `0 12px 40px ${COLORS.textDark}40`,
							}}
						>
							<img
								src={communicationImage}
								alt="Giao tiếp trong team"
								loading="lazy"
								className="w-full h-full object-cover transition-transform duration-300"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
						</motion.div>
					</div>

					{/* Nội dung bên trái (đổi vị trí) */}
					<div className="lg:w-1/2 space-y-6 text-center lg:text-left order-1 lg:order-2">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
							viewport={{ once: true, amount: 0.5 }}
						>
							<h1
								className="text-xl xs:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-3 uppercase tracking-wide"
								style={{
									color: COLORS.accent,
									textShadow: `1px 1px 0 ${COLORS.primary}55, 0 2px 4px ${COLORS.textDark}10`,
								}}
							>
								GIAO TIẾP DỄ DÀNG
							</h1>
							<h2
								className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 break-words"
								style={{
									color: COLORS.textDark,
									textShadow: `2px 2px 0 ${COLORS.secondary}, 0 5px 15px ${COLORS.textDark}20`,
								}}
							>
								Kết nối liền mạch,{" "}
								<span style={{ color: COLORS.primary }}>
									phối hợp hiệu quả
								</span>
							</h2>
							<p
								className="text-base xs:text-lg md:text-xl max-w-xl mx-auto lg:mx-0"
								style={{
									color: COLORS.textDark,
									opacity: 0.9,
								}}
							>
								UniPlan loại bỏ rào cản giao tiếp, giúp đội nhóm của bạn luôn
								đồng bộ và làm việc ăn ý mọi lúc, mọi nơi.
							</p>
						</motion.div>

						<div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6 pt-6">
							{features.map((feature, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 24 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{
										delay: index * 0.07 + 0.3,
										duration: 0.5,
										ease: "easeOut",
									}}
									viewport={{ once: true, amount: 0.5 }}
									className="flex flex-col items-center sm:items-start gap-3 bg-white rounded-xl shadow-lg border p-4 sm:p-6 text-center sm:text-left
                    hover:scale-105 hover:shadow-xl transition-all duration-300 min-w-[140px]"
									style={{
										borderColor: COLORS.secondary,
										color: COLORS.textDark,
									}}
								>
									<div
										className="mt-1"
										style={{ color: COLORS.primary }}
									>
										{feature.icon}
									</div>
									<div>
										<h4 className="font-semibold text-base sm:text-lg mb-1">
											{feature.title}
										</h4>
										<p className="text-xs sm:text-sm opacity-80">
											{feature.desc}
										</p>
									</div>
								</motion.div>
							))}
						</div>

						<motion.button
							onClick={handleStartChattingClick}
							className="mt-8 xs:mt-10 px-6 xs:px-8 py-3 xs:py-4 text-lg xs:text-xl font-bold rounded-xl transition-all shadow-xl
                hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 w-full xs:w-auto min-w-[180px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
							style={{
								backgroundColor: COLORS.accent,
								color: COLORS.surface,
								boxShadow: `0 6px 20px ${COLORS.accent}60`,
							}}
							aria-label="Bắt đầu trò chuyện"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
							viewport={{ once: true, amount: 0.5 }}
						>
							Bắt đầu trò chuyện ngay!
						</motion.button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroCommunicate;