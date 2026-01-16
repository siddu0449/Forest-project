const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const db = {};

db.sequelize = sequelize;
db.Sequelize = require("sequelize");

// Import models
db.VisitorBooking = require("./VisitorBooking");
db.IndividualToken = require("./IndividualToken");
db.Driver = require("./Driver");
db.Vehicle = require("./Vehicle");
db.VehicleAssignment = require("./VehicleAssignment");
db.UserCredential = require("./UserCredential");
db.SecurityQuestion = require("./SecurityQuestion");

// Define associations
db.VisitorBooking.hasMany(db.IndividualToken, {
  foreignKey: "bookingId",
  as: "individualTokens",
});

db.IndividualToken.belongsTo(db.VisitorBooking, {
  foreignKey: "bookingId",
  as: "booking",
});

module.exports = db;
