var config = {
  type: Phaser.AUTO,
  width: 1358,
  height: 575,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

function preload() {}

function create() {}

function update() {}
