const express = require('express');
const { listUsers, updateUser, deleteUser, createUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();
router.use(authenticate);
router.use(authorize('admin')); // all user management requires admin

router.post('/', createUser);
router.get('/', listUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;