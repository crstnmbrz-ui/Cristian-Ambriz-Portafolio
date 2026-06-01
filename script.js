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
const spacecraft = document.querySelector(".spacecraft");
const dottedSurfaceCanvases = [...document.querySelectorAll("[data-dotted-surface]")];

let particles = [];
let dottedSurfaces = [];
let dottedSurfaceFrame;
const spacecraftDirections = ["left", "top", "right", "bottom"];
let spacecraftDirectionIndex = Math.floor(Math.random() * spacecraftDirections.length);
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
    alpha: Math.random() * 0.54 + 0.24,
  }));
}

function drawSignature(time, viewportWidth, viewportHeight) {
  const pulse = Math.max(0, Math.sin(time / 3600 - 0.7));
  const alpha = pulse * 0.072;
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
      if (distance < 132) {
        ctx.strokeStyle = `rgba(120, 210, 255, ${(1 - distance / 132) * 0.18})`;
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

function setupDottedSurfaces() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const isMobile = document.documentElement.clientWidth < 640;

  dottedSurfaces = dottedSurfaceCanvases.map((surfaceCanvas) => {
    const host = surfaceCanvas.closest(".about-tech-card") || surfaceCanvas.parentElement;
    const rect = host.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const surfaceCtx = surfaceCanvas.getContext("2d");

    surfaceCanvas.width = width * ratio;
    surfaceCanvas.height = height * ratio;
    surfaceCanvas.style.width = `${width}px`;
    surfaceCanvas.style.height = `${height}px`;
    surfaceCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const amountX = Math.max(22, Math.min(isMobile ? 30 : 46, Math.floor(width / 24)));
    const amountY = Math.max(14, Math.min(isMobile ? 18 : 28, Math.floor(height / 22)));
    const points = [];

    for (let ix = 0; ix < amountX; ix += 1) {
      for (let iy = 0; iy < amountY; iy += 1) {
        points.push({
          ix,
          iy,
          phase: Math.random() * Math.PI * 2,
          drift: Math.random() * 0.8 + 0.35,
        });
      }
    }

    return { canvas: surfaceCanvas, ctx: surfaceCtx, width, height, amountX, amountY, points };
  });
}

function drawDottedSurface(time = 0) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  dottedSurfaces.forEach((surface) => {
    const { ctx: surfaceCtx, width, height, amountX, amountY, points } = surface;
    const spacingX = width / (amountX - 1);
    const spacingY = height / (amountY + 1);
    const timeScale = reduceMotion ? 0 : time * 0.00042;

    surfaceCtx.clearRect(0, 0, width, height);
    surfaceCtx.globalCompositeOperation = "lighter";

    points.forEach((point) => {
      const depth = point.iy / Math.max(1, amountY - 1);
      const wave =
        Math.sin(point.ix * 0.42 + timeScale * 3.2 + point.phase) * (10 + depth * 14) +
        Math.sin(point.iy * 0.66 + timeScale * 2.4) * 7;
      const flow = Math.sin(timeScale * 2 + point.iy * 0.38) * 16;
      const x = point.ix * spacingX + flow - width * 0.03;
      const y = height * 0.2 + point.iy * spacingY + wave;
      const alpha = (0.1 + depth * 0.16) * point.drift;
      const radius = 0.75 + depth * 0.95;

      surfaceCtx.beginPath();
      surfaceCtx.arc(x, y, radius, 0, Math.PI * 2);
      surfaceCtx.fillStyle = `rgba(104, 226, 255, ${alpha})`;
      surfaceCtx.fill();

      if (point.ix % 4 === 0 && point.iy % 3 === 0) {
        surfaceCtx.beginPath();
        surfaceCtx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
        surfaceCtx.fillStyle = `rgba(104, 226, 255, ${alpha * 0.2})`;
        surfaceCtx.fill();
      }
    });

    for (let iy = 0; iy < amountY; iy += 3) {
      surfaceCtx.beginPath();
      for (let ix = 0; ix < amountX; ix += 1) {
        const depth = iy / Math.max(1, amountY - 1);
        const wave = Math.sin(ix * 0.42 + timeScale * 3.2 + iy * 0.2) * (10 + depth * 14);
        const flow = Math.sin(timeScale * 2 + iy * 0.38) * 16;
        const x = ix * spacingX + flow - width * 0.03;
        const y = height * 0.2 + iy * spacingY + wave;
        if (ix === 0) surfaceCtx.moveTo(x, y);
        else surfaceCtx.lineTo(x, y);
      }
      surfaceCtx.strokeStyle = `rgba(73, 199, 255, ${0.025 + (iy / amountY) * 0.035})`;
      surfaceCtx.lineWidth = 1;
      surfaceCtx.stroke();
    }

    surfaceCtx.globalCompositeOperation = "source-over";
  });

  if (!reduceMotion && dottedSurfaces.length) {
    dottedSurfaceFrame = requestAnimationFrame(drawDottedSurface);
  }
}

function startDottedSurfaces() {
  if (!dottedSurfaceCanvases.length) return;

  if (dottedSurfaceFrame) cancelAnimationFrame(dottedSurfaceFrame);
  setupDottedSurfaces();
  drawDottedSurface();
}

function launchSpacecraft() {
  if (!spacecraft || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const direction = spacecraftDirections[spacecraftDirectionIndex];
  spacecraftDirectionIndex = (spacecraftDirectionIndex + 1) % spacecraftDirections.length;

  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight;
  const outside = Math.max(spacecraft.offsetWidth, 150) + 42;
  const horizontalLane = viewportWidth * (0.16 + Math.random() * 0.58);
  const verticalLane = viewportHeight * (0.18 + Math.random() * 0.57);
  const drift = (Math.random() - 0.5) * Math.min(viewportHeight * 0.2, 120);
  const variables = {
    "--ship-duration": `${12 + Math.random() * 4}s`,
    "--ship-opacity": viewportWidth < 640 ? "0.14" : "0.19",
  };

  if (direction === "left" || direction === "right") {
    variables["--ship-start-x"] = direction === "left" ? `${-outside}px` : `${viewportWidth + outside}px`;
    variables["--ship-end-x"] = direction === "left" ? `${viewportWidth + outside}px` : `${-outside}px`;
    variables["--ship-start-y"] = `${verticalLane}px`;
    variables["--ship-end-y"] = `${verticalLane + drift}px`;
    variables["--ship-rotation"] = direction === "left" ? "0deg" : "180deg";
  } else {
    variables["--ship-start-x"] = `${horizontalLane}px`;
    variables["--ship-end-x"] = `${horizontalLane + drift}px`;
    variables["--ship-start-y"] = direction === "top" ? `${-outside}px` : `${viewportHeight + outside}px`;
    variables["--ship-end-y"] = direction === "top" ? `${viewportHeight + outside}px` : `${-outside}px`;
    variables["--ship-rotation"] = direction === "top" ? "90deg" : "-90deg";
  }

  Object.entries(variables).forEach(([name, value]) => spacecraft.style.setProperty(name, value));
  spacecraft.classList.remove("cruising");
  void spacecraft.offsetWidth;
  spacecraft.classList.add("cruising");
}

function startSpacecraftPatrol() {
  if (!spacecraft || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.setTimeout(() => {
    launchSpacecraft();
    window.setInterval(launchSpacecraft, 30000);
  }, 2400);
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
startDottedSurfaces();
startSpacecraftPatrol();
window.addEventListener("resize", () => {
  setCanvasSize();
  startDottedSurfaces();
});
