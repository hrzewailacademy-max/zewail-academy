const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// وسيط للتحقق من المصادقة
const protect = async (req, res, next) => {
  let token;

  // التحقق من وجود توكن في الهيدر
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // الحصول على التوكن من الهيدر
      token = req.headers.authorization.split(' ')[1];

      // التحقق من التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // الحصول على بيانات المستخدم من قاعدة البيانات (بدون كلمة المرور)
      const [rows] = await pool.execute(
        'SELECT id, username, email, role FROM users WHERE id = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        res.status(401).json({ message: 'غير مصرح به' });
        return;
      }

      // تعيين بيانات المستخدم في الطلب
      req.user = rows[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'غير مصرح به، التوكن غير صالح' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'غير مصرح به، لا يوجد توكن' });
  }
};

// وسيط للتحقق من صلاحيات المسؤول
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'غير مسموح، يتطلب صلاحيات المسؤول' });
  }
};

module.exports = { protect, admin };