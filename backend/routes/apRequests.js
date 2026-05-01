const express = require('express');
const router = express.Router();
const { getRequests, submitRequest, reviewRequest } = require('../controllers/apRequestController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getRequests);
router.post('/', verifyToken, submitRequest);
router.put('/:id', verifyToken, reviewRequest);

module.exports = router;