const express = require('express');
const { listUsers, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();
router.use(authenticate);
router.use(authorize('admin')); // all user management requires admin

router.get('/', listUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;