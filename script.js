const matrixCanvas = document.getElementById("matrixCanvas");
const mCtx = matrixCanvas.getContext("2d");

const dotCanvas = document.getElementById("dotCanvas");
const dCtx = dotCanvas.getContext("2d");

const heartScene = document.getElementById("heartScene");
const heartTrail = document.getElementById("heartTrail");
const robotLyric = document.getElementById("robotLyric");
const bgMusic = document.getElementById("bgMusic");

let width = (matrixCanvas.width = dotCanvas.width = window.innerWidth);
let height = (matrixCanvas.height = dotCanvas.height = window.innerHeight);

// Urutan pembuka & tulisan di jalur hati
const sequenceWords = ["3", "2", "1", "Jangan", "Sedih", "Yaa", "El"];
const heartPhrase = "Stay Happy El";

// ==========================================
// 1. HUJAN KARAKTER ALA VIDEO 1
// ==========================================
const matrixChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ*+-<>";
const fontSize = 14;
let columns = Math.floor(width / fontSize);
let drops = Array.from({ length: columns }, () => Math.random() * -(height / fontSize));

function drawMatrixRain() {
  mCtx.fillStyle = "rgba(5, 3, 8, 0.16)";
  mCtx.fillRect(0, 0, width, height);

  mCtx.font = `${fontSize}px monospace`;
  for (let i = 0; i < drops.length; i++) {
    const ch = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    const isTip = Math.random() > 0.82;
    mCtx.fillStyle = isTip
      ? "rgba(255, 220, 235, 0.9)"
      : "rgba(235, 95, 155, 0.52)";
    mCtx.fillText(ch, x, y);

    if (y > height && Math.random() > 0.975) {
      drops[i] = Math.random() * -20;
    }
    drops[i] += 0.9;
  }
}

// ==========================================
// 2. DOT-MATRIX JELAS & MENGALIR (VIDEO 1)
// ==========================================
const totalDots = 2400;
const dots = [];

class Dot {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.tx = this.x;
    this.ty = this.y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.active = false;
    this.state = "scatter"; // "scatter" | "form"
    this.seed = Math.random() * Math.PI * 2;
  }

  scatter() {
    this.state = "scatter";
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.8 + Math.random() * 4.2;
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
      const breathe = Math.sin(now * 0.0045 + this.seed) * 0.65;
      this.x += (this.tx - this.x) * 0.19;
      this.y += (this.ty + breathe - this.y) * 0.19;
    } else {
      this.x += this.vx + Math.cos(now * 0.002 + this.seed) * 0.45;
      this.y += this.vy + Math.sin(now * 0.002 + this.seed) * 0.45;
      this.vx *= 0.96;
      this.vy *= 0.96;
    }
  }

  draw(dotRadius) {
    if (!this.active && this.state === "form") return;
    dCtx.beginPath();
    dCtx.arc(this.x, this.y, dotRadius, 0, Math.PI * 2);
    dCtx.fillStyle = "#fff7dc";
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
    ? Math.min(width, height) * 0.44
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
    : (width < 600 ? 7 : 8);

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
  }, 260);
}

// ==========================================
// 3. HATI TEKS BEROMBAK & MENGALIR (VIDEO 2)
// ==========================================
const totalHeartItems = 84;
const heartItems = [];

function createHeartTrail() {
  heartTrail.innerHTML = "";
  heartItems.length = 0;

  for (let i = 0; i < totalHeartItems; i++) {
    const love = document.createElement("div");
    love.className = "love";

    const horizontal = document.createElement("div");
    horizontal.className = "love_horizontal";

    const vertical = document.createElement("div");
    vertical.className = "love_vertical";

    const word = document.createElement("div");
    word.className = "love_word";
    word.textContent = heartPhrase;

    vertical.appendChild(word);
    horizontal.appendChild(vertical);
    love.appendChild(horizontal);
    heartTrail.appendChild(love);

    heartItems.push({
      horizontal,
      vertical,
      word,
      baseT: (i / totalHeartItems) * Math.PI * 2
    });
  }
}

let heartAngleOffset = 0;
let heartRunning = false;

function updateHeartTrail(now) {
  if (!heartRunning) return;

  heartAngleOffset += 0.013;
  const baseScale = Math.min(width, height) * 0.0235;
  const waveClock = now * 0.004;

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

    const waveOffset = Math.sin(waveClock + i * 0.42) * 16;
    const xPx = hx * baseScale;
    const yPx = hy * baseScale + waveOffset;

    item.horizontal.style.transform = `translateX(${xPx.toFixed(2)}px)`;
    item.vertical.style.transform = `translateY(${yPx.toFixed(2)}px)`;
  }
}

// ==========================================
// 4. LAGU1.MP3 + LIRIK GAYA ROBOT
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
  if (!bgMusic) return;

  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {
    const resumeOnTap = () => {
      bgMusic.play().catch(() => {});
      window.removeEventListener("pointerdown", resumeOnTap);
      window.removeEventListener("touchstart", resumeOnTap);
    };
    window.addEventListener("pointerdown", resumeOnTap, { once: true });
    window.addEventListener("touchstart", resumeOnTap, { once: true });
  });

  let lyricIdx = 0;

  function syncWithAudio() {
    if (!heartRunning) return;

    const currentTime = bgMusic.paused ? 0 : bgMusic.currentTime;

    while (
      lyricIdx < robotLyrics.length &&
      currentTime >= robotLyrics[lyricIdx].atSec
    ) {
      runRobotTypewriter(robotLyrics[lyricIdx].line);
      lyricIdx++;
    }

    if (!bgMusic.ended) {
      requestAnimationFrame(syncWithAudio);
    }
  }

  requestAnimationFrame(syncWithAudio);
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
      setTimeout(nextStep, 1450);
    } else {
      dots.forEach((dot) => {
        dot.state = "scatter";
        dot.active = true;
      });
      dotCanvas.classList.add("fade-out");

      createHeartTrail();
      heartRunning = true;

      setTimeout(() => {
        heartScene.classList.add("show");
        startMusicAndLyrics();
      }, 450);
    }
  }

  setTimeout(nextStep, 500);
}

function render(now) {
  drawMatrixRain();

  dCtx.clearRect(0, 0, width, height);
  const dotRadius = width < 600 ? 2.6 : 3.4;

  dCtx.save();
  dCtx.fillStyle = "#fff8dc";
  dCtx.shadowColor = "rgba(255, 200, 120, 0.75)";
  dCtx.shadowBlur = 7;

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

requestAnimationFrame(render);
runSequence();
