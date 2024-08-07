"use strict";

const router = require('express').Router();

router.use('/documents',require('./documentRouter'));
router.use('/users',require('./userRouter'));
router.use('/tokens',require('./tokenRouter'));
router.use('/cars',require('./carRouter'));
router.use('/reservations',require('./reservationRouter'));



module.exports = router;