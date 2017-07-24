'use strict';
var router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

var _registerRoutes = function(routes, method){
        for(var key in routes){
            if(typeof routes[key] === 'object' && !(routes[key] instanceof Array) && routes[key]!=null) {
                _registerRoutes(routes[key], key);
            } else {
                if(method === 'get'){
                    router.get(key, routes[key]);
                } else if(method === 'post'){
                    router.post(key, routes[key]);
                } else {
                    router.use(routes[key]);
                }
            }
        }
    }

    let route = (routes) => {
    _registerRoutes(routes);
    return router;
    };

    //Find a single user based on key
    let findOne = (profileID) => {
        return db.userModel.findOne({
            'profileId': profileID
        })
    };

    //create new user 
    let createNewUser = (profile)=>{
        return new Promise((resolve, reject) => {
            let newChatUser = db.userModel({
                profileId: profile.id,
                fullName: profile.displayName,
                profilePic: profile.photos[0].value || ''
            });

            newChatUser.save(error => {
                if(error){
                    console.log(error);
                    reject(error);
                } else { 
                    resolve(newChatUser);
                }
            });
        });
    };

    let findById = (id) => {
        return new Promise((resolve, reject)=> {
            db.userModel.findById(id, (error, user) => {
                if(error){
                    reject(error);
                } else {
                    resolve(user);
                }
            });
        })
    };

    
    let findRoomName = (allRooms, newRoom) => {
        let findRm = allRooms.findIndex((element, index, array) => {
            if(element.roomName === newRoom){
                return true;
            }
            return false;
        });

        return findRm > -1 ? true : false;
    };

    
    let isAuthenticated = (req, res, next) => {
        if(req.isAuthenticated()){
            next();
        } else {
            res.redirect('/');
        }
    };

    let createRandomHex = () => {
        return crypto.randomBytes(24).toString('hex') //24 bytes worth data
    };

    let findRoomById = (allRooms, id) => {
        return allRooms.find( (element, index, array) => {
            if(element.roomId === id){
                return true;
            } else {
                return false;
            }
        });
     };

     let addUserToRooms = (allRooms, data, socket) => {
        let getRoom = findRoomById(allRooms, data.roomID);
        if(getRoom !== undefined){
           
            let userId = socket.request.session.passport.user;

            let checkUser = getRoom.users.findIndex((element, index, array) => {
                if(element.userId === userId){
                    return true;
                } 
                return false;
            });
        
            if(checkUser > -1){
                //user existed so we should purge the user
                getRoom.users.splice(checkUser, 1);                
            };

            //push the user to the array
            getRoom.users.push({
                socketID: socket.id,
                userId,
                user: data.user,
                userPic: data.profilePic
            });

            //join the room channel
            socket.join(data.roomID);

            return getRoom;
        }  
    };

    let removeUserFromRoom = (allRooms, socket) => {
        for(let room of allRooms) {
            let findUserIndex = room.users.findIndex((element, index, array) => {
                if(element.socketID === socket.id){
                    return true;
                } else {
                    return false;
                }
            });
            if(findUserIndex > -1){
                socket.leave(room.roomID);
                room.users.splice(findUserIndex, 1);
                return room;
            }
        }
    }



    module.exports = {
        route,
        findOne,
        createNewUser,
        findById,
        isAuthenticated,
        findRoomName,
        findRoomById,
        createRandomHex,
        addUserToRooms,
        removeUserFromRoom
    }

