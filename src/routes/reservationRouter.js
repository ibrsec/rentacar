"use strict";

const router = require("express").Router();
// -----------------------------------------
const { reservation } = require("../controllers/reservationControllers");
// -----------------------------------------
router.route("/").get(reservation.list).post(reservation.create);
router
  .route("/:id")
  .get(reservation.read)
  .put(reservation.update)
  .patch(reservation.patchUpdate)
  .delete(reservation.delete);

// -----------------------------------------
module.exports = router;
