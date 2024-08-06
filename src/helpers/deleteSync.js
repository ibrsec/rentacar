"use strict";

const { User } = require("../models/userModel");


module.exports = () => {

    User.deleteMany().then(()=>{

        console.log('db is cleared!');
    }).catch((err)=>{
        console.log('db clear is failed! ',err);
    })

}