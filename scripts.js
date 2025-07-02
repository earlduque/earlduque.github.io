Vue.config.devtools = true;

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
      this.mouseX = e.pageX - this.$refs.card.offsetLeft - this.width / 2;
      this.mouseY = e.pageY - this.$refs.card.offsetTop - this.height / 2;
    },
    handleMouseEnter() {
      clearTimeout(this.mouseLeaveDelay);
    },
    handleMouseLeave() {
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
        const response = await fetch('links/index.json');
        if (!response.ok) throw new Error('Failed to fetch links manifest');
        let links = await response.json();
        links = links.filter(link => link.active).sort((a, b) => a.order - b.order);
        this.links = links;
      } catch (error) {
        console.error('Error loading links:', error);
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card-wrap");
  let activeIndex = 0;

  if (window.innerWidth <= 932) {
    // Adjust for small screens
    setInterval(() => {
      // Remove "active" class from all cards
      cards.forEach((card) => card.classList.remove("active"));
      // Add "active" class to the current card
      cards[activeIndex].classList.add("active");
      // Move to the next card in sequence
      activeIndex = (activeIndex + 1) % cards.length;
    }, 3000); // Adjust timing (e.g., 3 seconds per card)
  }
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

let counter = 0;
const next = () => {
  fx.setText(phrases[counter]).then(() => {
    setTimeout(next, 2000);
  });
  counter = (counter + 1) % phrases.length;
  // counter = Math.floor(Math.random() * phrases.length);
};

next();

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