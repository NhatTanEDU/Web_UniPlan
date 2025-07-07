// src/custom.d.ts

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}

// ... (các khai báo khác nếu bạn cần cho các loại file media/ảnh khác)