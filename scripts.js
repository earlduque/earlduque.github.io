Vue.config.devtools = true;

// Global animation state
let animationsEnabled = false;

Vue.component("card", {
  template: `
        <div class="card-wrap"
            @mousemove="handleMouseMove"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            ref="card">
            <div class="card"
            :style="cardStyle">
            <div class="card-bg" :style="[cardBgTransform, cardBgImage]"></div>
            <div class="card-info">
                <slot name="header"></slot>
                <slot name="content"></slot>
            </div>
            </div>
        </div>`,
  mounted() {
    this.width = this.$refs.card.offsetWidth;
    this.height = this.$refs.card.offsetHeight;
  },
  props: ["dataImage"],
  data: () => ({
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
    mouseLeaveDelay: null,
  }),
  computed: {
    mousePX() {
      return this.mouseX / this.width;
    },
    mousePY() {
      return this.mouseY / this.height;
    },
    cardStyle() {
      const rX = this.mousePX * 30;
      const rY = this.mousePY * -30;
      return {
        transform: `rotateY(${rX}deg) rotateX(${rY}deg)`,
      };
    },
    cardBgTransform() {
      const tX = this.mousePX * -40;
      const tY = this.mousePY * -40;
      return {
        transform: `translateX(${tX}px) translateY(${tY}px)`,
      };
    },
    cardBgImage() {
      return {
        backgroundImage: `url(${this.dataImage})`,
      };
    },
  },
  methods: {
    handleMouseMove(e) {
      if (!animationsEnabled) return;
      this.mouseX = e.pageX - this.$refs.card.offsetLeft - this.width / 2;
      this.mouseY = e.pageY - this.$refs.card.offsetTop - this.height / 2;
    },
    handleMouseEnter() {
      if (!animationsEnabled) return;
      clearTimeout(this.mouseLeaveDelay);
    },
    handleMouseLeave() {
      if (!animationsEnabled) return;
      this.mouseLeaveDelay = setTimeout(() => {
        this.mouseX = 0;
        this.mouseY = 0;
      }, 1000);
    },
  },
});

const app = new Vue({
  el: "#app",
  data: {
    links: []
  },
  created() {
    this.loadLinks();
  },
  methods: {
    async loadLinks() {
      try {
        // Use GitHub API to list files in the links directory
        const response = await fetch('https://api.github.com/repos/earlduque/earlduque.github.io/contents/links');
        if (!response.ok) throw new Error('Failed to fetch links directory from GitHub API');
        
        const files = await response.json();
        
        // Filter for JSON files (excluding index.json)
        const jsonFiles = files
          .filter(file => file.name.endsWith('.json') && file.name !== 'index.json')
          .map(file => file.download_url);
        
        // Fetch each JSON file
        const linkPromises = jsonFiles.map(url => fetch(url).then(res => res.json()));
        let links = await Promise.all(linkPromises);
        
        // Filter active links and sort by order
        links = links.filter(link => link.active).sort((a, b) => a.order - b.order);
        this.links = links;
      } catch (e) {
        console.error('Error loading links:', e);
        // Fallback to manifest file if GitHub API fails
        try {
          const manifestResponse = await fetch('links/index.json');
          if (!manifestResponse.ok) throw new Error('Failed to fetch links manifest');
          let links = await manifestResponse.json();
          links = links.filter(link => link.active).sort((a, b) => a.order - b.order);
          this.links = links;
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    }
  }
});

// Animation toggle functionality
function toggleAnimations() {
  animationsEnabled = !animationsEnabled;
  const toggleButton = document.getElementById('animation-toggle');
  const cards = document.querySelectorAll(".card-wrap");
  
  if (animationsEnabled) {
    toggleButton.textContent = '🎯 Static Mode';
    toggleButton.classList.add('active');
    enableAnimations(cards);
  } else {
    toggleButton.textContent = '🎭 Fun Mode';
    toggleButton.classList.remove('active');
    disableAnimations(cards);
  }
}

function enableAnimations(cards) {
  // Remove static mode class
  document.body.classList.remove('static-mode');
  
  // Enable floating animations
  cards.forEach((card, index) => {
    // Set random initial position within bounds
    const randomX = Math.random() * Math.max(0, window.innerWidth - 240);
    const randomY = 100 + Math.random() * Math.max(0, window.innerHeight - 320 - 100);
    card.style.left = randomX + 'px';
    card.style.top = randomY + 'px';
    card.style.position = 'absolute';
    
    // Randomly assign different animation types
    const animations = ['float', 'float-alt', 'float-slow'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    card.style.animationName = randomAnimation;
    card.style.animationDelay = (Math.random() * 5) + 's';
    card.style.animationDuration = (20 + Math.random() * 15) + 's';
    card.style.animationPlayState = 'running';
  });
  
  // Enable text scramble animation
  if (window.textScrambleInterval) clearInterval(window.textScrambleInterval);
  next();
  
  // Start mobile animation if on mobile
  if (window.startMobileAnimation) {
    window.startMobileAnimation();
  }
}

function disableAnimations(cards) {
  // Add static mode class
  document.body.classList.add('static-mode');
  
  // Disable floating animations and reset positioning
  cards.forEach((card, index) => {
    card.style.animationName = 'none';
    card.style.animationPlayState = 'paused';
    card.classList.remove('avoiding');
    card.style.position = 'relative';
    card.style.left = 'auto';
    card.style.top = 'auto';
    card.style.transform = 'none';
  });
  
  // Stop text scramble animation
  const textElement = document.querySelector(".text");
  if (textElement && window.textScrambleFx) {
    if (window.textScrambleInterval) clearInterval(window.textScrambleInterval);
    textElement.innerHTML = "ServiceNow Developer Advocate";
  }
  
  // Stop mobile animation
  if (window.stopMobileAnimation) {
    window.stopMobileAnimation();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Add toggle button event listener
  const toggleButton = document.getElementById('animation-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleAnimations);
  }
  
  setTimeout(() => {
    const cards = document.querySelectorAll(".card-wrap");
    let activeIndex = 0;

    // Function to check if two elements overlap
    function isOverlapping(el1, el2) {
      const rect1 = el1.getBoundingClientRect();
      const rect2 = el2.getBoundingClientRect();
      
      return !(rect1.right < rect2.left || 
               rect1.left > rect2.right || 
               rect1.bottom < rect2.top || 
               rect1.top > rect2.bottom);
    }

    // Function to pause all cards and move overlapping ones away
    function handleCardHover(hoveredCard) {
      if (!animationsEnabled) return;
      // Pause all cards
      cards.forEach(card => {
        card.style.animationPlayState = 'paused';
      });

      // Move overlapping cards away
      cards.forEach(card => {
        if (card !== hoveredCard) {
          const isOverlap = isOverlapping(hoveredCard, card);
          if (isOverlap) {
            card.classList.add('avoiding');
            
            // Calculate direction to move away from hovered card
            const hoveredRect = hoveredCard.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            
            const centerX1 = hoveredRect.left + hoveredRect.width / 2;
            const centerY1 = hoveredRect.top + hoveredRect.height / 2;
            const centerX2 = cardRect.left + cardRect.width / 2;
            const centerY2 = cardRect.top + cardRect.height / 2;
            
            // Calculate direction vector
            const dx = centerX2 - centerX1;
            const dy = centerY2 - centerY1;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Avoid division by zero
            if (distance > 0) {
              // Normalize and scale the movement (reduced from 300 to 150)
              const moveDistance = 150;
              const normalizedDx = (dx / distance) * moveDistance;
              const normalizedDy = (dy / distance) * moveDistance;
              
              // Apply the avoidance transform while preserving the animation transform
              const currentLeft = parseInt(card.style.left) || 0;
              const currentTop = parseInt(card.style.top) || 0;
              
              // Calculate new position
              let newLeft = currentLeft + normalizedDx;
              let newTop = currentTop + normalizedDy;
              
              // Keep within window boundaries
              const cardWidth = 240;
              const cardHeight = 320;
              newLeft = Math.max(0, Math.min(window.innerWidth - cardWidth, newLeft));
              newTop = Math.max(100, Math.min(window.innerHeight - cardHeight, newTop)); // 100px top margin for title
              
              card.style.left = newLeft + 'px';
              card.style.top = newTop + 'px';
            }
          }
        }
      });
    }

    // Function to resume animations from current positions
    function handleCardLeave() {
      if (!animationsEnabled) return;
      cards.forEach(card => {
        // Resume animations from current position
        card.style.animationPlayState = 'running';
        card.classList.remove('avoiding');
        // Don't reset positions - let them continue floating from where they are
      });
    }

    // Function to reposition cards within bounds
    function repositionCards() {
      cards.forEach((card, index) => {
        // Set random initial position within bounds
        const randomX = Math.random() * Math.max(0, window.innerWidth - 240);
        const randomY = 100 + Math.random() * Math.max(0, window.innerHeight - 320 - 100); // 100px top margin
        card.style.left = randomX + 'px';
        card.style.top = randomY + 'px';
      });
    }

    // Initialize in static mode by default
    disableAnimations(cards);
    
    cards.forEach((card, index) => {
      // Add hover event listeners
      card.addEventListener('mouseenter', () => {
        handleCardHover(card);
      });

      card.addEventListener('mouseleave', () => {
        handleCardLeave();
      });
    });

    // Mobile-specific behavior for fun mode only
    let mobileInterval;
    function startMobileAnimation() {
      if (window.innerWidth <= 932 && animationsEnabled) {
        mobileInterval = setInterval(() => {
          // Remove "active" class from all cards
          cards.forEach((card) => card.classList.remove("active"));
          // Add "active" class to the current card
          if (cards[activeIndex]) {
            cards[activeIndex].classList.add("active");
          }
          // Move to the next card in sequence
          activeIndex = (activeIndex + 1) % cards.length;
        }, 3000);
      }
    }
    
    function stopMobileAnimation() {
      if (mobileInterval) {
        clearInterval(mobileInterval);
        mobileInterval = null;
        cards.forEach((card) => card.classList.remove("active"));
      }
    }
    
    // Store these functions globally so toggle can access them
    window.startMobileAnimation = startMobileAnimation;
    window.stopMobileAnimation = stopMobileAnimation;

    // Handle window resize
    window.addEventListener('resize', () => {
      cards.forEach(card => {
        const currentLeft = parseInt(card.style.left) || 0;
        const currentTop = parseInt(card.style.top) || 0;
        
        // Keep cards within new window bounds
        const cardWidth = 240;
        const cardHeight = 320;
        const newLeft = Math.max(0, Math.min(window.innerWidth - cardWidth, currentLeft));
        const newTop = Math.max(100, Math.min(window.innerHeight - cardHeight, currentTop));
        
        card.style.left = newLeft + 'px';
        card.style.top = newTop + 'px';
      });
    });

  }, 1000); // Wait for Vue to render the cards
});

// ——————————————————————————————————————————————————
// TextScramble
// ——————————————————————————————————————————————————

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
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

// ——————————————————————————————————————————————————
// Example
// ——————————————————————————————————————————————————

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
window.textScrambleFx = fx;

// Set initial static text
if (el) {
  el.innerHTML = "ServiceNow Developer Advocate";
}

let counter = 0;
const next = () => {
  if (!animationsEnabled) return;
  fx.setText(phrases[counter]).then(() => {
    if (animationsEnabled) {
      window.textScrambleInterval = setTimeout(next, 2000);
    }
  });
  counter = (counter + 1) % phrases.length;
};

// Store the next function globally so it can be called from toggle
window.next = next;

// Don't start text scramble automatically - wait for animation toggle

// document.addEventListener("DOMContentLoaded", function () {
//     // URL of your public API
//     const apiUrl = "https://earl.service-now.com/api/x_snc_earlduque_0/earlduquedotcom";

//     // Perform the GET request
//     fetch(apiUrl)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`Network response was not ok (${response.status})`);
//         }
//         return response.json(); // Parse JSON data
//       })
//       .then((data) => {
//         console.log("API Response:", data); // Handle the response data
//         // Update your UI based on the data
//         const textElement = document.querySelector(".text");
//         textElement.textContent = `API Data: ${JSON.stringify(data, null, 2)}`;
//       })
//       .catch((error) => {
//         console.error("There was a problem with the fetch operation:", error);
//       });
//   });