import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://mysteria-nk8g9zwra-tonysixxs-projects.vercel.app',
    methods: ['GET', 'POST'],
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

app.get('/', (req, res) => {
  res.send('Mysteria Game Server');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('authenticate', async (token) => {
    const { user, error } = await supabase.auth.api.getUser(token);
    if (user && !error) {
      console.log('User authenticated:', user.email);
      socket.emit('authenticated', { userId: user.id });
    } else {
      console.log('Authentication failed');
      socket.emit('authentication_failed');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
