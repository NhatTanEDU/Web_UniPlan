import React from "react";
import logo from "../../assets/Name_Logo_3x.png";

const LoginSideInfo: React.FC = () => {
  return (
    // Container chính (bên trái màn hình login)
    <div
      className="hidden md:flex w-1/2 p-10 flex-col items-start justify-center text-left"
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
      <div className="flex flex-col gap-4 items-start">
        {/*
          Logo UniPlan
          - w-[150px] md:w-[240px]: rộng 150px (mobile), 240px (desktop)
          - drop-shadow-sm: đổ bóng nhẹ
          - mb-2: margin-bottom 2 (khoảng cách PHÍA DƯỚI logo)
          👉 MUỐN THAY ĐỔI KHOẢNG CÁCH DƯỚI LOGO: điều chỉnh mb-{n} (n từ 0-8)
        */}
        <img
          src={logo}
          alt="Logo UniPlan"
          className="w-[150px] md:w-[240px] drop-shadow-sm mb-1"
        />

        {/*
          Đoạn mô tả
          - text-sm: cỡ chữ nhỏ
          - max-w-xs: chiều rộng tối đa
          - mt-1: margin-top 1 (khoảng cách PHÍA TRÊN text)
          👉 MUỐN THAY ĐỔI KHOẢNG CÁCH TRÊN TEXT: điều chỉnh mt-{n}
        */}
        <p
          className="text-sm text-gray-700 max-w-xs font-normal leading-relaxed mt-4"
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