"use strict";

const router = require("express").Router();
// -----------------------------------------
const { token } = require("../controllers/tokenControllers");
const permissions = require("../middlewares/permissions");
// -----------------------------------------
router
  .route("/")
  .get(permissions.isAdmin, token.list)
  .post(permissions.isAdmin, token.create);
router
  .route("/:id")
  .get(permissions.isAdmin, token.read)
  .put(permissions.isAdmin, token.update)
  .patch(permissions.isAdmin, token.patchUpdate)
  .delete(permissions.isAdmin, token.delete);

// -----------------------------------------
module.exports = router;
