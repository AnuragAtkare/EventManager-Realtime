const express = require('express');
const router = express.Router();
const { createEvent, joinEvent, getMyEvents, getEventDetails, removeParticipant, getVolunteers, exportVolunteersPDF } = require('../controllers/eventController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/create', authenticate, createEvent);
router.post('/join', authenticate, joinEvent);
router.get('/my-events', authenticate, getMyEvents);
router.get('/:eventId', authenticate, getEventDetails);
router.get('/:eventId/volunteers', authenticate, getVolunteers);
router.get('/:eventId/export-pdf', authenticate, exportVolunteersPDF);
router.delete('/:eventId/remove/:userId', authenticate, removeParticipant);

module.exports = router;
