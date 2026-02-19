// ============================================
// Particle Constellation Background
// ============================================
class ParticleNetwork {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.config = {
      particleCount: window.innerWidth < 768 ? 25 : 55,
      maxDistance: 140,
      particleColor: "rgba(0, 212, 255, 0.25)",
      lineColor: [0, 212, 255],
      maxLineOpacity: 0.1,
      speed: 0.3,
      mouseRadius: 120,
      mouseForce: 0.02,
    };
    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.speed,
        vy: (Math.random() - 0.5) * this.config.speed,
        radius: Math.random() * 1.5 + 0.5,
      });
    }
  }

  bindEvents() {
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
        this.config.particleCount = window.innerWidth < 768 ? 25 : 55;
        this.createParticles();
      }, 250);
    });

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Subtle mouse repulsion
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.config.mouseRadius) {
          p.x += dx * this.config.mouseForce;
          p.y += dy * this.config.mouseForce;
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.particleColor;
      this.ctx.fill();
    }

    // Draw connecting lines
    const { maxDistance, lineColor, maxLineOpacity } = this.config;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const opacity = (1 - dist / maxDistance) * maxLineOpacity;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(${lineColor[0]}, ${lineColor[1]}, ${lineColor[2]}, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// Cursor Glow
// ============================================
function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow || window.matchMedia("(hover: none)").matches) return;

  let targetX = 0,
    targetY = 0;
  let currentX = 0,
    currentY = 0;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX - 200;
    targetY = e.clientY - 200;
  });

  function update() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    glow.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(update);
  }
  update();
}

// ============================================
// Card Interactivity (spotlight + tilt)
// ============================================
function initCardEffects() {
  if (window.matchMedia("(hover: none)").matches) return;

  document.querySelectorAll(".link-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Spotlight follows mouse
      card.style.setProperty("--mouse-x", `${x}%`);
      card.style.setProperty("--mouse-y", `${y}%`);

      // Subtle 3D tilt
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((e.clientY - rect.top - centerY) / centerY) * -4;
      const rotateY = ((e.clientX - rect.left - centerX) / centerX) * 4;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.setProperty("--mouse-x", "50%");
      card.style.setProperty("--mouse-y", "50%");
    });
  });
}

// ============================================
// Vue App
// ============================================
const app = new Vue({
  el: "#app",
  data: {
    links: [],
  },
  created() {
    this.loadLinks();
  },
  methods: {
    async loadLinks() {
      try {
        // Primary: GitHub API for dynamic link loading
        const response = await fetch(
          "https://api.github.com/repos/earlduque/earlduque.github.io/contents/links"
        );
        if (!response.ok) throw new Error("GitHub API failed");

        const files = await response.json();
        const jsonFiles = files
          .filter((f) => f.name.endsWith(".json") && f.name !== "index.json")
          .map((f) => f.download_url);

        const linkPromises = jsonFiles.map((url) =>
          fetch(url).then((res) => res.json())
        );
        let links = await Promise.all(linkPromises);
        links = links.filter((l) => l.active).sort((a, b) => a.order - b.order);
        this.links = links;
      } catch (e) {
        console.error("GitHub API error, using fallback:", e);
        // Fallback: local manifest
        try {
          const res = await fetch("links/index.json");
          if (!res.ok) throw new Error("Manifest fetch failed");
          let links = await res.json();
          links = links.filter((l) => l.active).sort((a, b) => a.order - b.order);
          this.links = links;
        } catch (fallbackErr) {
          console.error("Fallback also failed:", fallbackErr);
        }
      }

      // Init card effects after Vue renders the cards
      this.$nextTick(() => {
        initCardEffects();
      });
    },
  },
});

// ============================================
// TextScramble
// ============================================
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}--=+*^?#________";
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// ============================================
// Subtitle Rotation
// ============================================
const phrases = [
  "ServiceNow Developer Advocate",
  "Random Tech Stuff",
  "#GirlDad",
  "ServiceNow Developer",
  "Ally to those seeking allies",
  "Nerd",
];

const el = document.querySelector(".text");
const fx = new TextScramble(el);

let counter = 0;
const next = () => {
  fx.setText(phrases[counter]).then(() => {
    setTimeout(next, 2000);
  });
  counter = (counter + 1) % phrases.length;
};
next();

// ============================================
// Initialize on DOM Ready
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Particle constellation
  const canvas = document.getElementById("particle-canvas");
  if (canvas) new ParticleNetwork(canvas);

  // Cursor glow
  initCursorGlow();
});
