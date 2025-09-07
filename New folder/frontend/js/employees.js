/**
 * ملف إدارة الموظفين - نظام إدارة شؤون الموظفين - أكاديمية زويل
 * يتعامل مع عرض وإضافة وتعديل وحذف الموظفين
 */

// الرابط الأساسي للـ API
const API_URL = 'http://localhost:5000/api';

// تهيئة المتغيرات العامة
let allEmployees = [];
let filteredEmployees = [];
let currentPage = 1;
const pageSize = 10;

// تحميل بيانات الموظفين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // رابط قسم الموظفين
  const employeesLink = document.getElementById('employees-link');
  if (employeesLink) {
    employeesLink.addEventListener('click', (e) => {
      e.preventDefault();
      showEmployeesSection();
    });
  }
  
  // نموذج إضافة موظف
  const saveEmployeeBtn = document.getElementById('save-employee-btn');
  if (saveEmployeeBtn) {
    saveEmployeeBtn.addEventListener('click', handleAddEmployee);
  }
  
  // نموذج تعديل موظف
  const updateEmployeeBtn = document.getElementById('update-employee-btn');
  if (updateEmployeeBtn) {
    updateEmployeeBtn.addEventListener('click', handleUpdateEmployee);
  }
  
  // زر تأكيد الحذف
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
  }
  
  // البحث والتصفية
  const employeeSearch = document.getElementById('employee-search');
  const statusFilter = document.getElementById('status-filter');
  const jobFilter = document.getElementById('job-filter');
  const resetFiltersBtn = document.getElementById('reset-filters');
  
  if (employeeSearch) {
    employeeSearch.addEventListener('input', applyFilters);
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }
  
  if (jobFilter) {
    jobFilter.addEventListener('change', applyFilters);
  }
  
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }
});

/**
 * إظهار قسم الموظفين وإخفاء الأقسام الأخرى
 */
function showEmployeesSection() {
  // إخفاء الأقسام الأخرى
  document.getElementById('dashboard-section').classList.add('d-none');
  document.getElementById('reports-section').classList.add('d-none');
  document.getElementById('messages-section').classList.add('d-none');
  
  // إظهار قسم الموظفين
  document.getElementById('employees-section').classList.remove('d-none');
  
  // تحديث الروابط النشطة في القائمة
  document.querySelector('.nav-link.active').classList.remove('active');
  document.getElementById('employees-link').classList.add('active');
  
  // تحميل بيانات الموظفين
  loadEmployees();
}

/**
 * تحميل بيانات الموظفين من الخادم
 */
async function loadEmployees() {
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
    filteredEmployees = [...data];
    
    // تحديث قائمة الوظائف للتصفية
    updateJobFilterOptions(data);
    
    // عرض بيانات الموظفين
    displayEmployees(filteredEmployees, currentPage);
    
  } catch (error) {
    console.error('خطأ في تحميل بيانات الموظفين:', error);
  }
}

/**
 * تحديث خيارات تصفية الوظائف
 * @param {Array} employees - بيانات الموظفين
 */
function updateJobFilterOptions(employees) {
  // استخراج الوظائف الفريدة
  const uniqueJobs = [...new Set(employees.map(emp => emp.job_title))];
  
  // الحصول على قائمة الوظائف
  const jobFilter = document.getElementById('job-filter');
  
  // الاحتفاظ بالخيار الأول (جميع الوظائف)
  const defaultOption = jobFilter.options[0];
  jobFilter.innerHTML = '';
  jobFilter.appendChild(defaultOption);
  
  // إضافة خيارات الوظائف
  uniqueJobs.forEach(job => {
    const option = document.createElement('option');
    option.value = job;
    option.textContent = job;
    jobFilter.appendChild(option);
  });
}

/**
 * عرض بيانات الموظفين في الجدول
 * @param {Array} employees - بيانات الموظفين
 * @param {number} page - رقم الصفحة الحالية
 */
function displayEmployees(employees, page) {
  // حساب الموظفين الذين سيتم عرضهم في الصفحة الحالية
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedEmployees = employees.slice(startIndex, endIndex);
  
  // الحصول على جدول الموظفين
  const tableBody = document.getElementById('employees-table');
  const noEmployeesMessage = document.getElementById('no-employees-message');
  const employeesCount = document.getElementById('employees-count');
  
  // تحديث عدد الموظفين
  employeesCount.textContent = employees.length;
  
  // التحقق من وجود موظفين
  if (employees.length === 0) {
    tableBody.innerHTML = '';
    noEmployeesMessage.classList.remove('d-none');
  } else {
    noEmployeesMessage.classList.add('d-none');
    tableBody.innerHTML = '';
    
    // تنسيق العملة المصرية
    const currencyFormatter = new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    });
    
    // تنسيق التاريخ بالعربية
    const dateFormatter = new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // إضافة الموظفين إلى الجدول
    displayedEmployees.forEach(emp => {
      const row = document.createElement('tr');
      
      // تحديد لون الحالة
      let statusClass = '';
      switch (emp.status) {
        case 'نشط':
          statusClass = 'status-active';
          break;
        case 'متوقف':
          statusClass = 'status-inactive';
          break;
        case 'في إجازة':
          statusClass = 'status-leave';
          break;
      }
      
      // تنسيق تاريخ التوظيف
      const hireDate = new Date(emp.hire_date);
      const formattedDate = dateFormatter.format(hireDate);
      
      // إنشاء محتوى الصف
      row.innerHTML = `
        <td>${emp.name}</td>
        <td>${emp.national_id}</td>
        <td>${emp.job_title}</td>
        <td>${formattedDate}</td>
        <td>${currencyFormatter.format(emp.salary)}</td>
        <td><span class="status-badge ${statusClass}">${emp.status}</span></td>
        <td>
          <button class="btn btn-sm btn-primary action-btn" onclick="editEmployee(${emp.id})" title="تعديل">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger action-btn" onclick="deleteEmployee(${emp.id}, '${emp.name}')" title="حذف">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
    
    // إنشاء أزرار الصفحات
    createPagination(employees.length, page);
  }
}

/**
 * إنشاء أزرار الصفحات
 * @param {number} totalItems - إجمالي عدد العناصر
 * @param {number} currentPage - رقم الصفحة الحالية
 */
function createPagination(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const pagination = document.getElementById('employees-pagination');
  pagination.innerHTML = '';
  
  // إذا كان هناك صفحة واحدة فقط، لا داعي لإظهار أزرار الصفحات
  if (totalPages <= 1) {
    return;
  }
  
  // زر الصفحة السابقة
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `
    <a class="page-link" href="#" aria-label="السابق" ${currentPage > 1 ? `onclick="changePage(${currentPage - 1}); return false;"` : ''}>
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
      <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
    `;
    pagination.appendChild(pageLi);
  }
  
  // زر الصفحة التالية
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextLi.innerHTML = `
    <a class="page-link" href="#" aria-label="التالي" ${currentPage < totalPages ? `onclick="changePage(${currentPage + 1}); return false;"` : ''}>
      <span aria-hidden="true">&raquo;</span>
    </a>
  `;
  pagination.appendChild(nextLi);
}

/**
 * تغيير الصفحة الحالية
 * @param {number} page - رقم الصفحة الجديدة
 */
function changePage(page) {
  currentPage = page;
  displayEmployees(filteredEmployees, currentPage);
}

/**
 * تطبيق التصفية على بيانات الموظفين
 */
function applyFilters() {
  const searchTerm = document.getElementById('employee-search').value.trim().toLowerCase();
  const statusFilter = document.getElementById('status-filter').value;
  const jobFilter = document.getElementById('job-filter').value;
  
  // تصفية الموظفين حسب المعايير
  filteredEmployees = allEmployees.filter(emp => {
    // تصفية حسب البحث
    const matchesSearch = searchTerm === '' ||
      emp.name.toLowerCase().includes(searchTerm) ||
      emp.national_id.toLowerCase().includes(searchTerm) ||
      emp.job_title.toLowerCase().includes(searchTerm);
    
    // تصفية حسب الحالة
    const matchesStatus = statusFilter === '' || emp.status === statusFilter;
    
    // تصفية حسب الوظيفة
    const matchesJob = jobFilter === '' || emp.job_title === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });
  
  // إعادة تعيين الصفحة الحالية إلى الصفحة الأولى
  currentPage = 1;
  
  // عرض الموظفين المصفاة
  displayEmployees(filteredEmployees, currentPage);
}

/**
 * إعادة تعيين التصفية
 */
function resetFilters() {
  document.getElementById('employee-search').value = '';
  document.getElementById('status-filter').value = '';
  document.getElementById('job-filter').value = '';
  
  // إعادة تعيين القائمة المصفاة
  filteredEmployees = [...allEmployees];
  currentPage = 1;
  
  // عرض جميع الموظفين
  displayEmployees(filteredEmployees, currentPage);
}

/**
 * معالجة إضافة موظف جديد
 */
async function handleAddEmployee() {
  try {
    // الحصول على بيانات الموظف من النموذج
    const name = document.getElementById('employee-name').value;
    const nationalId = document.getElementById('employee-national-id').value;
    const jobTitle = document.getElementById('employee-job').value;
    const salary = document.getElementById('employee-salary').value;
    const hireDate = document.getElementById('employee-hire-date').value;
    const status = document.getElementById('employee-status').value;
    
    // التحقق من صحة البيانات
    if (!name || !nationalId || !jobTitle || !salary || !hireDate || !status) {
      throw new Error('جميع الحقول مطلوبة');
    }
    
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // إرسال البيانات إلى الخادم
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        national_id: nationalId,
        job_title: jobTitle,
        salary,
        hire_date: hireDate,
        status
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إضافة الموظف');
    }
    
    // إغلاق النافذة المنبثقة
    const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
    modal.hide();
    
    // إعادة تعيين النموذج
    document.getElementById('add-employee-form').reset();
    
    // إعادة تحميل بيانات الموظفين
    loadEmployees();
    
  } catch (error) {
    // عرض رسالة الخطأ
    const errorElement = document.getElementById('add-employee-error');
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
  }
}

/**
 * فتح نافذة تعديل الموظف
 * @param {number} id - معرف الموظف
 */
function editEmployee(id) {
  // البحث عن الموظف في القائمة
  const employee = allEmployees.find(emp => emp.id === id);
  if (!employee) return;
  
  // ملء النموذج ببيانات الموظف
  document.getElementById('edit-employee-id').value = employee.id;
  document.getElementById('edit-employee-name').value = employee.name;
  document.getElementById('edit-employee-national-id').value = employee.national_id;
  document.getElementById('edit-employee-job').value = employee.job_title;
  document.getElementById('edit-employee-salary').value = employee.salary;
  
  // تنسيق تاريخ التوظيف للنموذج (YYYY-MM-DD)
  const hireDate = new Date(employee.hire_date);
  const formattedDate = hireDate.toISOString().split('T')[0];
  document.getElementById('edit-employee-hire-date').value = formattedDate;
  
  document.getElementById('edit-employee-status').value = employee.status;
  
  // إخفاء رسالة الخطأ السابقة إن وجدت
  document.getElementById('edit-employee-error').classList.add('d-none');
  
  // فتح النافذة المنبثقة
  const modal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
  modal.show();
}

/**
 * معالجة تحديث بيانات الموظف
 */
async function handleUpdateEmployee() {
  try {
    // الحصول على معرف الموظف
    const id = document.getElementById('edit-employee-id').value;
    
    // الحصول على بيانات الموظف من النموذج
    const name = document.getElementById('edit-employee-name').value;
    const nationalId = document.getElementById('edit-employee-national-id').value;
    const jobTitle = document.getElementById('edit-employee-job').value;
    const salary = document.getElementById('edit-employee-salary').value;
    const hireDate = document.getElementById('edit-employee-hire-date').value;
    const status = document.getElementById('edit-employee-status').value;
    
    // التحقق من صحة البيانات
    if (!name || !nationalId || !jobTitle || !salary || !hireDate || !status) {
      throw new Error('جميع الحقول مطلوبة');
    }
    
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // إرسال البيانات إلى الخادم
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        national_id: nationalId,
        job_title: jobTitle,
        salary,
        hire_date: hireDate,
        status
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في تحديث بيانات الموظف');
    }
    
    // إغلاق النافذة المنبثقة
    const modal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
    modal.hide();
    
    // إعادة تحميل بيانات الموظفين
    loadEmployees();
    
  } catch (error) {
    // عرض رسالة الخطأ
    const errorElement = document.getElementById('edit-employee-error');
    errorElement.textContent = error.message;
    errorElement.classList.remove('d-none');
  }
}

/**
 * فتح نافذة تأكيد حذف الموظف
 * @param {number} id - معرف الموظف
 * @param {string} name - اسم الموظف
 */
function deleteEmployee(id, name) {
  // تعيين معرف الموظف ونوع العنصر
  document.getElementById('delete-item-id').value = id;
  document.getElementById('delete-item-type').value = 'employee';
  
  // تعيين رسالة التأكيد
  document.getElementById('delete-confirm-message').textContent = `هل أنت متأكد من رغبتك في حذف الموظف "${name}"؟`;
  
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
    
    // التحقق من أن العنصر هو موظف
    if (type !== 'employee') return;
    
    // الحصول على التوكن
    const token = window.auth.getToken();
    if (!token) {
      throw new Error('لم يتم تسجيل الدخول');
    }
    
    // إرسال طلب الحذف إلى الخادم
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في حذف الموظف');
    }
    
    // إغلاق النافذة المنبثقة
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    modal.hide();
    
    // إعادة تحميل بيانات الموظفين
    loadEmployees();
    
  } catch (error) {
    console.error('خطأ في حذف الموظف:', error);
  }
}

// تصدير الدوال للاستخدام في الملفات الأخرى
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.changePage = changePage;