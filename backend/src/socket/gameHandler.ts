import { Server, Socket } from 'socket.io';

let rooms: any = {};

export const setupSocketHandlers = (io: Server, socket: Socket) => {
    socket.on('join_room', (data) => {
        const roomId = data.roomId;
        const alias = data.alias;

        if (!rooms[roomId]) {
            rooms[roomId] = {
                id: roomId,
                players: [],
                status: 'waiting'
            };
        }

        const room = rooms[roomId];

        if (room.players.length >= 2) {
            socket.emit('error_message', 'Lo siento, habitación llena');
            return;
        }

        room.players.push({
            id: socket.id,
            alias: alias,
            choice: null
        });

        socket.join(roomId);

        if (room.players.length === 2) {
            room.status = 'full';
        }

        io.to(roomId).emit('room_updated', room);
        io.emit('available_rooms', Object.values(rooms));
    });


    socket.on('disconnect', () => {
        for (let roomId in rooms) {
            const room = rooms[roomId];

            room.players = room.players.filter((p: any) => p.id !== socket.id);

            if (room.players.length === 0) {
                delete rooms[roomId];
            } else {
                room.status = 'waiting';
                io.to(roomId).emit('room_updated', room);
            }
        }
        io.emit('available_rooms', Object.values(rooms));
    });
};