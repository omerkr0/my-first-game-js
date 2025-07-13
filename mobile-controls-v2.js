// Mobile Controls v2 - Phaser entegreli sistem
class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.controlsEnabled = false;
    this.buttons = {};
    this.state = {
      left: false,
      right: false,
      up: false
    };
    
    // Touch cihaz kontrolü
    this.isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) || 
                         (navigator.msMaxTouchPoints > 0);
    
    console.log('MobileControls v2 initialized. Touch device:', this.isTouchDevice);
  }
  
  create() {
    if (!this.isTouchDevice) {
      console.log('Not a touch device, skipping mobile controls');
      return;
    }
    
    const { width, height } = this.scene.cameras.main;
    
    // Kontrol grubu oluştur
    this.controlsGroup = this.scene.add.group();
    
    // Sol buton
    this.buttons.left = this.createButton(60, height - 80, '←', () => {
      this.state.left = true;
    }, () => {
      this.state.left = false;
    });
    
    // Sağ buton
    this.buttons.right = this.createButton(140, height - 80, '→', () => {
      this.state.right = true;
    }, () => {
      this.state.right = false;
    });
    
    // Zıplama butonu
    this.buttons.jump = this.createButton(width - 80, height - 80, '↑', () => {
      this.state.up = true;
    }, () => {
      this.state.up = false;
    });
    
    // Butonları sabit yap (kamera ile hareket etmesin)
    Object.values(this.buttons).forEach(button => {
      button.container.setScrollFactor(0);
    });
    
    this.controlsEnabled = true;
    console.log('Mobile controls created successfully');
  }
  
  createButton(x, y, text, onDown, onUp) {
    // Container oluştur
    const container = this.scene.add.container(x, y);
    
    // Buton arka planı
    const bg = this.scene.add.circle(0, 0, 35, 0xffffff, 0.9);
    bg.setStrokeStyle(3, 0x3498db);
    
    // Buton metni
    const label = this.scene.add.text(0, 0, text, {
      fontSize: '32px',
      color: '#2c3e50',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
    
    // Container'a ekle
    container.add([bg, label]);
    
    // Interaktif yap
    bg.setInteractive({ useHandCursor: false });
    
    // Pointer events
    bg.on('pointerdown', () => {
      console.log(`Button ${text} pressed`);
      bg.setScale(0.9);
      bg.setFillStyle(0x3498db);
      label.setColor('#ffffff');
      onDown();
      this.vibrate();
    });
    
    bg.on('pointerup', () => {
      console.log(`Button ${text} released`);
      bg.setScale(1);
      bg.setFillStyle(0xffffff);
      label.setColor('#2c3e50');
      onUp();
    });
    
    bg.on('pointerout', () => {
      bg.setScale(1);
      bg.setFillStyle(0xffffff);
      label.setColor('#2c3e50');
      onUp();
    });
    
    // Touch events için ek kontrol
    this.scene.input.on('pointerup', () => {
      bg.setScale(1);
      bg.setFillStyle(0xffffff);
      label.setColor('#2c3e50');
    });
    
    return {
      container,
      bg,
      label
    };
  }
  
  vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }
  
  getState() {
    return this.state;
  }
  
  isPressed(button) {
    return this.state[button] || false;
  }
  
  destroy() {
    Object.values(this.buttons).forEach(button => {
      button.container.destroy();
    });
    this.controlsEnabled = false;
  }
  
  // Debug bilgisi göster
  showDebug() {
    if (!this.debugText) {
      this.debugText = this.scene.add.text(10, 10, '', {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 5, y: 5 }
      });
      this.debugText.setScrollFactor(0);
      this.debugText.setDepth(1000);
    }
    
    this.debugText.setText([
      `Touch Device: ${this.isTouchDevice}`,
      `Controls Enabled: ${this.controlsEnabled}`,
      `Left: ${this.state.left}`,
      `Right: ${this.state.right}`,
      `Up: ${this.state.up}`
    ]);
  }
}

// Global erişim için
window.MobileControls = MobileControls;