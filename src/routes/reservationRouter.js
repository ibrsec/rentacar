"use strict";

const router = require("express").Router();
// -----------------------------------------
const { reservation } = require("../controllers/reservationControllers");
const permissions = require("../middlewares/permissions");
// -----------------------------------------
router.route("/").get(permissions.isLogin, reservation.list).post(permissions.isLogin, reservation.create);
router
  .route("/:id")
  .get(permissions.isLogin, reservation.read)
  .put(permissions.isStafforAdmin, reservation.update)
  .delete(permissions.isAdmin, reservation.delete);

// -----------------------------------------
module.exports = router;
