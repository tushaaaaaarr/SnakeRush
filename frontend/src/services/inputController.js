class InputController {
  constructor() {
    this.listeners = {};
    this.lastInputTime = 0;
    this.inputDebounce = 50;
    this.isMobile = this.detectMobile();

    this.setupKeyboardControls();
    if (this.isMobile) {
      this.setupTouchControls();
    }
  }

  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent.toLowerCase()
    );
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      const now = Date.now();
      if (now - this.lastInputTime < this.inputDebounce) return;

      const directions = {
        ArrowUp: { dx: 0, dy: -1 },
        ArrowDown: { dx: 0, dy: 1 },
        ArrowLeft: { dx: -1, dy: 0 },
        ArrowRight: { dx: 1, dy: 0 },
        w: { dx: 0, dy: -1 },
        W: { dx: 0, dy: -1 },
        s: { dx: 0, dy: 1 },
        S: { dx: 0, dy: 1 },
        a: { dx: -1, dy: 0 },
        A: { dx: -1, dy: 0 },
        d: { dx: 1, dy: 0 },
        D: { dx: 1, dy: 0 },
      };

      if (e.key in directions) {
        e.preventDefault();
        this.notifyListeners('direction', directions[e.key]);
        this.lastInputTime = now;
      }

      if (e.key === ' ') {
        e.preventDefault();
        this.notifyListeners('pause', null);
        this.lastInputTime = now;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        this.notifyListeners('restart', null);
        this.lastInputTime = now;
      }
    });
  }

  setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchmove', (e) => {
      if (!touchStartX || !touchStartY) return;

      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const threshold = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          this.notifyListeners('direction', {
            dx: deltaX > 0 ? 1 : -1,
            dy: 0,
          });
          touchStartX = touchEndX;
          touchStartY = touchEndY;
        }
      } else {
        if (Math.abs(deltaY) > threshold) {
          this.notifyListeners('direction', {
            dx: 0,
            dy: deltaY > 0 ? 1 : -1,
          });
          touchStartX = touchEndX;
          touchStartY = touchEndY;
        }
      }
    });

    document.addEventListener('touchend', () => {
      touchStartX = 0;
      touchStartY = 0;
    });
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }
}

export default InputController;
