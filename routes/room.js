const express = require('express');
const Room = require('../model/room');
const jwt = require('jsonwebtoken');
const {v4:uuidv4}=require('uuid') ;
require('dotenv').config();
const router = express.Router();
const User = require('../model/user');


const JWT_SECRET = process.env.JWT_TOKEN ;

// Create a new room
router.post('/create',async (req, res) => {
  const token = req.cookies.token; // Get token from cookies
    if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });
  
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified; // Attach user info to request object
      
    } catch (err) {
      res.status(400).json({ error: 'Invalid token' });
    }

  try {
    const {  roomId } =req.body;
    const { hostId}=req.user.id;
    const room = await Room.findOne({ roomId }).populate('participants');
    if (room) return res.status(404).send( 'Room already exist ' );
    const newRoom = new Room({ host: hostId, roomId });
    await newRoom.save();
    res.status(201).redirect(`/room/${roomId}`) ;
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//redirect to room-joining page
router.post('/',  async (req, res) => {
  const token = req.cookies.token; // Get token from cookies
  if (!token)  return res.render('pages/login');

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach user info to request object
    if (!req.user.id)  return res.render('pages/login');
  } catch (err) {
    res.status(400).send( 'Invalid token' );
  }
   const Id =req.body.Id;
   
  try {
    res.status(200).render(`pages/roomJoin`,{roomId:Id}) ;
    
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get room by ID
router.get('/:roomId',  async (req, res) => {
  const token = req.cookies.token; // Get token from cookies
  if (!token)  return res.render('pages/login');

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach user info to request object
    if (!req.user.id)  return res.render('pages/login');
  } catch (err) {
    res.status(400).send( 'Invalid token' );
  }
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate('participants');
    if (!room) return res.status(404).send( 'Room not found' );
    const roomId=room.roomId;
    res.render('pages/room',{roomId})
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join a room (add a participant)
router.post('/:roomId/join', async (req, res) => {
  //const userId=req.body;
  const token = req.cookies.token; // Get token from cookies
  if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach user info to request object
    
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
  console.log(`User  is attemptting to join room ${req.params.roomId }`);
  
  try {
    
    
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $addToSet: { participants: req.user.id } },
      { new: true }
    );
    if (!room) return res.status(404).json({ error: 'Room not found' });
 
    res.json({ message: `User has joined the room ${req.params.roomId}`, room });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/:roomId/leave', async (req, res) => {
  const token = req.cookies.token; // Get token from cookies
  if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach user info to request object
    
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
  try {
    const { userId}=req.user.id; // Get userId from request body
    const { roomId } = req.params; // Get roomId from URL parameters

    // Find the room and remove the user from participants
    const room = await Room.findOneAndUpdate(
      { roomId },
      { $pull: { participants: req.user.id } },
      { new: true } // Returns the updated document
    );

    if (!room) return res.status(404).json({ error: 'Room not found' });

     const user = await User.findById(req.user.id)
    
    res.json({ message: `${user.username} has left the room`, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;