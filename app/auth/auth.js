'use strict'

const passport = require('passport');
const logger = require('../logger');
const config = require('../config/config');
const utility = require('../helpers/utility');
const facebookStrategy = require('passport-facebook').Strategy;
const twitterStrategy = require("passport-twitter").Strategy;

module.exports = () => {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    })

    passport.deserializeUser((id, done) => {
        //find the user using mongo _id
        utility.findById(id)
        .then(user =>  done(null, user))
        .catch(error => logger.log('error', 'error happend when deserializing the user' + error));
    });


    const authProcess = (accessToken, profileToken, profile, done) => {
        //Finding a user in local database using profile Id
        //If the user found then return user data using done() method otherwise create one and return
        utility.findOne(profile.id).then((result)=>{
            if(result){
                done(null, result);
            } else {
                //create a new user 
                utility.createNewUser(profile).then((newChatUser) => {
                    done(null, newChatUser);
                }).catch(error=> {
                    logger.log('error', 'Error while creating new user' + error);
                })
            }
        })
    };
    passport.use(new facebookStrategy(config.fb, authProcess));
    passport.use(new twitterStrategy(config.twitter, authProcess));
}