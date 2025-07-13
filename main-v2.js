// Responsive game dimensions
function getGameDimensions() {
  const container = document.getElementById('game-container');
  
  if (!container) {
    return { width: 800, height: 600 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

const gameDimensions = getGameDimensions();

// Phaser Game Config
const config = {
  type: Phaser.AUTO,
  width: gameDimensions.width,
  height: gameDimensions.height,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#87CEEB',
  input: {
    activePointers: 3 // Multi-touch için
  }
};

// Game variables
let player;
let stars;
let bombs;
let platforms;
let cursors;
let spaceKey;
let score = 0;
let scoreText;
let gameOver = false;
let mobileControls;
let jumpSound;
let starSound;

// Start game
const game = new Phaser.Game(config);

function preload() {
  console.log('Preload started...');
  
  // Load assets
  this.load.image("sky", "assets/images/sky.png");
  this.load.image("ground", "assets/images/platform.png");
  this.load.image("star", "assets/images/star.png");
  this.load.image("bomb", "assets/images/bomb.png");
  this.load.spritesheet("dude", "assets/images/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  
  // Load sounds (optional)
  this.load.audio("jumpSound", ["assets/sounds/jumping.mp3"]);
  this.load.audio("starSound", ["assets/sounds/star.mp3"]);
  
  // Mobile controls script'i yükle
  this.load.script('mobilecontrols', 'mobile-controls-v2.js');
}

function create() {
  console.log('Create started...');
  
  const { width, height } = this.cameras.main;
  
  // Background
  const bg = this.add.image(width/2, height/2, "sky");
  bg.setDisplaySize(width, height);

  // Platforms
  platforms = this.physics.add.staticGroup();
  
  // Ground
  const ground = platforms.create(width/2, height - 30, "ground");
  ground.setScale(width / ground.width, 1).refreshBody();
  
  // Floating platforms
  const platformPositions = [
    { x: 0.2, y: 0.75 },
    { x: 0.7, y: 0.65 },
    { x: 0.5, y: 0.5 },
    { x: 0.15, y: 0.35 },
    { x: 0.85, y: 0.4 }
  ];
  
  platformPositions.forEach(pos => {
    platforms.create(width * pos.x, height * pos.y, "ground")
      .setScale(0.8, 1)
      .refreshBody();
  });

  // Player
  player = this.physics.add.sprite(100, height - 150, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  
  // Player animations
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Stars
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(child => {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  // Score
  scoreText = this.add.text(16, 16, 'Score: 0', { 
    fontSize: '32px', 
    fill: '#fff',
    stroke: '#000',
    strokeThickness: 4
  });
  scoreText.setScrollFactor(0);

  // Bombs
  bombs = this.physics.add.group();

  // Colliders
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  // Keyboard controls
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // Mobile Controls
  if (window.MobileControls) {
    mobileControls = new window.MobileControls(this);
    mobileControls.create();
    
    // Debug key - D tuşu
    this.input.keyboard.on('keydown-D', () => {
      if (mobileControls) {
        mobileControls.showDebug();
      }
    });
  }
  
  // Sounds
  try {
    jumpSound = this.sound.add('jumpSound', { volume: 0.5 });
    starSound = this.sound.add('starSound', { volume: 0.5 });
  } catch (e) {
    console.log('Sound initialization failed:', e);
  }
  
  console.log('Create completed');
}

function update() {
  if (gameOver) {
    return;
  }
  
  // Get input states
  let leftPressed = cursors.left.isDown;
  let rightPressed = cursors.right.isDown;
  let upPressed = cursors.up.isDown || spaceKey.isDown;
  
  // Mobile controls
  if (mobileControls && mobileControls.controlsEnabled) {
    const mobileState = mobileControls.getState();
    leftPressed = leftPressed || mobileState.left;
    rightPressed = rightPressed || mobileState.right;
    upPressed = upPressed || mobileState.up;
    
    // Debug için
    if (mobileControls.debugText) {
      mobileControls.showDebug();
    }
  }
  
  // Player movement
  if (leftPressed) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  } else if (rightPressed) {
    player.setVelocityX(160);
    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  // Jump
  if (upPressed && player.body.touching.down) {
    player.setVelocityY(-330);
    if (jumpSound) {
      jumpSound.play().catch(() => {});
    }
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);
  
  if (starSound) {
    starSound.play().catch(() => {});
  }

  if (stars.countActive(true) === 0) {
    stars.children.iterate(child => {
      child.enableBody(true, child.x, 0, true, true);
    });

    const x = (player.x < 400) ? 
      Phaser.Math.Between(400, 800) : 
      Phaser.Math.Between(0, 400);

    const bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('turn');
  gameOver = true;

  // Game over text
  const gameOverText = this.add.text(
    this.cameras.main.width / 2,
    this.cameras.main.height / 2,
    'GAME OVER\nTap to restart',
    {
      fontSize: '64px',
      fill: '#ff0000',
      align: 'center',
      stroke: '#fff',
      strokeThickness: 6
    }
  );
  gameOverText.setOrigin(0.5);
  gameOverText.setScrollFactor(0);
  
  // Restart on click/tap
  this.input.on('pointerdown', () => {
    this.scene.restart();
    gameOver = false;
    score = 0;
  });
}