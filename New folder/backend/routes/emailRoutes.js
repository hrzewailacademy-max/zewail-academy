const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendEmail } = require('../controllers/emailController');

// مسار إرسال البريد الإلكتروني
router.post('/', protect, sendEmail);

module.exports = router;