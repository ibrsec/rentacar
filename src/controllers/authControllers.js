"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const emailValidation = require("../helpers/emailValidation");
const passwordEncryptor = require("../helpers/passwordEncryptor");
const passwordValidation = require("../helpers/passwordValidation");
const { Token } = require("../models/tokenModel");
const { User } = require("../models/userModel");
const jwt = require("jsonwebtoken");

module.exports.auth = {
  login: async (req, res) => {
    /*
    #swagger.tags=['Authentication']
    #swagger.summary = 'Login'
    #swagger.description = 'Login with email/username and password!'
    #swagger.parameters['body']={
      in:'body',
      required:true,
      schema:{
        $username:'testuser',
        $email:'test@test.com',
        $password:'Password1?'
      }
    }

    #swagger.responses[200]={
      description:'Login is OK!',
      schema:{
        error:false,
        message:'Login is OK!',
        result:{
          token:"<tokenKey>",
          bearer:{
            accessToken: '<access token>',
            refreshToken:'<refresh token>'
          }
        }
      }
    }
    #swagger.responses[400]={
      description:'Bad request:
              </br>- Email/username and password is required for login!
              </br>- Invalid Email type - __@__.__
              </br>- Invalid password type - rRules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]
              
              
              ',
    }
    #swagger.responses[401]={
      description:'Unauthorized:</br> - User not found!</br>- Invalid Password!',
    }

    */
    const { email, username, password } = req.body;
    if (!password || !(email || username)) {
      throw new CustomError(
        "Email/username and password is required for login!",
        400
      );
    }

    if (email && !emailValidation(email)) {
      throw new CustomError("Invalid Email type - __@__.__", 400);
    }
    if (!passwordValidation(password)) {
      throw new CustomError(
        "Invalid password type - rRules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]",
        400
      );
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      throw new CustomError("Unauthorized - User not found!", 401);
    }

    if (user?.password !== passwordEncryptor(password)) {
      throw new CustomError("Unauthorized - Invalid Password!", 401);
    }

    //token auth
    let tokenData = await Token.findOne({ userId: user._id });
    if (!tokenData) {
      tokenData = await Token.create({
        userId: user?._id,
        token: passwordEncryptor(user?._id + "-" + Date.now()),
      });
    }

    //jwt auth
    const accessData = {
      userId: user?._id,
      username: user?.username,
      isAdmin: user?.isAdmin,
      isActive: user?.isActive,
      isStaff: user?.isStaff,
    };
    const refreshData = {
      username: user?.username,
      password: user?.password,
    };

    const accessToken = jwt.sign(
      //short
      accessData,
      process.env.ACCESSTOKEN_SECRETKEY,
      { expiresIn: "30m" }
    );
    const refreshToken = jwt.sign(
      //long
      refreshData,
      process.env.REFRESHTOKEN_SECRETKEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      error: false,
      message: "Login is OK!",
      result: {
        token: tokenData?.token,
        bearer: {
          accessToken,
          refreshToken,
        },
      },
    });
  },
  refresh: async (req, res) => {
    /*
    #swagger.tags=['Authentication']
    #swagger.summary = 'Refresh token'
    #swagger.description = 'Refresh the access token with a refresh token (bearer.refreshToken)!
    </br></br>
    '
    #swagger.parameters['body']={
      in:'body',
      schema:{
        bearer:{
          $refresh_Token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmIxZTQ5MjAwZ...'
        }
      }
    }

    #swagger.responses[200]={
      description:'Refresh is OK!',
      schema:{
        error:false,
        message:'Refresh is OK!',
        result:{ 
          bearer:{
            accessToken: '<access token>', 
          }
        }
      }
    }
    #swagger.responses[400]={
      description:'Bad request:
              </br>- bearer.refreshToken is required! 
              
              
              ',
    }
    #swagger.responses[401]={
      description:'Unauthorized:
                      </br> - User not found!
                      </br>- Invalid Password!',
    }

    */
    const refreshToken = req.body?.bearer?.refreshToken;
    if (!refreshToken) {
      throw new CustomError("Please enter the bearer.refreshToken!", 400);
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESHTOKEN_SECRETKEY
    );
    if (!decoded) {
      throw new CustomError("Verify error refresh token!", 401);
    }
    const user = await User.findOne({ username: decoded?.username });
    if (!user) {
      throw new CustomError("User not found!", 401);
    }
    if (decoded?.password !== user?.password) {
      throw new CustomError("Invalid password!", 401);
    }

    const accessData = {
      userId: user?._id,
      username: user?.username,
      isAdmin: user?.isAdmin,
      isActive: user?.isActive,
      isStaff: user?.isStaff,
    };

    const accessToken = jwt.sign(
      //short
      accessData,
      process.env.ACCESSTOKEN_SECRETKEY,
      { expiresIn: "30m" }
    );

    res.json({
      error: false,
      message: "Refresh is OK!",
      result: {
        bearer: {
          accessToken,
        },
      },
    });
  },
  logout: async (req, res) => {
    /*
    #swagger.tags=['Authentication']
    #swagger.summary = 'Logout'
    #swagger.description = 'Logout with or without token!'
    #swagger.parameters['Authorization']={
      in:'header', 
      example:"Token <...tokenkey>"
    }

    #swagger.responses[200]={
      description:'Refresh is OK!',
      schema:{
        error:false,
        message:'Logout is OK!',
        result:{ 
          tokenDeleted:1
        }
      }
    } 

    */

    const { deletedCount } = await Token.deleteOne({ userId: req?.user?._id });

    res.json({
      error: false,
      message: "Logout is OK!",
      result: {
        tokenDeleted: deletedCount,
      },
    });
  },
};
