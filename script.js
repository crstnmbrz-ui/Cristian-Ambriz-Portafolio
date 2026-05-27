const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const transitionLayer = document.querySelector(".page-transition");
const links = [...document.querySelectorAll('a[href^="#"]')];
const sections = [...document.querySelectorAll("main section[id]")];
const revealItems = document.querySelectorAll(".reveal");
const glowItems = document.querySelectorAll(".project-card, .lead-card, .recognition-card, .glass-panel");
const tiltCards = document.querySelectorAll(".tilt-card");
const credentialsModal = document.querySelector("#linkedin-credentials");
const credentialsOpen = document.querySelector("[data-credentials-open]");
const credentialsClose = document.querySelector("[data-credentials-close]");
const caModal = document.querySelector("#ca-natural-modal");
const caOpen = document.querySelector("[data-ca-open]");
const caClose = document.querySelector("[data-ca-close]");
const caCatalog = document.querySelector("[data-ca-catalog]");
const caProducts = document.querySelector("#ca-natural-products");
const canvas = document.querySelector(".ambient-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
const signatureSegments = [
  [[0.36, 0.1], [0.15, 0]],
  [[0.15, 0], [0, 0.2]],
  [[0, 0.2], [0, 0.8]],
  [[0, 0.8], [0.15, 1]],
  [[0.15, 1], [0.36, 0.9]],
  [[0.5, 1], [0.7, 0]],
  [[0.7, 0], [0.92, 1]],
  [[0.58, 0.58], [0.82, 0.58]],
];

function setCanvasSize() {
  const ratio = window.devicePixelRatio || 1;
  const viewportWidth = document.documentElement.clientWidth;
  canvas.width = viewportWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${viewportWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: Math.min(72, Math.floor(viewportWidth / 18)) }, () => ({
    x: Math.random() * viewportWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    size: Math.random() * 1.8 + 0.4,
    alpha: Math.random() * 0.48 + 0.2,
  }));
}

function drawSignature(time, viewportWidth, viewportHeight) {
  const pulse = Math.max(0, Math.sin(time / 3600 - 0.7));
  const alpha = pulse * 0.055;
  if (alpha < 0.004) return;

  const scale = Math.min(128, viewportWidth * 0.13);
  const originX = viewportWidth > 820 ? viewportWidth * 0.79 : viewportWidth * 0.62;
  const originY = viewportHeight * 0.7;

  signatureSegments.forEach(([start, end]) => {
    ctx.strokeStyle = `rgba(120, 210, 255, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(originX + start[0] * scale, originY + start[1] * scale);
    ctx.lineTo(originX + end[0] * scale, originY + end[1] * scale);
    ctx.stroke();

    ctx.fillStyle = `rgba(120, 210, 255, ${alpha * 1.7})`;
    ctx.beginPath();
    ctx.arc(originX + start[0] * scale, originY + start[1] * scale, 1.4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawAmbient(time = 0) {
  const viewportWidth = document.documentElement.clientWidth;
  ctx.clearRect(0, 0, viewportWidth, window.innerHeight);
  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > viewportWidth) particle.vx *= -1;
    if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120, 210, 255, ${particle.alpha})`;
    ctx.fill();

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 120) {
        ctx.strokeStyle = `rgba(120, 210, 255, ${(1 - distance / 120) * 0.14})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  });

  drawSignature(time, viewportWidth, window.innerHeight);
  requestAnimationFrame(drawAmbient);
}

function closeMenu() {
  navToggle.setAttribute("aria-expanded", "false");
  navLinks.classList.remove("open");
  document.body.classList.remove("menu-open");
}

function openDialog(modal) {
  if (typeof modal.showModal === "function") {
    modal.showModal();
    return;
  }

  modal.setAttribute("open", "");
  modal.classList.add("modal-visible");
  document.body.classList.add("dialog-open");
}

function closeDialog(modal) {
  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
  }

  modal.classList.remove("modal-visible");
  document.body.classList.remove("dialog-open");
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navLinks.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    transitionLayer.classList.add("active");
    closeMenu();

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", link.getAttribute("href"));
      transitionLayer.classList.remove("active");
    }, 260);
  });
});

credentialsOpen?.addEventListener("click", () => {
  openDialog(credentialsModal);
});

credentialsClose?.addEventListener("click", () => {
  closeDialog(credentialsModal);
});

credentialsModal?.addEventListener("click", (event) => {
  if (event.target === credentialsModal) closeDialog(credentialsModal);
});

caOpen?.addEventListener("click", () => {
  openDialog(caModal);
});

caClose?.addEventListener("click", () => {
  closeDialog(caModal);
});

caModal?.addEventListener("click", (event) => {
  if (event.target === caModal) closeDialog(caModal);
});

caCatalog?.addEventListener("click", () => {
  caProducts.scrollIntoView({ behavior: "smooth", block: "center" });
});

glowItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    item.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    item.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);

sections.forEach((section) => navObserver.observe(section));

setCanvasSize();
drawAmbient();
window.addEventListener("resize", setCanvasSize);
