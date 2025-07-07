/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/ScrollTrigger.tsx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        uni_black: "#000000",
        uni_gray: "#CCBABA",
        uni_darkblue: "#0B0A0A",
        uni_lightblue: "#1E90FF",
        uni_blue: "#20B5EB",
        uni_mint: "#8BE0B1",
        uni_green: "#91F7A2",
        primary: "#D4AF37",
      },
      backgroundImage: {
        "uniplan-gradient": "linear-gradient(to right, #E0F2FE, #E5CDF3)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "scale-in": "scaleIn 0.5s ease-out",
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      transitionProperty: {
        height: "height",
        width: "width",
        spacing: "margin, padding",
      },
      // Thêm cấu hình gradient tùy chỉnh nếu cần
      gradientColorStops: theme => ({
        ...theme('colors'),
        'start': '#E0F2FE',
        'end': '#E5CDF3',
      }),
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
    // Thêm plugin để xử lý gradient nếu cần
    function({ addUtilities }) {
      const newUtilities = {
        '.bg-gradient-custom': {
          backgroundImage: 'linear-gradient(to right, var(--tw-gradient-stops))',
        },
      }
      addUtilities(newUtilities)
    }
  ],
  // Tắt các core plugins không cần thiết
  corePlugins: {
    gradientColorStops: false, // Tắt gradient mặc định nếu không cần
  }
}