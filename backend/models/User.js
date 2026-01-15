const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String },
  bio: { type: String },
  avatar_url: { type: String },
  institute: { type: String },
  course: { type: String },
  stream: { type: String },
  interests: [{ type: String }],
  lastQualification: { type: String },
  aim: { type: String },
  studyHours: { type: String },
  preferredContent: { type: String },
  profileCompletion: { type: Number, default: 0 },
  donorVerified: { type: Boolean, default: false },
  donorAmount: { type: Number },
  donorAt: { type: Date },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);