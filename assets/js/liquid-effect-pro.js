class LiquidWaterEffect {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'water-liquid-effect';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    `;
    document.body.insertBefore(this.canvas, document.body.firstChild);

    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.mouse = { x: this.width / 2, y: this.height / 2 };
    this.waves = [];
    this.particles = [];
    this.time = 0;

    this.initWaves();
    this.initParticles();
    this.setupEventListeners();
    this.animate();
  }

  initWaves() {
    for (let i = 0; i < 5; i++) {
      this.waves.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        amplitude: Math.random() * 30 + 20,
        frequency: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      });
    }
  }

  initParticles() {
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1,
        life: 1,
        size: Math.random() * 4 + 2,
        color: `hsl(${Math.random() * 60 + 180}, 100%, ${Math.random() * 50 + 25}%)`
      });
    }
  }

  setupEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.createWaveAtMouse();
    });

    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    });
  }

  createWaveAtMouse() {
    if (Math.random() < 0.3) {
      this.waves.push({
        x: this.mouse.x,
        y: this.mouse.y,
        amplitude: Math.random() * 40 + 30,
        frequency: Math.random() * 0.03 + 0.02,
        phase: 0,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        maxLife: 2,
        life: 2
      });

      if (Math.random() < 0.7) {
        for (let i = 0; i < 5; i++) {
          this.particles.push({
            x: this.mouse.x,
            y: this.mouse.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 - 2,
            life: 1,
            size: Math.random() * 6 + 3,
            color: `hsl(${Math.random() * 40 + 190}, 100%, ${Math.random() * 40 + 30}%)`
          });
        }
      }
    }
  }

  updateWaves() {
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wave = this.waves[i];
      wave.x += wave.vx;
      wave.y += wave.vy;
      wave.phase += wave.frequency;
      wave.amplitude *= 0.98;

      if (wave.life !== undefined) {
        wave.life -= 0.02;
        if (wave.life <= 0) {
          this.waves.splice(i, 1);
        }
      }

      if (wave.x < -100 || wave.x > this.width + 100 ||
          wave.y < -100 || wave.y > this.height + 100) {
        this.waves.splice(i, 1);
      }
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= 0.01;
      p.vx *= 0.99;

      if (p.life <= 0 || p.y > this.height) {
        this.particles.splice(i, 1);
      }
    }
  }

  drawWaves() {
    this.waves.forEach(wave => {
      const gradient = this.ctx.createRadialGradient(wave.x, wave.y, 0, wave.x, wave.y, wave.amplitude * 3);
      const opacity = wave.life !== undefined ? wave.life : 1;
      
      gradient.addColorStop(0, `rgba(100, 200, 255, ${opacity * 0.4})`);
      gradient.addColorStop(0.5, `rgba(100, 150, 255, ${opacity * 0.2})`);
      gradient.addColorStop(1, `rgba(100, 150, 255, 0)`);

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(wave.x, wave.y, wave.amplitude * 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.drawWaveCircles(wave, opacity);
    });
  }

  drawWaveCircles(wave, opacity) {
    for (let i = 0; i < 3; i++) {
      const radius = Math.sin(wave.phase + i) * wave.amplitude + wave.amplitude;
      this.ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * (0.3 - i * 0.1)})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color.replace('1)', `${p.life})`);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      const glow = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      glow.addColorStop(0, p.color.replace('1)', `${p.life * 0.5})`));
      glow.addColorStop(1, p.color.replace('1)', '0)'));
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawFluidBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, 'rgba(10, 20, 40, 0.1)');
    gradient.addColorStop(0.5, 'rgba(20, 40, 80, 0.05)');
    gradient.addColorStop(1, 'rgba(10, 20, 40, 0.1)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  animate = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.drawFluidBackground();
    this.updateWaves();
    this.updateParticles();
    this.drawWaves();
    this.drawParticles();

    this.time++;
    requestAnimationFrame(this.animate);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LiquidWaterEffect();
});
