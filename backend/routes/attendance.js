const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, getMeetingAttendance } = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getAttendance);
router.post('/', verifyToken, markAttendance);
router.get('/:meetingId', verifyToken, getMeetingAttendance);

module.exports = router;