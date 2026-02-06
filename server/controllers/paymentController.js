const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { announcementId } = req.body;

    if (!announcementId) {
      return res.status(400).json({ success: false, message: 'announcementId is required' });
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement || announcement.type !== 'payment') {
      return res.status(404).json({ success: false, message: 'Payment announcement not found' });
    }

    const event = await Event.findById(announcement.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({
      announcementId,
      userId: req.user._id,
      status: 'paid',
    });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'You have already paid for this' });
    }

    const amount = announcement.paymentAmount * 100; // Razorpay uses paise

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${req.user._id}`,
      notes: {
        eventId: announcement.eventId.toString(),
        announcementId: announcementId,
        userId: req.user._id.toString(),
      },
    });

    // Create payment record
    const payment = new Payment({
      eventId: announcement.eventId,
      announcementId,
      userId: req.user._id,
      amount: announcement.paymentAmount,
      status: 'initiated',
      razorpayOrderId: order.id,
    });
    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/verify  (Called after Razorpay checkout success)
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (payment) {
      payment.status = 'paid';
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.paidAt = new Date();
      await payment.save();
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/webhook  (Razorpay webhook)
const webhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.authorized' || event === 'payment.captured') {
      const orderId = payload.payment.entity.order_id;
      const paymentId = payload.payment.entity.id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== 'paid') {
        payment.status = 'paid';
        payment.razorpayPaymentId = paymentId;
        payment.paidAt = new Date();
        await payment.save();
      }
    }

    if (event === 'payment.failed') {
      const orderId = payload.payment.entity.order_id;
      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/status/:eventId/:announcementId
const getPaymentStatus = async (req, res) => {
  try {
    const { eventId, announcementId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isHead = event.head.toString() === req.user._id.toString();

    if (isHead) {
      // Head sees all payments for this announcement
      const payments = await Payment.find({ eventId, announcementId })
        .populate('userId', 'firstName middleName lastName email avatar');

      res.status(200).json({ success: true, data: { payments } });
    } else {
      // Volunteer sees only their own payment
      const payment = await Payment.findOne({
        eventId,
        announcementId,
        userId: req.user._id,
      });

      res.status(200).json({ success: true, data: { payment: payment || { status: 'pending' } } });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, webhook, getPaymentStatus };
