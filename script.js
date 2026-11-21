const startOverlay = document.getElementById("startOverlay");
const startBtn = document.getElementById("startBtn");

const matrixCanvas = document.getElementById("matrixCanvas");
const mCtx = matrixCanvas.getContext("2d");

const dotCanvas = document.getElementById("dotCanvas");
const dCtx = dotCanvas.getContext("2d");

const heartScene = document.getElementById("heartScene");
const heartContainer = document.getElementById("heartContainer");
const robotLyric = document.getElementById("robotLyric");
const bgMusic = document.getElementById("bgMusic");

let width = (matrixCanvas.width = dotCanvas.width = window.innerWidth);
let height = (matrixCanvas.height = dotCanvas.height = window.innerHeight);

const sequenceWords = ["3", "2", "1", "Jangan", "Sedih", "Yaa", "El"];
const heartPhrase = "love u all";

// ==========================================
// 1. HUJAN KARAKTER PINK
// ==========================================
const matrixChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ*+-<>";
const fontSize = 14;
let columns = Math.floor(width / fontSize);
let drops = Array.from({ length: columns }, () => Math.random() * -(height / fontSize));

function drawMatrixRain() {
  mCtx.fillStyle = "rgba(5, 2, 6, 0.16)";
  mCtx.fillRect(0, 0, width, height);

  mCtx.font = `${fontSize}px monospace`;
  for (let i = 0; i < drops.length; i++) {
    const ch = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    const isTip = Math.random() > 0.88;
    mCtx.fillStyle = isTip
      ? "rgba(255, 185, 215, 0.85)"
      : "rgba(235, 70, 145, 0.42)";
    mCtx.fillText(ch, x, y);

    if (y > height && Math.random() > 0.975) {
      drops[i] = Math.random() * -20;
    }
    drops[i] += 0.9;
  }
}

// ==========================================
// 2. DOT-MATRIX PINK JELAS (ANTI MENYATU)
// ==========================================
const totalDots = 2400;
const dots = [];

class Dot {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.tx = this.x;
    this.ty = this.y;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
    this.active = false;
    this.state = "scatter";
    this.seed = Math.random() * Math.PI * 2;
  }

  scatter() {
    this.state = "scatter";
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.2 + Math.random() * 4.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  setTarget(x, y) {
    this.tx = x;
    this.ty = y;
    this.active = true;
    this.state = "form";
  }

  update(now) {
    if (this.state === "form" && this.active) {
      this.x += (this.tx - this.x) * 0.24;
      this.y += (this.ty - this.y) * 0.24;
    } else {
      this.x += this.vx + Math.cos(now * 0.002 + this.seed) * 0.3;
      this.y += this.vy + Math.sin(now * 0.002 + this.seed) * 0.3;
      this.vx *= 0.95;
      this.vy *= 0.95;
    }
  }

  draw(dotRadius) {
    if (!this.active && this.state === "form") return;

    // Lingkaran gelap tipis di belakang titik aktif agar kontras di atas matrix pink
    if (this.state === "form" && this.active) {
      dCtx.beginPath();
      dCtx.arc(this.x, this.y, dotRadius + 2.2, 0, Math.PI * 2);
      dCtx.fillStyle = "rgba(8, 2, 6, 0.78)";
      dCtx.fill();
    }

    dCtx.beginPath();
    dCtx.arc(this.x, this.y, dotRadius, 0, Math.PI * 2);
    dCtx.fillStyle = this.state === "form" && this.active ? "#ff69b4" : "#ff85b3";
    dCtx.fill();
  }
}

for (let i = 0; i < totalDots; i++) {
  dots.push(new Dot());
}

function sampleTextDots(text) {
  const off = document.createElement("canvas");
  const oCtx = off.getContext("2d");
  off.width = width;
  off.height = height;

  const isShort = text.length <= 2;
  const maxWidth = width * 0.84;
  let fontSizePx = isShort
    ? Math.min(width, height) * 0.45
    : Math.min(width * 0.22, 175);

  oCtx.font = `900 ${fontSizePx}px Arial, Helvetica, sans-serif`;
  const measured = oCtx.measureText(text).width;
  if (measured > maxWidth) {
    fontSizePx = fontSizePx * (maxWidth / measured);
    oCtx.font = `900 ${fontSizePx}px Arial, Helvetica, sans-serif`;
  }

  oCtx.fillStyle = "#ffffff";
  oCtx.textAlign = "center";
  oCtx.textBaseline = "middle";
  oCtx.fillText(text, width / 2, height / 2);

  const pixels = oCtx.getImageData(0, 0, width, height).data;
  const gridStep = isShort
    ? (width < 600 ? 9 : 11)
    : (width < 600 ? 7 : 9);

  const coords = [];
  for (let y = 0; y < height; y += gridStep) {
    for (let x = 0; x < width; x += gridStep) {
      if (pixels[(y * width + x) * 4 + 3] > 140) {
        coords.push({ x, y });
      }
    }
  }
  return coords;
}

function morphWord(word) {
  dots.forEach((dot) => dot.scatter());

  setTimeout(() => {
    const coords = sampleTextDots(word);
    for (let i = 0; i < dots.length; i++) {
      if (i < coords.length) {
        dots[i].setTarget(coords[i].x, coords[i].y);
      } else {
        dots[i].active = false;
        dots[i].state = "scatter";
      }
    }
  }, 300);
}

// ==========================================
// 3. HATI TEKS RAPI & TERATUR
// ==========================================
// Jumlah item pas & jarak sudut merata agar teks tidak saling menumpuk berantakan
const totalHeartItems = 44;
const heartItems = [];

function createHeartTrail() {
  heartContainer.innerHTML = "";
  heartItems.length = 0;

  for (let i = 0; i < totalHeartItems; i++) {
    const item = document.createElement("div");
    item.className = "love_item";

    const word = document.createElement("div");
    word.className = "love_word";
    word.textContent = heartPhrase;

    item.appendChild(word);
    heartContainer.appendChild(item);

    heartItems.push({
      el: item,
      wordEl: word,
      baseT: (i / totalHeartItems) * Math.PI * 2
    });
  }
}

let heartAngleOffset = 0;
let heartRunning = false;

function updateHeartTrail(now) {
  if (!heartRunning) return;

  heartAngleOffset += 0.01;
  const baseScale = Math.min(width, height) * 0.0235;

  for (let i = 0; i < heartItems.length; i++) {
    const item = heartItems[i];
    const t = item.baseT + heartAngleOffset;

    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );

    const xPx = hx * baseScale;
    const yPx = hy * baseScale;

    // Sedikit gradasi terang-redup halus searah putaran agar berasa mengalir
    const depth = (Math.sin(t) + 1) * 0.5; // 0 .. 1
    const opacity = (0.45 + depth * 0.55).toFixed(2);
    const scale = (0.9 + depth * 0.14).toFixed(2);

    item.el.style.transform = `translate(${xPx.toFixed(2)}px, ${yPx.toFixed(2)}px) scale(${scale})`;
    item.wordEl.style.opacity = opacity;
  }
}

// ==========================================
// 4. LAGU & LIRIK ROBOT (MULAI SAAT LOVE MUNCUL + AUTO LOOP)
// ==========================================
const robotLyrics = [
  { atSec: 0.2, line: "Jangan Bersedih" },
  { atSec: 1.8, line: "Janganlah Merana" },
  { atSec: 3.6, line: "Hanya Gara Gara Di Putuskan Cinta" },
  { atSec: 6.8, line: "Bila Memang Tak Ada Jodohnya" },
  { atSec: 10.0, line: "Lalu Mau Bilang Apa ?" },
  { atSec: 13.5, line: "Mari Menari, Ikuti Irama" },
  { atSec: 17.0, line: "Kita Bergembira Berjoget Bersama" },
  { atSec: 20.5, line: "Hilangkan Semua Duka Lara" },
  { atSec: 23.8, line: "Buanglah Rasa Kecewa" },
  { atSec: 27.2, line: "Ini Lagu Baru Di Ciptakan" },
  { atSec: 30.6, line: "Di Ciptakan Hanya Satu Malam" },
  { atSec: 34.0, line: "Karna Penciptanya Orang Padang" },
  { atSec: 37.2, line: "Lagu Ini Judulnya Goyang Nasi Padang" },
  { atSec: 40.5, line: "Goyang Nasi Padang" },
  { atSec: 42.2, line: "Pakai Sambal Rendang" },
  { atSec: 44.0, line: "Sama Orang Minang" },
  { atSec: 45.8, line: "Yang Ikut Bergoyang" },
  { atSec: 47.6, line: "Semua Masalah Jadi Hilang" },
  { atSec: 51.0, line: "Pikiran Ku Jadi Tenang" },
  { atSec: 54.4, line: "Goyang Nasi Padang" }
];

let typeInterval = null;

function runRobotTypewriter(text) {
  clearInterval(typeInterval);
  robotLyric.classList.add("show");
  robotLyric.innerHTML = `<span id="typedText"></span><span class="robot-cursor">_</span>`;
  const typedSpan = document.getElementById("typedText");

  const stepSpeed = text.length > 26 ? 24 : 35;
  let idx = 0;
  typeInterval = setInterval(() => {
    if (!typedSpan) return;
    typedSpan.textContent = text.slice(0, idx + 1);
    idx++;
    if (idx >= text.length) {
      clearInterval(typeInterval);
    }
  }, stepSpeed);
}

function startMusicAndLyrics() {
  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {});

  let lyricIdx = 0;
  let lastTime = 0;

  bgMusic.addEventListener("seeked", () => {
    if (bgMusic.currentTime < 1) {
      lyricIdx = 0;
      lastTime = bgMusic.currentTime;
    }
  });

  function checkTime() {
    if (!heartRunning) return;
    const currentTime = bgMusic.currentTime;

    if (currentTime + 0.3 < lastTime) {
      lyricIdx = 0;
    }
    lastTime = currentTime;

    while (
      lyricIdx < robotLyrics.length &&
      currentTime >= robotLyrics[lyricIdx].atSec
    ) {
      runRobotTypewriter(robotLyrics[lyricIdx].line);
      lyricIdx++;
    }

    requestAnimationFrame(checkTime);
  }

  requestAnimationFrame(checkTime);
}

// ==========================================
// 5. ALUR UTAMA
// ==========================================
function runSequence() {
  let step = 0;

  function nextStep() {
    if (step < sequenceWords.length) {
      morphWord(sequenceWords[step]);
      step++;
      setTimeout(nextStep, 1700);
    } else {
      dots.forEach((dot) => {
        dot.state = "scatter";
        dot.active = true;
      });
      dotCanvas.classList.add("fade-out");
      matrixCanvas.classList.add("dimmed");

      createHeartTrail();
      heartRunning = true;

      setTimeout(() => {
        heartScene.classList.add("show");
        startMusicAndLyrics();
      }, 500);
    }
  }

  setTimeout(nextStep, 400);
}

function render(now) {
  drawMatrixRain();

  dCtx.clearRect(0, 0, width, height);
  const dotRadius = width < 600 ? 2.8 : 3.5;

  dCtx.save();
  dCtx.shadowColor = "rgba(255, 64, 129, 0.85)";
  dCtx.shadowBlur = 8;

  for (let i = 0; i < dots.length; i++) {
    dots[i].update(now);
    dots[i].draw(dotRadius);
  }
  dCtx.restore();

  updateHeartTrail(now);
  requestAnimationFrame(render);
}

window.addEventListener("resize", () => {
  width = matrixCanvas.width = dotCanvas.width = window.innerWidth;
  height = matrixCanvas.height = dotCanvas.height = window.innerHeight;
  columns = Math.floor(width / fontSize);
  drops = Array.from({ length: columns }, () => Math.random() * -(height / fontSize));
});

startBtn.addEventListener("click", () => {
  startOverlay.classList.add("hidden");
  bgMusic.load();
  requestAnimationFrame(render);
  runSequence();
});
