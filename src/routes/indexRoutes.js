"use strict";

const router = require('express').Router();

router.use('/documents',require('./documentRouter'));
router.use('/users',require('./userRouter'));



module.exports = router;