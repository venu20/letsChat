const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('../config/config')
const db = require('../db');

if(process.env.NODE_ENV === 'production'){
    //Production environment
    module.exports = session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        //to store the session data
        store: new MongoStore({
            mongooseConnection: db.mongoose.connection
        })
    });
} else {
    module.exports = session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true
    });
}