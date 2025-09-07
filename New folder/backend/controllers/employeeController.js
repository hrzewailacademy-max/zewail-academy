const { pool } = require('../config/db');

// الحصول على جميع الموظفين
const getEmployees = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM employees ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// الحصول على موظف بواسطة المعرف
const getEmployeeById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'الموظف غير موجود' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// إنشاء موظف جديد
const createEmployee = async (req, res) => {
  const { name, national_id, job_title, salary, hire_date, status } = req.body;

  // التحقق من البيانات المطلوبة
  if (!name || !national_id || !job_title || !salary || !hire_date) {
    return res.status(400).json({ message: 'يرجى تقديم جميع البيانات المطلوبة' });
  }

  try {
    // التحقق من عدم وجود رقم قومي مكرر
    const [existingEmployee] = await pool.execute(
      'SELECT * FROM employees WHERE national_id = ?',
      [national_id]
    );

    if (existingEmployee.length > 0) {
      return res.status(400).json({ message: 'الرقم القومي موجود بالفعل' });
    }

    // إدخال الموظف الجديد
    const [result] = await pool.execute(
      'INSERT INTO employees (name, national_id, job_title, salary, hire_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, national_id, job_title, salary, hire_date, status || 'نشط']
    );

    // الحصول على بيانات الموظف المضاف
    const [newEmployee] = await pool.execute('SELECT * FROM employees WHERE id = ?', [result.insertId]);

    res.status(201).json(newEmployee[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// تحديث بيانات موظف
const updateEmployee = async (req, res) => {
  const { name, national_id, job_title, salary, hire_date, status } = req.body;
  const employeeId = req.params.id;

  try {
    // التحقق من وجود الموظف
    const [existingEmployee] = await pool.execute('SELECT * FROM employees WHERE id = ?', [employeeId]);

    if (existingEmployee.length === 0) {
      return res.status(404).json({ message: 'الموظف غير موجود' });
    }

    // التحقق من عدم وجود رقم قومي مكرر (إذا تم تغييره)
    if (national_id && national_id !== existingEmployee[0].national_id) {
      const [duplicateCheck] = await pool.execute(
        'SELECT * FROM employees WHERE national_id = ? AND id != ?',
        [national_id, employeeId]
      );

      if (duplicateCheck.length > 0) {
        return res.status(400).json({ message: 'الرقم القومي موجود بالفعل' });
      }
    }

    // تحديث بيانات الموظف
    await pool.execute(
      `UPDATE employees SET 
        name = COALESCE(?, name), 
        national_id = COALESCE(?, national_id), 
        job_title = COALESCE(?, job_title), 
        salary = COALESCE(?, salary), 
        hire_date = COALESCE(?, hire_date), 
        status = COALESCE(?, status)
      WHERE id = ?`,
      [name, national_id, job_title, salary, hire_date, status, employeeId]
    );

    // الحصول على بيانات الموظف المحدثة
    const [updatedEmployee] = await pool.execute('SELECT * FROM employees WHERE id = ?', [employeeId]);

    res.status(200).json(updatedEmployee[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// حذف موظف
const deleteEmployee = async (req, res) => {
  try {
    // التحقق من وجود الموظف
    const [existingEmployee] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);

    if (existingEmployee.length === 0) {
      return res.status(404).json({ message: 'الموظف غير موجود' });
    }

    // حذف الموظف
    await pool.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);

    res.status(200).json({ message: 'تم حذف الموظف بنجاح', id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};