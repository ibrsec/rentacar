"use strict";

const { User } = require("../models/userModel");

module.exports = async() => {
    const admin = await User.findOne({username:'admin'})
    const adminData = {
        username:'admin',
        email:'admin@admin.com',
        password:'Aa*12345',
        isAdmin:true
        
    }
    if(admin){
        console.log('admin is already exist :',adminData);
        return;
    }
    User.create(adminData).then((adminUser)=>{
        console.log('admin is created:',adminData);
        console.log('adminUser',adminUser);
    }).catch((err)=>{
        console.log('admin use creation error!',err);
    })
}