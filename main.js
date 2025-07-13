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

function preload() {
  // Load the sky background
  this.load.image('sky', 'assets/images/sky.png');
  this.load.image('ground', 'assets/images/platform.png');
}

function create() {
  // Add the sky background - this will fix the black screen
  this.add.image(679, 287, 'sky').setScale(2.5);
  
  // Add a platform at the bottom
  this.add.image(679, 550, 'ground').setScale(3, 1);
}

function update() {}
