/**
 * Subtle Particle Effect for CGPilote
 * Creates a lightweight network of connected particles
 */

class ParticleNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Configuration
    this.config = {
      particleCount: Math.min(Math.floor((window.innerWidth * window.innerHeight) / 10000), 80), // Slightly fewer particles
      connectionDistance: 140, // Reduced reach
      mouseDistance: 200, // Reduced interaction range
      baseColor: "rgba(18, 19, 23, 0.4)", // More subtle color
      lineColor: "rgba(18, 19, 23, 0.05)",
      speed: 0.2, // Slower
    };

    this.mouse = { x: null, y: null };

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.addEventListeners();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = Math.min(window.innerHeight, 850); // Limit height to hero area
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.config.particleCount = Math.min(Math.floor((this.width * this.height) / 12000), 80);

    // Re-initialize particles on resize to avoid clustering
    if (this.particles.length > 0) {
      this.createParticles();
    }
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.config.speed,
        vy: (Math.random() - 0.5) * this.config.speed,
        size: Math.random() * 2 + 1, // Smaller particles again
      });
    }
  }

  addEventListeners() {
    window.addEventListener("resize", () => this.resize());

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });

    window.addEventListener("mouseout", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    window.addEventListener("scroll", () => {
      // Optional: stop animating if not visible.
      // Since the canvas is fixed, it's technically always visible in viewport unless we move it absolute.
      // The user requested "it shouldn't show below hero".
      // The best way to do this is to change position from 'fixed' to 'absolute' via CSS or handle opacity here.
      // We will handle position in CSS, but let's pause animation if the user scrolls past the hero (e.g. 900px)
      // to save resources, although not strictly required by the prompt, it's good practice.
      // The visibility logic is mainly handled by CSS positioning now.
    });
  }

  drawLines(p, i) {
    // Connect to other particles
    for (let j = i + 1; j < this.particles.length; j++) {
      const p2 = this.particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.config.connectionDistance) {
        const opacity = 1 - distance / this.config.connectionDistance;
        this.ctx.strokeStyle = `rgba(18, 19, 23, ${opacity * 0.15})`; // Very subtle lines
        this.ctx.lineWidth = 1; // Thinner lines
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
      }
    }

    // Connect to mouse
    if (this.mouse.x != null) {
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.config.mouseDistance) {
        const opacity = 1 - distance / this.config.mouseDistance;
        this.ctx.strokeStyle = `rgba(37, 99, 235, ${opacity * 0.2})`; // Subtle interaction
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.stroke();
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Mouse Repulsion / Interaction
      if (this.mouse.x != null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Interaction radius
        if (distance < 150) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (150 - distance) / 150;

          const directionX = forceDirectionX * force * 0.6; // Push strength
          const directionY = forceDirectionY * force * 0.6;

          p.vx += directionX;
          p.vy += directionY;
        }
      }

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Friction (to slow them down after being pushed)
      p.vx *= 0.98; // Friction factor
      p.vy *= 0.98;

      // Keep minimum speed for ambient movement
      const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (currentSpeed < this.config.speed) {
        // Slowly accelerate back to random ambient drift if too slow
        // This is a bit complex to do smoothly, simpler is to just clamp or add random noise
        // Instead, let's just make sure they don't stop completely.
        if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.05;
        if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.05;
      }

      // Bounce off edges
      if (p.x < 0) {
        p.x = 0;
        p.vx *= -1;
      }
      if (p.x > this.width) {
        p.x = this.width;
        p.vx *= -1;
      }
      if (p.y < 0) {
        p.y = 0;
        p.vy *= -1;
      }
      if (p.y > this.height) {
        p.y = this.height;
        p.vy *= -1;
      }

      // Draw particle
      this.ctx.fillStyle = this.config.baseColor;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Connect
      this.drawLines(p, i);
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new ParticleNetwork("particles-canvas");
});
