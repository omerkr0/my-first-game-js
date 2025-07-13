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
  // Load game assets
  this.load.image('sky', 'assets/images/sky.png');
  this.load.image('ground', 'assets/images/platform.png');
  this.load.image('star', 'assets/images/star.png');
  this.load.image('bomb', 'assets/images/bomb.png');
  this.load.spritesheet('dude', 'assets/images/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
  // Add background
  this.add.image(400, 300, 'sky');
  
  // Create platforms group
  platforms = this.physics.add.staticGroup();
  
  // Create ground platform
  platforms.create(400, 568, 'ground').setScale(2, 1).refreshBody();
  
  // Create some floating platforms
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');
  
  // Add a star for visual interest
  this.add.image(100, 100, 'star');
}

function update() {
  // Game loop - can add game logic here later
}
