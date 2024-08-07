"use strict";

const router = require("express").Router();
// -----------------------------------------
const { car } = require("../controllers/carControllers");
// -----------------------------------------
router.route("/").get(car.list).post(car.create);
router
  .route("/:id")
  .get(car.read)
  .put(car.update)
  .patch(car.patchUpdate)
  .delete(car.delete);

// -----------------------------------------
module.exports = router;
