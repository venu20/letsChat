'use strict';

let utility = require('../helpers/utility');

module.exports = (io, app) => {
   let allRooms = app.locals.chatrooms;

    io.of('/roomslist').on('connection', socket => {
        socket.on('getChatRoomsList', () => {
            socket.emit('chatRoomsList', JSON.stringify(allRooms));
        });

        socket.on('createNewRoom', (newRoom) => {
            //first check newRoom already exist
            if(!utility.findRoomName(allRooms,newRoom)){
                allRooms.push({
                    roomName: newRoom,
                    roomId: utility.createRandomHex(),//generate a unique roomID,
                    users: []
                });

                //sends an updated list to the user
                socket.emit('chatRoomsList', JSON.stringify(allRooms))

                //Emit an updated list to everyone connected to rooms page
                socket.broadcast.emit('chatRoomsList', JSON.stringify(allRooms));
            };
        });
    });

    io.of('/chatter').on('connection', socket => {

        socket.on('join', (data) => {
        let usersList = utility.addUserToRooms(allRooms, data, socket);

        //update the active users list
         if(usersList){
             socket.broadcast.to(data.roomID).emit('updateUserList', JSON.stringify(usersList.users)); //we can directly use socket.to
             socket.emit('updateUserList', JSON.stringify(usersList.users));
         }
         });

        socket.on('disconnect', () => {
            console.log('Got disconnect!');
            //Find the room and remove the user
            if(allRooms.length > 0){
                let room = utility.removeUserFromRoom(allRooms, socket);
                socket.broadcast.to(room.roomId).emit('updateUserList', JSON.stringify(room.users));
             }
        });

        socket.on('messageTyped', (typedUserInfo) => {
            socket.to(typedUserInfo.roomID).emit('messageReceived', JSON.stringify(typedUserInfo));
        })
    })
}