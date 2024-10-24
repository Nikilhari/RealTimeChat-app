// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Ensure this matches your React app's URL and port
        methods: ["GET", "POST"],
        credentials: true
    }
});

const users = {};

app.use(cors());

app.get('/', (req, res) => {
    res.send("Chat server is running...");
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);


    socket.on('new-user', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
        console.log(`${name} has joined`);
    });

    // Handle sending chat message
    socket.on('send-chat-message', (message) => {
        const senderName = users[socket.id];
        if (senderName) {
            socket.broadcast.emit('chat-message', {
                message: message,
                name: senderName
            });
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const name = users[socket.id];
        if (name) {
            socket.broadcast.emit('user-disconnected', name);
            delete users[socket.id];
            console.log(`${name} has disconnected`);
        }
    });
});

const PORT = process.env.PORT || 7777;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
