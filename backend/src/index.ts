import 'dotenv/config'; 
import express from 'express';
import { createServer } from 'http'; 
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket/gameHandler';

const app = express();
app.use(cors()); 

app.get('/', (req, res) => {
    res.send('El servidor está vivo y escuchando perfectamente');
});
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
