const express = require('express');
const router = express.Router();
const {
  createCommittee,
  getCommittees,
  assignSubHead,
  joinCommittees,
  removeVolunteer,
  deleteCommittee,
} = require('../controllers/committeeController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/create', authenticate, createCommittee);
router.get('/:eventId', authenticate, getCommittees);
router.put('/:committeeId/assign-subhead', authenticate, assignSubHead);
router.post('/join-committees', authenticate, joinCommittees);
router.delete('/:committeeId/remove-volunteer/:userId', authenticate, removeVolunteer);
router.delete('/:committeeId', authenticate, deleteCommittee);

module.exports = router;
