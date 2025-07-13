// Responsive game dimensions
function getGameDimensions() {
  const isMobile = window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches;
  const container = document.getElementById('game-container');
  
  if (!container) {
    return { width: 800, height: 600 };
  }
  
  let availableHeight = window.innerHeight;
  
  // Mobil cihazlarda kontrol alanı için yer ayır
  if (isMobile) {
    const controlsHeight = window.innerWidth < 480 ? 80 : 100;
    availableHeight = window.innerHeight - controlsHeight;
  }
  
  return {
    width: container.offsetWidth || window.innerWidth,
    height: availableHeight
  };
}

const gameDimensions = getGameDimensions();

var config = {
  type: Phaser.AUTO,
  width: gameDimensions.width,
  height: gameDimensions.height,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: gameDimensions.width,
    height: gameDimensions.height,
    expandParent: false,
    autoRound: true
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 280 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  backgroundColor: '#87CEEB', // Gökyüzü rengi
  // Base path ekle
  loader: {
    baseURL: window.location.origin + window.location.pathname.replace(/[^\/]*$/, ''),
    crossOrigin: 'anonymous'
  },
  // Mobil performans optimizasyonları
  fps: {
    target: 60,
    forceSetTimeOut: false
  },
  antialias: false,
  pixelArt: false,
  roundPixels: true
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var spaceKey;
var score = 0;
var scoreText;
var gameOver = false;

// Mobile controls
var mobileControls = {
  left: false,
  right: false,
  up: false
};

// Touch event tracking
var activeTouches = new Map();

var lastJumpTime = 0;

// Debug mode - set to false for production
var debugMode = false;

var game = new Phaser.Game(config);

// Prevent default touch behaviors
function preventDefaultTouch(e) {
  if (e.cancelable) {
    e.preventDefault();
  }
  e.stopPropagation();
}

// Mobile control event listeners with improved responsiveness
function setupMobileControls() {
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  const jumpBtn = document.getElementById('jump-btn');
  
  // Prevent context menu on long press
  [leftBtn, rightBtn, jumpBtn].forEach(btn => {
    btn.addEventListener('contextmenu', preventDefaultTouch);
  });

  // Helper function for haptic feedback
  function vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }
  
  function addPressedClass(btn) {
    btn.classList.add('pressed');
  }
  
  function removePressedClass(btn) {
    btn.classList.remove('pressed');
  }
  
  // Left button with multi-touch support
  // Touch events
  leftBtn.addEventListener('touchstart', (e) => {
    preventDefaultTouch(e);
    for (let touch of e.changedTouches) {
      activeTouches.set(touch.identifier, 'left');
    }
    mobileControls.left = true;
    addPressedClass(leftBtn);
    vibrate();
    if (debugMode) console.log('Left button pressed (touch)');
  }, { passive: false });
  
  leftBtn.addEventListener('touchend', (e) => {
    preventDefaultTouch(e);
    for (let touch of e.changedTouches) {
      activeTouches.delete(touch.identifier);
    }
    if (![...activeTouches.values()].includes('left')) {
      mobileControls.left = false;
      removePressedClass(leftBtn);
    }
    if (debugMode) console.log('Left button released (touch)');
  }, { passive: false });
  
  leftBtn.addEventListener('touchcancel', (e) => {
    preventDefaultTouch(e);
    mobileControls.left = false;
    removePressedClass(leftBtn);
  }, { passive: false });
  
  // Mouse events for testing on desktop
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
  
  leftBtn.addEventListener('mouseleave', () => {
    mobileControls.left = false;
    removePressedClass(leftBtn);
  });
  
  // Right button with multi-touch support
  // Touch events
  rightBtn.addEventListener('touchstart', (e) => {
    preventDefaultTouch(e);
    for (let touch of e.changedTouches) {
      activeTouches.set(touch.identifier, 'right');
    }
    mobileControls.right = true;
    addPressedClass(rightBtn);
    vibrate();
    if (debugMode) console.log('Right button pressed (touch)');
  }, { passive: false });
  
  rightBtn.addEventListener('touchend', (e) => {
    preventDefaultTouch(e);
    for (let touch of e.changedTouches) {
      activeTouches.delete(touch.identifier);
    }
    if (![...activeTouches.values()].includes('right')) {
      mobileControls.right = false;
      removePressedClass(rightBtn);
    }
    if (debugMode) console.log('Right button released (touch)');
  }, { passive: false });
  
  rightBtn.addEventListener('touchcancel', (e) => {
    preventDefaultTouch(e);
    mobileControls.right = false;
    removePressedClass(rightBtn);
  }, { passive: false });
  
  // Mouse events for testing on desktop
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
  
  rightBtn.addEventListener('mouseleave', () => {
    mobileControls.right = false;
    removePressedClass(rightBtn);
  });
  
  // Jump button with multi-touch support
  // Touch events
  jumpBtn.addEventListener('touchstart', (e) => {
    preventDefaultTouch(e);
    for (let touch of e.changedTouches) {
      activeTouches.set(touch.identifier, 'jump');
    }
    mobileControls.up = true;
    addPressedClass(jumpBtn);
    vibrate();
    if (debugMode) console.log('Jump button pressed (touch)');
  }, { passive: false });
  
  jumpBtn.addEventListener('touchend', (e) => {
    preventDefaultTouch(e);
    for (let touch of e.changedTouches) {
      activeTouches.delete(touch.identifier);
    }
    if (![...activeTouches.values()].includes('jump')) {
      mobileControls.up = false;
      removePressedClass(jumpBtn);
    }
    if (debugMode) console.log('Jump button released (touch)');
  }, { passive: false });
  
  jumpBtn.addEventListener('touchcancel', (e) => {
    preventDefaultTouch(e);
    mobileControls.up = false;
    removePressedClass(jumpBtn);
  }, { passive: false });
  
  // Mouse events for testing on desktop
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
  
  jumpBtn.addEventListener('mouseleave', () => {
    mobileControls.up = false;
    removePressedClass(jumpBtn);
  });
  
  // Debug: Log mobile controls state periodically
  setInterval(() => {
    if (mobileControls.left || mobileControls.right || mobileControls.up) {
      if (debugMode) console.log('Mobile controls state:', mobileControls);
    }
  }, 1000);
}

// Setup mobile controls when DOM is ready
document.addEventListener('DOMContentLoaded', setupMobileControls);

// Handle orientation changes on mobile
window.addEventListener('orientationchange', function() {
  setTimeout(() => {
    if (game && game.scale) {
      game.scale.refresh();
    }
  }, 100);
});

// Handle window resize
window.addEventListener('resize', function() {
  if (game && game.scale) {
    game.scale.refresh();
  }
});

function preload() {
  // Loading göstergesini gizle
  const loadingElement = document.querySelector('.loading');
  
  // Hata yakalama ekle
  this.load.on('loaderror', (file) => {
    console.error('Dosya yüklenemedi:', file.key, file.src);
  });
  
  this.load.on('complete', () => {
    console.log('Tüm dosyalar yüklendi');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  });
  
  // Dosya yollarını kontrol et
  this.load.image("sky", "assets/images/sky.png");
  this.load.image("ground", "assets/images/platform.png");
  this.load.image("star", "assets/images/star.png");
  this.load.image("bomb", "assets/images/bomb.png");
  
  // Sprite sheet için boyutları doğrula
  this.load.spritesheet("dude", "assets/images/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
    endFrame: 8
  });
  
  // Ses dosyalarını yükle (hata durumunda sessiz devam et)
  this.load.audio("jumpSound", ["assets/sounds/jumping.mp3"]);
  this.load.audio("starSound", ["assets/sounds/star.mp3"]);
}

function create() {
  const gameWidth = this.cameras.main.width;
  const gameHeight = this.cameras.main.height;
  
  // Scale background to fit screen
  const bg = this.add.image(gameWidth/2, gameHeight/2, "sky");
  bg.setDisplaySize(gameWidth, gameHeight);

  platforms = this.physics.add.staticGroup();

  // Ana zemin platformu
  const groundY = gameHeight - 40; // Zemini biraz daha yukarı al
  const groundPlatform = platforms.create(gameWidth / 2, groundY, "ground");
  const groundScaleX = gameWidth / groundPlatform.width;
  groundPlatform.setScale(groundScaleX, 1).refreshBody();

  // Responsive platform düzeni
  const isMobile = gameWidth < 768;
  const platformWidth = 200; // Sabit platform genişliği
  
  if (isMobile) {
    // Mobil düzen - daha iyi yerleştirilmiş platformlar
    platforms.create(gameWidth * 0.2, gameHeight * 0.75, "ground")
      .setScale(0.8, 1).refreshBody();
    
    platforms.create(gameWidth * 0.7, gameHeight * 0.65, "ground")
      .setScale(0.8, 1).refreshBody();
    
    platforms.create(gameWidth * 0.5, gameHeight * 0.5, "ground")
      .setScale(0.7, 1).refreshBody();
    
    platforms.create(gameWidth * 0.15, gameHeight * 0.35, "ground")
      .setScale(0.6, 1).refreshBody();
    
    platforms.create(gameWidth * 0.85, gameHeight * 0.4, "ground")
      .setScale(0.6, 1).refreshBody();
  } else {
    // Desktop düzen
    platforms.create(gameWidth * 0.85, gameHeight * 0.7, "ground")
      .setScale(1, 1).refreshBody();
    
    platforms.create(gameWidth * 0.15, gameHeight * 0.55, "ground")
      .setScale(1, 1).refreshBody();
    
    platforms.create(gameWidth * 0.5, gameHeight * 0.45, "ground")
      .setScale(0.8, 1).refreshBody();
    
    platforms.create(gameWidth * 0.3, gameHeight * 0.3, "ground")
      .setScale(0.7, 1).refreshBody();
    
    platforms.create(gameWidth * 0.7, gameHeight * 0.25, "ground")
      .setScale(0.7, 1).refreshBody();
  }

  // Oyuncu pozisyonu - zeminden yukarıda başlat ve görünür olduğundan emin ol
  const playerSpawnY = groundY - 100;
  
  // Orijinal sprite karakterini kullan
  player = this.physics.add.sprite(gameWidth * 0.1, playerSpawnY, 'dude');

  // Oyuncunun görünür olduğundan emin ol
  player.setVisible(true);
  player.setAlpha(1);
  player.setDepth(10); // Diğer nesnelerin üstünde görünsün
  
  // Sprite yüklenmezse yedek olarak kırmızı kare göster
  if (!player.texture || player.texture.key === '__MISSING') {
    console.error('Karakter sprite yüklenemedi! Yedek grafik kullanılıyor.');
    // Yedek olarak basit bir grafik oluştur
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 48);
    graphics.generateTexture('dudeBackup', 32, 48);
    graphics.destroy();
    
    player.setTexture('dudeBackup');
  }

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  
  // Collision body ayarlarını basitleştir
  player.body.setSize(24, 40);
  player.body.setOffset(4, 8);

  jumpSound = this.sound.add("jumpSound", { volume: 0.5 });
  starSound = this.sound.add("starSound", { volume: 0.5 });
  
  // Test sounds and disable if they fail to load
  try {
    if (!jumpSound || !jumpSound.totalDuration) {
      console.warn('Jump sound not loaded properly, jumping will work without sound');
      jumpSound = null;
    }
    if (!starSound || !starSound.totalDuration) {
      console.warn('Star sound not loaded properly, star collection will work without sound');
      starSound = null;
    }
  } catch (error) {
    console.warn('Sound initialization error, continuing without sounds:', error);
    jumpSound = null;
    starSound = null;
  }

  // Animasyonları oluştur - oyuncu oluşturulduktan hemen sonra
  try {
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

    // Başlangıç animasyonunu ayarla
    player.anims.play("turn");
  } catch (error) {
    console.error('Animasyon oluşturma hatası:', error);
    // Animasyon yoksa statik frame kullan
    player.setFrame(4);
  }

  cursors = this.input.keyboard.createCursorKeys();
  
  // Space tuşunu da ekle
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // Debug mode toggle with 'D' key
  this.input.keyboard.on('keydown-D', () => {
    debugMode = !debugMode;
    console.log('Debug mode:', debugMode ? 'ON' : 'OFF');
  });
  
  // Mobile debug - triple tap score to toggle debug mode
  let tapCount = 0;
  let lastTapTime = 0;
  scoreText.setInteractive();
  scoreText.on('pointerdown', () => {
    const currentTime = Date.now();
    if (currentTime - lastTapTime < 500) {
      tapCount++;
      if (tapCount >= 3) {
        debugMode = !debugMode;
        console.log('Debug mode (mobile):', debugMode ? 'ON' : 'OFF');
        tapCount = 0;
      }
    } else {
      tapCount = 1;
    }
    lastTapTime = currentTime;
  });

  // Yıldızları daha iyi dağıt
  const starCount = Math.min(Math.max(Math.floor(gameWidth / 120), 5), 12);
  stars = this.physics.add.group({
    key: "star",
    repeat: starCount - 1,
    setXY: { 
      x: 50, 
      y: 50, 
      stepX: (gameWidth - 100) / (starCount - 1) 
    },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    child.setSize(20, 20, true);
  });

  // Responsive skor metni
  const fontSize = Math.min(gameWidth / 25, 32);
  scoreText = this.add.text(20, 20, "Score: 0", {
    fontSize: fontSize + "px",
    fill: "#fff",
    fontWeight: "bold",
    stroke: "#000",
    strokeThickness: 4,
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#000',
      blur: 2,
      stroke: true,
      fill: true
    }
  });
  scoreText.setScrollFactor(0); // Kamera hareketi ile hareket etmez

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
  const upPressed = (cursors.up.isDown || spaceKey.isDown || mobileControls.up);
  
  // Responsive hareket hızları
  const gameWidth = this.cameras.main.width;
  const isMobile = gameWidth < 768;
  const moveSpeed = isMobile ? 130 : 160;
  const jumpForce = isMobile ? -380 : -420;
  
  if (leftPressed) {
    player.setVelocityX(-moveSpeed);
    if (player.anims) {
      player.anims.play("left", true);
    }
  } else if (rightPressed) {
    player.setVelocityX(moveSpeed);
    if (player.anims) {
      player.anims.play("right", true);
    }
  } else {
    player.setVelocityX(0);
    if (player.anims) {
      player.anims.play("turn");
    }
  }

  // Basitleştirilmiş ve daha güvenilir zıplama mekaniği
  const currentTime = Date.now();
  
  // Daha toleranslı yer tespiti
  const isOnGround = player.body.touching.down || player.body.blocked.down;
  const isNearGround = player.body.velocity.y >= -50 && 
                       (player.body.bottom >= this.cameras.main.height - 100);
  
  // Platform yakınlığı kontrolü (daha toleranslı)
  const isNearPlatform = platforms.children.entries.some(platform => {
    const verticalDistance = Math.abs(player.body.bottom - platform.body.top);
    const horizontalOverlap = player.body.right > platform.body.left - 5 && 
                             player.body.left < platform.body.right + 5;
    return verticalDistance < 15 && horizontalOverlap && player.body.velocity.y >= -100;
  });
  
  const canJump = isOnGround || isNearGround || isNearPlatform;
  
  // Daha responsive zıplama - mobilde daha kısa cooldown
  const jumpCooldown = isMobile ? 100 : 150;
  
  if (upPressed && canJump && (currentTime - lastJumpTime > jumpCooldown)) {
    player.setVelocityY(jumpForce);
    if (jumpSound && !jumpSound.isPlaying) {
      jumpSound.play().catch(() => {
        console.log('Jump sound could not be played');
      });
    }
    lastJumpTime = currentTime;
    if (debugMode) console.log('Jump executed! Mobile:', isMobile, 'canJump:', canJump, 'jumpForce:', jumpForce, 'controls:', {space: spaceKey.isDown, up: cursors.up.isDown, mobile: mobileControls.up});
  }
  
  // Mobile debug için
  if (upPressed && !canJump && debugMode) {
    console.log('Jump blocked:', {
      isOnGround, isNearGround, isNearPlatform, 
      cooldownReady: (currentTime - lastJumpTime > jumpCooldown),
      mobileUp: mobileControls.up,
      playerY: player.y,
      velocity: player.body.velocity.y
    });
  }
  
  // Oyuncunun düşmesini önle
  if (player.y > this.cameras.main.height) {
    player.setY(100);
    player.setX(this.cameras.main.width * 0.1);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText(`Score: ${score}`);
  
  if (starSound && !starSound.isPlaying) {
    starSound.play().catch(() => {
      console.log('Star sound could not be played');
    });
  }

  if (stars.countActive(true) === 0) {
    // Yıldızları yeniden oluştur
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    // Bomba ekle
    const gameWidth = this.cameras.main.width;
    var x = player.x < gameWidth/2
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
  if (player.anims) {
    player.anims.play("turn");
  }
  gameOver = true;

  // Game over mesajı
  const gameWidth = this.cameras.main.width;
  const gameHeight = this.cameras.main.height;
  const fontSize = Math.min(gameWidth / 12, 48);
  
  const gameOverText = this.add.text(gameWidth/2, gameHeight/2, 'GAME OVER', {
    fontSize: fontSize + 'px',
    fill: '#ff0000',
    fontWeight: 'bold',
    stroke: '#fff',
    strokeThickness: 6
  });
  gameOverText.setOrigin(0.5);
  
  // Yeniden başlat mesajı
  const restartText = this.add.text(gameWidth/2, gameHeight/2 + fontSize + 20, 'Tap or Press SPACE to Restart', {
    fontSize: (fontSize * 0.5) + 'px',
    fill: '#fff',
    fontWeight: 'bold',
    stroke: '#000',
    strokeThickness: 4
  });
  restartText.setOrigin(0.5);
  
  // Yeniden başlatma
  this.input.on('pointerdown', () => {
    this.scene.restart();
    gameOver = false;
    score = 0;
  });
  
  this.input.keyboard.on('keydown-SPACE', () => {
    this.scene.restart();
    gameOver = false;
    score = 0;
  });
}

// Pencere boyutu değiştiğinde oyunu yeniden boyutlandır
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (game && game.scale) {
      const newDimensions = getGameDimensions();
      game.scale.resize(newDimensions.width, newDimensions.height);
    }
  }, 100);
});

// Dokunmatik cihazlarda scroll'u engelle
document.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });

// iOS'ta bounce efektini engelle
document.body.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });

// Prevent double tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

document.addEventListener('touchstart', function(e) {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }
}, { passive: true });

document.addEventListener('touchend', function(e) {
  if (e.changedTouches.length === 1) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = touchEndTime - touchStartTime;
    
    // Quick swipe up for jump
    if (deltaTime < 300 && Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0) {
        // Swipe up - trigger jump
        mobileControls.up = true;
        setTimeout(() => {
          mobileControls.up = false;
        }, 100);
      }
    }
  }
}, { passive: true });

// Show/hide mobile controls based on input type
function updateControlsVisibility() {
  const mobileControlsEl = document.querySelector('.mobile-controls');
  if (!mobileControlsEl) return;
  
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (hasTouch || isMobileDevice) {
    mobileControlsEl.style.display = 'flex';
  }
}

// Check controls visibility on load and orientation change
window.addEventListener('load', updateControlsVisibility);
window.addEventListener('orientationchange', updateControlsVisibility);

// Fullscreen API for mobile
function requestFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { // Safari
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE11
    elem.msRequestFullscreen();
  }
}

// Request fullscreen on first touch for better mobile experience
document.addEventListener('touchstart', function() {
  if (document.fullscreenElement === null) {
    requestFullscreen();
  }
}, { once: true });
