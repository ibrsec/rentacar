'use strict';
const mongoose = require('mongoose');




const dbConnection = () => {
    mongoose.connect(process.env.CONNECTION_STRING)
    .then((connect)=>{
        console.log('#### DB CONNECTED #### ===', connect.connection.host, connect.connection.name);
        require('../helpers/initializeAdmin')();
    }).catch((err)=>{
        console.log('#### DB NOT CONNECTED ####', err);
    })
}


module.exports = {dbConnection,mongoose};