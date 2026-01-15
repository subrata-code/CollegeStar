const express = require('express');
const multer = require('multer');
const path = require('path');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().populate('user_id', 'full_name');
    res.json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get notes by user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user_id: req.params.userId });
    res.json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create note
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject, tags, user_id } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : '';

    const note = new Note({
      title,
      description,
      subject,
      tags: JSON.parse(tags || '[]'),
      file_url,
      file_name: req.file ? req.file.originalname : '',
      user_id,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;