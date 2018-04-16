'use strict';
console.log(process.env)
if(process.env.NODE_ENV === 'production'){

    let redis_URI = require('url').parse(process.env.REDIS_URL);
    let redisPassword = redis_URI.auth.split(':')[1];

    module.exports = {
        host: process.env.host || '',
        dbURI: process.env.dbURI || '',
        sessionSecret: process.env.sessionSecret,
        fb: {
        clientID: process.env.fbClientID,
        clientSecret: process.env.fbClientSecret,
        callbackURL: process.env.host + "/auth/facebook/callback",
        profileFileds: ["id", "displayName", "photos"]
        },
        twitter: {
        consumerKey: process.env.twConsumerKey,
        consumerSecret: process.env.twConsumerSecret,
        callbackURL: process.env.host + "/auth/twitter/callback",
        profileFileds: ["id", "displayName", "photos"]
        },
        redis: {
            host: redis_URI.hostname,
            port: redis_URI.port,
            password: redisPassword
        }

    }
} else {
    module.exports = require('./development.json');
}