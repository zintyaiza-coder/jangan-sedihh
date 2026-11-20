const matrixCanvas = document.getElementById("matrixCanvas");
const mCtx = matrixCanvas.getContext("2d");

const particleCanvas = document.getElementById("particleCanvas");
const pCtx = particleCanvas.getContext("2d");

const uiContainer = document.getElementById("ui");
const heartTrail = document.getElementById("heartTrail");

let width = (matrixCanvas.width = particleCanvas.width = window.innerWidth);
let height = (matrixCanvas.height = particleCanvas.height = window.innerHeight);

// Urutan kata pembuka
const sequenceWords = ["3", "2", "1", "Jangan", "Sedih", "Yaa", "El"];
const rotatingHeartText = "Stay Happy El";

// 1. EFEK HUJAN MATRIX PINK
const chars = "01♡✦✧ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fontSize = 15;
let columns = Math.floor(width / fontSize);
let drops = Array.from({ length: columns }, () => Math.random() * -50);

function drawMatrix() {
  mCtx.fillStyle = "rgba(7, 5, 10, 0.12)";
  mCtx.fillRect(0, 0, width, height);

  mCtx.font = `${fontSize}px monospace`;
  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    mCtx.fillStyle = Math.random() > 0.25 ? "rgba(255, 133, 161, 0.65)" : "rgba(255, 214, 224, 0.85)";
    mCtx.fillText(text, x, y);

    if (y > height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i] += 0.85;
  }
}

// 2. EFEK DOT-MATRIX PARTIKEL
let particles = [];
const totalParticles = 950;

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.tx = this.x;
    this.ty = this.y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.size = Math.random() * 2 + 1.8;
    this.dispersed = false;
  }

  update() {
    if (this.dispersed) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    } else {
      this.x += (this.tx - this.x) * 0.12;
      this.y += (this.ty - this.y) * 0.12;
    }
  }

  draw() {
    pCtx.beginPath();
    pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    pCtx.fillStyle = "#fff8e7";
    pCtx.shadowColor = "#ff9ebb";
    pCtx.shadowBlur = 10;
    pCtx.fill();
  }
}

for (let i = 0; i < totalParticles; i++) {
  particles.push(new Particle());
}

function morphToText(word) {
  const offCanvas = document.createElement("canvas");
  const offCtx = offCanvas.getContext("2d");
  offCanvas.width = width;
  offCanvas.height = height;

  const isShort = word.length <= 2;
  const textSize = isShort
    ? Math.min(width, height) * 0.34
    : Math.min(width * 0.18, 150);

  offCtx.fillStyle = "#ffffff";
  offCtx.font = `900 ${textSize}px 'Segoe UI', Arial, sans-serif`;
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText(word, width / 2, height / 2);

  const imageData = offCtx.getImageData(0, 0, width, height).data;
  const gap = width < 600 ? 6 : 8;
  const targets = [];

  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const index = (y * width + x) * 4;
      if (imageData[index + 3] > 128) {
        targets.push({ x, y });
      }
    }
  }

  targets.sort(() => Math.random() - 0.5);

  for (let i = 0; i < particles.length; i++) {
    particles[i].dispersed = false;
    if (i < targets.length) {
      particles[i].tx = targets[i].x;
      particles[i].ty = targets[i].y;
    } else {
      particles[i].tx = Math.random() * width;
      particles[i].ty = Math.random() * height;
    }
  }
}

function disperseParticles() {
  particles.forEach((p) => {
    p.dispersed = true;
    p.vx = (Math.random() - 0.5) * 1.4;
    p.vy = (Math.random() - 0.5) * 1.4;
  });
}

// 3. HATI TEKS BERGERAK (BAGIAN TENGAH KOSONG)
const totalLoveItems = 68;
const loveElements = [];

function createHeartElements() {
  heartTrail.innerHTML = "";
  loveElements.length = 0;

  for (let i = 0; i < totalLoveItems; i++) {
    const love = document.createElement("div");
    love.className = "love";

    const horizontal = document.createElement("div");
    horizontal.className = "love_horizontal";

    const vertical = document.createElement("div");
    vertical.className = "love_vertical";

    const word = document.createElement("div");
    word.className = "love_word";
    word.textContent = rotatingHeartText;

    vertical.appendChild(word);
    horizontal.appendChild(vertical);
    love.appendChild(horizontal);
    heartTrail.appendChild(love);

    loveElements.push({
      horizontal,
      vertical,
      offset: (i / totalLoveItems) * Math.PI * 2
    });
  }
}

let heartPhase = 0;
let heartActive = false;

function animateHeartTrail() {
  if (!heartActive) return;

  heartPhase += 0.012;
  const scale = Math.min(width, height) * 0.023;

  for (let i = 0; i < loveElements.length; i++) {
    const item = loveElements[i];
    const t = item.offset + heartPhase;

    const x = 16 * Math.pow(Math.sin(t), 3) * scale;
    const y =
      -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      ) * scale;

    item.horizontal.style.transform = `translateX(${x.toFixed(2)}px)`;
    item.vertical.style.transform = `translateY(${y.toFixed(2)}px)`;
  }
}

// 4. ALUR UTAMA ANIMASI
function startShow() {
  let step = 0;

  function nextWord() {
    if (step < sequenceWords.length) {
      morphToText(sequenceWords[step]);
      step++;
      setTimeout(nextWord, 1250);
    } else {
      disperseParticles();
      createHeartElements();
      heartActive = true;
      setTimeout(() => {
        uiContainer.classList.add("show");
      }, 450);
    }
  }

  setTimeout(nextWord, 600);
}

function renderLoop() {
  drawMatrix();

  pCtx.clearRect(0, 0, width, height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  animateHeartTrail();
  requestAnimationFrame(renderLoop);
}

window.addEventListener("resize", () => {
  width = matrixCanvas.width = particleCanvas.width = window.innerWidth;
  height = matrixCanvas.height = particleCanvas.height = window.innerHeight;
  columns = Math.floor(width / fontSize);
  drops = Array.from({ length: columns }, () => Math.random() * -50);
});

renderLoop();
startShow();
