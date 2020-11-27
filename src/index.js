/**
 * TODO:
 * 1. Add location sharing feature to the chat
 * 2. Clean up code
 * 3. Rewrite & restructure some repetition
 */
const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const qs = require('qs');

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
  // socket.on('sendLocation', ({ latitude, longitude }) => {
  //   socket.broadcast.emit('user-location',
  //     `https://www.google.com/maps/@${latitude},${longitude},20z`);
  // });
  socket.on('userMessage', (obj, callback) => {
    const { username } = qs.parse(obj.qs, { ignoreQueryPrefix: true });
    const { msg, time } = obj;
    io.emit('channelMessage', { username, msg, time });
    callback('Delivered!');
  });
  socket.on('userLocation', (obj, callback) => {
    const { username } = qs.parse(obj.qs, { ignoreQueryPrefix: true });
    const { latitude, longitude } = obj;
    io.emit('channelLocation', { username, latitude, longitude });
    callback('Delivered');
  });
});
server.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
});
