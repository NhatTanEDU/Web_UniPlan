export const showToast = (message: string, type: 'success' | 'error') => {
  // Tạo một div container cho toast message
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 flex items-center p-4 mb-4 rounded-lg shadow-lg z-50 ${
    type === 'success'
      ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100'
      : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100'
  }`;

  // Thêm icon và message
  const icon = type === 'success' ? '✓' : '⚠';
  toast.innerHTML = `
    <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-lg font-bold">
      ${icon}
    </div>
    <div class="ml-3 text-sm font-normal">${message}</div>
  `;

  // Thêm vào body
  document.body.appendChild(toast);

  // Tự động xóa sau 3 giây
  setTimeout(() => {
    toast.remove();
  }, 3000);
};
