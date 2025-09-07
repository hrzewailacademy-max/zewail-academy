/**
 * ملف لوحة التحكم - نظام إدارة شؤون الموظفين - أكاديمية زويل
 * يتعامل مع عرض البيانات والإحصائيات في لوحة التحكم
 */

// الرابط الأساسي للـ API
const API_URL = 'http://localhost:5000/api';

// تهيئة المتغيرات العامة
let employeesData = [];
let jobDistributionChart = null;
let salaryChart = null;

// تحميل بيانات لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // التحقق من وجود قسم لوحة التحكم
  if (document.getElementById('dashboard-section')) {
    loadDashboardData();
  }
  
  // زر عرض جميع الموظفين
  const viewAllEmployeesBtn = document.getElementById('view-all-employees');
  if (viewAllEmployeesBtn) {
    viewAllEmployeesBtn.addEventListener('click', () => {
      // إخفاء لوحة التحكم وإظهار قسم الموظفين
      document.getElementById('dashboard-section').classList.add('d-none');
      document.getElementById('employees-section').classList.remove('d-none');
      document.getElementById('reports-section').classList.add('d-none');
      document.getElementById('messages-section').classList.add('d-none');
      
      // تحديث الروابط النشطة في القائمة
      document.querySelector('.nav-link.active').classList.remove('active');
      document.getElementById('employees-link').classList.add('active');
    });
  }
});

/**
 * تحميل بيانات لوحة التحكم
 */
async function loadDashboardData() {
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
      throw new Error('فشل في جلب البيانات');
    }
    
    const data = await response.json();
    employeesData = data;
    
    // تحديث إحصائيات الموظفين
    updateEmployeeStats(data);
    
    // تحديث الرسوم البيانية
    createJobDistributionChart(data);
    createSalaryChart(data);
    
    // عرض أحدث الموظفين
    displayRecentEmployees(data);
    
  } catch (error) {
    console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
  }
}

/**
 * تحديث إحصائيات الموظفين
 * @param {Array} employees - بيانات الموظفين
 */
function updateEmployeeStats(employees) {
  // إجمالي عدد الموظفين
  document.getElementById('total-employees').textContent = employees.length;
  
  // عدد الموظفين النشطين
  const activeCount = employees.filter(emp => emp.status === 'نشط').length;
  document.getElementById('active-employees').textContent = activeCount;
  
  // عدد الموظفين في إجازة
  const onLeaveCount = employees.filter(emp => emp.status === 'في إجازة').length;
  document.getElementById('on-leave-employees').textContent = onLeaveCount;
  
  // عدد الموظفين المتوقفين
  const inactiveCount = employees.filter(emp => emp.status === 'متوقف').length;
  document.getElementById('inactive-employees').textContent = inactiveCount;
}

/**
 * إنشاء رسم بياني لتوزيع الموظفين حسب الوظيفة
 * @param {Array} employees - بيانات الموظفين
 */
function createJobDistributionChart(employees) {
  // تجميع الموظفين حسب الوظيفة
  const jobCounts = {};
  employees.forEach(emp => {
    if (jobCounts[emp.job_title]) {
      jobCounts[emp.job_title]++;
    } else {
      jobCounts[emp.job_title] = 1;
    }
  });
  
  // تحويل البيانات إلى تنسيق مناسب للرسم البياني
  const labels = Object.keys(jobCounts);
  const data = Object.values(jobCounts);
  
  // ألوان للرسم البياني
  const backgroundColors = [
    '#1e88e5', '#26a69a', '#ff9800', '#d32f2f', '#7b1fa2', '#388e3c', '#ffa000', '#5d4037', '#455a64', '#0097a7'
  ];
  
  // الحصول على عنصر الرسم البياني
  const ctx = document.getElementById('job-distribution-chart').getContext('2d');
  
  // إذا كان الرسم البياني موجودًا بالفعل، قم بتدميره
  if (jobDistributionChart) {
    jobDistributionChart.destroy();
  }
  
  // إنشاء رسم بياني دائري
  jobDistributionChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          rtl: true,
          labels: {
            font: {
              family: 'Cairo'
            }
          }
        },
        tooltip: {
          rtl: true,
          titleFont: {
            family: 'Cairo'
          },
          bodyFont: {
            family: 'Cairo'
          },
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * إنشاء رسم بياني لمتوسط الرواتب
 * @param {Array} employees - بيانات الموظفين
 */
function createSalaryChart(employees) {
  // تجميع الموظفين حسب الوظيفة وحساب متوسط الراتب
  const jobSalaries = {};
  const jobCounts = {};
  
  employees.forEach(emp => {
    if (jobSalaries[emp.job_title]) {
      jobSalaries[emp.job_title] += parseFloat(emp.salary);
      jobCounts[emp.job_title]++;
    } else {
      jobSalaries[emp.job_title] = parseFloat(emp.salary);
      jobCounts[emp.job_title] = 1;
    }
  });
  
  // حساب متوسط الراتب لكل وظيفة
  const averageSalaries = {};
  for (const job in jobSalaries) {
    averageSalaries[job] = jobSalaries[job] / jobCounts[job];
  }
  
  // تحويل البيانات إلى تنسيق مناسب للرسم البياني
  const labels = Object.keys(averageSalaries);
  const data = Object.values(averageSalaries);
  
  // الحصول على عنصر الرسم البياني
  const ctx = document.getElementById('salary-chart').getContext('2d');
  
  // إذا كان الرسم البياني موجودًا بالفعل، قم بتدميره
  if (salaryChart) {
    salaryChart.destroy();
  }
  
  // تنسيق العملة المصرية
  const currencyFormatter = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP'
  });
  
  // إنشاء رسم بياني شريطي
  salaryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'متوسط الراتب',
        data: data,
        backgroundColor: '#1e88e5',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          rtl: true,
          titleFont: {
            family: 'Cairo'
          },
          bodyFont: {
            family: 'Cairo'
          },
          callbacks: {
            label: function(context) {
              return `متوسط الراتب: ${currencyFormatter.format(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return currencyFormatter.format(value);
            },
            font: {
              family: 'Cairo'
            }
          }
        },
        x: {
          ticks: {
            font: {
              family: 'Cairo'
            }
          }
        }
      }
    }
  });
}

/**
 * عرض أحدث الموظفين في الجدول
 * @param {Array} employees - بيانات الموظفين
 */
function displayRecentEmployees(employees) {
  // ترتيب الموظفين حسب تاريخ التوظيف (الأحدث أولاً)
  const sortedEmployees = [...employees].sort((a, b) => {
    return new Date(b.hire_date) - new Date(a.hire_date);
  });
  
  // أخذ أحدث 5 موظفين
  const recentEmployees = sortedEmployees.slice(0, 5);
  
  // الحصول على جدول أحدث الموظفين
  const tableBody = document.getElementById('recent-employees-table');
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
  recentEmployees.forEach(emp => {
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
      <td>${emp.job_title}</td>
      <td>${formattedDate}</td>
      <td>${currencyFormatter.format(emp.salary)}</td>
      <td><span class="status-badge ${statusClass}">${emp.status}</span></td>
    `;
    
    tableBody.appendChild(row);
  });
}