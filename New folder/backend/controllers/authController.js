const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// إنشاء توكن JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// تسجيل مستخدم جديد
const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  // التحقق من البيانات المطلوبة
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'يرجى تقديم جميع البيانات المطلوبة' });
  }

  try {
    // التحقق من عدم وجود اسم مستخدم أو بريد إلكتروني مكرر
    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل' });
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // إدخال المستخدم الجديد
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user']
    );

    // الحصول على بيانات المستخدم المضاف
    const [newUser] = await pool.execute(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [result.insertId]
    );

    // إنشاء توكن JWT
    const token = generateToken(newUser[0].id);

    res.status(201).json({
      ...newUser[0],
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// تسجيل الدخول
const login = async (req, res) => {
  const { username, password } = req.body;

  // التحقق من البيانات المطلوبة
  if (!username || !password) {
    return res.status(400).json({ message: 'يرجى تقديم اسم المستخدم وكلمة المرور' });
  }

  try {
    // البحث عن المستخدم
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
    }

    const user = users[0];

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة' });
    }

    // إنشاء توكن JWT
    const token = generateToken(user.id);

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// الحصول على بيانات المستخدم الحالي
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  register,
  login,
  getMe
};