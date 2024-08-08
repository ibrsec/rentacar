"use strict";

const CustomError = require("../errors/customError");

module.exports = {
  isLogin: (req, res, next) => {
    if (!req?.user) {
      throw new CustomError(
        "AuthenticationError:Forbidden - You must login first!",
        403
      );
    }
    if (!req?.user?.isActive) {
      throw new CustomError(
        "Your account is not active, please contact with the support!",
        403
      );
    }
    next();
  },


  isAdmin: (req, res, next) => {
    if (!req?.user?.isAdmin) {
      throw new CustomError(
        "AuthorizationError:Forbidden - You must be an admin user to access this resource!!",
        403
      );
    } else {
    }
    if (!req?.user?.isActive) {
      throw new CustomError(
        "Your account is not active, please contact with the support!",
        403
      );
    }
    next();
  },


  isStafforAdmin: (req, res, next) => {
    if (!req?.user?.isAdmin || !req?.user?.isStaff) {
      throw new CustomError(
        "AuthorizationError:Forbidden - You must be an admin or a staff user to access this resource!!",
        403
      );
    } else {
    }
    if (!req?.user?.isActive) {
      throw new CustomError(
        "Your account is not active, please contact with the support!",
        403
      );
    }
    next();
  },
};
