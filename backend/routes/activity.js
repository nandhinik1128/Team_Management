const express = require('express');
const router = express.Router();
const { getActivity } = require('../controllers/activityController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getActivity);

module.exports = router;