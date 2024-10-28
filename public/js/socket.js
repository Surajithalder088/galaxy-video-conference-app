const socket=io();

function joinRoom(roomId,userId){

    socket.emit('join-room',roomId,userId) ;

    socket.on('user-connected',(userId)=>{
        console.log(`User connected  : ${userId}`);
        
    })
    socket.on('user-disconnected',(userId)=>{
        console.log(`User disconnected  : ${userId}`);
        
    })
    
}

export default socket ;