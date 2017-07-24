'use strict';

const config = require('./config/config');

var routerDetails = require('./routes')();
//create a client interface to interact with redis 
const redis = require('redis').createClient;
const adapter = require('socket.io-redis')

//social authenticaion logic
require('./auth/auth')();


//create a IO server instace
let ioServer = app => {
    app.locals.chatrooms = [];
    const httpServer = require('http').Server(app);
    const io = require('socket.io')(httpServer);
    //socket.io should use webSockets for trasport media instead of trasport-pooling(call it as session affinity)
    io.set('transports', ['websocket'])    

    let pubClient = redis(config.redis.port, config.redis.host, {
        auth_pass: config.redis.password
    });

    let subClient = redis(config.redis.port, config.redis.host, {
        return_buffers: true,
        auth_pass: config.redis.password
    });

    io.adapter(adapter({
        pubClient,
        subClient
    }));
        
    io.use((socket, next)=>{
        require('./session/session')(socket.request, {}, next);
    })
    require('./socket')(io, app);
    return httpServer;
};

module.exports = {
    router: routerDetails,
    session: require('./session/session'),
    ioServer,
    logger: require('./logger')
}