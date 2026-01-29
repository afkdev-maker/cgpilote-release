/**
 * "Market Trends" Effect for CGPilote
 * Creates smooth, flowing sine waves representing financial stability and growth.
 * A calm, premium aesthetic often used in modern fintech (e.g. Stripe, Robinhood).
 */

class MarketTrends {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.waves = [];

    // Configuration
    this.config = {
      waveCount: 3, // Number of distinct waves
      waveSpeed: 0.003, // How fast they move horizontally
      waveAmplitude: 60, // Height of the peaks
      waveLength: 0.0015, // How tight the curves are
      yOffset: 0, // Vertical centering adjustment
      colors: [
        "rgba(37, 99, 235, 0.06)", // Faint Blue
        "rgba(37, 99, 235, 0.04)", // Fainter Blue
        "rgba(10, 46, 92, 0.03)", // Very Faint Dark
      ],
    };

    this.time = 0;
    this.init();
  }

  init() {
    if (window.innerWidth <= 1024) return;
    this.resize();
    this.addEventListeners();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;

    // Find the hero section
    const heroSection = document.querySelector(".hero");

    if (heroSection) {
      const heroTop = heroSection.offsetTop;
      const heroHeight = heroSection.offsetHeight;
      const heroBottom = heroTop + heroHeight;

      this.height = heroBottom;

      this.config.yOffset = heroTop + heroHeight * 0.5;
    } else {
      // Fallback for pages without hero
      this.height = Math.min(window.innerHeight, 1200);
      this.config.yOffset = this.height / 2;
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Adjust wave parameters based on screen width
    if (this.width >= 1600) {
      // Large screens
      this.config.waveAmplitude = 90;
      this.config.waveLength = 0.001;
    } else if (this.width >= 1200) {
      // Standard laptops/desktops
      this.config.waveAmplitude = 60;
      this.config.waveLength = 0.0015;
    } else {
      // Smaller screens (tablets/small laptops)
      this.config.waveAmplitude = 30;
      this.config.waveLength = 0.0025;
    }
  }

  addEventListeners() {
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => this.resize(), 100);
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.time += this.config.waveSpeed;

    // Draw each wave
    for (let i = 0; i < this.config.waveCount; i++) {
      this.ctx.beginPath();
      this.ctx.fillStyle = this.config.colors[i];

      // Start drawing the wave from left to right
      this.ctx.moveTo(0, this.height); // Start at bottom-left corner

      // Loop through width to draw sine wave
      for (let x = 0; x <= this.width; x += 10) {
        // Unique parameters for each wave layer to make them distinct
        // Offset phase by i to separate them
        // Vary frequency slightly by i
        const y = this.config.yOffset + Math.sin(x * this.config.waveLength + this.time + i * 2) * this.config.waveAmplitude * (1 + i * 0.2);

        this.ctx.lineTo(x, y);
      }

      // Close the shape to fill it
      this.ctx.lineTo(this.width, this.height); // Bottom-right
      this.ctx.lineTo(0, this.height); // Bottom-left
      this.ctx.closePath();
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    new MarketTrends("particles-canvas");
  }
});
