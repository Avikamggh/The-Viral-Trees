/**
 * Smooth Custom Cursor
 * Standalone implementation for smooth cursor tracking with custom styling
 * Can be used alongside liquid-pro.js
 */

class SmoothCursor {
  constructor(options = {}) {
    this.config = {
      cursorElement: options.cursorElement || this.createDefaultCursor(),
      springConfig: options.springConfig || {
        damping: 45,
        stiffness: 400,
        mass: 1,
        restDelta: 0.001,
      },
      hideDefaultCursor: options.hideDefaultCursor !== false,
      zIndex: options.zIndex || 999,
      scale: {
        min: options.scaleMin || 0.5,
        max: options.scaleMax || 1.5,
      },
      hiddenElements: options.hiddenElements || [],
    };

    this.state = {
      isMoving: false,
      lastMousePos: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      lastUpdateTime: Date.now(),
      previousAngle: 0,
      accumulatedRotation: 0,
      cursorX: 0,
      cursorY: 0,
      rotation: 0,
      scale: 1,
    };

    this.springValues = {
      cursorX: { value: 0, velocity: 0 },
      cursorY: { value: 0, velocity: 0 },
      rotation: { value: 0, velocity: 0 },
      scale: { value: 1, velocity: 0 },
    };

    this.rafId = null;
    this.hideTimeout = null;

    this.init();
  }

  createDefaultCursor() {
    const cursor = document.createElement('div');
    cursor.id = 'smooth-cursor-default';
    cursor.style.cssText = `
      width: 30px;
      height: 30px;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.3);
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), transparent);
      pointer-events: none;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(cursor);
    return cursor;
  }

  init() {
    // Hide default cursor
    if (this.config.hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    // Set up cursor element
    const cursor = this.config.cursorElement;
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.willChange = 'transform';
    cursor.style.zIndex = this.config.zIndex;
    cursor.style.left = '0px';
    cursor.style.top = '0px';

    // Event listeners
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseenter', () => this.handleMouseEnter());
    document.addEventListener('mouseleave', () => this.handleMouseLeave());
    document.addEventListener('mousedown', () => this.handleMouseDown());
    document.addEventListener('mouseup', () => this.handleMouseUp());

    // Check for hidden elements on scroll
    window.addEventListener('scroll', () => this.checkHiddenElements());

    // Start animation loop
    this.animate();
  }

  handleMouseMove(e) {
    const currentPos = { x: e.clientX, y: e.clientY };
    this.updateVelocity(currentPos);

    const speed = Math.sqrt(
      Math.pow(this.state.velocity.x, 2) + Math.pow(this.state.velocity.y, 2)
    );

    // Update spring targets
    this.springValues.cursorX.target = currentPos.x;
    this.springValues.cursorY.target = currentPos.y;

    if (speed > 0.1) {
      const currentAngle =
        Math.atan2(this.state.velocity.y, this.state.velocity.x) * (180 / Math.PI) + 90;

      let angleDiff = currentAngle - this.state.previousAngle;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      this.state.accumulatedRotation += angleDiff;
      this.springValues.rotation.target = this.state.accumulatedRotation;
      this.state.previousAngle = currentAngle;

      // Scale down on movement
      this.springValues.scale.target = this.config.scale.min;
      this.state.isMoving = true;

      // Reset scale after a delay
      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => {
        this.springValues.scale.target = 1;
        this.state.isMoving = false;
      }, 150);
    }
  }

  handleMouseEnter() {
    this.config.cursorElement.style.opacity = '1';
  }

  handleMouseLeave() {
    this.config.cursorElement.style.opacity = '0';
  }

  handleMouseDown() {
    this.springValues.scale.target = this.config.scale.min * 0.8;
  }

  handleMouseUp() {
    this.springValues.scale.target = 1;
  }

  updateVelocity(currentPos) {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.state.lastUpdateTime;

    if (deltaTime > 0) {
      this.state.velocity = {
        x: (currentPos.x - this.state.lastMousePos.x) / deltaTime,
        y: (currentPos.y - this.state.lastMousePos.y) / deltaTime,
      };
    }

    this.state.lastUpdateTime = currentTime;
    this.state.lastMousePos = currentPos;
  }

  updateSpring(spring, config, deltaTime) {
    const dt = deltaTime / 1000; // Convert to seconds
    const target = spring.target || spring.value;
    const diff = target - spring.value;

    // Spring physics
    const springForce = config.stiffness * diff;
    const dampingForce = config.damping * spring.velocity;
    const acceleration = (springForce - dampingForce) / config.mass;

    spring.velocity += acceleration * dt;
    spring.value += spring.velocity * dt;

    return spring.value;
  }

  animate = () => {
    const now = Date.now();
    const deltaTime = now - this.state.lastUpdateTime;

    const springConfig = this.config.springConfig;

    // Update spring values
    this.state.cursorX = this.updateSpring(
      this.springValues.cursorX,
      springConfig,
      deltaTime
    );
    this.state.cursorY = this.updateSpring(
      this.springValues.cursorY,
      springConfig,
      deltaTime
    );

    const rotationConfig = { ...springConfig, damping: 60, stiffness: 300 };
    this.state.rotation = this.updateSpring(
      this.springValues.rotation,
      rotationConfig,
      deltaTime
    );

    const scaleConfig = { ...springConfig, stiffness: 500, damping: 35 };
    this.state.scale = this.updateSpring(
      this.springValues.scale,
      scaleConfig,
      deltaTime
    );

    // Apply transforms
    this.updateCursorPosition();

    this.rafId = requestAnimationFrame(this.animate);
  };

  updateCursorPosition() {
    const cursor = this.config.cursorElement;
    cursor.style.transform = `
      translate(${this.state.cursorX}px, ${this.state.cursorY}px)
      translate(-50%, -50%)
      rotate(${this.state.rotation}deg)
      scale(${this.state.scale})
    `;
  }

  checkHiddenElements() {
    const cursor = this.config.cursorElement;
    let shouldHide = false;

    this.config.hiddenElements.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (
          this.state.cursorX >= rect.left &&
          this.state.cursorX <= rect.right &&
          this.state.cursorY >= rect.top &&
          this.state.cursorY <= rect.bottom
        ) {
          shouldHide = true;
        }
      });
    });

    cursor.style.opacity = shouldHide ? '0' : '1';
  }

  // Public methods

  setCursorElement(element) {
    this.config.cursorElement = element;
    element.style.position = 'fixed';
    element.style.pointerEvents = 'none';
    element.style.willChange = 'transform';
    element.style.zIndex = this.config.zIndex;
  }

  setSpringConfig(config) {
    this.config.springConfig = { ...this.config.springConfig, ...config };
  }

  showCursor() {
    this.config.cursorElement.style.opacity = '1';
  }

  hideCursor() {
    this.config.cursorElement.style.opacity = '0';
  }

  setScale(minScale, maxScale) {
    this.config.scale.min = minScale;
    this.config.scale.max = maxScale;
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    document.body.style.cursor = 'default';
    document.removeEventListener('mousemove', (e) => this.handleMouseMove(e));
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smoothCursor = new SmoothCursor();
  });
} else {
  window.smoothCursor = new SmoothCursor();
}
