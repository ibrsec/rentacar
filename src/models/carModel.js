"use strict";

const mongooseUniqueValidator = require("mongoose-unique-validator");
const { mongoose } = require("../configs/dbConnection");
 

const CarSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    brand: {
      type: String,
      trim: true,
      required: true,
    },
    model: {
      type: String,
      trim: true,
      required: true,
    },
    year:{
        type:Number,
        required:true,
        min:2000,
        max: new Date().getFullYear(),
    },
    isAutomatic:{
        type:Boolean,
        default:false,

    },
    pricePerDay:{
        type:Number,
        required:true,
    },
    images: {
      type: [String],
      default: [],
    },
    isAvaliable: {
      type: Boolean,
      default: true,
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
    collection: "cars",
    timestamps: true,
  }
);

CarSchema.plugin(mongooseUniqueValidator, {
  message: "This {PATH} is exist!",
});

module.exports.Car = mongoose.model("Car", CarSchema);
