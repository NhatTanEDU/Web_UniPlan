import React from 'react';

const GanttPageHeader: React.FC = () => (
  <div style={{
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '24px 24px 8px 24px',
    marginBottom: 0,
    position: 'sticky',
    top: 0,
    zIndex: 20,
  }}>
    <h1 style={{
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      📊 Tổng quan Gantt - Quản lý Dự án
    </h1>
    <p style={{
      fontSize: '14px',
      color: '#6b7280',
      margin: '8px 0 0 0',
    }}>
      Xem tổng quan tiến độ và trạng thái của tất cả dự án trong hệ thống
    </p>
  </div>
);

export default GanttPageHeader;
