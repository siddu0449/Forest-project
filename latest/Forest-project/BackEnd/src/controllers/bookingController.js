const { VisitorBooking, IndividualToken } = require("../models");
const { Op } = require("sequelize");

// Time slots configuration (10 AM to 6 PM)
const TIME_SLOTS = [
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
];

const SLOT_LIMIT = 60;
const TIMER_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Create a new visitor booking
 */
exports.createBooking = async (req, res) => {
  try {
    const { name, phone, email, safariDate, timeSlot, adults, children } =
      req.body;

    // Validate required fields
    if (!name || !phone || !email || !safariDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    // Calculate total seats and amount
    const adultsCount = Number(adults) || 0;
    const childrenCount = Number(children) || 0;
    const totalSeats = adultsCount + childrenCount;

    if (totalSeats === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one adult or child is required",
      });
    }

    const paymentAmount = adultsCount * 600 + childrenCount * 300;

    // Check slot availability
    const now = Date.now();
    const usedSeats =
      (await VisitorBooking.sum("totalSeats", {
        where: {
          safariDate,
          timeSlot,
          [Op.or]: [
            { paymentDone: true },
            {
              paymentDone: false,
              expiryTime: { [Op.gt]: now },
              expired: false,
            },
          ],
        },
      })) || 0;

    const remainingSeats = SLOT_LIMIT - usedSeats;

    if (remainingSeats < totalSeats) {
      return res.status(400).json({
        success: false,
        message: `Not enough seats available. Only ${remainingSeats} seats remaining.`,
      });
    }

    // Generate unique token for the date
    const maxToken = await VisitorBooking.max("token", {
      where: { safariDate },
    });
    const token = (maxToken || 0) + 1;

    // Set expiry time (15 minutes from now)
    const expiryTime = now + TIMER_DURATION;

    // Create booking
    const booking = await VisitorBooking.create({
      token,
      name,
      phone,
      email,
      safariDate,
      timeSlot,
      adults: adultsCount,
      children: childrenCount,
      totalSeats,
      paymentAmount,
      expiryTime,
      paymentDone: false,
      expired: false,
      safariStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: booking.id,
        token: booking.token,
        name: booking.name,
        safariDate: booking.safariDate,
        timeSlot: booking.timeSlot,
        totalSeats: booking.totalSeats,
        paymentAmount: booking.paymentAmount,
        expiryTime: booking.expiryTime,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

/**
 * Get available time slots for a specific date
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { safariDate, totalSeats } = req.query;

    if (!safariDate) {
      return res.status(400).json({
        success: false,
        message: "Safari date is required",
      });
    }

    const seatsNeeded = Number(totalSeats) || 1;
    const now = Date.now();

    const availableSlots = await Promise.all(
      TIME_SLOTS.map(async (slot) => {
        const usedSeats =
          (await VisitorBooking.sum("totalSeats", {
            where: {
              safariDate,
              timeSlot: slot,
              [Op.or]: [
                { paymentDone: true },
                {
                  paymentDone: false,
                  expiryTime: { [Op.gt]: now },
                  expired: false,
                },
              ],
            },
          })) || 0;

        const remainingSeats = SLOT_LIMIT - usedSeats;

        return {
          slot,
          remainingSeats,
          available: remainingSeats >= seatsNeeded,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available slots",
      error: error.message,
    });
  }
};

/**
 * Get booking by token
 */
exports.getBookingByToken = async (req, res) => {
  try {
    const { token, safariDate } = req.params;

    const booking = await VisitorBooking.findOne({
      where: { token, safariDate },
      include: [
        {
          model: IndividualToken,
          as: "individualTokens",
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

/**
 * Assign individual tokens to group members
 */
exports.assignIndividualTokens = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { tokens } = req.body; // Array of {personName, personType}

    const booking = await VisitorBooking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (tokens.length !== booking.totalSeats) {
      return res.status(400).json({
        success: false,
        message: `Expected ${booking.totalSeats} tokens but received ${tokens.length}`,
      });
    }

    // Generate individual tokens (e.g., 1a, 1b, 1c, etc.)
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const individualTokensData = tokens.map((tokenData, index) => ({
      bookingId: booking.id,
      groupToken: booking.token,
      individualToken: `${booking.token}${letters[index]}`,
      personName: tokenData.personName || null,
      personType: tokenData.personType,
      assignedBy: req.user?.name || "system", // From auth middleware
    }));

    await IndividualToken.bulkCreate(individualTokensData);

    res.status(201).json({
      success: true,
      message: "Individual tokens assigned successfully",
      data: individualTokensData,
    });
  } catch (error) {
    console.error("Assign tokens error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign individual tokens",
      error: error.message,
    });
  }
};

/**
 * Mark payment as completed
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentMode } = req.body;

    const booking = await VisitorBooking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.expired) {
      return res.status(400).json({
        success: false,
        message: "Booking has expired",
      });
    }

    booking.paymentDone = true;
    booking.paymentMode = paymentMode || "cash";
    booking.safariStatus = "confirmed";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
      error: error.message,
    });
  }
};

/**
 * Get all bookings (with filters)
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { safariDate, status } = req.query;

    const where = {};
    if (safariDate) where.safariDate = safariDate;
    if (status) where.safariStatus = status;

    const bookings = await VisitorBooking.findAll({
      where,
      include: [
        {
          model: IndividualToken,
          as: "individualTokens",
        },
      ],
      order: [
        ["safariDate", "DESC"],
        ["token", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};
