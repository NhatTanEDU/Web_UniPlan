// models/counter.model.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  }, // Sẽ có dạng: `${kanbanId}_${status}`
  seq: { 
    type: Number, 
    default: 0 
  }
});

// Phương thức helper để lấy order tiếp theo
counterSchema.statics.getNextSequence = async function(counterName) {
  const counter = await this.findByIdAndUpdate(
    counterName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // upsert: true sẽ tạo mới nếu chưa có counter
  );
  return counter.seq;
};

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
