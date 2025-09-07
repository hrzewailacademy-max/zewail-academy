const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// تحميل متغيرات البيئة
dotenv.config({ path: '../.env' });

// إنشاء تطبيق Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// تعيين المجلد الثابت
app.use(express.static(path.join(__dirname, '../frontend')));

// تضمين مسارات API
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/send-email', require('./routes/emailRoutes'));
app.use('/api/send-whatsapp', require('./routes/whatsappRoutes'));

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// معالجة المسارات غير الموجودة
app.use((req, res) => {
  res.status(404).json({ message: 'المسار غير موجود' });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'خطأ في الخادم', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// تعيين المنفذ والاستماع للطلبات
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT} في وضع ${process.env.NODE_ENV}`);
});