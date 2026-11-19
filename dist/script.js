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
const coachVideo = document.querySelector("#coach-video");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const clipFiles = {
  peso: "hero-pesas",
  dominadas: "hero-dominadas",
  press: "hero-press"
};

let currentClip = 0;
let heroVisible = false;
let playHero = !reducedMotion.matches;

function syncHeroPlayback() {
  if (playHero && heroVisible && !document.hidden) {
    heroVideo.play().catch(() => {});
  } else {
    heroVideo.pause();
  }
}

function selectClip(index) {
  if (index === currentClip) return;

  clipButtons[currentClip].removeAttribute("aria-current");
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

heroToggle.addEventListener("click", () => {
  playHero = heroVideo.paused;
  syncHeroPlayback();
});

heroVideo.addEventListener("play", () => { heroToggle.textContent = "Pausar"; });
heroVideo.addEventListener("pause", () => { heroToggle.textContent = "Reproducir"; });
heroVideo.addEventListener("ended", () => {
  if (playHero) selectClip((currentClip + 1) % clipButtons.length);
});

reducedMotion.addEventListener("change", (event) => {
  playHero = !event.matches;
  syncHeroPlayback();
  if (event.matches) coachVideo.pause();
});
document.addEventListener("visibilitychange", syncHeroPlayback);

const videoObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.target === hero) {
      heroVisible = entry.isIntersecting;
      syncHeroPlayback();
    } else if (entry.isIntersecting && !reducedMotion.matches) {
      coachVideo.play().catch(() => {});
      videoObserver.unobserve(coachVideo);
    }
  }
}, { threshold: 0.15 });

videoObserver.observe(hero);
videoObserver.observe(coachVideo);
