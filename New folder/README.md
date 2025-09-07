# نظام إدارة شؤون الموظفين - Zewail Academy CRM

## نظرة عامة
نظام متكامل لإدارة شؤون الموظفين في أكاديمية زويل، يتيح إدارة بيانات الموظفين، إنشاء وإرسال التقارير، وعرض إحصائيات وبيانات الموظفين بشكل مرئي. النظام يدعم اللغة العربية بالكامل ويوفر واجهة مستخدم سهلة الاستخدام.

## المميزات
- إدارة بيانات الموظفين (إضافة، تعديل، حذف، عرض)
- إنشاء وإدارة التقارير الخاصة بالموظفين
- إرسال التقارير عبر البريد الإلكتروني وتطبيق واتساب
- عرض إحصائيات وبيانات الموظفين بشكل مرئي باستخدام الرسوم البيانية
- نظام تسجيل دخول آمن باستخدام JWT
- دعم كامل للغة العربية وواجهة مستخدم RTL
- تصميم متجاوب يعمل على جميع الأجهزة

## المتطلبات
- Node.js (الإصدار 14 أو أحدث)
- MySQL (الإصدار 5.7 أو أحدث)
- متصفح حديث يدعم ES6

## التثبيت

### 1. استنساخ المشروع
```bash
git clone https://github.com/yourusername/zewail-academy-crm.git
cd zewail-academy-crm
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد ملف البيئة
قم بإنشاء ملف `.env` في مجلد `backend` باستخدام النموذج المتوفر في `.env.example`:
```
# إعدادات الخادم
PORT=5000
NODE_ENV=development

# إعدادات قاعدة البيانات
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zewail_academy_crm
DB_PORT=3306

# إعدادات JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# إعدادات Nodemailer
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=أكاديمية زويل

# إعدادات Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 4. إعداد قاعدة البيانات
```bash
npm run setup-db
```
أو قم بتشغيل ملف `database/schema.sql` في قاعدة البيانات MySQL الخاصة بك.

## تشغيل التطبيق

### تشغيل الخادم والعميل معًا (وضع التطوير)
```bash
npm run dev
```

### تشغيل الخادم فقط
```bash
npm run server
```

### تشغيل العميل فقط
```bash
npm run client
```

## الوصول إلى التطبيق
- واجهة المستخدم: http://localhost:3000
- واجهة API: http://localhost:5000/api

## بيانات تسجيل الدخول الافتراضية
- البريد الإلكتروني: admin@zewailacademy.edu.eg
- كلمة المرور: password123

## هيكل المشروع
```
├── backend/             # ملفات الخادم (Node.js/Express)
│   ├── config/          # إعدادات التطبيق
│   ├── controllers/     # وحدات التحكم
│   ├── middleware/      # الوسائط البرمجية
│   ├── routes/          # مسارات API
│   └── server.js        # نقطة دخول الخادم
├── database/            # ملفات قاعدة البيانات
│   └── schema.sql       # مخطط قاعدة البيانات
├── frontend/            # ملفات العميل
│   ├── css/             # أنماط CSS
│   ├── img/             # الصور والأيقونات
│   ├── js/              # ملفات JavaScript
│   └── index.html       # صفحة HTML الرئيسية
├── .env                 # متغيرات البيئة
├── package.json         # تبعيات المشروع
└── README.md            # توثيق المشروع
```

## المساهمة
نرحب بمساهماتكم في تطوير هذا المشروع. يرجى اتباع الخطوات التالية:
1. قم بعمل Fork للمشروع
2. قم بإنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. قم بإجراء التغييرات المطلوبة
4. قم بعمل Commit للتغييرات (`git commit -m 'إضافة ميزة رائعة'`)
5. قم بدفع التغييرات إلى الفرع (`git push origin feature/amazing-feature`)
6. قم بفتح طلب Pull Request

## الترخيص
هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## الاتصال
للاستفسارات أو الدعم، يرجى التواصل مع فريق تطوير البرمجيات في أكاديمية زويل على البريد الإلكتروني: dev@zewailacademy.edu.eg

نظام متكامل لإدارة شؤون الموظفين في أكاديمية زويل، يتضمن قاعدة بيانات SQL وواجهة باك إند باستخدام Node.js + Express، مع فرونت إند باستخدام HTML وCSS وJavaScript.

## المميزات الرئيسية

- إدارة بيانات الموظفين (إضافة، تعديل، حذف، عرض)
- إرسال تقارير عبر البريد الإلكتروني وواتساب
- لوحة تحكم لعرض إحصائيات الموظفين
- دعم كامل للغة العربية (RTL)
- تصميم متجاوب يعمل على جميع الأجهزة
- رسوم بيانية لعرض البيانات
- تأمين API باستخدام JWT

## متطلبات التشغيل

- Node.js
- MySQL أو PostgreSQL
- متصفح حديث يدعم HTML5 و CSS3

## طريقة التثبيت

1. استنساخ المشروع:
   ```
   git clone [رابط المشروع]
   ```

2. تثبيت الاعتماديات:
   ```
   cd zewail-academy-crm
   npm install
   ```

3. إعداد قاعدة البيانات:
   - قم بإنشاء قاعدة بيانات جديدة
   - قم بتعديل ملف .env بمعلومات الاتصال بقاعدة البيانات

4. تشغيل المشروع:
   ```
   npm start
   ```

5. فتح المتصفح على العنوان:
   ```
   http://localhost:3000
   ```

## هيكل المشروع

- `backend/`: ملفات الباك إند (Node.js + Express)
- `frontend/`: ملفات الفرونت إند (HTML, CSS, JavaScript)
- `database/`: سكريبتات قاعدة البيانات

## المطورون

- فريق أكاديمية زويل