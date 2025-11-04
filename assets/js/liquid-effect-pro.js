/**
 * Liquid Effect PRO - Advanced Mouse Hover Animation
 * Multiple themes and customization options
 * Similar to lusion.co website hover effects
 */

class LiquidEffectPro {
  constructor(options = {}) {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: 0, y: 0, radius: 80, vx: 0, vy: 0 };
    this.animationId = null;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    this.presets = {
      default: {
        particleCount: 60,
        friction: 0.98,
        gravity: 0.08,
        connectionDistance: 120,
        particleRadius: 2.5,
        lineColor: 'rgba(0, 173, 239, 0.25)',
        particleColor: 'rgba(0, 173, 239, 0.7)',
        mouseRepulsionForce: 2
      },
      primary: {
        particleCount: 70,
        friction: 0.96,
        gravity: 0.05,
        connectionDistance: 140,
        particleRadius: 2,
        lineColor: 'rgba(255, 107, 107, 0.2)',
        particleColor: 'rgba(255, 107, 107, 0.6)',
        mouseRepulsionForce: 2.5
      },
      neon: {
        particleCount: 80,
        friction: 0.97,
        gravity: 0.1,
        connectionDistance: 100,
        particleRadius: 3,
        lineColor: 'rgba(138, 43, 226, 0.3)',
        particleColor: 'rgba(138, 43, 226, 0.8)',
        mouseRepulsionForce: 3
      },
      minimal: {
        particleCount: 30,
        friction: 0.99,
        gravity: 0.02,
        connectionDistance: 80,
        particleRadius: 1.5,
        lineColor: 'rgba(100, 100, 100, 0.2)',
        particleColor: 'rgba(100, 100, 100, 0.5)',
        mouseRepulsionForce: 1.5
      },
      soft: {
        particleCount: 100,
        friction: 0.995,
        gravity: 0.01,
        connectionDistance: 150,
        particleRadius: 2,
        lineColor: 'rgba(200, 200, 200, 0.15)',
        particleColor: 'rgba(200, 200, 200, 0.4)',
        mouseRepulsionForce: 1
      }
    };

    this.theme = options.theme || 'default';
    this.config = {
      ...this.presets[this.theme],
      ...options
    };

    this.init();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'liquid-effect-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1;
      pointer-events: none;
      mix-blend-mode: screen;
      will-change: contents;
    `;
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseleave', () => this.onMouseLeave());
    document.addEventListener('mousedown', () => this.onMouseDown());
    document.addEventListener('mouseup', () => this.onMouseUp());

    this.createParticles();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        radius: this.config.particleRadius,
        originalX: Math.random() * this.canvas.width,
        originalY: Math.random() * this.canvas.height,
        life: 1,
        maxLife: 1
      });
    }
  }

  onMouseMove(e) {
    this.mouse.vx = e.clientX - this.lastMouseX;
    this.mouse.vy = e.clientY - this.lastMouseY;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  onMouseLeave() {
    this.mouse.x = -this.mouse.radius * 2;
    this.mouse.y = -this.mouse.radius * 2;
    this.mouse.vx = 0;
    this.mouse.vy = 0;
  }

  onMouseDown() {
    this.mouse.radius = 120;
  }

  onMouseUp() {
    this.mouse.radius = 80;
  }

  updateParticles() {
    this.particles.forEach((particle) => {
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        const force = (this.mouse.radius - distance) / this.mouse.radius;
        const velocityFactor = Math.sqrt(this.mouse.vx * this.mouse.vx + this.mouse.vy * this.mouse.vy);
        
        particle.vx -= Math.cos(angle) * force * this.config.mouseRepulsionForce * (1 + velocityFactor * 0.5);
        particle.vy -= Math.sin(angle) * force * this.config.mouseRepulsionForce * (1 + velocityFactor * 0.5);
      }

      particle.vx *= this.config.friction;
      particle.vy *= this.config.friction;
      particle.vy += this.config.gravity;

      const returnForce = 0.001;
      particle.vx += (particle.originalX - particle.x) * returnForce;
      particle.vy += (particle.originalY - particle.y) * returnForce;

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -50) particle.x = this.canvas.width + 50;
      if (particle.x > this.canvas.width + 50) particle.x = -50;
      if (particle.y < -50) particle.y = this.canvas.height + 50;
      if (particle.y > this.canvas.height + 50) particle.y = -50;
    });
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.radius * 2
      );
      
      const baseColor = this.config.particleColor;
      gradient.addColorStop(0, baseColor.replace('0.7', '0.3'));
      gradient.addColorStop(1, baseColor.replace('0.7', '0'));

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = this.config.particleColor;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawConnections() {
    const particles = this.particles;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.connectionDistance) {
          const opacity = (1 - distance / this.config.connectionDistance) * 0.6;
          this.ctx.strokeStyle = this.config.lineColor.replace('0.25', opacity);
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(particles[i].x, particles[i].y);
          this.ctx.lineTo(particles[j].x, particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateParticles();
    this.drawConnections();
    this.drawParticles();
    this.animationId = requestAnimationFrame(this.animate);
  }

  setTheme(themeName) {
    if (this.presets[themeName]) {
      this.theme = themeName;
      this.config = { ...this.presets[themeName] };
      this.createParticles();
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    if (this.canvas) this.canvas.remove();
  }

  pause() {
    cancelAnimationFrame(this.animationId);
  }

  resume() {
    this.animate();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.liquidEffect = new LiquidEffectPro({ theme: 'default' });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiquidEffectPro;
}
