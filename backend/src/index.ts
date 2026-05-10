import express from 'express';
import { createServer } from 'http'; // Necesario para que Socket.io funcione
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config'; // Carga tu archivo .env
import { setupSocketHandlers } from './socket/gameHandler';

const app = express();
app.use(cors()); // Permite que el front se conecte sin bloqueos
app.use(express.json());

// servidor http
const httpServer = createServer(app);

// inicializacion de socket.io
const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

//conexiones
io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    //control de handle socket
    setupSocketHandlers(io, socket);

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`);
    });
});

//inicio de servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Servidor en: http://localhost:${PORT}`);
});
