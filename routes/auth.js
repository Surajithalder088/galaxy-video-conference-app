const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../model/user');

const router = express.Router();

const JWT_SECRET = process.env.JWT_TOKEN ;

router.get('/login',(req,res)=>{
    res.render('pages/login')
})

router.get('/signup',(req,res)=>{
  res.render('pages/signup')
})



// Middleware to authenticate users by verifying JWT from cookies
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies
    if (!token) return res.status(401).json({ error: 'Access denied, no token provided' });
  
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified; // Attach user info to request object
      next();
    } catch (err) {
      res.status(400).json({ error: 'Invalid token' });
    }
  };

// Sign Up
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User created');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT and send it as a cookie
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true, // Prevents client-side access to the cookie
      secure: process.env.NODE_ENV === 'production', // Only use https in production
      maxAge: 3600000, // 1 hour
    });
    
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected Route Example: Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).send( 'User not found' );

      res.status(200).render('pages/profile',{user})
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Logout Route
router.post('/logout', authenticateToken,(req, res) => {
    res.clearCookie('token'); // Clears the JWT token cookie
    res.render('pages/login');
  });


module.exports = router;
