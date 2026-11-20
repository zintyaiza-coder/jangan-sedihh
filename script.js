const matrixCanvas = document.getElementById("matrixCanvas");
const mCtx = matrixCanvas.getContext("2d");

const particleCanvas = document.getElementById("particleCanvas");
const pCtx = particleCanvas.getContext("2d");

const uiContainer = document.getElementById("ui");
const heartTrail = document.getElementById("heartTrail");

let width = (matrixCanvas.width = particleCanvas.width = window.innerWidth);
let height = (matrixCanvas.height = particleCanvas.height = window.innerHeight);

// Urutan pembuka & tulisan hati
const sequenceWords = ["3", "2", "1", "Jangan", "Sedih", "Yaa", "El"];
const rotatingHeartText = "Stay Happy El";

// 1. HUJAN KARAKTER PINK
const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ♡✦✧";
const fontSize = 14;
let columns = Math.floor(width / fontSize);
let drops = Array.from({ length: columns }, () => Math.random() * -(height / fontSize));

function drawMatrix() {
  mCtx.fillStyle = "rgba(6, 4, 9, 0.14)";
  mCtx.fillRect(0, 0, width, height);

  mCtx.font = `${fontSize}px monospace`;
  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    const bright = Math.random() > 0.76;
    mCtx.fillStyle = bright
      ? "rgba(255, 215, 230, 0.85)"
      : "rgba(244, 114, 166, 0.55)";
    mCtx.fillText(text, x, y);

    if (y > height && Math.random() > 0.975) {
      drops[i] = Math.random() * -15;
    }
    drops[i] += 0.95;
  }
}

// 2. PARTIKEL DOT-MATRIX YANG MENGALIR HALUS (TIDAK KAKU)
let particles = [];
const totalParticles = 1250;

class SmoothDot {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.tx = this.x;
    this.ty = this.y;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this.radius = width < 600 ? 2.4 : 3.1;
    this.phase = "drift"; // "drift" | "swirl" | "form"
    this.angle = Math.random() * Math.PI * 2;
    this.ease = 0.055 + Math.random() * 0.035;
  }

  swirlOut() {
    this.phase = "swirl";
    this.angle = Math.random() * Math.PI * 2;
    const speed = 1.6 + Math.random() * 3.2;
    this.vx = Math.cos(this.angle) * speed;
    this.vy = Math.sin(this.angle) * speed;
  }

  update(now) {
    if (this.phase === "swirl") {
      // Melayang melengkung halus seperti di video 1 sebelum berkumpul
      this.angle += 0.06;
      this.x += this.vx + Math.cos(this.angle) * 0.8;
      this.y += this.vy + Math.sin(this.angle) * 0.8;
      this.vx *= 0.965;
      this.vy *= 0.965;
    } else if (this.phase === "form") {
      // Meluncur ke posisi huruf dengan sedikit ombak halus supaya tidak kaku
      const waveX = Math.sin(now * 0.004 + this.y * 0.03) * 1.3;
      const waveY = Math.cos(now * 0.004 + this.x * 0.03) * 1.3;
      this.x += (this.tx + waveX - this.x) * this.ease;
      this.y += (this.ty + waveY - this.y) * this.ease;
    } else {
      // Mengambang lembut saat menyebar
      this.x += this.vx + Math.sin(now * 0.0015 + this.y * 0.01) * 0.35;
      this.y += this.vy + Math.cos(now * 0.0015 + this.x * 0.01) * 0.35;
    }
  }

  draw() {
    pCtx.beginPath();
    pCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    pCtx.fillStyle = "#fff9ec";
    pCtx.fill();
  }
}

for (let i = 0; i < totalParticles; i++) {
  particles.push(new SmoothDot());
}

function getWordDots(word) {
  const offCanvas = document.createElement("canvas");
  const offCtx = offCanvas.getContext("2d");
  offCanvas.width = width;
  offCanvas.height = height;

  const isShort = word.length === 1;
  const fontPx = isShort
    ? Math.min(width, height) * 0.42
    : Math.min(width * 0.2, 165);

  offCtx.fillStyle = "#ffffff";
  offCtx.font = `900 ${fontPx}px Arial, Helvetica, sans-serif`;
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText(word, width / 2, height / 2);

  const data = offCtx.getImageData(0, 0, width, height).data;
  const gap = isShort
    ? (width < 600 ? 9 : 12)
    : (width < 600 ? 7 : 9);

  const points = [];
  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      if (data[(y * width + x) * 4 + 3] > 140) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

function transitionToWord(word) {
  // 1. Biarkan partikel berputar/menyebar halus selama ~420ms
  particles.forEach((p) => p.swirlOut());

  // 2. Baru arahkan perlahan membentuk huruf berikutnya
  setTimeout(() => {
    const targets = getWordDots(word);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.phase = "form";
      if (i < targets.length) {
        p.tx = targets[i].x;
        p.ty = targets[i].y;
      } else {
        p.tx = Math.random() * width;
        p.ty = Math.random() * height;
      }
    }
  }, 420);
}

function releaseParticles() {
  particles.forEach((p) => {
    p.phase = "drift";
    p.vx = (Math.random() - 0.5) * 1.3;
    p.vy = (Math.random() - 0.5) * 1.3;
  });
}

// 3. HATI TEKS BERPUTAR & NAIK-TURUN (BAGIAN TENGAH KOSONG)
const totalLoveItems = 56;
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
      word,
      offset: (i / totalLoveItems) * Math.PI * 2
    });
  }
}

let heartPhase = 0;
let heartActive = false;

function animateHeartTrail(now) {
  if (!heartActive) return;

  heartPhase += 0.014;
  const scale = Math.min(width, height) * 0.0235;
  const waveTime = now * 0.0032;

  for (let i = 0; i < loveElements.length; i++) {
    const item = loveElements[i];
    const t = item.offset + heartPhase;

    const x = 16 * Math.pow(Math.sin(t), 3) * scale;
    const baseY =
      -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      ) * scale;

    const waveY = Math.sin(waveTime + i * 0.35) * 14;
    const tiltDeg = Math.cos(waveTime + i * 0.35) * 10 - 28;
    const pulseScale = 0.94 + (Math.sin(waveTime + i * 0.35) + 1) * 0.06;

    item.horizontal.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    item.vertical.style.transform = `translate3d(0, ${(baseY + waveY).toFixed(2)}px, 0)`;
    item.word.style.transform = `translate(-50%, -50%) rotate(${tiltDeg.toFixed(1)}deg) scale(${pulseScale.toFixed(3)})`;
  }
}

// 4. ALUR UTAMA
function startShow() {
  let index = 0;

  function stepNext() {
    if (index < sequenceWords.length) {
      transitionToWord(sequenceWords[index]);
      index++;
      setTimeout(stepNext, 1450);
    } else {
      releaseParticles();
      createHeartElements();
      heartActive = true;
      setTimeout(() => {
        uiContainer.classList.add("show");
      }, 500);
    }
  }

  setTimeout(stepNext, 500);
}

function loop(now) {
  drawMatrix();

  pCtx.clearRect(0, 0, width, height);
  pCtx.save();
  pCtx.shadowColor = "rgba(255, 196, 120, 0.65)";
  pCtx.shadowBlur = 8;
  for (let i = 0; i < particles.length; i++) {
    particles[i].update(now);
    particles[i].draw();
  }
  pCtx.restore();

  animateHeartTrail(now);
  requestAnimationFrame(loop);
}

window.addEventListener("resize", () => {
  width = matrixCanvas.width = particleCanvas.width = window.innerWidth;
  height = matrixCanvas.height = particleCanvas.height = window.innerHeight;
  columns = Math.floor(width / fontSize);
  drops = Array.from({ length: columns }, () => Math.random() * -15);
});

requestAnimationFrame(loop);
startShow();
