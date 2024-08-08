"use strict";

const uniqueValidator = require("mongoose-unique-validator");
const { mongoose } = require("../configs/dbConnection");
const emailValidation = require("../helpers/emailValidation");
const passwordEncryptor = require("../helpers/passwordEncryptor");
const passwordValidation = require("../helpers/passwordValidation");
const invalidPasswordType =
  "Invalid password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validate: [(email) => emailValidation(email),'Invalid email type! - __@__.__'],
    },
    password: {
      type: String,
      trim: true,
      required: true,
      set: (password) => { 
        if (passwordValidation(password)) { 
          return passwordEncryptor(password);
        } else {
          return invalidPasswordType;
        }
      },
      validate: (password) => {
        if (password === invalidPasswordType) {
          return false;
        } else {
          return true;
        }
      },
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isStaff: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "users", timestamps: true }
);


UserSchema.plugin(uniqueValidator,{
    message: 'This {PATH} is exist!'
})

module.exports.User = mongoose.model("User", UserSchema);
