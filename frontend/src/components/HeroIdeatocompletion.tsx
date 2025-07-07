import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, PencilRuler, ClipboardCheck, Rocket } from "lucide-react";
// import ideaImage from "../assets/idea.png"; // <-- Loại bỏ import ảnh cũ

import { COLORS } from "../constants/colors"; // Import COLORS
import ideatocompletionImage from "../assets/ideaUniPlan.png"; // <-- Import ảnh mới: ideaUniPlan.png

// Rút gọn text cho các tính năng
const features = [
	{
		icon: <Lightbulb className="w-6 h-6" />,
		title: "Ghi lại ý tưởng nhanh",
		desc: "",
	},
	{
		icon: <PencilRuler className="w-6 h-6" />,
		title: "Chuyển hóa thành hành động",
		desc: "",
	},
	{
		icon: <ClipboardCheck className="w-6 h-6" />,
		title: "Theo dõi tiến độ rõ ràng",
		desc: "",
	},
	{
		icon: <Rocket className="w-6 h-6" />,
		title: "Triển khai & hoàn thiện",
		desc: "",
	},
];

const HeroIdeatocompletion = () => {
	const handleStartIdeatingClick = () => {
		console.log("Bắt đầu lên ý tưởng ngay được click!");
	};

	return (
		<section
			className="py-20 md:py-32 relative overflow-hidden"
			style={{
				background: `linear-gradient(180deg, ${COLORS.background} 0%, ${COLORS.surface} 100%)`,
			}}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
					viewport={{ once: true, amount: 0.5 }}
					className="text-center max-w-4xl mx-auto space-y-6"
				>
					<h1
						className="text-2xl md:text-3xl font-extrabold mb-3 uppercase tracking-wide"
						style={{
							color: COLORS.primary,
							textShadow: `1px 1px 0 ${COLORS.secondary}55, 0 2px 4px ${COLORS.textDark}10`,
						}}
					>
						QUY TRÌNH SÁNG TẠO
					</h1>
					<h2
						className="text-4xl md:text-6xl font-bold leading-tight mb-6"
						style={{
							color: COLORS.textDark,
							textShadow: `2px 2px 0 ${COLORS.secondary}, 0 5px 15px ${COLORS.textDark}20`,
						}}
					>
						Từ ý tưởng{" "}
						<span style={{ color: COLORS.accent }}>đến hoàn thiện</span>
					</h2>
					<p
						className="text-lg md:text-xl opacity-90"
						style={{
							color: COLORS.textDark,
						}}
					></p>
				</motion.div>

				{/* Hình minh họa (đặt trước danh sách tính năng để tạo sự khác biệt) */}
				<div className="mt-16 mb-12 max-w-5xl mx-auto">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.02 }}
						transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
						viewport={{ once: true, amount: 0.5 }}
						className="relative rounded-2xl overflow-hidden shadow-2xl border w-full aspect-video lg:aspect-auto"
						style={{
							borderColor: COLORS.primary,
							boxShadow: `0 12px 40px ${COLORS.textDark}40`,
						}}
					>
						<img
							src={ideatocompletionImage} // <-- Sử dụng ảnh mới: Ideatocompletion.png
							alt="Từ ý tưởng đến hoàn thiện"
							loading="lazy"
							className="w-full h-full object-cover transition-transform duration-300"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
					</motion.div>
				</div>

				{/* Danh sách tính năng dạng card grid (bây giờ ở dưới hình ảnh) */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto pt-6">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{
								delay: index * 0.1 + 0.6,
								duration: 0.5,
								ease: "easeOut",
							}}
							viewport={{ once: true, amount: 0.5 }}
							className="flex flex-col items-center justify-center gap-4 bg-white rounded-2xl shadow-xl border-2 p-8 text-center hover:scale-105 hover:shadow-2xl transition-all duration-300 group"
							style={{
								borderColor: COLORS.accent,
								color: COLORS.textDark,
								minHeight: 210,
							}}
						>
							<div
								className="flex items-center justify-center w-16 h-16 rounded-full mb-2 bg-[var(--accent,#F18F01)10] group-hover:bg-[var(--accent,#F18F01)20] transition-all duration-300"
								style={{
									backgroundColor: COLORS.accent + "15",
								}}
							>
								<span
									style={{
										color: COLORS.accent,
										fontSize: 32,
									}}
								>
									{feature.icon}
								</span>
							</div>
							<h4
								className="font-bold text-lg md:text-xl mb-0.5"
								style={{ color: COLORS.textDark }}
							>
								{feature.title}
							</h4>
						</motion.div>
					))}
				</div>

				<motion.button
					onClick={handleStartIdeatingClick}
					className="mt-12 xs:mt-16 px-6 xs:px-8 py-3 xs:py-4 text-lg xs:text-xl font-bold rounded-xl transition-all shadow-xl
            hover:bg-accent-darker hover:scale-105 active:scale-95 active:shadow-inner
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 w-full xs:w-auto min-w-[180px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
					style={{
						backgroundColor: COLORS.accent,
						color: COLORS.surface,
						boxShadow: `0 6px 20px ${COLORS.accent}60`,
					}}
					aria-label="Bắt đầu lên ý tưởng ngay"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
					viewport={{ once: true, amount: 0.5 }}
				>
					Bắt đầu lên ý tưởng ngay!
				</motion.button>
			</div>
		</section>
	);
};

export default HeroIdeatocompletion;