const twilio = require('twilio');
const { pool } = require('../config/db');

// إرسال رسالة واتساب
const sendWhatsapp = async (req, res) => {
  const { employee_id, message, report_id } = req.body;

  // التحقق من البيانات المطلوبة
  if (!employee_id || !message) {
    return res.status(400).json({ message: 'يرجى تقديم جميع البيانات المطلوبة' });
  }

  try {
    // الحصول على بيانات الموظف
    const [employees] = await pool.execute('SELECT * FROM employees WHERE id = ?', [employee_id]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'الموظف غير موجود' });
    }

    const employee = employees[0];

    // إنشاء عميل Twilio
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // إرسال رسالة واتساب
    await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:+201234567890` // يجب استبدالها برقم هاتف الموظف الفعلي
    });

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
        [employee_id, 'تقرير واتساب', message]
      );
    }

    res.status(200).json({ message: 'تم إرسال رسالة الواتساب بنجاح' });
  } catch (error) {
    console.error('خطأ في إرسال رسالة الواتساب:', error);
    res.status(500).json({ message: 'فشل في إرسال رسالة الواتساب', error: error.message });
  }
};

module.exports = {
  sendWhatsapp
};