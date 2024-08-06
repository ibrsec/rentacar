"use strict";

module.exports = async(err,req,res,next)=>{
    const statusCode = err.statusCode || res.errorStatusCode || 500;
    res.status(statusCode).json({
        error:true,
        message:err.message,
        body:req.body,
        stack:err.stack,
    })
}