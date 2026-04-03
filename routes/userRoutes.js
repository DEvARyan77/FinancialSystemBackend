const express = require('express');
const { listUsers, updateUser, deleteUser, createUser, forgotPassword } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();
router.post('/forgot-password', forgotPassword);
router.use(authenticate);
router.use(authorize('admin'));

router.post('/', createUser);
router.get('/', listUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;