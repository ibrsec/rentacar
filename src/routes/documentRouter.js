"use strict";

const swaggerUI = require("swagger-ui-express");
const redoc = require('redoc-express');

/* -------------- router -------------- */
const router = require("express").Router();

const swaggerJson = require("../configs/swagger.json");

router.all("/", (req, res) => {
  res.send({
    json: "/documents/json",
    swagger: "/documents/swagger",
    redoc: "/documents/redoc",
  });
});
router.use("/json", (req, res) => {
  res.sendFile("/src/configs/swagger.json", { root: "." });
});

router.use('/redoc',redoc({specUrl:'/documents/json', title:'Redoc Api Doc'}))


router.use('/swagger', swaggerUI.serve,swaggerUI.setup(swaggerJson,{ swaggerOptions: { persistAuthorization: true } }));



module.exports = router;
