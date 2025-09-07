const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendWhatsapp } = require('../controllers/whatsappController');

// مسار إرسال رسالة واتساب
router.post('/', protect, sendWhatsapp);

module.exports = router;