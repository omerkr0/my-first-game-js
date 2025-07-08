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
    height: gameDimensions.height
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
  backgroundColor: '#87CEEB', // Gökyüzü rengi
  // Base path ekle
  loader: {
    baseURL: window.location.origin + window.location.pathname.replace(/[^\/]*$/, ''),
    crossOrigin: 'anonymous'
  }
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
  
  // Sprite yerine basit bir dikdörtgen kullan
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // Yeşil renk
  graphics.fillRect(0, 0, 32, 48);
  graphics.generateTexture('playerTexture', 32, 48);
  graphics.destroy();
  
  player = this.physics.add.sprite(gameWidth * 0.1, playerSpawnY, 'playerTexture');

  // Oyuncunun görünür olduğundan emin ol
  player.setVisible(true);
  player.setAlpha(1);
  player.setDepth(10); // Diğer nesnelerin üstünde görünsün
  player.setTint(0x00ff00); // Yeşil renk
  
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
  player.body.setSize(20, 32);
  player.body.setOffset(6, 16);

  jumpSound = this.sound.add("jumpSound", { volume: 0.5 });
  starSound = this.sound.add("starSound", { volume: 0.5 });

  // Animasyonları oluştur - oyuncu oluşturulduktan hemen sonra
  /* Sprite kullanmadığımız için animasyonları devre dışı bırak
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
  */

  cursors = this.input.keyboard.createCursorKeys();

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
  const upPressed = (cursors.up.isDown || mobileControls.up);
  
  // Responsive hareket hızları
  const gameWidth = this.cameras.main.width;
  const isMobile = gameWidth < 768;
  const moveSpeed = isMobile ? 130 : 160;
  const jumpForce = isMobile ? -330 : -350;
  
  if (leftPressed) {
    player.setVelocityX(-moveSpeed);
    player.setTint(0x0000ff); // Sola giderken mavi
    /* if (player.anims) {
      player.anims.play("left", true);
    } */
  } else if (rightPressed) {
    player.setVelocityX(moveSpeed);
    player.setTint(0xff0000); // Sağa giderken kırmızı
    /* if (player.anims) {
      player.anims.play("right", true);
    } */
  } else {
    player.setVelocityX(0);
    player.setTint(0x00ff00); // Duruyorken yeşil
    /* if (player.anims) {
      player.anims.play("turn");
    } */
  }

  // Geliştirilmiş zıplama mekaniği - body kullan
  const currentTime = Date.now();
  const isOnGround = player.body.touching.down || player.body.blocked.down;
  
  if (upPressed && isOnGround && (currentTime - lastJumpTime > 100)) {
    player.setVelocityY(jumpForce);
    if (jumpSound && !jumpSound.isPlaying) {
      jumpSound.play();
    }
    lastJumpTime = currentTime;
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
    starSound.play();
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
  // player.anims.play("turn"); // Animasyon kullanmıyoruz
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
