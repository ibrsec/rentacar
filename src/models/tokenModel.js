"use strict";

const mongooseUniqueValidator = require("mongoose-unique-validator");
const { mongoose } = require("../configs/dbConnection");

const TokenSchema = new mongoose.Schema(
  {
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true,
        index:true
    },
    token:{
        type: String,
        trim:true, 
        required:true,
        unique:true,
        index:true
    },
  },
  {
    collection: "tokens",
    timestamps: true,
  }
);

TokenSchema.plugin(mongooseUniqueValidator,{
    message: 'This {PATH} is exist!'
})

module.exports.Token = mongoose.model('Token',TokenSchema);