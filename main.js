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

var platforms;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "assets/images/sky.png");
  this.load.image("ground", "assets/images/platform.png");
  this.load.image("star", "assets/images/star.png");
  this.load.image("bomb", "assets/images/bomb.png");
  this.load.spritesheet("dude", "assets/images/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  this.add.image(670, 300, "sky");

  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, "ground").setScale(5, 3).refreshBody();
  platforms.create(1160, 400, "ground");
  platforms.create(150, 150, "ground");
  platforms.create(1250, 180, "ground");
  platforms.create(615, 310, "ground");
}

function update() {}
