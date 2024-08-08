"use strict";

const { Token } = require("../models/tokenModel");
const  jwt = require('jsonwebtoken');
const { User } = require("../models/userModel");

module.exports = async(req,res,next) => {


    req.user = null;
    req.token = null;
    const authHeader = req.headers.authorization;
    if(authHeader){
        if(authHeader.split(" ")[0] === 'Token'){
            const tokenKey = authHeader.split(" ")[1];
            if(tokenKey){
                const tokenData = await Token.findOne({token:tokenKey}).populate('userId');
                if(tokenData){
                    req.user = tokenData?.userId;
                    req.user.userId = tokenData?.userId?._id;
                    req.token = tokenData?.token;
                    console.log(tokenData);
                }
            }
        }else if(authHeader.split(" ")[0] === 'Bearer'){
            const tokenKey = authHeader.split(" ")[1];
            if(tokenKey){
                 
                jwt.verify(tokenKey,process.env.ACCESSTOKEN_SECRETKEY,(err,decoded)=>{
                    if(!err){ 
                        req.user = decoded;
                        req.token = tokenKey;
                    }
                })


            }
        }
    }


    next()
}