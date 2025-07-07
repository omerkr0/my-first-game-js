// Get screen dimensions for responsive design
const gameWidth = Math.min(window.innerWidth, 800);
const gameHeight = Math.min(window.innerHeight, 600);

var config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: gameWidth,
    height: gameHeight
  },
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

// Mobile controls
var mobileControls = {
  left: false,
  right: false,
  up: false
};

var game = new Phaser.Game(config);

// Mobile control event listeners
function setupMobileControls() {
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  const jumpBtn = document.getElementById('jump-btn');
  
  if (leftBtn) {
    leftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      mobileControls.left = true;
    });
    leftBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      mobileControls.left = false;
    });
    leftBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      mobileControls.left = true;
    });
    leftBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      mobileControls.left = false;
    });
  }
  
  if (rightBtn) {
    rightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      mobileControls.right = true;
    });
    rightBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      mobileControls.right = false;
    });
    rightBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      mobileControls.right = true;
    });
    rightBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      mobileControls.right = false;
    });
  }
  
  if (jumpBtn) {
    jumpBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      mobileControls.up = true;
    });
    jumpBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      mobileControls.up = false;
    });
    jumpBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      mobileControls.up = true;
    });
    jumpBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      mobileControls.up = false;
    });
  }
}

// Setup mobile controls when DOM is ready
document.addEventListener('DOMContentLoaded', setupMobileControls);

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
  // Scale background to fit screen
  const bg = this.add.image(gameWidth/2, gameHeight/2, "sky");
  bg.setDisplaySize(gameWidth, gameHeight);

  platforms = this.physics.add.staticGroup();

  // Responsive platform positioning
  const groundScale = Math.max(gameWidth / 160, 3); // Ensure ground covers width
  platforms.create(gameWidth/2, gameHeight - 20, "ground").setScale(groundScale, 2).refreshBody();
  
  // Adjust platform positions based on screen size
  platforms.create(gameWidth * 0.85, gameHeight * 0.7, "ground");
  platforms.create(gameWidth * 0.15, gameHeight * 0.4, "ground");
  platforms.create(gameWidth * 0.9, gameHeight * 0.35, "ground");
  platforms.create(gameWidth * 0.45, gameHeight * 0.55, "ground");

  player = this.physics.add.sprite(100, gameHeight - 150, "dude");

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
    repeat: Math.floor(gameWidth / 60) - 1, // Responsive star count
    setXY: { x: 30, y: 0, stepX: Math.floor(gameWidth / Math.floor(gameWidth / 60)) },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: Math.min(gameWidth / 25, 32) + "px",
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
  
  // Check both keyboard and mobile controls
  const leftPressed = (cursors.left.isDown || mobileControls.left);
  const rightPressed = (cursors.right.isDown || mobileControls.right);
  const upPressed = (cursors.up.isDown || mobileControls.up);
  
  if (leftPressed) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (rightPressed) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (upPressed && player.body.touching.down) {
    player.setVelocityY(-330);
    jumpSound.play();
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText(`Score: ${score}`);
  starSound.play();

  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < gameWidth/2
        ? Phaser.Math.Between(gameWidth/2, gameWidth - 50)
        : Phaser.Math.Between(50, gameWidth/2);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;
}

// Handle window resize for better mobile experience
window.addEventListener('resize', () => {
  if (game && game.scale) {
    game.scale.refresh();
  }
});
