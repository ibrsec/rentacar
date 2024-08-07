"use strict";

const router = require("express").Router();
// -----------------------------------------
const { token } = require("../controllers/tokenControllers");
// -----------------------------------------
router.route("/").get(token.list).post(token.create);
router
  .route("/:id")
  .get(token.read)
  .put(token.update)
  .patch(token.patchUpdate)
  .delete(token.delete);

// -----------------------------------------
module.exports = router;
