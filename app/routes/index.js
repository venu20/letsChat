'use strict';

var helper = require('../helpers/utility');
const passport = require('passport');
const config = require('../config/config');

module.exports = function(){
    var routes = {
        'get': {
            '/':  function(req, res, next){
                res.render('login');
            },
            '/rooms': [helper.isAuthenticated, (req, res, next) => {
                res.render('rooms', {
                    user: req.user,
                    host: config.host
                });
            }],
            '/chat/:id': [helper.isAuthenticated, function(req, res, next){
                let localAllChatRooms = req.app.locals.chatrooms;
                let getRoom = helper.findRoomById(localAllChatRooms, req.params.id);

                if(getRoom === undefined) {
                    return next();
                } else {
                    res.render('chatroom', {
                        user: req.user,
                        host: config.host,
                        roomName: getRoom.roomName,
                        roomId: getRoom.roomId
                    });
                }
            }],
            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': passport.authenticate('facebook', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/auth/twitter': passport.authenticate('twitter'),
            '/auth/twitter/callback': passport.authenticate('twitter', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/logout': (req, res, next) => {
                req.logOut();//passport has in-built method to clear the session
                res.redirect('/')
            }
        },
        'post': {
            
        },
        'NA':(req, res, next) => {
            res.render('404');
        }
    };
   return helper.route(routes);
}