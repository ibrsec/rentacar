"use strict";

const router = require('express').Router();
// -----------------------------------------
const {user} = require('../controllers/userControllers')
// -----------------------------------------
router.route('/').get(user.list).post(user.create);
router.route('/:id').get(user.read).put(user.update).patch(user.patchUpdate).delete(user.delete);

// -----------------------------------------
module.exports = router;