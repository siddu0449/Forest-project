const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { auth, authorize } = require("../middleware/auth");

/**
 * @route   POST /api/bookings
 * @desc    Create a new visitor booking
 * @access  Public
 */
router.post("/", bookingController.createBooking);

/**
 * @route   GET /api/bookings/available-slots
 * @desc    Get available time slots for a date
 * @access  Public
 */
router.get("/available-slots", bookingController.getAvailableSlots);

/**
 * @route   GET /api/bookings/:token/:safariDate
 * @desc    Get booking by token and date
 * @access  Public
 */
router.get("/:token/:safariDate", bookingController.getBookingByToken);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (admin only)
 * @access  Private (Admin, Manager, Gate)
 */
router.get("/", bookingController.getAllBookings);

/**
 * @route   POST /api/bookings/:bookingId/assign-tokens
 * @desc    Assign individual tokens to group members
 * @access  Private (Admin, Reception)
 */
router.post(
  "/:bookingId/assign-tokens",
  bookingController.assignIndividualTokens
);

/**
 * @route   PUT /api/bookings/:bookingId/confirm-payment
 * @desc    Confirm payment for a booking
 * @access  Private (Admin, Reception)
 */
router.put("/:bookingId/confirm-payment", bookingController.confirmPayment);

module.exports = router;
