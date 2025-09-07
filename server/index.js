import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Room management
const rooms = new Map(); // roomId -> { players: Set<socketId>, state?: any, rematchRequests?: Set<socketId> }

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/create', (_req, res) => {
  const id = nanoid(8);
  rooms.set(id, { players: new Set() });
  res.json({ id, url: id });
});

io.on('connection', (socket) => {
  socket.on('join', ({ roomId }) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { players: new Set() });
    }
    const room = rooms.get(roomId);
    room.players.add(socket.id);
    socket.join(roomId);
    io.to(roomId).emit('players', Array.from(room.players));
    if (room.state) {
      socket.emit('state', room.state);
    }
  });

  socket.on('leave', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.players.delete(socket.id);
      socket.leave(roomId);
      io.to(roomId).emit('players', Array.from(room.players));
    }
  });

  socket.on('state', ({ roomId, state }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.state = state;
      socket.to(roomId).emit('state', state);
    }
  });

  socket.on('requestRematch', ({ roomId }) => {
    console.log(`Player ${socket.id} requesting rematch in room ${roomId}`);
    const room = rooms.get(roomId);
    if (room) {
      if (!room.rematchRequests) room.rematchRequests = new Set();
      
      // If this player already requested, ignore duplicate
      if (room.rematchRequests.has(socket.id)) {
        console.log(`Player ${socket.id} already requested rematch, ignoring`);
        return;
      }
      
      room.rematchRequests.add(socket.id);
      console.log(`Room ${roomId} now has ${room.rematchRequests.size} rematch requests`);
      
      if (room.rematchRequests.size === 1) {
        // First player requested, notify the other
        console.log(`Notifying other players in room ${roomId} about rematch request`);
        socket.to(roomId).emit('rematchRequested', { requesterId: socket.id });
      } else if (room.rematchRequests.size === 2) {
        // Both players agreed, start new game
        console.log(`Both players agreed to rematch in room ${roomId}`);
        room.rematchRequests.clear();
        io.to(roomId).emit('rematchAccepted');
      }
    }
  });

  socket.on('declineRematch', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.rematchRequests = new Set();
      io.to(roomId).emit('rematchDeclined', { declinerId: socket.id });
    }
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.players.delete(socket.id);
        if (room.rematchRequests) {
          room.rematchRequests.delete(socket.id);
          // If someone disconnects during rematch, decline it
          if (room.rematchRequests.size > 0) {
            room.rematchRequests.clear();
            io.to(roomId).emit('rematchDeclined', { declinerId: socket.id, reason: 'disconnect' });
          }
        }
        io.to(roomId).emit('players', Array.from(room.players));
      }
    }
  });
});

const PORT = process.env.PORT || 5175;
server.listen(PORT, () => {
  console.log('Server running on', PORT);
});


