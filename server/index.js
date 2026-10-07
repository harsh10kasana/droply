const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        // Check current room size before joining
        const room = io.sockets.adapter.rooms.get(roomId);
        const size = room ? room.size : 0;

        if (size >= 2) {
            socket.emit('room-full');
            return;
        }

        socket.join(roomId);
        socket.to(roomId).emit('peer-joined', socket.id);
    });

    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit('peer-left');
    });

    socket.on('offer', ({ roomId, offer }) => socket.to(roomId).emit('offer', offer));
    socket.on('answer', ({ roomId, answer }) => socket.to(roomId).emit('answer', answer));
    socket.on('ice-candidate', ({ roomId, candidate }) =>
        socket.to(roomId).emit('ice-candidate', candidate)
    );

    socket.on('disconnecting', () => {
        for (const roomId of socket.rooms) {
            if (roomId !== socket.id) socket.to(roomId).emit('peer-left');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Signaling server is running on port ${PORT}`);
});