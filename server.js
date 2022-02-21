const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notification = require('./models/Notification');

// dotenv.config({
//   path: './config.env',
// });
require('dotenv').config();


const app = require('./app');
const MONGO_URL=`mongodb+srv://bro:znznektm~1@cluster0.70y6a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose
  //.connect(process.env.DB, {
  .connect(MONGO_URL, {
    dbName: 'instaCloneTest2',
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Db connected');
  })
  .catch((e) => {
    console.log(e, 'Failed to connect Db');
  });

const server = app.listen(process.env.PORT || 3001, () => {
  console.log('Server started' + process.env.PORT);
});

const io = require('socket.io')(server, { pingTimeout: 60000 });

io.on('connection', (socket) => {
  console.log('connected');
  socket.on('authenticated', (userId) => {
    console.log(userId, 'auth');
    socket.join(userId);
  });
  socket.on('join room', (groupId) => {
    socket.join(groupId);
  });
  socket.on('message', ({ groupId, message }) => {
    socket.broadcast.to(groupId).emit('message', { groupId, message });
  });
  socket.on('seen', (groupId) => {
    socket.broadcast.to(groupId).emit('seen', groupId);
  });
  socket.on('render', (groupId) => {
    socket.broadcast.to(groupId).emit('render', groupId);
  });
  socket.on('notification', async (msg) => {
    const notification = await Notification.create(msg);
    socket.broadcast.to(msg.to).emit('notification');
  });
  socket.on('disconnect', () => {
    console.log('disconnected');
  });
});
