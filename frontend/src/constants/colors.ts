// src/constants/colors.ts

/**
 * BẢNG MÀU CHUẨN CHO TOÀN BỘ ỨNG DỤNG (Dựa trên Logo UniPlan)
 * Bao gồm cả các màu cũ để tương thích ngược và các màu mới theo ngữ nghĩa để dễ bảo trì.
 */

// ----------------------------------------------------
// CÁC MÀU GỐC TỪ LOGO VÀ PHONG CÁCH HIỆN CÓ (ĐỂ TƯƠNG THÍCH NGƯỢC)
// Bạn có thể giữ các biến này nếu các file khác vẫn đang sử dụng chúng.
// Nên dần dần chuyển đổi các file đó sang dùng `COLORS` object bên dưới.
// ----------------------------------------------------
export const OLIVE = "#5e5728";
export const OLIVE_LIGHT = "#a3a06a";
export const CREAM = "#f9f7e8";
export const DARK_BROWN = "#2a2416";
export const WHITE = "#fff";

// ----------------------------------------------------
// BẢNG MÀU CHÍNH THỨC VỚI CÁC TÊN CÓ Ý NGHĨA (NÊN SỬ DỤNG MỚI)
// ----------------------------------------------------
export const COLORS = {
  /**
   * primary: Màu chủ đạo của ứng dụng - Lấy từ màu Olive đậm trong logo
   * → Dùng cho các thành phần chính như nút chính, tiêu đề lớn, highlight quan trọng
   */
  primary: OLIVE, // Hoặc trực tiếp "#5e5728"

  /**
   * secondary: Màu nhấn phụ - Lấy từ màu Olive nhạt trong logo
   * → Dùng cho các nút phụ, liên kết, icon, hoặc thành phần cần nổi bật nhẹ
   */
  secondary: OLIVE_LIGHT, // Hoặc trực tiếp "#a3a06a"

  /**
   * accent: Màu điểm nhấn mạnh - Màu cam năng lượng để tạo sự tươi sáng, năng lượng
   * → Dùng cho các chi tiết nổi bật cần thu hút sự chú ý (ví dụ: nút "Bắt đầu miễn phí" sáng hơn, highlight đồ thị)
   */
  accent: "#F18F01", // Cam - Mang lại năng lượng và sự chú ý, nhưng vẫn hài hòa

  /**
   * background: Nền tổng thể của layout - Lấy từ màu Cream
   * → Dùng cho nền trang, wrapper, hoặc container chính
   */
  background: CREAM, // Hoặc trực tiếp "#f9f7e8"

  /**
   * surface: Nền của các thành phần nổi bật trên màn hình (card, form, modal...)
   * → Thường là màu trắng hoặc gần trắng
   */
  surface: WHITE, // Hoặc trực tiếp "#FFFFFF"

  /**
   * textDark: Màu chữ chính, tiêu đề, nội dung chính - Lấy từ màu nâu tối
   * → Đảm bảo độ tương phản cao với nền sáng
   */
  textDark: DARK_BROWN, // Hoặc trực tiếp "#2a2416"

  /**
   * textLight: Màu chữ phụ, chú thích, placeholder
   * → Độ tương phản thấp hơn, nhẹ nhàng, tinh tế. Tôi dùng một màu xám xanh thay vì chỉ dùng DARK_BROWN opacity.
   */
  textLight: "#8D99AE", // Một sắc thái xám xanh nhạt hơn, phù hợp cho textLight

  /**
   * border: Màu viền, đường phân cách
   * → Dùng cho các đường kẻ, viền button, border của card. Lấy từ màu xám nhạt để bổ trợ.
   */
  border: "#d1d5db", // Xám nhạt

  /**
   * error: Màu cảnh báo, lỗi
   * → Dùng cho thông báo lỗi, input sai, trạng thái thất bại
   */
  error: "#EF233C", // Đỏ tươi

  /**
   * success: Màu thành công
   * → Dùng cho trạng thái thành công, thông báo tích cực
   */
  success: "#50C878", // Xanh lá sáng

  // Có thể thêm các biến màu khác nếu cần: ví dụ: info, warning, disabled, v.v.
};