"use strict";

/* --------------------------------- imports -------------------------------- */
require('dotenv').config();
const PORT = process.env.PORT;
require('express-async-errors')

/* --------------------------------- express -------------------------------- */
const express = require('express')
const app = express();


/* ------------------------------ db connection ----------------------------- */
require('./src/configs/dbConnection').dbConnection(); 


 /* ------------------------------- middlewares ------------------------------ */
//body parse
app.use(express.json());

//queryhandler
app.use(require('./src/middlewares/queryHandler'));

//logger --sep!
const morgan = require('morgan');
app.use(morgan('combined'));

//authentication
//permissions
//upload

//swagger statics
const path = require('path');
const deleteSync = require('./src/helpers/deleteSync');
app.use('/swagger',express.static(path.join(__dirname,'node_modules','swagger-ui-dist')));




/* --------------------------------- routes --------------------------------- */
app.all('/',(req,res)=>{res.send('Welcome to rent a car api!')})
//main route index
app.use('/',require('./src/routes/indexRoutes'))
//documents ok

//cars
//users
//reservations
//tokens
//auth


//errorhandler
app.use(require('./src/middlewares/errorHandler'))
//custom error



/* ----------------------------------- Run ---------------------------------- */
app.listen(PORT,()=>console.log('Server is running on: ',PORT));


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