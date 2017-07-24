'use strict';
const config = require('../config/config');
const logger = require('../logger');
const mongoose = require('mongoose').connect(config.dbURI);

mongoose.connection.on('error', (error)=> {
logger.log('error', 'mongoose connection error' + error);
});

//create a schema that defines the structure for storing user data
const chatUser = new mongoose.Schema({
profileId: String,
fullName: String,
profilePic: String
});

//Make the schema into a usable model 
let userModel = mongoose.model('chatUser', chatUser);

module.exports = {
    mongoose,
    userModel
}