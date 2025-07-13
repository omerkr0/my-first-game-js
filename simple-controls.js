// Basit mobil kontroller
window.simpleMobileControls = {
  left: false,
  right: false,
  up: false
};

function setupSimpleControls() {
  console.log('Basit kontroller kuruluyor...');
  
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  const jumpBtn = document.getElementById('jump-btn');
  
  if (!leftBtn || !rightBtn || !jumpBtn) {
    console.error('Butonlar bulunamadı!');
    return;
  }
  
  console.log('Butonlar bulundu, event listener\'lar ekleniyor...');
  
  // Sol buton
  leftBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    window.simpleMobileControls.left = true;
    this.style.background = '#3498db';
    this.style.color = 'white';
    console.log('SOL BASILDI');
  });
  
  leftBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    window.simpleMobileControls.left = false;
    this.style.background = '';
    this.style.color = '';
    console.log('SOL BIRAKILDI');
  });
  
  leftBtn.addEventListener('mousedown', function(e) {
    e.preventDefault();
    window.simpleMobileControls.left = true;
    this.style.background = '#3498db';
    this.style.color = 'white';
    console.log('SOL BASILDI (mouse)');
  });
  
  leftBtn.addEventListener('mouseup', function(e) {
    e.preventDefault();
    window.simpleMobileControls.left = false;
    this.style.background = '';
    this.style.color = '';
    console.log('SOL BIRAKILDI (mouse)');
  });
  
  // Sağ buton
  rightBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    window.simpleMobileControls.right = true;
    this.style.background = '#3498db';
    this.style.color = 'white';
    console.log('SAĞ BASILDI');
  });
  
  rightBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    window.simpleMobileControls.right = false;
    this.style.background = '';
    this.style.color = '';
    console.log('SAĞ BIRAKILDI');
  });
  
  rightBtn.addEventListener('mousedown', function(e) {
    e.preventDefault();
    window.simpleMobileControls.right = true;
    this.style.background = '#3498db';
    this.style.color = 'white';
    console.log('SAĞ BASILDI (mouse)');
  });
  
  rightBtn.addEventListener('mouseup', function(e) {
    e.preventDefault();
    window.simpleMobileControls.right = false;
    this.style.background = '';
    this.style.color = '';
    console.log('SAĞ BIRAKILDI (mouse)');
  });
  
  // Zıplama butonu
  jumpBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    window.simpleMobileControls.up = true;
    this.style.background = '#2980b9';
    console.log('ZIPLAMA BASILDI');
  });
  
  jumpBtn.addEventListener('touchend', function(e) {
    e.preventDefault();
    window.simpleMobileControls.up = false;
    this.style.background = '';
    console.log('ZIPLAMA BIRAKILDI');
  });
  
  jumpBtn.addEventListener('mousedown', function(e) {
    e.preventDefault();
    window.simpleMobileControls.up = true;
    this.style.background = '#2980b9';
    console.log('ZIPLAMA BASILDI (mouse)');
  });
  
  jumpBtn.addEventListener('mouseup', function(e) {
    e.preventDefault();
    window.simpleMobileControls.up = false;
    this.style.background = '';
    console.log('ZIPLAMA BIRAKILDI (mouse)');
  });
  
  console.log('Kontroller hazır!');
  
  // Her saniye kontrol durumunu logla
  setInterval(function() {
    if (window.simpleMobileControls.left || window.simpleMobileControls.right || window.simpleMobileControls.up) {
      console.log('Aktif kontroller:', window.simpleMobileControls);
    }
  }, 1000);
}

// DOM yüklendiğinde çalıştır
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSimpleControls);
} else {
  setupSimpleControls();
}

// Global değişkene ata
window.mobileControls = window.simpleMobileControls;