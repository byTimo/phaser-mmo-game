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
}

function update() { }

const game = new Phaser.Game(config);
window.gameLoaded();

io.on("connection", function (socket) {
  console.log("a user connected");
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    id: socket.id,
    team: Math.random() > 0.5 ? "red" : "blue"
  };

  addPlayer(self, players[socket.id]);
  socket.emit('currentPlayers', players);
  socket.broadcast.emit("newPlayer", player[socket.id]);
  socket.on("disconnect", function () {
    console.log("user disconnected");
  })
})

function addPlayer(self, playerInfo) {
  const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  player.setDrag(100);
  player.setAngularDrag(100);
  player.setMaxVelocity(200);
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}