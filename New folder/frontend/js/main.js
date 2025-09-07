/**
 * الملف الرئيسي - نظام إدارة شؤون الموظفين - أكاديمية زويل
 * يتعامل مع تهيئة التطبيق وتحميل الصفحة
 */

// تهيئة المتغيرات العامة
const API_URL = 'http://localhost:5000/api';

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // التحقق من تسجيل الدخول
  checkAuth();
  
  // تهيئة أحداث النقر على روابط القائمة
  setupNavigation();
  
  // تهيئة أحداث النقر على أزرار فتح النوافذ المنبثقة
  setupModalButtons();
});

/**
 * التحقق من تسجيل الدخول
 */
function checkAuth() {
  // التحقق من وجود توكن صالح
  const isLoggedIn = window.auth.isAuthenticated();
  
  if (isLoggedIn) {
    // إخفاء نموذج تسجيل الدخول وإظهار المحتوى الرئيسي
    document.getElementById('login-container').classList.add('d-none');
    document.getElementById('main-container').classList.remove('d-none');
    
    // تحميل بيانات لوحة التحكم
    loadDashboard();
    
    // تحديث اسم المستخدم في الشريط العلوي
    updateUserInfo();
  } else {
    // إظهار نموذج تسجيل الدخول وإخفاء المحتوى الرئيسي
    document.getElementById('login-container').classList.remove('d-none');
    document.getElementById('main-container').classList.add('d-none');
  }
}

/**
 * تحديث معلومات المستخدم في الشريط العلوي
 */
function updateUserInfo() {
  const user = window.auth.getUser();
  if (user) {
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = user.name;
    }
  }
}

/**
 * تهيئة أحداث النقر على روابط القائمة
 */
function setupNavigation() {
  // رابط لوحة التحكم
  const dashboardLink = document.getElementById('dashboard-link');
  if (dashboardLink) {
    dashboardLink.addEventListener('click', (e) => {
      e.preventDefault();
      showDashboardSection();
    });
  }
  
  // زر تسجيل الخروج
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.auth.logout();
    });
  }
}

/**
 * تهيئة أحداث النقر على أزرار فتح النوافذ المنبثقة
 */
function setupModalButtons() {
  // زر إضافة موظف جديد
  const addEmployeeBtn = document.getElementById('add-employee-btn');
  if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener('click', () => {
      // إعادة تعيين النموذج
      document.getElementById('add-employee-form').reset();
      // إخفاء رسالة الخطأ إن وجدت
      document.getElementById('add-employee-error').classList.add('d-none');
    });
  }
  
  // زر إضافة تقرير جديد
  const addReportBtn = document.getElementById('add-report-btn');
  if (addReportBtn) {
    addReportBtn.addEventListener('click', () => {
      // إعادة تعيين النموذج
      document.getElementById('add-report-form').reset();
      // إخفاء رسالة الخطأ إن وجدت
      document.getElementById('add-report-error').classList.add('d-none');
    });
  }
}

/**
 * إظهار قسم لوحة التحكم وإخفاء الأقسام الأخرى
 */
function showDashboardSection() {
  // إخفاء الأقسام الأخرى
  document.getElementById('employees-section').classList.add('d-none');
  document.getElementById('reports-section').classList.add('d-none');
  document.getElementById('messages-section').classList.add('d-none');
  
  // إظهار قسم لوحة التحكم
  document.getElementById('dashboard-section').classList.remove('d-none');
  
  // تحديث الروابط النشطة في القائمة
  document.querySelector('.nav-link.active').classList.remove('active');
  document.getElementById('dashboard-link').classList.add('active');
  
  // تحميل بيانات لوحة التحكم
  loadDashboard();
}

/**
 * تحميل بيانات لوحة التحكم
 */
function loadDashboard() {
  // استدعاء دالة تحميل البيانات من ملف dashboard.js
  if (typeof window.loadDashboardData === 'function') {
    window.loadDashboardData();
  }
}

// تصدير الدوال للاستخدام في الملفات الأخرى
window.showDashboardSection = showDashboardSection;