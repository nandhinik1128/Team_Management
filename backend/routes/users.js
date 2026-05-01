const express = require('express');
const router = express.Router();
const { getUsers, getProfile, updatePoints } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getUsers);
router.get('/profile', verifyToken, getProfile);
router.put('/points/:id', verifyToken, updatePoints);

module.exports = router;