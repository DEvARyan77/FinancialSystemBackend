const express = require('express');
const { summary, categoryTotals, recentActivity, trends } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();
router.use(authenticate);
router.get('/summary', authorize('viewer', 'analyst', 'admin'), summary);
router.get('/category-totals', authorize('viewer', 'analyst', 'admin'), categoryTotals);
router.get('/recent', authorize('viewer', 'analyst', 'admin'), recentActivity);
router.get('/trends', authorize('viewer', 'analyst', 'admin'), trends);

module.exports = router;