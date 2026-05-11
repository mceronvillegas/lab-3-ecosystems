import { Server, Socket } from 'socket.io';
import { getWinner } from '../utils/gameLogic';
import { Room } from '../types/gameTypes';

let rooms: Record<string, Room> = {};

export const setupSocketHandlers = (io: Server, socket: Socket) => {
    
    socket.emit('available_rooms', Object.values(rooms));

    socket.on('join_room', (data) => {
        const { roomId, alias } = data;
        
        if (!rooms[roomId]) {
            rooms[roomId] = { id: roomId, players: [], status: 'waiting' };
        }
        
        const room = rooms[roomId];

        if (room.players.length < 2) {
            room.players.push({ id: socket.id, alias, choice: null, timeTaken: 0 });
            socket.join(roomId);
            
            if (room.players.length === 2) {
                room.status = 'full';
                room.roundStartTime = Date.now(); 
            }

            socket.emit('joined_room', room);
            
            io.to(roomId).emit('room_updated', room);
        } else {
            socket.emit('error_message', 'La sala está llena');
        }
        
        io.emit('available_rooms', Object.values(rooms));
    });

    socket.on('make_choice', (data) => {
        const { roomId, choice } = data;
        const room = rooms[roomId];
        if (!room || room.status !== 'full') return;

        const player = room.players.find(p => p.id === socket.id);
        if (player && player.choice === null) {
            player.choice = choice;
            player.timeTaken = parseFloat(((Date.now() - (room.roundStartTime || Date.now())) / 1000).toFixed(2));
            
            io.to(roomId).emit('player_ready', { playerId: socket.id });
        }

        const allReady = room.players.every(p => p.choice !== null);
        
        if (allReady && room.players.length === 2) {
            const p1 = room.players[0];
            const p2 = room.players[1];
            
            const techResult = String(getWinner(p1.choice!, p2.choice!)).toLowerCase();

            let finalWinner = 'draw';
            if (techResult.includes('1')) {
                finalWinner = p1.alias;
            } else if (techResult.includes('2')) {
                finalWinner = p2.alias;
            }

            room.status = 'finished';

            io.to(roomId).emit('game_result', {
                winner: finalWinner,
                players: room.players
            });
            io.to(roomId).emit('room_updated', room);
        }
    });

    socket.on('restart_game', (roomId) => {
        const room = rooms[roomId];
        if (room) {
            room.players.forEach((p:any) => { p.choice = null; p.timeTaken = 0; });
            room.status = 'full';
            room.roundStartTime = Date.now();
            
            io.to(roomId).emit('room_updated', room);
            io.to(roomId).emit('game_result', null);
        }
    });

    const handleLeave = (roomId: string) => {
        const room = rooms[roomId];
        if (room) {
            room.players = room.players.filter((p:any) => p.id !== socket.id);
            socket.leave(roomId);
            
            if (room.players.length === 0) {
                delete rooms[roomId];
            } else {
                room.status = 'waiting';
                room.players[0].choice = null;
                io.to(roomId).emit('room_updated', room);
            }
            io.emit('available_rooms', Object.values(rooms));
        }
    };

    socket.on('leave_room', (roomId) => handleLeave(roomId));

    socket.on('disconnect', () => {
        for (const id in rooms) {
            if (rooms[id].players.find((p:any) => p.id === socket.id)) {
                handleLeave(id);
            }
        }
    });
};