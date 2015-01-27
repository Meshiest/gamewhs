var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {}

var command = {}

app.set('port', (process.env.PORT || 5000));

var idCount = 0;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/ship.png', function(req, res) {
  res.sendFile(__dirname+'/ship.png');
});

app.get('/background.jpg', function(req, res) {
  res.sendFile(__dirname+'/background.jpg');
});

app.get('/pointer.png', function(req, res) {
  res.sendFile(__dirname+'/pointer.png');
});

app.get('/laser.png', function(req, res) {
  res.sendFile(__dirname+'/laser.png');
});

io.on('connection', function(socket) {

  var user = {};
  var id = idCount++;

  user.id = id;
  user.joinTime = new Date().getTime();
  user.socket = socket;

  socket.broadcast.emit('connection', user.id, 0, 0, 0);

  users[id] = user;

  for(var i in users) {
    if(i != id) {
      var u = users[i];
      socket.emit('connection', i, u.x, u.y, u.theta);
    }
  }

  console.log('user '+user.id+' connected');

  socket.on('location', function(x, y, theta){
    user.x = x;
    user.y = y;
    user.theta = theta;
    socket.broadcast.emit('location', id, x, y, theta);
  })

  socket.on('laser', function(vx, vy, theta){
    //console.log("laser "+user.id);
    socket.broadcast.emit('laser',
          user.x,
          user.y,
          vx,
          vy,
          theta,
          new Date().getTime() + 500,
          user.id)
  })

  socket.on('disconnect', function() {
    socket.broadcast.emit('disconnection', user.id);
    delete users[user.id];
    console.log('user '+user.id+' disconnected');
  });
});

http.listen(app.get('port'));

