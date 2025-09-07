/**
 * ملف إدارة التقارير - نظام إدارة شؤون الموظفين - أكاديمية زويل
 * يتعامل مع عرض وإضافة وتعديل وحذف التقارير وإرسالها عبر البريد الإلكتروني وواتساب
 */

// الرابط الأساسي للـ API
const API_URL = 'http://localhost:5000/api';

// تهيئة المتغيرات العامة
let allReports = [];
let filteredReports = [];
let allEmployees = [];
let currentPage = 1;
const pageSize = 10;

// تحميل بيانات التقارير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // رابط قسم التقارير
  const reportsLink = document.getElementById('reports-link');
  if (reportsLink) {
    reportsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showReportsSection();
    });
  }
  
  // نموذج إضافة تقرير
  const saveReportBtn = document.getElementById('save-report-btn');
  if (saveReportBtn) {
    saveReportBtn.addEventListener('click', handleAddReport);
  }
  
  // نموذج تعديل تقرير
  const updateReportBtn = document.getElementById('update-report-btn');
  if (updateReportBtn) {
    updateReportBtn.addEventListener('click', handleUpdateReport);
  }
  
  // زر تأكيد الحذف
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
  }
  
  // أزرار إرسال التقارير
  const sendEmailBtn = document.getElementById('send-email-btn');
  const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');
  
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', handleSendEmail);
  }
  
  if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener('click', handleSendWhatsapp);
  }
  
  // البحث والتصفية
  const reportSearch = document.getElementById('report-search');
  const typeFilter = document.getElementById('type-filter');
  const employeeFilter = document.getElementById('employee-filter');
  const resetFiltersBtn = document.getElementById('reset-report-filters');
  
  if (reportSearch) {
    reportSearch.addEventListener('input', applyFilters);
  }
  
  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilters);
  }
  
  if (employeeFilter) {
    employeeFilter.addEventListener('change', applyFilters);
  }
  
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }
});

/**
 * إظهار قسم التقارير وإخفاء الأقسام الأخرى
 */
function showReportsSection() {
  // إخفاء الأقسام الأخرى
  document.getElementById('dashboard-section').classList.add('d-none');
  document.getElementById('employees-section').classList.add('d-none');
  document.getElementById('messages-section').classList.add('d-none');
  
  // إظهار قسم التقارير
  document.getElementById('reports-section').classList.remove('d-none');
  
  // تحديث الروابط النشطة في القائمة
  document.querySelector('.nav-link.active').classList.remove('active');
  document.getElementById('reports-link').classList.add('active');
  
  // تحميل بيانات التقارير والموظفين
  loadReportsAndEmployees();
}

/**
 * تحميل بيانات التقارير والموظفين من الخادم
 */
async function loadReportsAndEmployees() {
  try {
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // جلب بيانات الموظفين
    const employeesResponse = await fetch(`${API_URL}/employees`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!employeesResponse.ok) {
      throw new Error('فشل في جلب بيانات الموظفين');
    }
    
    // جلب بيانات التقارير
    const reportsResponse = await fetch(`${API_URL}/reports`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!reportsResponse.ok) {
      throw new Error('فشل في جلب بيانات التقارير');
    }
    
    // تحميل البيانات
    const employeesData = await employeesResponse.json();
    const reportsData = await reportsResponse.json();
    
    allEmployees = employeesData;
    allReports = reportsData;
    filteredReports = [...reportsData];
    
    // تحديث قائمة الموظفين للتصفية
    updateEmployeeFilterOptions(employeesData);
    
    // تحديث قائمة الموظفين في نموذج إضافة تقرير
    updateEmployeeSelectOptions(employeesData);
    
    // عرض بيانات التقارير
    displayReports(filteredReports, currentPage);
    
  } catch (error) {
    console.error('خطأ في تحميل البيانات:', error);
  }
}

/**
 * تحديث خيارات تصفية الموظفين
 * @param {Array} employees - بيانات الموظفين
 */
function updateEmployeeFilterOptions(employees) {
  // الحصول على قائمة الموظفين
  const employeeFilter = document.getElementById('employee-filter');
  
  // الاحتفاظ بالخيار الأول (جميع الموظفين)
  const defaultOption = employeeFilter.options[0];
  employeeFilter.innerHTML = '';
  employeeFilter.appendChild(defaultOption);
  
  // إضافة خيارات الموظفين
  employees.forEach(emp => {
    const option = document.createElement('option');
    option.value = emp.id;
    option.textContent = emp.name;
    employeeFilter.appendChild(option);
  });
}

/**
 * تحديث خيارات الموظفين في نموذج إضافة تقرير
 * @param {Array} employees - بيانات الموظفين
 */
function updateEmployeeSelectOptions(employees) {
  // الحصول على قوائم الموظفين
  const addReportEmployee = document.getElementById('report-employee');
  const editReportEmployee = document.getElementById('edit-report-employee');
  const messageEmployee = document.getElementById('message-employee');
  
  // تحديث قائمة الموظفين في نموذج إضافة تقرير
  if (addReportEmployee) {
    addReportEmployee.innerHTML = '<option value="">اختر الموظف</option>';
    employees.forEach(emp => {
      const option = document.createElement('option');
      option.value = emp.id;
      option.textContent = emp.name;
      addReportEmployee.appendChild(option);
    });
  }
  
  // تحديث قائمة الموظفين في نموذج تعديل تقرير
  if (editReportEmployee) {
    editReportEmployee.innerHTML = '<option value="">اختر الموظف</option>';
    employees.forEach(emp => {
      const option = document.createElement('option');
      option.value = emp.id;
      option.textContent = emp.name;
      editReportEmployee.appendChild(option);
    });
  }
  
  // تحديث قائمة الموظفين في نموذج إرسال رسالة
  if (messageEmployee) {
    messageEmployee.innerHTML = '<option value="">اختر الموظف</option>';
    employees.forEach(emp => {
      const option = document.createElement('option');
      option.value = emp.id;
      option.textContent = `${emp.name} (${emp.job_title})`;
      messageEmployee.appendChild(option);
    });
  }
}

/**
 * عرض بيانات التقارير في الجدول
 * @param {Array} reports - بيانات التقارير
 * @param {number} page - رقم الصفحة الحالية
 */
function displayReports(reports, page) {
  // حساب التقارير التي سيتم عرضها في الصفحة الحالية
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedReports = reports.slice(startIndex, endIndex);
  
  // الحصول على جدول التقارير
  const tableBody = document.getElementById('reports-table');
  const noReportsMessage = document.getElementById('no-reports-message');
  const reportsCount = document.getElementById('reports-count');
  
  // تحديث عدد التقارير
  reportsCount.textContent = reports.length;
  
  // التحقق من وجود تقارير
  if (reports.length === 0) {
    tableBody.innerHTML = '';
    noReportsMessage.classList.remove('d-none');
  } else {
    noReportsMessage.classList.add('d-none');
    tableBody.innerHTML = '';
    
    // تنسيق التاريخ بالعربية
    const dateFormatter = new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // إضافة التقارير إلى الجدول
    displayedReports.forEach(report => {
      const row = document.createElement('tr');
      
      // البحث عن اسم الموظف
      const employee = allEmployees.find(emp => emp.id === report.employee_id) || { name: 'غير معروف' };
      
      // تنسيق تاريخ الإرسال
      const sendDate = new Date(report.send_date);
      const formattedDate = dateFormatter.format(sendDate);
      
      // إنشاء محتوى الصف
      row.innerHTML = `
        <td>${employee.name}</td>
        <td>${report.report_type}</td>
        <td>${formattedDate}</td>
        <td>
          <button class="btn btn-sm btn-info action-btn" onclick="viewReport(${report.id})" title="عرض">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-primary action-btn" onclick="editReport(${report.id})" title="تعديل">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-success action-btn" onclick="sendReport(${report.id}, 'email')" title="إرسال بريد">
            <i class="fas fa-envelope"></i>
          </button>
          <button class="btn btn-sm btn-success action-btn" onclick="sendReport(${report.id}, 'whatsapp')" title="إرسال واتساب">
            <i class="fab fa-whatsapp"></i>
          </button>
          <button class="btn btn-sm btn-danger action-btn" onclick="deleteReport(${report.id}, '${report.report_type}')" title="حذف">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // إنشاء أزرار الصفحات
    createPagination(reports.length, page);
  }
}

/**
 * إنشاء أزرار الصفحات
 * @param {number} totalItems - إجمالي عدد العناصر
 * @param {number} currentPage - رقم الصفحة الحالية
 */
function createPagination(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const pagination = document.getElementById('reports-pagination');
  pagination.innerHTML = '';
  
  // إذا كان هناك صفحة واحدة فقط، لا داعي لإظهار أزرار الصفحات
  if (totalPages <= 1) {
    return;
  }
  
  // زر الصفحة السابقة
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `
    <a class="page-link" href="#" aria-label="السابق" ${currentPage > 1 ? `onclick="changeReportPage(${currentPage - 1}); return false;"` : ''}>
      <span aria-hidden="true">&laquo;</span>
    </a>
  `;
  pagination.appendChild(prevLi);
  
  // أزرار الصفحات
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // ضبط نطاق الصفحات المعروضة
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // إضافة أزرار الصفحات
  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement('li');
    pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
    pageLi.innerHTML = `
      <a class="page-link" href="#" onclick="changeReportPage(${i}); return false;">${i}</a>
    `;
    pagination.appendChild(pageLi);
  }
  
  // زر الصفحة التالية
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextLi.innerHTML = `
    <a class="page-link" href="#" aria-label="التالي" ${currentPage < totalPages ? `onclick="changeReportPage(${currentPage + 1}); return false;"` : ''}>
      <span aria-hidden="true">&raquo;</span>
    </a>
  `;
  pagination.appendChild(nextLi);
}

/**
 * تغيير الصفحة الحالية
 * @param {number} page - رقم الصفحة الجديدة
 */
function changeReportPage(page) {
  currentPage = page;
  displayReports(filteredReports, currentPage);
}

/**
 * تطبيق التصفية على بيانات التقارير
 */
function applyFilters() {
  const searchTerm = document.getElementById('report-search').value.trim().toLowerCase();
  const typeFilter = document.getElementById('type-filter').value;
  const employeeFilter = document.getElementById('employee-filter').value;
  
  // تصفية التقارير حسب المعايير
  filteredReports = allReports.filter(report => {
    // البحث عن اسم الموظف
    const employee = allEmployees.find(emp => emp.id === report.employee_id) || { name: 'غير معروف' };
    
    // تصفية حسب البحث
    const matchesSearch = searchTerm === '' ||
      employee.name.toLowerCase().includes(searchTerm) ||
      report.report_type.toLowerCase().includes(searchTerm);
    
    // تصفية حسب نوع التقرير
    const matchesType = typeFilter === '' || report.report_type === typeFilter;
    
    // تصفية حسب الموظف
    const matchesEmployee = employeeFilter === '' || report.employee_id.toString() === employeeFilter;
    
    return matchesSearch && matchesType && matchesEmployee;
  });
  
  // إعادة تعيين الصفحة الحالية إلى الصفحة الأولى
  currentPage = 1;
  
  // عرض التقارير المصفاة
  displayReports(filteredReports, currentPage);
}

/**
 * إعادة تعيين التصفية
 */
function resetFilters() {
  document.getElementById('report-search').value = '';
  document.getElementById('type-filter').value = '';
  document.getElementById('employee-filter').value = '';
  
  // إعادة تعيين القائمة المصفاة
  filteredReports = [...allReports];
  currentPage = 1;
  
  // عرض جميع التقارير
  displayReports(filteredReports, currentPage);
}

/**
 * معالجة إضافة تقرير جديد
 */
async function handleAddReport() {
  try {
    // الحصول على بيانات التقرير من النموذج
    const employeeId = document.getElementById('report-employee').value;
    const reportType = document.getElementById('report-type').value;
    const sendDate = document.getElementById('report-date').value;
    
    // التحقق من صحة البيانات
    if (!employeeId || !reportType || !sendDate) {
      throw new Error('جميع الحقول مطلوبة');
    }
    
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // إرسال البيانات إلى الخادم
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_id: employeeId,
        report_type: reportType,
        send_date: sendDate
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إضافة التقرير');
    }
    
    // إغلاق النافذة المنبثقة
    const modal = bootstrap.Modal.getInstance(document.getElementById('addReportModal'));
    modal.hide();
    
    // إعادة تعيين النموذج
    document.getElementById('add-report-form').reset();
    
    // إعادة تحميل بيانات التقارير
    loadReportsAndEmployees();
    
  } catch (error) {
    // عرض رسالة الخطأ
    const errorElement = document.getElementById('add-report-error');
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
  }
}

/**
 * عرض تفاصيل التقرير
 * @param {number} id - معرف التقرير
 */
function viewReport(id) {
  // البحث عن التقرير في القائمة
  const report = allReports.find(rep => rep.id === id);
  if (!report) return;
  
  // البحث عن الموظف
  const employee = allEmployees.find(emp => emp.id === report.employee_id) || { name: 'غير معروف', job_title: 'غير معروف' };
  
  // تنسيق التاريخ بالعربية
  const dateFormatter = new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const sendDate = new Date(report.send_date);
  const formattedDate = dateFormatter.format(sendDate);
  
  // تعيين بيانات التقرير في النافذة المنبثقة
  document.getElementById('view-report-title').textContent = `تقرير ${report.report_type}`;
  document.getElementById('view-report-employee').textContent = employee.name;
  document.getElementById('view-report-job').textContent = employee.job_title;
  document.getElementById('view-report-type').textContent = report.report_type;
  document.getElementById('view-report-date').textContent = formattedDate;
  
  // فتح النافذة المنبثقة
  const modal = new bootstrap.Modal(document.getElementById('viewReportModal'));
  modal.show();
}

/**
 * فتح نافذة تعديل التقرير
 * @param {number} id - معرف التقرير
 */
function editReport(id) {
  // البحث عن التقرير في القائمة
  const report = allReports.find(rep => rep.id === id);
  if (!report) return;
  
  // ملء النموذج ببيانات التقرير
  document.getElementById('edit-report-id').value = report.id;
  document.getElementById('edit-report-employee').value = report.employee_id;
  document.getElementById('edit-report-type').value = report.report_type;
  
  // تنسيق تاريخ الإرسال للنموذج (YYYY-MM-DD)
  const sendDate = new Date(report.send_date);
  const formattedDate = sendDate.toISOString().split('T')[0];
  document.getElementById('edit-report-date').value = formattedDate;
  
  // إخفاء رسالة الخطأ السابقة إن وجدت
  document.getElementById('edit-report-error').classList.add('d-none');
  
  // فتح النافذة المنبثقة
  const modal = new bootstrap.Modal(document.getElementById('editReportModal'));
  modal.show();
}

/**
 * معالجة تحديث بيانات التقرير
 */
async function handleUpdateReport() {
  try {
    // الحصول على معرف التقرير
    const id = document.getElementById('edit-report-id').value;
    
    // الحصول على بيانات التقرير من النموذج
    const employeeId = document.getElementById('edit-report-employee').value;
    const reportType = document.getElementById('edit-report-type').value;
    const sendDate = document.getElementById('edit-report-date').value;
    
    // التحقق من صحة البيانات
    if (!employeeId || !reportType || !sendDate) {
      throw new Error('جميع الحقول مطلوبة');
    }
    
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // إرسال البيانات إلى الخادم
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_id: employeeId,
        report_type: reportType,
        send_date: sendDate
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في تحديث بيانات التقرير');
    }
    
    // إغلاق النافذة المنبثقة
    const modal = bootstrap.Modal.getInstance(document.getElementById('editReportModal'));
    modal.hide();
    
    // إعادة تحميل بيانات التقارير
    loadReportsAndEmployees();
    
  } catch (error) {
    // عرض رسالة الخطأ
    const errorElement = document.getElementById('edit-report-error');
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
  }
}

/**
 * فتح نافذة تأكيد حذف التقرير
 * @param {number} id - معرف التقرير
 * @param {string} type - نوع التقرير
 */
function deleteReport(id, type) {
  // تعيين معرف التقرير ونوع العنصر
  document.getElementById('delete-item-id').value = id;
  document.getElementById('delete-item-type').value = 'report';
  
  // تعيين رسالة التأكيد
  document.getElementById('delete-confirm-message').textContent = `هل أنت متأكد من رغبتك في حذف التقرير "${type}"؟`;
  
  // فتح النافذة المنبثقة
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  modal.show();
}

/**
 * معالجة تأكيد الحذف
 */
async function handleDeleteConfirm() {
  try {
    // الحصول على معرف العنصر ونوعه
    const id = document.getElementById('delete-item-id').value;
    const type = document.getElementById('delete-item-type').value;
    
    // التحقق من أن العنصر هو تقرير
    if (type !== 'report') return;
    
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // إرسال طلب الحذف إلى الخادم
    const response = await fetch(`${API_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في حذف التقرير');
    }
    
    // إغلاق النافذة المنبثقة
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    modal.hide();
    
    // إعادة تحميل بيانات التقارير
    loadReportsAndEmployees();
    
  } catch (error) {
    console.error('خطأ في حذف التقرير:', error);
  }
}

/**
 * فتح نافذة إرسال التقرير
 * @param {number} id - معرف التقرير
 * @param {string} method - طريقة الإرسال (email أو whatsapp)
 */
function sendReport(id, method) {
  // البحث عن التقرير في القائمة
  const report = allReports.find(rep => rep.id === id);
  if (!report) return;
  
  // البحث عن الموظف
  const employee = allEmployees.find(emp => emp.id === report.employee_id);
  if (!employee) return;
  
  // تعيين معرف التقرير والموظف
  document.getElementById('message-report-id').value = report.id;
  document.getElementById('message-employee').value = employee.id;
  
  // تعيين عنوان النافذة المنبثقة حسب طريقة الإرسال
  const modalTitle = document.getElementById('messageModalLabel');
  const sendBtn = document.getElementById('send-message-btn');
  
  if (method === 'email') {
    modalTitle.textContent = 'إرسال التقرير عبر البريد الإلكتروني';
    sendBtn.textContent = 'إرسال البريد';
    sendBtn.onclick = handleSendEmail;
  } else if (method === 'whatsapp') {
    modalTitle.textContent = 'إرسال التقرير عبر واتساب';
    sendBtn.textContent = 'إرسال واتساب';
    sendBtn.onclick = handleSendWhatsapp;
  }
  
  // تعيين نوع التقرير والموضوع
  document.getElementById('message-subject').value = `تقرير ${report.report_type} - ${employee.name}`;
  
  // إنشاء محتوى الرسالة
  const messageContent = `
    مرحباً ${employee.name}،

    نرسل لكم تقرير ${report.report_type} الخاص بكم.

    التفاصيل:
    - الاسم: ${employee.name}
    - الوظيفة: ${employee.job_title}
    - الراتب: ${new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(employee.salary)}
    - تاريخ التوظيف: ${new Intl.DateTimeFormat('ar-EG').format(new Date(employee.hire_date))}

    مع تحيات،
    أكاديمية زويل
  `;
  
  document.getElementById('message-content').value = messageContent;
  
  // إخفاء رسالة الخطأ السابقة إن وجدت
  document.getElementById('message-error').classList.add('d-none');
  document.getElementById('message-success').classList.add('d-none');
  
  // فتح النافذة المنبثقة
  const modal = new bootstrap.Modal(document.getElementById('messageModal'));
  modal.show();
}

/**
 * معالجة إرسال البريد الإلكتروني
 */
async function handleSendEmail() {
  try {
    // الحصول على بيانات الرسالة من النموذج
    const reportId = document.getElementById('message-report-id').value;
    const employeeId = document.getElementById('message-employee').value;
    const subject = document.getElementById('message-subject').value;
    const content = document.getElementById('message-content').value;
    
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
    document.getElementById('send-message-btn').disabled = true;
    document.getElementById('send-message-btn').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري الإرسال...';
    
    // إرسال البيانات إلى الخادم
    const response = await fetch(`${API_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_id: employeeId,
        report_id: reportId || null,
        subject,
        content
      })
    });
    
    // إعادة تفعيل الزر
    document.getElementById('send-message-btn').disabled = false;
    document.getElementById('send-message-btn').textContent = 'إرسال البريد';
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إرسال البريد الإلكتروني');
    }
    
    // عرض رسالة النجاح
    const successElement = document.getElementById('message-success');
    successElement.textContent = 'تم إرسال البريد الإلكتروني بنجاح';
    successElement.classList.remove('d-none');
    
    // إخفاء رسالة الخطأ إن وجدت
    document.getElementById('message-error').classList.add('d-none');
    
    // إغلاق النافذة المنبثقة بعد ثانيتين
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('messageModal'));
      modal.hide();
      
      // إعادة تعيين النموذج
      document.getElementById('message-form').reset();
    }, 2000);
    
  } catch (error) {
    // عرض رسالة الخطأ
    const errorElement = document.getElementById('message-error');
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
    
    // إخفاء رسالة النجاح إن وجدت
    document.getElementById('message-success').classList.add('d-none');
  }
}

/**
 * معالجة إرسال رسالة واتساب
 */
async function handleSendWhatsapp() {
  try {
    // الحصول على بيانات الرسالة من النموذج
    const reportId = document.getElementById('message-report-id').value;
    const employeeId = document.getElementById('message-employee').value;
    const content = document.getElementById('message-content').value;
    
    // التحقق من صحة البيانات
    if (!employeeId || !content) {
      throw new Error('جميع الحقول مطلوبة');
    }
    
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // إظهار رسالة التحميل
    document.getElementById('send-message-btn').disabled = true;
    document.getElementById('send-message-btn').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري الإرسال...';
    
    // إرسال البيانات إلى الخادم
    const response = await fetch(`${API_URL}/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_id: employeeId,
        report_id: reportId || null,
        message: content
      })
    });
    
    // إعادة تفعيل الزر
    document.getElementById('send-message-btn').disabled = false;
    document.getElementById('send-message-btn').textContent = 'إرسال واتساب';
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إرسال رسالة واتساب');
    }
    
    // عرض رسالة النجاح
    const successElement = document.getElementById('message-success');
    successElement.textContent = 'تم إرسال رسالة واتساب بنجاح';
    successElement.classList.remove('d-none');
    
    // إخفاء رسالة الخطأ إن وجدت
    document.getElementById('message-error').classList.add('d-none');
    
    // إغلاق النافذة المنبثقة بعد ثانيتين
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('messageModal'));
      modal.hide();
      
      // إعادة تعيين النموذج
      document.getElementById('message-form').reset();
    }, 2000);
    
  } catch (error) {
    // عرض رسالة الخطأ
    const errorElement = document.getElementById('message-error');
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
    
    // إخفاء رسالة النجاح إن وجدت
    document.getElementById('message-success').classList.add('d-none');
  }
}

// تصدير الدوال للاستخدام في الملفات الأخرى
window.viewReport = viewReport;
window.editReport = editReport;
window.deleteReport = deleteReport;
window.sendReport = sendReport;
window.changeReportPage = changeReportPage;