"use strict";

/* --------------------------------- imports -------------------------------- */
require("dotenv").config();
const PORT = process.env.PORT;
require("express-async-errors");
const cors = require('cors')
/* --------------------------------- express -------------------------------- */
const express = require("express");
const app = express();

/* ------------------------------ db connection ----------------------------- */
require("./src/configs/dbConnection").dbConnection();

/* ------------------------------- middlewares ------------------------------ */
//body parse
app.use(express.json());

//queryhandler
app.use(require("./src/middlewares/queryHandler"));

//logger --sep!
// const morgan = require("morgan");
// app.use(morgan("combined"));
app.use(require("./src/middlewares/logger"));

//authentication
app.use(require("./src/middlewares/auhtentication"));

//cors
app.use(cors()) 



 



//permissions
//upload

//swagger statics
const path = require("path");
const deleteSync = require("./src/helpers/deleteSync");
app.use(
  "/swagger",
  express.static(path.join(__dirname, "node_modules", "swagger-ui-dist"))
);

/* --------------------------------- routes --------------------------------- */
app.all("/", (req, res) => {
  res.send({ message: "Welcome to rent a car api!", user: req.user });
});
//main route index
app.use("/", require("./src/routes/indexRoutes"));
//documents ok

//cars
//users
//reservations
//tokens
//auth

//not found route
app.use("*", (req, res) => {
  res.status(400).send({
    error: true,
    message: "Route not found!",
  });
});

//errorhandler
app.use(require("./src/middlewares/errorHandler"));
//custom error

/* ----------------------------------- Run ---------------------------------- */
app.listen(PORT, () => console.log("Server is running on: ", PORT));

////// * helpers
//password validation
//password encrpyt
//email validation
//sync
//date validations
//send mail

//delete all db
// deleteSync()

//permissionlardan sonra user admin staff restrictleri ayarlayacaz
//, normal reservation crudlari bitir sonra reservation ozel  islemlerini bitir
//readme ye bak
// sonra auth routeu bitir
// sonra authentication ve token islemleri
// sonra admin staf normal user restrictionslar kafa yorulacak

//login vs olduktan sorna reservationdaki userid ve created id vs ler ayarlanacak
//adminse degilse vs
