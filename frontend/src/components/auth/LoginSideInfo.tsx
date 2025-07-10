import React from "react";
import logo from "../../assets/Name_Logo_3x.png";

const LoginSideInfo: React.FC = () => {
  return (
    // Container chính (bên trái màn hình login)
    <div
      className="hidden lg:flex w-1/2 p-6 md:p-8 lg:p-10 flex-col items-start justify-center text-left"
      style={{
        backgroundColor: "#F9F9F5", // Màu nền nhẹ
      }}
    >
      {/*
        Container chứa logo và mô tả
        - flex-col: sắp xếp các phần tử theo chiều dọc
        - gap-2: khoảng cách GIỮA các phần tử con (logo và text)
        - items-start: căn lề trái
      */}
      <div className="flex flex-col gap-4 items-start w-full">
        {/*
          Logo UniPlan
          - w-[120px] md:w-[180px] lg:w-[240px]: responsive logo size
          - drop-shadow-sm: đổ bóng nhẹ
          - mb-2: margin-bottom 2 (khoảng cách PHÍA DƯỚI logo)
          👉 MUỐN THAY ĐỔI KHOẢNG CÁCH DƯỚI LOGO: điều chỉnh mb-{n} (n từ 0-8)
        */}
        <img
          src={logo}
          alt="Logo UniPlan"
          className="w-[120px] md:w-[180px] lg:w-[240px] xl:w-[280px] drop-shadow-sm mb-1 max-w-full h-auto"
        />

        {/*
          Đoạn mô tả
          - text-xs md:text-sm lg:text-base: responsive text size
          - max-w-xs lg:max-w-sm: responsive max width
          - mt-1: margin-top 1 (khoảng cách PHÍA TRÊN text)
          👉 MUỐN THAY ĐỔI KHOẢNG CÁCH TRÊN TEXT: điều chỉnh mt-{n}
        */}
        <p
          className="text-xs md:text-sm lg:text-base text-gray-700 max-w-xs lg:max-w-sm xl:max-w-md font-normal leading-relaxed mt-2 md:mt-4 break-words"
          style={{
            fontFamily: "Poppins, sans-serif", // Font chữ
            color: "#374151", // Màu chữ
            textShadow: "0.5px 0.5px 0 #14AE5C", // Đổ bóng chữ
            /*
              lineHeight: khoảng cách GIỮA CÁC DÒNG trong đoạn văn
              👉 MUỐN THAY ĐỔI KHOẢNG CÁCH DÒNG: điều chỉnh giá trị này
              - 1.4: hơi rộng
              - 1.2: vừa phải
              - 1: sát nhau
            */
            lineHeight: "1.4",
          }}
        >
          UniPlan – Giải pháp quản lý dự án toàn diện: Từ lập kế hoạch đến báo cáo.
          Tích hợp AI hỗ trợ nhắc hạn và dự đoán tiến độ.
        </p>
      </div>
    </div>
  );
};

export default LoginSideInfo;