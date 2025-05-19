// utils/cleaner.js
//Dọn sạch sau 14 ngày (tự động)
const mongoose = require('mongoose');
const Project = require('../models/project.model.js');

const deleteOldProjects = async () => {
     const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 14 ngày
    //const cutoff = new Date(Date.now() - 1 * 1000);
  const deleted = await Project.deleteMany({
    is_deleted: true,
    deleted_at: { $lte: cutoff }
  });
  console.log(new Date(), 'Đang chạy dọn dẹp...')
  console.log(`🧹 Dọn ${deleted.deletedCount} dự án đã xóa quá 14 ngày`);
};

module.exports = deleteOldProjects;
