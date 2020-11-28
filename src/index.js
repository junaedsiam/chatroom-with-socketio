const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const { getUserName } = require('./helper');

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = socketio(server);
// Middlewares
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/static.html'));
});

io.on('connection', (socket) => {
  socket.emit('message', 'Welcome user!');
  socket.broadcast.emit('new-user', 'A new user has joined');
  socket.on('userMessage', (obj, callback) => {
    const { username } = getUserName(obj.qs);
    const { message } = obj;
    io.emit('channelMessage', { username, message });
    callback('Delivered!');
  });
  socket.on('userLocation', (obj, callback) => {
    const { username } = getUserName(obj.qs);
    const { latitude, longitude } = obj;
    const location = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    io.emit('channelLocation', { username, location });
    callback('Delivered');
  });
});

server.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
});
