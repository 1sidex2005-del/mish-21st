/* =========================================================
   MISH — 21st Birthday Site — shared behaviour
   ========================================================= */

/* ---------- Nav active state ---------- */
(function highlightNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
})();

/* ---------- Background music, persists across page navigation ----------
   Uses localStorage to remember play/pause + position so the song keeps
   flowing as Mish clicks between pages, like one continuous experience.
   Drop your track at assets/music/bg.mp3 (see README for details).
------------------------------------------------------------------- */
(function setupMusic() {
  const audio = document.getElementById("bg-music");
  const toggle = document.getElementById("music-toggle");
  if (!audio || !toggle) return;

  const STATE_KEY = "mish21_music_state"; // "playing" | "paused"
  const TIME_KEY = "mish21_music_time";

  const savedTime = parseFloat(localStorage.getItem(TIME_KEY) || "0");
  if (!isNaN(savedTime)) audio.currentTime = savedTime;

  const savedState = localStorage.getItem(STATE_KEY);

  function setPlayingUI(isPlaying) {
    toggle.classList.toggle("is-playing", isPlaying);
    toggle.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
  }

  function tryPlay() {
    audio.play().then(() => setPlayingUI(true)).catch(() => {
      // Autoplay blocked until the user interacts — that's fine.
      setPlayingUI(false);
    });
  }

  if (savedState === "playing") {
    tryPlay();
  } else {
    setPlayingUI(false);
  }

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      tryPlay();
      localStorage.setItem(STATE_KEY, "playing");
    } else {
      audio.pause();
      setPlayingUI(false);
      localStorage.setItem(STATE_KEY, "paused");
    }
  });

  setInterval(() => {
    if (!audio.paused) localStorage.setItem(TIME_KEY, String(audio.currentTime));
  }, 1000);

  window.addEventListener("beforeunload", () => {
    localStorage.setItem(TIME_KEY, String(audio.currentTime));
  });
})();

/* ---------- Gentle gold confetti burst (used on the landing hero) ---------- */
function fireConfetti(container, count = 26) {
  if (!container) return;
  const colors = ["#c6a15b", "#e8b4a0", "#ecdcb2", "#97753a"];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.6 + "s";
    piece.style.animationDuration = 2.6 + Math.random() * 1.6 + "s";
    piece.style.width = piece.style.height = 6 + Math.random() * 6 + "px";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4600);
  }
}

/* ---------- Scratch card reveal (used on message.html) ----------
   Draws a gold foil layer on a canvas over the hidden message and
   clears pixels as Mish scratches with mouse or finger.
------------------------------------------------------------------- */
function setupScratchCard(canvasId, thresholdPercent = 55, onReveal) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let revealed = false;

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawFoil();
  }

  function drawFoil() {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#e8d5a8");
    grad.addColorStop(0.5, "#c6a15b");
    grad.addColorStop(1, "#97753a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 15px 'Poppins', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("scratch here ✦", canvas.width / 2, canvas.height / 2);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function scratch(e) {
    const { x, y } = getPos(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    checkProgress();
  }

  function checkProgress() {
    if (revealed) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 4 * 20) {
      if (data[i] === 0) cleared++;
    }
    const total = data.length / (4 * 20);
    if ((cleared / total) * 100 > thresholdPercent) {
      revealed = true;
      canvas.style.transition = "opacity 0.6s ease";
      canvas.style.opacity = "0";
      setTimeout(() => (canvas.style.display = "none"), 650);
      if (onReveal) onReveal();
    }
  }

  let drawing = false;
  canvas.addEventListener("mousedown", () => (drawing = true));
  canvas.addEventListener("mouseup", () => (drawing = false));
  canvas.addEventListener("mouseleave", () => (drawing = false));
  canvas.addEventListener("mousemove", (e) => drawing && scratch(e));

  canvas.addEventListener("touchstart", (e) => { drawing = true; scratch(e); }, { passive: true });
  canvas.addEventListener("touchend", () => (drawing = false));
  canvas.addEventListener("touchmove", (e) => { if (drawing) { scratch(e); e.preventDefault(); } }, { passive: false });

  window.addEventListener("resize", sizeCanvas);
  sizeCanvas();
}

/* ---------- Birthday wish wall ----------
   If firebase-config.js has been filled in with real project keys,
   wishes are stored in Firestore so EVERYONE sees the same shared wall,
   no matter what device or app they opened the link from.
   If Firebase isn't configured yet, it quietly falls back to
   localStorage (private to each browser) so nothing breaks.
------------------------------------------------------------------- */
(function setupWishWall() {
  const form = document.getElementById("wish-form");
  const list = document.getElementById("wish-list");
  if (!form || !list) return;

  const usingFirestore = typeof window.mishDB !== "undefined";
  const KEY = "mish21_wishes";

  function renderWishes(wishes) {
    list.innerHTML = "";
    if (wishes.length === 0) {
      list.innerHTML = '<p class="wish-empty">No wishes yet — be the first to leave one for Mish 🤍</p>';
      return;
    }
    wishes.forEach((w) => {
      const card = document.createElement("div");
      card.className = "wish-card";
      card.innerHTML = `<p class="wish-text"></p><span class="wish-from"></span>`;
      card.querySelector(".wish-text").textContent = w.text;
      card.querySelector(".wish-from").textContent = "— " + (w.name || "Anonymous");
      list.appendChild(card);
    });
  }

  if (usingFirestore) {
    // Shared wall: live-updates for every visitor as new wishes come in
    window.mishDB.collection("wishes").orderBy("at", "desc").onSnapshot(
      (snapshot) => {
        const wishes = snapshot.docs.map((doc) => doc.data());
        renderWishes(wishes);
      },
      (err) => {
        console.error("Firestore read failed, falling back to local wishes.", err);
        renderWishes(loadLocal());
      }
    );

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector("#wish-name").value.trim();
      const text = form.querySelector("#wish-text").value.trim();
      if (!text) return;
      window.mishDB.collection("wishes").add({ name, text, at: Date.now() })
        .then(() => form.reset())
        .catch((err) => alert("Couldn't post your wish — check your internet and try again."));
    });

    return;
  }

  // ---- Fallback: local-only (used only if Firebase isn't set up yet) ----
  function loadLocal() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]").slice().reverse();
    } catch {
      return [];
    }
  }

  function saveLocal(wishes) {
    localStorage.setItem(KEY, JSON.stringify(wishes));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("#wish-name").value.trim();
    const text = form.querySelector("#wish-text").value.trim();
    if (!text) return;
    const wishes = JSON.parse(localStorage.getItem(KEY) || "[]");
    wishes.push({ name, text, at: Date.now() });
    saveLocal(wishes);
    form.reset();
    renderWishes(loadLocal());
  });

  renderWishes(loadLocal());
})();
