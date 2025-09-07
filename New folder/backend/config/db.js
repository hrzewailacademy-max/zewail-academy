const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config({ path: '../../.env' });

// إنشاء مجمع اتصالات لقاعدة البيانات
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// اختبار الاتصال بقاعدة البيانات
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('تم الاتصال بقاعدة البيانات بنجاح!');
    connection.release();
    return true;
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error.message);
    return false;
  }
};

// تصدير مجمع الاتصالات واختبار الاتصال
module.exports = { pool, testConnection };