/**
 * ملف المصادقة - نظام إدارة شؤون الموظفين - أكاديمية زويل
 * يتعامل مع تسجيل الدخول والخروج وإدارة الجلسات
 */

// الرابط الأساسي للـ API
const API_URL = 'http://localhost:5000/api';

// التحقق من حالة تسجيل الدخول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// نموذج تسجيل الدخول
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

// زر تسجيل الخروج
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', handleLogout);
}

/**
 * التحقق من حالة تسجيل الدخول
 */
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (token && user) {
    // تحديث اسم المستخدم في الواجهة
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
      usernameElement.textContent = user.name;
    }
    
    // إظهار الواجهة الرئيسية وإخفاء نموذج تسجيل الدخول
    document.getElementById('login-container').classList.add('d-none');
    document.getElementById('main-container').classList.remove('d-none');
    
    // التحقق من صلاحية التوكن
    validateToken(token);
  } else {
    // إظهار نموذج تسجيل الدخول وإخفاء الواجهة الرئيسية
    document.getElementById('login-container').classList.remove('d-none');
    document.getElementById('main-container').classList.add('d-none');
  }
}

/**
 * التحقق من صلاحية التوكن
 * @param {string} token - توكن المصادقة
 */
async function validateToken(token) {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('انتهت صلاحية الجلسة');
    }
    
    const data = await response.json();
    // تحديث بيانات المستخدم في التخزين المحلي
    localStorage.setItem('user', JSON.stringify(data));
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    // تسجيل الخروج في حالة انتهاء صلاحية التوكن
    handleLogout();
  }
}

/**
 * معالجة تسجيل الدخول
 * @param {Event} e - حدث النموذج
 */
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');
  
  // إخفاء رسالة الخطأ السابقة إن وجدت
  errorElement.classList.add('d-none');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'فشل تسجيل الدخول');
    }
    
    // تخزين التوكن وبيانات المستخدم
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // إعادة تحميل الصفحة لتطبيق حالة تسجيل الدخول
    window.location.reload();
  } catch (error) {
    // عرض رسالة الخطأ
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
  }
}

/**
 * معالجة تسجيل الخروج
 */
function handleLogout() {
  // حذف التوكن وبيانات المستخدم من التخزين المحلي
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // إعادة تحميل الصفحة لتطبيق حالة تسجيل الخروج
  window.location.reload();
}

/**
 * الحصول على التوكن الحالي
 * @returns {string|null} توكن المصادقة أو null إذا لم يكن المستخدم مسجل الدخول
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * الحصول على بيانات المستخدم الحالي
 * @returns {Object|null} بيانات المستخدم أو null إذا لم يكن المستخدم مسجل الدخول
 */
function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

// تصدير الدوال للاستخدام في الملفات الأخرى
window.auth = {
  getToken,
  getCurrentUser,
  checkLoginStatus,
  handleLogout
};