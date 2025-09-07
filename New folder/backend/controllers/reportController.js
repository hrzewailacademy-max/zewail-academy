const { pool } = require('../config/db');

// الحصول على جميع التقارير
const getReports = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.*, e.name as employee_name 
      FROM reports r 
      JOIN employees e ON r.employee_id = e.id 
      ORDER BY r.send_date DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// الحصول على تقرير بواسطة المعرف
const getReportById = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.*, e.name as employee_name 
      FROM reports r 
      JOIN employees e ON r.employee_id = e.id 
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'التقرير غير موجود' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// الحصول على تقارير موظف معين
const getEmployeeReports = async (req, res) => {
  try {
    // التحقق من وجود الموظف
    const [employee] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.employeeId]);
    
    if (employee.length === 0) {
      return res.status(404).json({ message: 'الموظف غير موجود' });
    }
    
    // الحصول على تقارير الموظف
    const [reports] = await pool.execute(
      'SELECT * FROM reports WHERE employee_id = ? ORDER BY send_date DESC',
      [req.params.employeeId]
    );
    
    res.status(200).json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// إنشاء تقرير جديد
const createReport = async (req, res) => {
  const { employee_id, report_type, content } = req.body;

  // التحقق من البيانات المطلوبة
  if (!employee_id || !report_type) {
    return res.status(400).json({ message: 'يرجى تقديم جميع البيانات المطلوبة' });
  }

  try {
    // التحقق من وجود الموظف
    const [employee] = await pool.execute('SELECT * FROM employees WHERE id = ?', [employee_id]);
    
    if (employee.length === 0) {
      return res.status(404).json({ message: 'الموظف غير موجود' });
    }

    // إدخال التقرير الجديد
    const [result] = await pool.execute(
      'INSERT INTO reports (employee_id, report_type, content) VALUES (?, ?, ?)',
      [employee_id, report_type, content || '']
    );

    // الحصول على بيانات التقرير المضاف
    const [newReport] = await pool.execute(`
      SELECT r.*, e.name as employee_name 
      FROM reports r 
      JOIN employees e ON r.employee_id = e.id 
      WHERE r.id = ?
    `, [result.insertId]);

    res.status(201).json(newReport[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// تحديث تقرير
const updateReport = async (req, res) => {
  const { report_type, content } = req.body;
  const reportId = req.params.id;

  try {
    // التحقق من وجود التقرير
    const [existingReport] = await pool.execute('SELECT * FROM reports WHERE id = ?', [reportId]);

    if (existingReport.length === 0) {
      return res.status(404).json({ message: 'التقرير غير موجود' });
    }

    // تحديث بيانات التقرير
    await pool.execute(
      `UPDATE reports SET 
        report_type = COALESCE(?, report_type), 
        content = COALESCE(?, content)
      WHERE id = ?`,
      [report_type, content, reportId]
    );

    // الحصول على بيانات التقرير المحدثة
    const [updatedReport] = await pool.execute(`
      SELECT r.*, e.name as employee_name 
      FROM reports r 
      JOIN employees e ON r.employee_id = e.id 
      WHERE r.id = ?
    `, [reportId]);

    res.status(200).json(updatedReport[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// حذف تقرير
const deleteReport = async (req, res) => {
  try {
    // التحقق من وجود التقرير
    const [existingReport] = await pool.execute('SELECT * FROM reports WHERE id = ?', [req.params.id]);

    if (existingReport.length === 0) {
      return res.status(404).json({ message: 'التقرير غير موجود' });
    }

    // حذف التقرير
    await pool.execute('DELETE FROM reports WHERE id = ?', [req.params.id]);

    res.status(200).json({ message: 'تم حذف التقرير بنجاح', id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

module.exports = {
  getReports,
  getReportById,
  getEmployeeReports,
  createReport,
  updateReport,
  deleteReport
};