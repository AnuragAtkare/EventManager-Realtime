const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, webhook, getPaymentStatus } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);

// Webhook needs raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Parse raw body back to JSON after signature check
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body.toString();
    req.body = JSON.parse(req.rawBody);
  }
  next();
}, webhook);

router.get('/status/:eventId/:announcementId', authenticate, getPaymentStatus);

module.exports = router;
