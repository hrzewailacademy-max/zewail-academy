const nodemailer = require('nodemailer');
const { pool } = require('../config/db');

// إرسال بريد إلكتروني
const sendEmail = async (req, res) => {
  const { employee_id, subject, message, report_id } = req.body;

  // التحقق من البيانات المطلوبة
  if (!employee_id || !subject || !message) {
    return res.status(400).json({ message: 'يرجى تقديم جميع البيانات المطلوبة' });
  }

  try {
    // الحصول على بيانات الموظف
    const [employees] = await pool.execute('SELECT * FROM employees WHERE id = ?', [employee_id]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'الموظف غير موجود' });
    }

    const employee = employees[0];

    // إنشاء ناقل البريد الإلكتروني
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // إعداد خيارات البريد الإلكتروني
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: 'recipient@example.com', // يجب استبدالها ببريد الموظف الفعلي
      subject: subject,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 2px solid #0056b3; padding-bottom: 10px;">${subject}</h2>
          <p style="margin-top: 20px; line-height: 1.6;">${message}</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">أكاديمية زويل - نظام إدارة شؤون الموظفين</p>
          </div>
        </div>
      `
    };

    // إرسال البريد الإلكتروني
    await transporter.sendMail(mailOptions);

    // تسجيل التقرير إذا تم تقديم معرف التقرير
    if (report_id) {
      await pool.execute(
        'UPDATE reports SET send_date = CURRENT_TIMESTAMP WHERE id = ?',
        [report_id]
      );
    } else {
      // إنشاء تقرير جديد
      await pool.execute(
        'INSERT INTO reports (employee_id, report_type, content) VALUES (?, ?, ?)',
        [employee_id, 'تقرير بريد إلكتروني', message]
      );
    }

    res.status(200).json({ message: 'تم إرسال البريد الإلكتروني بنجاح' });
  } catch (error) {
    console.error('خطأ في إرسال البريد الإلكتروني:', error);
    res.status(500).json({ message: 'فشل في إرسال البريد الإلكتروني', error: error.message });
  }
};

module.exports = {
  sendEmail
};