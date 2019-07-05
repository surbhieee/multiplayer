var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var players = {};
var TeamJoiningNumber = 0;
var startGame = false;
var scores = {
  blue: 0,
  red: 0,
  green: 0,
  yellow: 0
};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('User connected..?');
  // create a new player and add it to our players object
  players[socket.id] = {
    playerId: socket.id,
    team: joinTeam(),
    readytoPlay: false
  };

  // send the players object to the new player
  socket.emit('currentPlayers', players,startGame);

  //Game Started
  socket.emit('gameStarted',startGame)

  // send the current scores
  socket.emit('scoreUpdate', scores);

  // update all other players of the new player
  socket.broadcast.emit('newPlayer', startGame, players);

  if (Object.keys(players).length >= 2 && !startGame) {
    socket.emit('showStartButton');
  }
  else {
    socket.emit('hideStartButton');
  }

  socket.on('disconnect', function () {
    console.log('User disconnected..');
    // remove this player from our players object
    delete players[socket.id];
    if(Object.keys(players).length <=0 ){
      startGame = false;
    }
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id, players);
    socket.emit('currentPlayers', players,startGame);
  });

  socket.on('startClicked', function () {
    players[socket.id].readytoPlay = true;
    startGame = checkAllPlayersState(players);
    if(startGame)
      socket.broadcast.emit('renderGame');
      socket.emit('currentPlayers', players,startGame);
  });
});


server.listen(1251, function () {
  console.log(`Listening on ${server.address().port}`);
});

function checkAllPlayersState(players) {
  var temp = true;
  Object.keys(players).forEach(player => {
    if (players[player].readytoPlay != true) {
      temp = false;
    }
  });
  return temp;
}

function joinTeam() {
  teamName = '';
  switch (TeamJoiningNumber) {
    case 0:
      TeamJoiningNumber++;
      teamName = 'blue';
      break;
    case 1:
      TeamJoiningNumber++;
      teamName = 'red';
      break;
    case 2:
      TeamJoiningNumber++;
      teamName = 'green';
      break;
    case 3:
      TeamJoiningNumber = 0;
      teamName = 'yellow';
      break;
  }
  return teamName;
}