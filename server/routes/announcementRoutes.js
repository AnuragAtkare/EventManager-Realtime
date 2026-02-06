const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements, pinAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/create', authenticate, createAnnouncement);
router.get('/:eventId', authenticate, getAnnouncements);
router.put('/:id/pin', authenticate, pinAnnouncement);
router.delete('/:id', authenticate, deleteAnnouncement);

module.exports = router;
