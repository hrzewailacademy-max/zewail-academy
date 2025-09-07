const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getEmployeeReports
} = require('../controllers/reportController');

// مسارات التقارير
router.route('/')
  .get(protect, getReports)
  .post(protect, createReport);

router.route('/:id')
  .get(protect, getReportById)
  .put(protect, updateReport)
  .delete(protect, deleteReport);

// الحصول على تقارير موظف معين
router.get('/employee/:employeeId', protect, getEmployeeReports);

module.exports = router;