// 🎰 Sunlit Casino Pachinko & Vegas Slot Machine Engine

const PRIZES = [
  {
    id: "bunny_slippers",
    name: "🌟 [전설] 토끼 슬리퍼",
    desc: "낙하 데미지 100% 무효화 + 이속 10%",
    icon: "🐰✨",
    tier: "legendary",
    badge: "LEGENDARY",
    weight: 0.05
  },
  {
    id: "prismatic_shard",
    name: "무지개 파편",
    desc: "최고급 전설 가공 보석",
    icon: "💎✨",
    tier: "epic",
    badge: "EPIC",
    weight: 1.50
  },
  {
    id: "diamond_set",
    name: "고급 광물 세트",
    desc: "다이아몬드 8개 + 오므니 지오드 10개",
    icon: "⛏️💎",
    tier: "rare",
    badge: "RARE",
    weight: 15.00
  },
  {
    id: "feast_set",
    name: "궁극의 미식가 세트",
    desc: "특급 요리 및 고급 음식 모음",
    icon: "🍱🍖",
    tier: "uncommon",
    badge: "DELUXE",
    weight: 33.45
  },
  {
    id: "sun_payback",
    name: "선릿 코인 환급",
    desc: "20,000원 ~ 50,000원 계좌 즉시 입금",
    icon: "🪙💰",
    tier: "payback",
    badge: "CASHBACK",
    weight: 40.00
  },
  {
    id: "poisonous_potato",
    name: "독이 있는 감자",
    desc: "아쉬운 꽝! 다음 기회에...",
    icon: "🥔💨",
    tier: "dud",
    badge: "MISS",
    weight: 10.00
  }
];

const CARD_WIDTH = 140;
const CARD_MARGIN = 8;
const TOTAL_CARD_WIDTH = CARD_WIDTH + (CARD_MARGIN * 2); // 156px
const TOTAL_CARDS = 80;
const WINNER_INDEX = 65;

let currentBalance = 1500000;
let isSpinning = false;
let audioCtx = null;
let bgmTimer = null;
let bgmEnabled = true;

// ==========================================
// 🎵 Web Audio Synthesizer: Casino BGM & FX
// ==========================================
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (bgmEnabled) startCasinoBGM();
  }
}

// Upbeat Pachinko / Casino Funk BGM Loop
function startCasinoBGM() {
  if (!audioCtx || !bgmEnabled) return;
  if (bgmTimer) clearInterval(bgmTimer);

  // Funk Pachinko Bass & Lead Notes (BPM 128)
  const bassNotes = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63];
  const leadNotes = [523.25, 659.25, 783.99, 1046.50, 880.00, 659.25, 587.33, 523.25];
  let step = 0;

  bgmTimer = setInterval(() => {
    if (!bgmEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      // Bass line
      const bOsc = audioCtx.createOscillator();
      const bGain = audioCtx.createGain();
      bOsc.type = "sawtooth";
      bOsc.frequency.setValueAtTime(bassNotes[step % bassNotes.length], now);
      bGain.gain.setValueAtTime(0.04, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      bOsc.connect(bGain);
      bGain.connect(audioCtx.destination);
      bOsc.start(now);
      bOsc.stop(now + 0.18);

      // Chiptune Pachinko Lead Arp
      if (step % 2 === 0) {
        const lOsc = audioCtx.createOscillator();
        const lGain = audioCtx.createGain();
        lOsc.type = "square";
        lOsc.frequency.setValueAtTime(leadNotes[(step / 2) % leadNotes.length], now);
        lGain.gain.setValueAtTime(0.03, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        lOsc.connect(lGain);
        lGain.connect(audioCtx.destination);
        lOsc.start(now);
        lOsc.stop(now + 0.15);
      }

      // Hi-Hat noise tick
      const hOsc = audioCtx.createOscillator();
      const hGain = audioCtx.createGain();
      hOsc.type = "triangle";
      hOsc.frequency.setValueAtTime(4000, now);
      hGain.gain.setValueAtTime(0.015, now);
      hGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      hOsc.connect(hGain);
      hGain.connect(audioCtx.destination);
      hOsc.start(now);
      hOsc.stop(now + 0.05);

      step = (step + 1) % 16;
    } catch (e) {}
  }, 234); // ~128 BPM 16th groove
}

function stopCasinoBGM() {
  if (bgmTimer) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
}

// Lever Pull Clank Sound
function playLeverSound() {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {}
}

// Crisp Mechanical Reel Tick
function playTickSound() {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1000 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.035);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  } catch (e) {}
}

// Jackpot Winner Fanfare
function playJackpotSound() {
  if (!audioCtx) return;
  try {
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    chord.forEach((freq, idx) => {
      const now = audioCtx.currentTime + idx * 0.08;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  } catch (e) {}
}

function playFailSound() {
  if (!audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.45);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  } catch (e) {}
}

// ==========================================
// 💡 Running Marquee LED Bulbs Generation
// ==========================================
function setupLEDBulbs() {
  const topStrip = document.querySelector(".top-strip");
  const bottomStrip = document.querySelector(".bottom-strip");
  const leftStrip = document.querySelector(".left-strip");
  const rightStrip = document.querySelector(".right-strip");
  const colors = ["gold", "red", "blue"];

  if (topStrip) {
    topStrip.innerHTML = "";
    for (let i = 0; i < 28; i++) {
      const b = document.createElement("div");
      b.className = `bulb ${colors[i % 3]}`;
      b.style.animationDelay = `${(i * 0.08)}s`;
      topStrip.appendChild(b);
    }
  }

  if (bottomStrip) {
    bottomStrip.innerHTML = "";
    for (let i = 0; i < 28; i++) {
      const b = document.createElement("div");
      b.className = `bulb ${colors[(i + 1) % 3]}`;
      b.style.animationDelay = `${(i * 0.08)}s`;
      bottomStrip.appendChild(b);
    }
  }

  if (leftStrip) {
    leftStrip.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const b = document.createElement("div");
      b.className = `bulb ${colors[i % 3]}`;
      b.style.animationDelay = `${(i * 0.15)}s`;
      leftStrip.appendChild(b);
    }
  }

  if (rightStrip) {
    rightStrip.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const b = document.createElement("div");
      b.className = `bulb ${colors[(i + 2) % 3]}`;
      b.style.animationDelay = `${(i * 0.15)}s`;
      rightStrip.appendChild(b);
    }
  }
}

// ==========================================
// 🎰 Populate Roller Track (NO PERCENTAGES)
// ==========================================
function populateTrack(winnerPrize = null) {
  const track = document.getElementById("rouletteTrack");
  track.innerHTML = "";
  track.style.transition = "none";
  track.style.transform = "translateX(0px)";

  for (let i = 0; i < TOTAL_CARDS; i++) {
    let prize;
    if (i === WINNER_INDEX && winnerPrize) {
      prize = winnerPrize;
    } else {
      const rand = Math.random() * 100;
      let cumulative = 0;
      for (const p of PRIZES) {
        cumulative += p.weight;
        if (rand <= cumulative) {
          prize = p;
          break;
        }
      }
      if (!prize) prize = PRIZES[PRIZES.length - 1];
    }

    const card = document.createElement("div");
    card.className = `slot-card tier-${prize.tier}`;
    card.innerHTML = `
      <div class="slot-card-icon">${prize.icon}</div>
      <div class="slot-card-name">${prize.name}</div>
      <div class="slot-card-badge">${prize.badge}</div>
    `;
    track.appendChild(card);
  }
}

// ==========================================
// 🚀 Spin Animation Engine (6.5s Smooth Spin)
// ==========================================
function startSpinAnimation(winnerItem) {
  if (isSpinning) return;
  isSpinning = true;
  initAudio();

  const spinBtn = document.getElementById("spinBtn");
  const leverWrapper = document.getElementById("leverWrapper");
  spinBtn.disabled = true;

  // Pull Lever 3D Spring Effect
  if (leverWrapper) {
    leverWrapper.classList.add("pulled");
    playLeverSound();
    setTimeout(() => leverWrapper.classList.remove("pulled"), 400);
  }

  // Deduct 100,000 Won from display
  currentBalance = Math.max(0, currentBalance - 100000);
  updateBalanceDisplay();

  // Populate cards with the determined winner at WINNER_INDEX
  populateTrack(winnerItem);

  const track = document.getElementById("rouletteTrack");
  const viewport = document.getElementById("rouletteViewport");
  const viewportWidth = viewport.offsetWidth;

  // Calculate target offset to center WINNER_INDEX card perfectly
  const jitter = (Math.random() - 0.5) * (CARD_WIDTH * 0.5);
  const targetX = -((WINNER_INDEX * TOTAL_CARD_WIDTH) + (TOTAL_CARD_WIDTH / 2) - (viewportWidth / 2) + jitter);

  let lastSoundCardIndex = 0;
  const startTime = performance.now();
  const duration = 6500;

  function trackSoundProgress() {
    if (!isSpinning) return;
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    const easedProgress = 1 - Math.pow(1 - progress, 4);
    const currentTranslate = targetX * easedProgress;

    const currentPassedCards = Math.floor(Math.abs(currentTranslate) / TOTAL_CARD_WIDTH);
    if (currentPassedCards > lastSoundCardIndex) {
      lastSoundCardIndex = currentPassedCards;
      playTickSound();
    }

    if (progress < 1) {
      requestAnimationFrame(trackSoundProgress);
    }
  }

  setTimeout(() => {
    track.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.8, 0.15, 1)`;
    track.style.transform = `translateX(${targetX}px)`;
    requestAnimationFrame(trackSoundProgress);
  }, 50);

  setTimeout(() => {
    isSpinning = false;
    spinBtn.disabled = false;

    showWinnerModal(winnerItem);

    if (winnerItem.tier === "legendary" || winnerItem.tier === "epic") {
      playJackpotSound();
      triggerCoinShower();
    } else if (winnerItem.tier === "dud") {
      playFailSound();
    } else {
      playTickSound();
    }
  }, duration + 400);
}

function showWinnerModal(prize) {
  const modal = document.getElementById("winnerModal");
  const modalHeader = document.getElementById("modalHeader");
  const modalIcon = document.getElementById("modalIcon");
  const modalName = document.getElementById("modalName");
  const modalDesc = document.getElementById("modalDesc");

  if (prize.tier === "legendary") {
    modalHeader.innerText = "🌟 [전설 0.05%] 잭팟 당첨!!";
    modalHeader.style.color = "#ffaa00";
  } else if (prize.tier === "epic") {
    modalHeader.innerText = "🌈 에픽 보상 당첨!";
    modalHeader.style.color = "#d946ef";
  } else if (prize.tier === "dud") {
    modalHeader.innerText = "💀 아쉬운 꽝...";
    modalHeader.style.color = "#94a3b8";
  } else {
    modalHeader.innerText = "🎉 당첨 축하합니다!";
    modalHeader.style.color = "#ffd700";
  }

  modalIcon.innerText = prize.icon;
  modalName.innerText = prize.name;
  modalDesc.innerText = prize.desc;

  modal.classList.add("active");
}

function updateBalanceDisplay() {
  document.getElementById("playerBalance").innerText = currentBalance.toLocaleString();
}

// Coin Shower Particle Canvas Effect
function triggerCoinShower() {
  const canvas = document.getElementById("coinCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const coins = [];
  for (let i = 0; i < 70; i++) {
    coins.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 4,
      vy: 4 + Math.random() * 8,
      size: 14 + Math.random() * 12,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2
    });
  }

  let frames = 0;
  function renderCoins() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    coins.forEach(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.rotation += c.vRot;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.font = `${c.size}px serif`;
      ctx.fillText("🪙", -c.size / 2, c.size / 2);
      ctx.restore();
    });

    frames++;
    if (frames < 180) {
      requestAnimationFrame(renderCoins);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(renderCoins);
}

// Global hooks for MCEF Java client
window.onServerSpinResult = function(winnerId, newBalance) {
  const winnerPrize = PRIZES.find(p => p.id === winnerId) || PRIZES[PRIZES.length - 1];
  if (newBalance !== undefined) currentBalance = newBalance;
  startSpinAnimation(winnerPrize);
};

window.setPlayerBalance = function(balance) {
  currentBalance = balance;
  updateBalanceDisplay();
};

function triggerSpin() {
  if (isSpinning) return;
  if (currentBalance < 100000) {
    alert("은행 계좌 잔고가 부족합니다! (최소 100,000원 필요)");
    return;
  }

  window.location.hash = "spin_" + Date.now();

  if (window.mcefQuery) {
    window.mcefQuery({
      request: "spin",
      onSuccess: function(response) {
        try {
          const data = JSON.parse(response);
          window.onServerSpinResult(data.winnerId, data.newBalance);
        } catch (e) {
          console.error("MCEF parse error:", e);
        }
      },
      onFailure: function(code, msg) {
        alert("룰렛 오류: " + msg);
      }
    });
  } else {
    // Standalone Web Test Mode
    setTimeout(() => {
      if (!isSpinning) {
        const rand = Math.random() * 100;
        let cumulative = 0;
        let chosenPrize = PRIZES[PRIZES.length - 1];
        for (const p of PRIZES) {
          cumulative += p.weight;
          if (rand <= cumulative) {
            chosenPrize = p;
            break;
          }
        }
        startSpinAnimation(chosenPrize);
      }
    }, 100);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  setupLEDBulbs();
  populateTrack();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("balance")) {
    currentBalance = parseInt(urlParams.get("balance"), 10) || 0;
  }
  updateBalanceDisplay();

  // Spin Button & Mechanical Lever Triggers
  document.getElementById("spinBtn").addEventListener("click", triggerSpin);
  const lever = document.getElementById("leverWrapper");
  if (lever) lever.addEventListener("click", triggerSpin);

  document.getElementById("modalConfirmBtn").addEventListener("click", () => {
    document.getElementById("winnerModal").classList.remove("active");
  });

  // BGM Toggle
  const bgmBtn = document.getElementById("bgmToggleBtn");
  bgmBtn.addEventListener("click", () => {
    initAudio();
    bgmEnabled = !bgmEnabled;
    if (bgmEnabled) {
      bgmBtn.innerHTML = '<span class="audio-icon">🔊</span> BGM ON';
      bgmBtn.classList.add("active");
      startCasinoBGM();
    } else {
      bgmBtn.innerHTML = '<span class="audio-icon">🔇</span> BGM OFF';
      bgmBtn.classList.remove("active");
      stopCasinoBGM();
    }
  });

  // Start audio on first user click anywhere
  document.body.addEventListener("click", () => {
    initAudio();
  }, { once: true });
});
