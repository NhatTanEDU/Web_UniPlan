const predictTaskRisk = (task) => {
  // Rule 1: Task quá hạn -> rủi ro cao
  if (task.is_overdue) return 0.9;
  
  // Rule 2: Task sắp hết hạn -> rủi ro trung bình
  if (task.is_approaching_deadline) return 0.7;
  
  // Rule 3: Task chưa bắt đầu nhưng đã qua 30% thời gian -> rủi ro cao
  const now = new Date();
  const start = new Date(task.start_date);
  const end = new Date(task.due_date);
  
  if (now > start && task.status === 'Cần làm') {
    const totalDuration = end - start;
    const elapsed = now - start;
    if (elapsed / totalDuration > 0.3) return 0.8;
  }
  
  return 0.2; // Rủi ro thấp
};

module.exports = { predictTaskRisk };
