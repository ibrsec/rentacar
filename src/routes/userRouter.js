"use strict";

const router = require("express").Router();
// -----------------------------------------
const { user } = require("../controllers/userControllers");
const permissions = require("../middlewares/permissions");
// -----------------------------------------
router.route("/").get(permissions.isLogin, user.list).post(user.create);
router
  .route("/:id")
  .get(permissions.isLogin, user.read)
  .put(permissions.isStafforAdmin, user.update)
  .patch(permissions.isStafforAdmin, user.patchUpdate)
  .delete(permissions.isAdmin, user.delete);

// -----------------------------------------
module.exports = router;
