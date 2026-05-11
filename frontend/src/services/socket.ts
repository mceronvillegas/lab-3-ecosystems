import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL;

// se conecta al servidor
export const socket = io(URL);