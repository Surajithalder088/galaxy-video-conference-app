const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true }, // Unique ID for each room
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the host's User ID
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of participants
  createdAt: { type: Date, default: Date.now }, // Timestamp when the room is created
  expiresAt: { type: Date }, // Optional expiration for the room (e.g., for scheduled meetings)
});

module.exports = mongoose.model('Room', roomSchema);