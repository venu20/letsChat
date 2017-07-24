'use strict';

var express = require('express');
var app = express();
var chatCat = require('./app');
const passport = require('passport');
app.set('port',process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(chatCat.session);
app.use(passport.initialize());
app.use(passport.session());
app.use(require('morgan')('combined', {
    stream: {
        write: message => {
            //write logs
            chatCat.logger.log('info', message);
        }
    }
}))

app.use('/', chatCat.router);

chatCat.ioServer(app).listen(app.get('port'),function(){
    console.log('server started on port 3000');
})