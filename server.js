const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path =require('path') ;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const {v4:uuidv4}=require('uuid') ;
require('dotenv').config();
const socketHandler = require('./socket/socket');
const authRoutes= require('./routes/auth')
const roomRoutes= require('./routes/room')

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
socketHandler(io);

const JWT_SECRET = process.env.JWT_TOKEN ;

const User = require('./model/user');

// Middleware and Routes
app.set('view engine','ejs') ;
app.set('views',path.join(__dirname,'views')) ;
app.use(express.static(path.join(__dirname,'public'))) ;

app.use(express.json());
app.use(cookieParser());
app.use(express.Router());
app.use(express.urlencoded({extended:true}))
//app.use(express.authenticateToken());
app.use('/auth',authRoutes);
app.use('/room',roomRoutes);

app.get('/', (req,res)=>{
        const token = req.cookies.token; // Get token from cookies
       if (!token)  return res.redirect('/auth/login');
      

          const verified =   jwt.verify(token, JWT_SECRET);
          req.user = verified; // Attach user info to request object
          if (!req.user.id)  return res.redirect('/auth/login');
          console.log(req.user.id);
         // console.log(verified);
          
        res.render('pages/dashboard');
      
})
app.post('/chat',async(req,res)=>{
      try{ 
     const users=   await User.find();
     res.json({users})}catch(err){
        res.json('failed')
     }
})


const dbConnect = async()=>{
        try{
         await  mongoose.connect( process.env.MONGO_URL, { useNewUrlParser: true ,useUnifiedTopology:true});
                console.log('data base connected');
                
        }catch(err){
                console.log(` Failed to connect database : error : ${err}`);
                
        }
     
}

dbConnect();
const port=process.env.PORT || 5000
server.listen(port, () => console.log(`Server is running on port ${port}  ` ));