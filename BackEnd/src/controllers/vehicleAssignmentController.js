const { VehicleAssignment } = require("../models");

// Get all vehicle assignments for a specific date
exports.getVehicleAssignments = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    const assignments = await VehicleAssignment.findAll({
      where: { safariDate: date },
      order: [["createdAt", "ASC"]],
    });

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Get vehicle assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle assignments",
      error: error.message,
    });
  }
};

// Create or update vehicle assignment
exports.saveVehicleAssignment = async (req, res) => {
  try {
    const {
      vehicleId,
      vehicleNumber,
      vehicleOwner,
      driverName,
      safariDate,
      capacity,
      seatsFilled,
      passengers,
      status,
      safariStatus,
      plasticCountIn,
      plasticCountOut,
      gateInTime,
      gateOutTime,
    } = req.body;

    if (!vehicleId || !vehicleNumber || !safariDate) {
      return res.status(400).json({
        success: false,
        message: "vehicleId, vehicleNumber, and safariDate are required",
      });
    }

    // Check if assignment already exists
    const existing = await VehicleAssignment.findOne({
      where: {
        vehicleId,
        safariDate,
      },
    });

    let assignment;
    if (existing) {
      // Update existing
      await existing.update({
        vehicleNumber,
        vehicleOwner,
        driverName,
        capacity,
        seatsFilled,
        passengers,
        status,
        safariStatus,
        plasticCountIn,
        plasticCountOut,
        gateInTime,
        gateOutTime,
      });
      assignment = existing;
    } else {
      // Create new
      assignment = await VehicleAssignment.create({
        vehicleId,
        vehicleNumber,
        vehicleOwner,
        driverName,
        safariDate,
        capacity: capacity || 10,
        seatsFilled: seatsFilled || 0,
        passengers: passengers || [],
        status: status || "waiting",
        safariStatus: safariStatus || "pending",
        plasticCountIn,
        plasticCountOut,
        gateInTime,
        gateOutTime,
      });
    }

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Save vehicle assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save vehicle assignment",
      error: error.message,
    });
  }
};

// Update vehicle assignment (for driver, status, gate info, plastic count)
exports.updateVehicleAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const assignment = await VehicleAssignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Vehicle assignment not found",
      });
    }

    await assignment.update(updates);

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Update vehicle assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update vehicle assignment",
      error: error.message,
    });
  }
};

// Delete vehicle assignment
exports.deleteVehicleAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await VehicleAssignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Vehicle assignment not found",
      });
    }

    await assignment.destroy();

    res.json({
      success: true,
      message: "Vehicle assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete vehicle assignment",
      error: error.message,
    });
  }
};
