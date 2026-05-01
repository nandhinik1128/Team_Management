const express = require('express');
const router = express.Router();
const { getPolls, createPoll, vote } = require('../controllers/pollController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getPolls);
router.post('/', verifyToken, createPoll);
router.post('/:id/vote', verifyToken, vote);

module.exports = router;