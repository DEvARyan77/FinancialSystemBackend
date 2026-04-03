const express = require('express');
const { create, list, getById, update, deleteRecord } = require('../controllers/recordController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');
const { validateQuery, recordListQuerySchema } = require('../middlewares/queryValidation');

const router = express.Router();
router.use(authenticate); // all routes require auth

router.post('/', authorize('analyst', 'admin'), validate(schemas.createRecord), create);
router.get('/:id', authorize('viewer', 'analyst', 'admin'), getById);
router.put('/:id', authorize('analyst', 'admin'), validate(schemas.updateRecord), update);
router.delete('/:id', authorize('admin'), deleteRecord);
router.get('/', authorize('viewer', 'analyst', 'admin'), validateQuery(recordListQuerySchema), list);

module.exports = router;