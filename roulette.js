// 🎰 Sunlit Casino Luxury Slot Roulette Engine
const PRIZES = [
  {
    id: "bunny_slippers",
    name: "🌟 [전설] 토끼 슬리퍼",
    desc: "낙하 데미지 100% 무효화 + 이속 10%",
    icon: "🐰✨",
    tier: "legendary",
    tierName: "전설 (0.05%)",
    weight: 0.05
  },
  {
    id: "prismatic_shard",
    name: "무지개 파편",
    desc: "최고급 전설 가공 보석",
    icon: "💎✨",
    tier: "epic",
    tierName: "에픽 (1.50%)",
    weight: 1.50
  },
  {
    id: "diamond_set",
    name: "고급 광물 세트",
    desc: "다이아몬드 8개 + 오므니 지오드 10개",
    icon: "⛏️💎",
    tier: "rare",
    tierName: "레어 (15.00%)",
    weight: 15.00
  },
  {
    id: "feast_set",
    name: "궁극의 미식가 세트",
    desc: "특급 요리 및 고급 음식 모음",
    icon: "🍱🍖",
    tier: "uncommon",
    tierName: "일반 (33.45%)",
    weight: 33.45
  },
  {
    id: "sun_payback",
    name: "선릿 코인 환급",
    desc: "20,000원 ~ 50,000원 계좌 즉시 입금",
    icon: "🪙💰",
    tier: "payback",
    tierName: "페이백 (40.00%)",
    weight: 40.00
  },
  {
    id: "poisonous_potato",
    name: "독이 있는 감자",
    desc: "아쉬운 꽝! 다음 기회에...",
    icon: "🥔💨",
    tier: "dud",
    tierName: "꽝 (10.00%)",
    weight: 10.00
  }
];

const CARD_WIDTH = 140;
const CARD_MARGIN = 10;
const TOTAL_CARD_WIDTH = CARD_WIDTH + (CARD_MARGIN * 2); // 160px
const TOTAL_CARDS = 80;
const WINNER_INDEX = 65; // The card index that stops at center line

let currentBalance = 1500000;
let isSpinning = false;
let audioCtx = null;

// Initialize Web Audio Synthesizer
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTickSound() {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800 + Math.random() * 200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {}
}

function playJackpotSound() {
  if (!audioCtx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.1);
      osc.stop(audioCtx.currentTime + i * 0.1 + 0.5);
    });
  } catch (e) {}
}

function playFailSound() {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(250, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
}

// Populate Roller Cards
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
      // Random filler card based on weight
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
    card.className = `roulette-card tier-${prize.tier}`;
    card.innerHTML = `
      <div class="card-icon">${prize.icon}</div>
      <div class="card-name">${prize.name}</div>
      <div class="card-tier">${prize.tierName}</div>
    `;
    track.appendChild(card);
  }
}

// Spin Animation
function startSpinAnimation(winnerItem) {
  if (isSpinning) return;
  isSpinning = true;
  initAudio();

  const spinBtn = document.getElementById("spinBtn");
  spinBtn.disabled = true;

  // Deduct 100,000 Won from display
  currentBalance = Math.max(0, currentBalance - 100000);
  updateBalanceDisplay();

  // Populate cards with the determined winner at WINNER_INDEX
  populateTrack(winnerItem);

  const track = document.getElementById("rouletteTrack");
  const viewport = document.getElementById("rouletteViewport");
  const viewportWidth = viewport.offsetWidth;

  // Calculate target offset to center WINNER_INDEX card perfectly
  // Target position: Center line is at (viewportWidth / 2)
  // WINNER card center = (WINNER_INDEX * TOTAL_CARD_WIDTH) + (TOTAL_CARD_WIDTH / 2)
  // Random small jitter (-40px ~ +40px) inside card for natural casino feel
  const jitter = (Math.random() - 0.5) * (CARD_WIDTH * 0.6);
  const targetX = -((WINNER_INDEX * TOTAL_CARD_WIDTH) + (TOTAL_CARD_WIDTH / 2) - (viewportWidth / 2) + jitter);

  // Sound ticking loop during animation
  let lastSoundCardIndex = 0;
  const startTime = performance.now();
  const duration = 6500; // 6.5s smooth spin

  function trackSoundProgress() {
    if (!isSpinning) return;
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Cubic bezier ease-out approximation: 1 - Math.pow(1 - progress, 4)
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

  // Apply CSS transition
  setTimeout(() => {
    track.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.8, 0.15, 1)`;
    track.style.transform = `translateX(${targetX}px)`;
    requestAnimationFrame(trackSoundProgress);
  }, 50);

  // When animation finishes
  setTimeout(() => {
    isSpinning = false;
    spinBtn.disabled = false;

    // Show winner modal
    showWinnerModal(winnerItem);

    if (winnerItem.tier === "legendary" || winnerItem.tier === "epic") {
      playJackpotSound();
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
    modalHeader.innerText = "🌟 [전설] 잭팟 당첨! 축하합니다!";
    modalHeader.style.color = "#ff9900";
  } else if (prize.tier === "epic") {
    modalHeader.innerText = "🌈 에픽 보상 당첨!";
    modalHeader.style.color = "#c850c0";
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

// Global hook for Minecraft Client to deliver server RNG result
window.onServerSpinResult = function(winnerId, newBalance) {
  const winnerPrize = PRIZES.find(p => p.id === winnerId) || PRIZES[PRIZES.length - 1];
  if (newBalance !== undefined) currentBalance = newBalance;
  startSpinAnimation(winnerPrize);
};

// Global hook for MCEF Java client to sync balance
window.setPlayerBalance = function(balance) {
  currentBalance = balance;
  updateBalanceDisplay();
};

// MCEF Query or Standalone Trigger
function triggerSpin() {
  if (isSpinning) return;
  if (currentBalance < 100000) {
    alert("은행 계좌 잔고가 부족합니다! (최소 100,000원 필요)");
    return;
  }

  // Signal MCEF via hash change (100% native intercept)
  window.location.hash = "spin_" + Date.now();

  // Also query if mcefQuery is available
  if (window.mcefQuery) {
    window.mcefQuery({
      request: "spin",
      onSuccess: function(response) {
        try {
          const data = JSON.parse(response);
          window.onServerSpinResult(data.winnerId, data.newBalance);
        } catch (e) {
          console.error("MCEF response parse error:", e);
        }
      },
      onFailure: function(errorCode, errorMessage) {
        alert("룰렛 실패: " + errorMessage);
      }
    });
  } else {
    // Standalone Web Test Mode fallback
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
  // Read balance from URL params if provided
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("balance")) {
    currentBalance = parseInt(urlParams.get("balance"), 10) || 0;
  }

  populateTrack();
  updateBalanceDisplay();

  document.getElementById("spinBtn").addEventListener("click", triggerSpin);
  document.getElementById("modalConfirmBtn").addEventListener("click", () => {
    document.getElementById("winnerModal").classList.remove("active");
  });
});
