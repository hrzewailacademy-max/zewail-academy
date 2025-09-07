/**
 * ملف إدارة الرسائل - نظام إدارة شؤون الموظفين - أكاديمية زويل
 * يتعامل مع إرسال الرسائل عبر البريد الإلكتروني وواتساب
 */

// الرابط الأساسي للـ API
const API_URL = 'http://localhost:5000/api';

// تهيئة المتغيرات العامة
let allEmployees = [];

// تحميل بيانات الموظفين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // رابط قسم الرسائل
  const messagesLink = document.getElementById('messages-link');
  if (messagesLink) {
    messagesLink.addEventListener('click', (e) => {
      e.preventDefault();
      showMessagesSection();
    });
  }
  
  // أزرار إرسال الرسائل
  const sendEmailBtn = document.getElementById('send-direct-email-btn');
  const sendWhatsappBtn = document.getElementById('send-direct-whatsapp-btn');
  
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', handleSendDirectEmail);
  }
  
  if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener('click', handleSendDirectWhatsapp);
  }
});

/**
 * إظهار قسم الرسائل وإخفاء الأقسام الأخرى
 */
function showMessagesSection() {
  // إخفاء الأقسام الأخرى
  document.getElementById('dashboard-section').classList.add('d-none');
  document.getElementById('employees-section').classList.add('d-none');
  document.getElementById('reports-section').classList.add('d-none');
  
  // إظهار قسم الرسائل
  document.getElementById('messages-section').classList.remove('d-none');
  
  // تحديث الروابط النشطة في القائمة
  document.querySelector('.nav-link.active').classList.remove('active');
  document.getElementById('messages-link').classList.add('active');
  
  // تحميل بيانات الموظفين
  loadEmployeesForMessages();
}

/**
 * تحميل بيانات الموظفين من الخادم
 */
async function loadEmployeesForMessages() {
  try {
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // جلب بيانات الموظفين
    const response = await fetch(`${API_URL}/employees`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('فشل في جلب بيانات الموظفين');
    }
    
    const data = await response.json();
    allEmployees = data;
    
    // تحديث قائمة الموظفين في نماذج الرسائل
    updateEmployeeSelectOptions(data);
    
  } catch (error) {
    console.error('خطأ في تحميل بيانات الموظفين:', error);
  }
}

/**
 * تحديث خيارات الموظفين في نماذج الرسائل
 * @param {Array} employees - بيانات الموظفين
 */
function updateEmployeeSelectOptions(employees) {
  // الحصول على قوائم الموظفين
  const emailEmployeeSelect = document.getElementById('email-employee');
  const whatsappEmployeeSelect = document.getElementById('whatsapp-employee');
  
  // تحديث قائمة الموظفين في نموذج البريد الإلكتروني
  if (emailEmployeeSelect) {
    emailEmployeeSelect.innerHTML = '<option value="">اختر الموظف</option>';
    employees.forEach(emp => {
      const option = document.createElement('option');
      option.value = emp.id;
      option.textContent = `${emp.name} (${emp.job_title})`;
      emailEmployeeSelect.appendChild(option);
    });
  }
  
  // تحديث قائمة الموظفين في نموذج واتساب
  if (whatsappEmployeeSelect) {
    whatsappEmployeeSelect.innerHTML = '<option value="">اختر الموظف</option>';
    employees.forEach(emp => {
      const option = document.createElement('option');
      option.value = emp.id;
      option.textContent = `${emp.name} (${emp.job_title})`;
      whatsappEmployeeSelect.appendChild(option);
    });
  }
}

/**
 * معالجة إرسال البريد الإلكتروني المباشر
 */
async function handleSendDirectEmail() {
  try {
    // الحصول على بيانات الرسالة من النموذج
    const employeeId = document.getElementById('email-employee').value;
    const subject = document.getElementById('email-subject').value;
    const content = document.getElementById('email-content').value;
    
    // التحقق من صحة البيانات
    if (!employeeId || !subject || !content) {
      throw new Error('جميع الحقول مطلوبة');
    }
    
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // إظهار رسالة التحميل
    document.getElementById('send-direct-email-btn').disabled = true;
    document.getElementById('send-direct-email-btn').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري الإرسال...';
    
    // إرسال البيانات إلى الخادم
    const response = await fetch(`${API_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_id: employeeId,
        subject,
        content
      })
    });
    
    // إعادة تفعيل الزر
    document.getElementById('send-direct-email-btn').disabled = false;
    document.getElementById('send-direct-email-btn').textContent = 'إرسال البريد';
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إرسال البريد الإلكتروني');
    }
    
    // عرض رسالة النجاح
    const successElement = document.getElementById('email-success');
    successElement.textContent = 'تم إرسال البريد الإلكتروني بنجاح';
    successElement.classList.remove('d-none');
    
    // إخفاء رسالة الخطأ إن وجدت
    document.getElementById('email-error').classList.add('d-none');
    
    // إعادة تعيين النموذج بعد ثانيتين
    setTimeout(() => {
      document.getElementById('email-form').reset();
      successElement.classList.add('d-none');
    }, 2000);
    
  } catch (error) {
    // عرض رسالة الخطأ
    const errorElement = document.getElementById('email-error');
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
    
    // إخفاء رسالة النجاح إن وجدت
    document.getElementById('email-success').classList.add('d-none');
  }
}

/**
 * معالجة إرسال رسالة واتساب المباشرة
 */
async function handleSendDirectWhatsapp() {
  try {
    // الحصول على بيانات الرسالة من النموذج
    const employeeId = document.getElementById('whatsapp-employee').value;
    const message = document.getElementById('whatsapp-content').value;
    
    // التحقق من صحة البيانات
    if (!employeeId || !message) {
      throw new Error('جميع الحقول مطلوبة');
    }
    
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // إظهار رسالة التحميل
    document.getElementById('send-direct-whatsapp-btn').disabled = true;
    document.getElementById('send-direct-whatsapp-btn').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري الإرسال...';
    
    // إرسال البيانات إلى الخادم
    const response = await fetch(`${API_URL}/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_id: employeeId,
        message
      })
    });
    
    // إعادة تفعيل الزر
    document.getElementById('send-direct-whatsapp-btn').disabled = false;
    document.getElementById('send-direct-whatsapp-btn').textContent = 'إرسال واتساب';
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إرسال رسالة واتساب');
    }
    
    // عرض رسالة النجاح
    const successElement = document.getElementById('whatsapp-success');
    successElement.textContent = 'تم إرسال رسالة واتساب بنجاح';
    successElement.classList.remove('d-none');
    
    // إخفاء رسالة الخطأ إن وجدت
    document.getElementById('whatsapp-error').classList.add('d-none');
    
    // إعادة تعيين النموذج بعد ثانيتين
    setTimeout(() => {
      document.getElementById('whatsapp-form').reset();
      successElement.classList.add('d-none');
    }, 2000);
    
  } catch (error) {
    // عرض رسالة الخطأ
    const errorElement = document.getElementById('whatsapp-error');
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
    
    // إخفاء رسالة النجاح إن وجدت
    document.getElementById('whatsapp-success').classList.add('d-none');
  }
}

// تصدير الدوال للاستخدام في الملفات الأخرى
window.showMessagesSection = showMessagesSection;