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

var lastJumpTime = 0;

var game = new Phaser.Game(config);

// Mobile control event listeners with improved responsiveness
function setupMobileControls() {
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  const jumpBtn = document.getElementById('jump-btn');
  
  // Helper function for haptic feedback
  function vibrate() {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
  
  // Helper function to add visual feedback
  function addPressedClass(btn) {
    btn.classList.add('pressed');
  }
  
  function removePressedClass(btn) {
    btn.classList.remove('pressed');
  }
  
  if (leftBtn) {
    leftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      mobileControls.left = true;
      addPressedClass(leftBtn);
      vibrate();
    });
    leftBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      mobileControls.left = false;
      removePressedClass(leftBtn);
    });
    leftBtn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      mobileControls.left = false;
      removePressedClass(leftBtn);
    });
    leftBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      mobileControls.left = true;
      addPressedClass(leftBtn);
    });
    leftBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      mobileControls.left = false;
      removePressedClass(leftBtn);
    });
    leftBtn.addEventListener('mouseleave', (e) => {
      mobileControls.left = false;
      removePressedClass(leftBtn);
    });
  }
  
  if (rightBtn) {
    rightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      mobileControls.right = true;
      addPressedClass(rightBtn);
      vibrate();
    });
    rightBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      mobileControls.right = false;
      removePressedClass(rightBtn);
    });
    rightBtn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      mobileControls.right = false;
      removePressedClass(rightBtn);
    });
    rightBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      mobileControls.right = true;
      addPressedClass(rightBtn);
    });
    rightBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      mobileControls.right = false;
      removePressedClass(rightBtn);
    });
    rightBtn.addEventListener('mouseleave', (e) => {
      mobileControls.right = false;
      removePressedClass(rightBtn);
    });
  }
  
  if (jumpBtn) {
    jumpBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      mobileControls.up = true;
      addPressedClass(jumpBtn);
      vibrate();
    });
    jumpBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      mobileControls.up = false;
      removePressedClass(jumpBtn);
    });
    jumpBtn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      mobileControls.up = false;
      removePressedClass(jumpBtn);
    });
    jumpBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      mobileControls.up = true;
      addPressedClass(jumpBtn);
    });
    jumpBtn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      mobileControls.up = false;
      removePressedClass(jumpBtn);
    });
    jumpBtn.addEventListener('mouseleave', (e) => {
      mobileControls.up = false;
      removePressedClass(jumpBtn);
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

  // Fixed ground platform - proper scaling and positioning
  const groundScaleX = Math.ceil(gameWidth / 160);
  const groundY = gameHeight - 32; // Proper ground position
  const groundPlatform = platforms.create(gameWidth/2, groundY, "ground");
  groundPlatform.setScale(groundScaleX, 2).refreshBody(); // Better thickness
  
  // Mobile-friendly platform positioning with proper spacing
  const isMobile = gameWidth < 600;
  const platformScale = isMobile ? 1.5 : 1.2;
  
  if (isMobile) {
    // Mobile layout: better spaced platforms to prevent overlap and improve gameplay
    const leftPlatform = platforms.create(gameWidth * 0.15, gameHeight * 0.8, "ground");
    leftPlatform.setScale(platformScale, 1.5).refreshBody();
    
    const centerPlatform = platforms.create(gameWidth * 0.5, gameHeight * 0.6, "ground");
    centerPlatform.setScale(platformScale, 1.5).refreshBody();
    
    const rightPlatform = platforms.create(gameWidth * 0.85, gameHeight * 0.7, "ground");
    rightPlatform.setScale(platformScale, 1.5).refreshBody();
    
    const topLeftPlatform = platforms.create(gameWidth * 0.25, gameHeight * 0.4, "ground");
    topLeftPlatform.setScale(platformScale * 0.7, 1.5).refreshBody();
    
    const topRightPlatform = platforms.create(gameWidth * 0.75, gameHeight * 0.45, "ground");
    topRightPlatform.setScale(platformScale * 0.7, 1.5).refreshBody();
  } else {
    // Desktop layout: properly positioned platforms
    const p1 = platforms.create(gameWidth * 0.85, gameHeight * 0.75, "ground");
    p1.setScale(platformScale, 1.5).refreshBody();
    
    const p2 = platforms.create(gameWidth * 0.15, gameHeight * 0.5, "ground");
    p2.setScale(platformScale, 1.5).refreshBody();
    
    const p3 = platforms.create(gameWidth * 0.9, gameHeight * 0.4, "ground");
    p3.setScale(platformScale, 1.5).refreshBody();
    
    const p4 = platforms.create(gameWidth * 0.45, gameHeight * 0.65, "ground");
    p4.setScale(platformScale, 1.5).refreshBody();
  }

  // Fixed player spawn position - ensure they spawn safely above ground
  const playerSpawnY = groundY - 80; // Safe distance above ground
  player = this.physics.add.sprite(100, playerSpawnY, "dude");

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  
  // Improved collision body - better hitbox to prevent getting stuck
  player.setSize(24, 40, true); // width, height, center
  player.setOffset(4, 8); // offset from sprite origin

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

  // Create stars with better spacing and positioning
  const starCount = Math.max(Math.floor(gameWidth / 100), 4);
  stars = this.physics.add.group({
    key: "star",
    repeat: starCount - 1,
    setXY: { x: 60, y: 0, stepX: Math.floor((gameWidth - 120) / (starCount - 1)) },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    // Ensure stars don't get stuck
    child.setSize(20, 20, true);
  });

  // Responsive score text with better positioning
  scoreText = this.add.text(20, 20, "Score: 0", {
    fontSize: Math.min(gameWidth / 20, 28) + "px",
    fill: "#000",
    fontWeight: "bold",
    stroke: "#fff",
    strokeThickness: 3,
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#000',
      blur: 2,
      stroke: true,
      fill: true
    }
  });

  bombs = this.physics.add.group();

  // Improved collision detection with proper callbacks
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
  
  // Improved movement with better responsiveness
  const isMobile = gameWidth < 600;
  const moveSpeed = isMobile ? 140 : 160;
  const jumpForce = isMobile ? -350 : -330;
  
  if (leftPressed) {
    player.setVelocityX(-moveSpeed);
    player.anims.play("left", true);
  } else if (rightPressed) {
    player.setVelocityX(moveSpeed);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  // Improved jump mechanics with better ground detection
  const currentTime = Date.now();
  const canJump = player.body.touching.down || player.body.onFloor();
  
  if (upPressed && canJump && (currentTime - lastJumpTime > 200)) {
    player.setVelocityY(jumpForce);
    if (jumpSound) {
      jumpSound.play();
    }
    lastJumpTime = currentTime;
  }
  
  // Prevent player from getting stuck - emergency unstuck mechanism
  if (player.body.embedded || (player.body.blocked.left && player.body.blocked.right)) {
    player.y -= 5; // Slightly lift player
    player.body.touching.none = false;
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
