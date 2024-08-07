"use strict";

const mongooseUniqueValidator = require("mongoose-unique-validator");
const { mongoose } = require("../configs/dbConnection");
 

const ReservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    startDate: {
      type: Date, 
      required: true, 
    },
    endDate: {
      type: Date, 
      required: true, 
    },
    amount:{
      type:Number,
      required:true,
    },
    createdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    collection: "reservations",
    timestamps: true,
  }
);

ReservationSchema.plugin(mongooseUniqueValidator, {
  message: "This {PATH} is exist!",
});

module.exports.Reservation = mongoose.model("Reservation", ReservationSchema);
