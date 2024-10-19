import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io('https://mysteria-backend.onrender.com', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Připojeno k serveru');
    });

    socket.on('disconnect', () => {
      console.log('Odpojeno od serveru');
    });
  }
};

export const getSocket = (): Socket | null => socket;
