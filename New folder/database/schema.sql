-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS zewail_academy_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- استخدام قاعدة البيانات
USE zewail_academy_crm;

-- إنشاء جدول الموظفين
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  national_id VARCHAR(14) UNIQUE NOT NULL,
  job_title VARCHAR(100) NOT NULL,
  salary DECIMAL(10, 2) NOT NULL,
  hire_date DATE NOT NULL,
  status ENUM('نشط', 'متوقف', 'في إجازة') NOT NULL DEFAULT 'نشط',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إنشاء جدول التقارير
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  send_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  content TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إنشاء جدول المستخدمين للتوثيق
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدخال بيانات تجريبية للموظفين
INSERT INTO employees (name, national_id, job_title, salary, hire_date, status) VALUES
('أحمد محمد', '29901234567890', 'مدير تنفيذي', 15000.00, '2020-01-15', 'نشط'),
('سارة أحمد', '30001234567891', 'مدير موارد بشرية', 12000.00, '2020-03-20', 'نشط'),
('محمد علي', '29801234567892', 'محاسب', 8000.00, '2021-05-10', 'نشط'),
('فاطمة محمود', '29701234567893', 'مطور برمجيات', 10000.00, '2021-02-01', 'في إجازة'),
('خالد إبراهيم', '29601234567894', 'مسؤول تسويق', 9000.00, '2022-01-10', 'نشط'),
('نورا سعيد', '29501234567895', 'مساعد إداري', 6000.00, '2022-06-15', 'نشط'),
('عمر حسن', '29401234567896', 'فني دعم', 7000.00, '2021-11-20', 'متوقف');

-- إدخال بيانات تجريبية للتقارير
INSERT INTO reports (employee_id, report_type, content) VALUES
(1, 'تقرير شهري', 'محتوى التقرير الشهري للمدير التنفيذي'),
(2, 'تقرير سنوي', 'محتوى التقرير السنوي لمدير الموارد البشرية'),
(3, 'تقرير مالي', 'محتوى التقرير المالي للمحاسب'),
(4, 'تقرير أداء', 'محتوى تقرير أداء مطور البرمجيات');

-- إدخال بيانات تجريبية للمستخدمين
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGq6zpfdcN6MFsapxXowvC', 'admin@zewailacademy.edu.eg', 'admin'), -- كلمة المرور: admin123
('user', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.07ux6ydDYuZ8FwY0CD3z7uZ9S7Io7vy', 'user@zewailacademy.edu.eg', 'user'); -- كلمة المرور: user123