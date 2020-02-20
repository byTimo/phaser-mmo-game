const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  autoFocus: false,
};

const players = {};

function preload() {
  this.load.image("ship", "assets/spaceShips_001.png");
}

function create() {
  const self = this;
  this.players = this.physics.add.group();

  io.on("connection", function (socket) {
    console.log("a user connected");
    players[socket.id] = {
      rotation: 0,
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
      id: socket.id,
      team: Math.random() > 0.5 ? "red" : "blue",
      input: {
        left: false,
        right: false,
        up: false
      }
    };

    addPlayer(self, players[socket.id]);
    socket.emit('currentPlayers', players);
    socket.broadcast.emit("newPlayer", players[socket.id]);
    socket.on("disconnect", function () {
      console.log("user disconnected");
      removePlayer(self, socket.id);
      delete players[socket.id];
      io.emit('disconnect', socket.id);
    });
    socket.on('playerInput', function (inputData) {
      console.log("playerInput");
      handlePlayerInput(self, socket.id, inputData);
    })
  })
}

function update() {
  this.players.getChildren().forEach((player) => {
    const input = players[player.id].input;
    if (input.left) {
      player.setAngularVelocity(-300);
    } else if (input.right) {
      player.setAngularVelocity(300);
    } else {
      player.setAngularVelocity(0);
    }

    if (input.up) {
      this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
    } else {
      player.setAcceleration(0);
    }

    players[player.id].x = player.x;
    players[player.id].y = player.y;
    players[player.id].rotation = player.rotation;
  });
  this.physics.world.wrap(this.players, 5);
  io.emit('playerUpdates', players);
}

function addPlayer(self, playerInfo) {
  const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  player.setDrag(100);
  player.setAngularDrag(100);
  player.setMaxVelocity(200);
  player.id = playerInfo.id;
  self.players.add(player);
}

function removePlayer(self, playerId) {
  self.players.getChildren().forEach(player => {
    if (playerId === player.id) {
      player.destroy();
    }
  })
}

function handlePlayerInput(self, id, input) {
  players[id].input = input;
}

const game = new Phaser.Game(config);
window.gameLoaded();