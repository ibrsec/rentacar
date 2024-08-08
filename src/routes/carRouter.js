"use strict";

const router = require("express").Router();
// -----------------------------------------
const { car } = require("../controllers/carControllers");
const permissions = require("../middlewares/permissions");
// -----------------------------------------
router.route("/").get(car.list).post(permissions.isStafforAdmin, car.create);
router
  .route("/:id")
  .get(car.read)
  .put(permissions.isStafforAdmin, car.update)
  .patch(permissions.isStafforAdmin, car.patchUpdate)
  .delete(permissions.isAdmin, car.delete);

// -----------------------------------------
module.exports = router;
