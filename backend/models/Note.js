const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  tags: [{ type: String }],
  file_name: { type: String, required: true },
  file_url: { type: String, required: true },
  download_count: { type: Number, default: 0 },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Note', noteSchema);