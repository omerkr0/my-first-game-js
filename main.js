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

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var scoreText;
var gameOver = false;
var jumpSound;
var starSound;

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
  this.load.audio("jumpSound", "assets/sounds/jumping.mp3");
  this.load.audio("starSound", "assets/sounds/star.mp3");
}

function create() {
  this.add.image(670, 300, "sky");

  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, "ground").setScale(5, 3).refreshBody();
  platforms.create(1160, 400, "ground");
  platforms.create(150, 150, "ground");
  platforms.create(1250, 180, "ground");
  platforms.create(615, 310, "ground");

  player = this.physics.add.sprite(100, 450, "dude");

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  jumpSound = this.sound.add("jumpSound");
  starSound = this.sound.add("starSound");

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();

  stars = this.physics.add.group({
    key: "star",
    repeat: 14,
    setXY: { x: 15, y: 0, stepX: 90 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "30px",
    fill: "#000",
  });

  bombs = this.physics.add.group();

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
  if (gameOver) {
    return;
  }
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);

    if (jumpSound && !jumpSound.isPlaying) {
      jumpSound.play();
    }
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  // Prevent score overflow and ensure it's a valid number
  if (score < Number.MAX_SAFE_INTEGER - 10) {
    score += 10;
  }
  // Sanitize score display to prevent potential XSS and ensure it's an integer
  scoreText.setText('Score: ' + Math.floor(score));
  
  if (starSound && !starSound.isPlaying) {
    starSound.play();
  }

  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    var velocityX = Phaser.Math.Between(-200, 200);
    // Ensure minimum velocity to avoid slow/stationary bombs
    if (Math.abs(velocityX) < 50) {
      velocityX = velocityX < 0 ? -50 : 50;
    }
    bomb.setVelocity(velocityX, Phaser.Math.Between(50, 100));
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;
}
