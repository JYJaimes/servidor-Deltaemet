const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let users = {}; // { socketId: { name: string, votes: { charIndex: boolean } } }
let characteristics = []; // Array de strings

io.on('connection', (socket) => {
    console.log('Nuevo usuario intentando conectar...');

    socket.on('join', (name) => {
        users[socket.id] = { name, votes: {} };
        io.emit('updateData', { users, characteristics });
    });

    socket.on('addCharacteristic', (charName) => {
        characteristics.push(charName);
        io.emit('updateData', { users, characteristics });
    });

    socket.on('vote', ({ targetSocketId, charIndex, voteValue }) => {
        // Solo registramos el voto si el usuario existe
        if (users[targetSocketId]) {
            // Guardamos quién votó qué sobre quién
            // Estructura simplificada para el ejemplo:
            if (!users[targetSocketId].votes[charIndex]) {
                users[targetSocketId].votes[charIndex] = {};
            }
            users[targetSocketId].votes[charIndex][socket.id] = voteValue;
            
            io.emit('updateData', { users, characteristics });
        }
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('updateData', { users, characteristics });
    });
});

// IMPORTANTE: Escuchar en 0.0.0.0 para que sea accesible desde otros dispositivos
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});