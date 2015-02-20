/**
 Copyright (C) fancyfrog.org
 Author : Sagiruddin Mondal
 This code is available under MIT Licence
 **/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
users = {};

http.listen(3000, function(){
    console.log('listening on *: 3000');
});

//routes for index
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    console.log('a user connected');

    socket.on('new user', function(data, callback){
       if(data in users ){
           callback(false);
       }else{
           socket.nickname = data;
           users[socket.nickname] = socket;
           callback(true);
           updateNicknames();
       }
    });

    function updateNicknames(){
        io.sockets.emit('userNames', Object.keys(users));
    }

    socket.on('send message', function(data, callback){
        var msg = data.trim();
        if(msg.substr(0, 3) === '/w '){
            console.log(msg);
            msg = msg.substr(3);
            var ind = msg.indexOf(' ');
            if(ind !== -1) {
                var name = msg.substr(0, ind);
                var msg = msg.substr(ind+1);
                if(name in users){
                    users[name].emit('private', {msg: msg, nick: socket.nickname});
                    console.log("data! private");
                }else{
                    callback('error : message you are sending to is not available!');
                }
            }else{
                callback('error : please enter a message first!');
            }
        }else {
            console.log(msg);
            console.log(socket.nickname);
            io.sockets.emit('public', {msg: msg, nick: socket.nickname});
            //send data everyone eccept me
            //socket.broadcast.emit('new message', data);
        }
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
        if(!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
    });
});



