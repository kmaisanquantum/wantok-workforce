const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking_controller');
const authMiddleware = require('../../auth/middlewares/auth');

router.post('/create', authMiddleware, BookingController.createJob);
router.post('/:bookingId/accept', authMiddleware, BookingController.acceptJob);
router.post('/:bookingId/escrow', authMiddleware, BookingController.lockEscrow);
router.post('/:bookingId/complete', authMiddleware, BookingController.markComplete);
router.post('/:bookingId/approve', authMiddleware, BookingController.approveWork);

router.get('/list', authMiddleware, BookingController.getBookings);
module.exports = router;
