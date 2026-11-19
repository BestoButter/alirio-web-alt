document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#navegacion");

function setMenuOpen(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.querySelector("span").textContent = open ? "−" : "+";
  navigation.classList.toggle("menu-open", open);
}

menuButton.hidden = false;
menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});

document.querySelector(".site-header").addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuButton.focus();
  }
});

const form = document.querySelector("#mensaje-form");
const service = document.querySelector("#servicio");
const objective = document.querySelector("#objetivo");
const messageBox = document.querySelector("#mensaje-preview");
const draft = document.querySelector("#borrador");
const status = document.querySelector("#mensaje-estado");
const whatsappContact = document.querySelector("#whatsapp-contacto");
const whatsappMessage = document.querySelector("#whatsapp-mensaje");

const inquiries = {
  gimnasio: "Quisiera información sobre una rutina personalizada para entrenar en gimnasio.",
  casa: "Quisiera información sobre una rutina personalizada para entrenar en casa.",
  alimentacion: "Quisiera información sobre la orientación alimentaria.",
  general: "Quisiera conocer qué asesoría me recomiendas para empezar."
};

function updateDraft() {
  const inquiry = inquiries[service.value];
  if (!inquiry) return;

  const goal = objective.value.trim();
  draft.value = `Hola, Alirio. ${inquiry}${goal ? `\n\nMi objetivo: ${goal}` : ""}\n\n¿Podrías contarme cómo funciona y cuáles son las opciones disponibles?`;
  whatsappMessage.href = `${whatsappContact.href}?text=${encodeURIComponent(draft.value)}`;
  status.textContent = "";
}

form.hidden = false;
form.addEventListener("input", () => {
  if (!messageBox.hidden) updateDraft();
});

for (const link of document.querySelectorAll("[data-service]")) {
  link.addEventListener("click", () => {
    service.value = link.dataset.service;
    if (!messageBox.hidden) updateDraft();
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateDraft();
  messageBox.hidden = false;
  draft.focus();
});

document.querySelector("#copiar-mensaje").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(draft.value);
    status.textContent = "Mensaje copiado. Puedes pegarlo en el chat.";
  } catch {
    draft.focus();
    draft.select();
    status.textContent = "Seleccionamos el mensaje para que puedas copiarlo.";
  }
});

const hero = document.querySelector("#inicio");
const heroVideo = document.querySelector("#hero-video");
const heroControls = document.querySelector("#hero-controls");
const heroToggle = document.querySelector("#hero-toggle");
const clipButtons = Array.from(heroControls.querySelectorAll("[data-hero-clip]"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const clipFiles = {
  peso: "hero-pesas",
  dominadas: "hero-dominadas",
  press: "hero-press"
};

let currentClip = 0;
let heroVisible = false;
let playHero = !reducedMotion.matches;

function setHeroPlayback(enabled) {
  playHero = enabled;
  heroToggle.textContent = enabled ? "Pausar" : "Reproducir";
  syncHeroPlayback();
}

function syncHeroPlayback() {
  if (!playHero || !heroVisible || document.hidden) {
    heroVideo.pause();
    return;
  }

  const source = heroVideo.src;
  heroVideo.play().catch((error) => {
    if (error.name !== "AbortError" && heroVideo.src === source) setHeroPlayback(false);
  });
}

function updateHeroProgress() {
  const { currentSrc, src, currentTime, duration } = heroVideo;
  if (currentSrc !== src || !Number.isFinite(duration) || duration <= 0) return;

  const progress = Math.min(1, currentTime / duration);
  clipButtons[currentClip].style.setProperty("--clip-progress", progress);
}

function selectClip(index) {
  if (index === currentClip) return;

  const previous = clipButtons[currentClip];
  previous.removeAttribute("aria-current");
  previous.style.removeProperty("--clip-progress");
  currentClip = index;
  const selected = clipButtons[currentClip];
  const clip = selected.dataset.heroClip;
  const file = clipFiles[clip];
  selected.setAttribute("aria-current", "true");
  heroVideo.dataset.clip = clip;
  heroVideo.poster = `./assets/${file}-poster.webp`;
  heroVideo.src = `./assets/${file}.mp4`;
  syncHeroPlayback();
}

setHeroPlayback(playHero);
heroControls.hidden = false;
clipButtons.forEach((button, index) => {
  button.addEventListener("click", () => selectClip(index));
  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const target = (index + offset + clipButtons.length) % clipButtons.length;
    selectClip(target);
    clipButtons[target].focus();
  });
});

heroToggle.addEventListener("click", () => setHeroPlayback(!playHero));
heroVideo.addEventListener("timeupdate", updateHeroProgress);
heroVideo.addEventListener("pause", updateHeroProgress);
heroVideo.addEventListener("ended", () => {
  if (playHero) selectClip((currentClip + 1) % clipButtons.length);
});

reducedMotion.addEventListener("change", (event) => setHeroPlayback(!event.matches));
document.addEventListener("visibilitychange", syncHeroPlayback);

const heroObserver = new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  syncHeroPlayback();
}, { threshold: 0.15 });

heroObserver.observe(hero);

const caseViewer = document.querySelector("#case-viewer");

if (typeof caseViewer.showModal === "function") {
  const caseLinks = Array.from(document.querySelectorAll(".case-image-link"));
  const viewerImage = caseViewer.querySelector(".case-viewer-image");
  const viewerTitle = caseViewer.querySelector("#case-viewer-title");
  const viewerPosition = caseViewer.querySelector("#case-viewer-position");
  let activeCase = 0;
  let openedFrom;

  function showCase(index) {
    activeCase = (index + caseLinks.length) % caseLinks.length;
    const link = caseLinks[activeCase];
    viewerImage.src = link.href;
    viewerImage.alt = link.querySelector("img").alt;
    viewerTitle.textContent = link.closest(".case-card").querySelector("h3").textContent;
    viewerPosition.textContent = `${activeCase + 1} de ${caseLinks.length}`;
  }

  caseLinks.forEach((link, index) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      openedFrom = link;
      showCase(index);
      caseViewer.showModal();
    });
  });

  caseViewer.querySelector(".case-viewer-prev").addEventListener("click", () => showCase(activeCase - 1));
  caseViewer.querySelector(".case-viewer-next").addEventListener("click", () => showCase(activeCase + 1));
  caseViewer.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    showCase(activeCase + (event.key === "ArrowRight" ? 1 : -1));
  });
  caseViewer.addEventListener("click", (event) => {
    if (event.target === caseViewer) caseViewer.close();
  });
  caseViewer.addEventListener("close", () => openedFrom.focus({ preventScroll: true }));
}
