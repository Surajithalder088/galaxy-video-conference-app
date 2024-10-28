const rooms = {};

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    
    // Handle joining the room
    socket.on('join-room', (roomId, userId) => {
      if (!rooms[roomId]) rooms[roomId] = [];

      // Check if the room is full
      if (rooms[roomId].length >= 50) {
        socket.emit('room-full'); 
        return;
      }

      // Add user to the room
      rooms[roomId].push(userId);
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);

      // Handle screen share
    socket.on('screen-share', (data) => {
        socket.to(roomId).emit('share-screen', data);
      });

      // Handle leaving the meeting
      socket.on('leave-room', () => {
        socket.leave(roomId);
        rooms[roomId] = rooms[roomId].filter((id) => id !== userId);
        socket.to(roomId).emit('user-disconnected', userId);
      });

      // Disconnect event
      socket.on('disconnect', () => {
        rooms[roomId] = rooms[roomId].filter((id) => id !== userId);
        socket.to(roomId).emit('user-disconnected', userId);
      });
    });
  });
};

module.exports = socketHandler;