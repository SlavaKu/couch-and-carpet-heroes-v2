const carpetCleaningMedia = {
  beforeAfter: [
    { title: "Living Room Carpet Refresh", beforeSrc: "../assets/project-living-room.png", beforeAlt: "Before carpet cleaning in a lived-in Bay Area living room", afterSrc: "../assets/hero-clean-living-room.png", afterAlt: "After carpet cleaning showing a fresher living room carpet" },
    { title: "Office Carpet Traffic Lane Refresh", beforeSrc: "../assets/project-restaurant.png", beforeAlt: "Before commercial carpet cleaning in a high-traffic business space", afterSrc: "../assets/project-office.png", afterAlt: "After commercial carpet cleaning in a brighter office space" },
    { title: "Upholstery and Carpet Area Refresh", beforeSrc: "../assets/before-sofa.png", beforeAlt: "Before cleaning example with visible everyday soil near carpet and upholstery", afterSrc: "../assets/after-sofa.png", afterAlt: "After cleaning example showing a fresher carpet and upholstery area" }
  ],
  gallery: [
    { src: "../assets/hero-clean-living-room.png", alt: "Clean living room carpet after a professional cleaning service", caption: "Living room carpet • Mountain View" },
    { src: "../assets/project-living-room.png", alt: "Residential carpet cleaning example in a Bay Area apartment", caption: "Apartment move-out • Sunnyvale" },
    { src: "../assets/project-office.png", alt: "Clean office carpet after commercial carpet cleaning", caption: "Office carpet cleaning • Palo Alto" },
    { src: "../assets/project-restaurant.png", alt: "Commercial carpet cleaning example for a customer-facing space", caption: "Shared business space • Santa Clara" }
  ],
  imageBreaks: {
    moveReady: { src: "../assets/hero-clean-living-room.png", alt: "Clean carpet in a bright living room ready for move-in or guests", title: "Move-ready rooms", description: "A clean carpet can help a home, rental or apartment feel fresher before the next chapter." },
    cleanVsReplace: { src: "../assets/project-office.png", alt: "Freshly cleaned carpet in a professional office space", title: "A smarter first step", description: "When carpet still has useful life left, professional cleaning can improve the space before replacement is considered." }
  }
};
const defaultServicePageMedia = typeof carpetCleaningMedia !== "undefined" ? carpetCleaningMedia : {
  beforeAfter: [],
  gallery: [],
  imageBreaks: {}
};

const servicePageMedia = window.cmsServicePageMedia || window.servicePageMedia || defaultServicePageMedia;
const servicePageComponentConfig = {
  beforeAfterTitle: "Carpet Cleaning Before & After",
  beforeAfterDescription: "Browse temporary cleaning examples. Final project photos can be swapped in one data list later.",
  beforeAfterControlsLabel: "Carpet cleaning before and after controls",
  beforeAfterDotLabel: "Show carpet cleaning before and after example",
  ...window.servicePageComponentConfig
};

const escapeServiceComponentText = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
})[char]);


const serviceFramingNumber = (value, fallback, min, max) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
};

const serviceFramingStyle = (item, phase) => {
  const shared = serviceFramingNumber(item.shared_zoom ?? item.zoom, 1, 1, 3);
  const phaseZoom = serviceFramingNumber(item[`${phase}_zoom`], 1, 1, 3);
  const x = serviceFramingNumber(item[`${phase}_position_x`], 50, 0, 100);
  const y = serviceFramingNumber(item[`${phase}_position_y`], 50, 0, 100);
  const offsetX = (50 - x) * 1.4;
  const offsetY = (50 - y) * 1.4;
  return `--ba-scale:${shared * phaseZoom}; --ba-x:${offsetX}%; --ba-y:${offsetY}%; object-position:${x}% ${y}%; transform:translate(var(--ba-x), var(--ba-y)) scale(var(--ba-scale)); transform-origin:center center;`;
};

const buildResponsiveImageAttrs = (item, isHero = false) => {
  const srcset = item.srcset ? ` srcset="${escapeServiceComponentText(item.srcset)}"` : "";
  const sizes = item.sizes ? ` sizes="${escapeServiceComponentText(item.sizes)}"` : "";
  const loading = isHero ? "eager" : "lazy";
  const fetchPriority = isHero ? ' fetchpriority="high"' : "";
  return `${srcset}${sizes} loading="${loading}" decoding="async"${fetchPriority}`;
};

const renderServiceBeforeAfter = (root, items) => {
  if (!root || !items.length) return;

  root.innerHTML = `
    <div class="ba-carousel hero-ba-carousel" data-service-ba-carousel>
      <div class="ba-carousel-top">
        <div>
          <h3>${escapeServiceComponentText(servicePageComponentConfig.beforeAfterTitle)}</h3>
          <p>${escapeServiceComponentText(servicePageComponentConfig.beforeAfterDescription)}</p>
        </div>
        <div class="ba-controls" aria-label="${escapeServiceComponentText(servicePageComponentConfig.beforeAfterControlsLabel)}">
          <button class="ba-nav-btn" type="button" data-service-ba-prev aria-label="Previous before and after example">&lsaquo;</button>
          <button class="ba-nav-btn" type="button" data-service-ba-next aria-label="Next before and after example">&rsaquo;</button>
        </div>
      </div>
      <div class="ba-slides">
        ${items.map((item, index) => `
          <article class="ba-slide ${index === 0 ? "is-active" : ""}" data-service-ba-slide aria-hidden="${index === 0 ? "false" : "true"}">
              <div class="ba-slider-card">
                <div class="ba-slider" data-service-ba-slider style="--position: 50%; --position-num: .5;">
                <div class="ba-slider-base">
                  <img class="ba-slider-img" src="${escapeServiceComponentText(item.afterSrc)}" alt="${escapeServiceComponentText(item.afterAlt)}" style="${serviceFramingStyle(item, "after")}"${buildResponsiveImageAttrs({ srcset: item.afterSrcset, sizes: item.sizes }, index === 0)}>
                </div>
                <div class="ba-slider-after">
                  <img class="ba-slider-img" src="${escapeServiceComponentText(item.beforeSrc)}" alt="${escapeServiceComponentText(item.beforeAlt)}" style="${serviceFramingStyle(item, "before")}"${buildResponsiveImageAttrs({ srcset: item.beforeSrcset, sizes: item.sizes }, index === 0)}>
                </div>
                <span class="ba-label ba-label-before">Before</span>
                <span class="ba-label ba-label-after">After</span>
                <div class="ba-divider" aria-hidden="true"></div>
                <input class="ba-range" type="range" min="1" max="99" value="50" aria-label="Compare ${escapeServiceComponentText(item.title)} before and after">
              </div>
              <div class="ba-title">${escapeServiceComponentText(item.title)}</div>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="ba-dots" data-service-ba-dots aria-label="Before and after examples"></div>
    </div>
  `;

  initializeServiceBeforeAfter(root.querySelector("[data-service-ba-carousel]"));
};

const initializeServiceBeforeAfter = (carousel) => {
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll("[data-service-ba-slide]"));
  const prev = carousel.querySelector("[data-service-ba-prev]");
  const next = carousel.querySelector("[data-service-ba-next]");
  const dotsRoot = carousel.querySelector("[data-service-ba-dots]");
  if (!slides.length || !dotsRoot) return;

  carousel.querySelectorAll("[data-service-ba-slider]").forEach((slider) => {
    const range = slider.querySelector(".ba-range");
    if (!range) return;
    const update = () => {
      const value = Number(range.value);
      slider.style.setProperty("--position", `${value}%`);
      slider.style.setProperty("--position-num", String(value / 100));
    };
    range.addEventListener("input", update);
    update();
  });

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "ba-dot";
    dot.setAttribute("aria-label", `${servicePageComponentConfig.beforeAfterDotLabel} ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    dotsRoot.appendChild(dot);
    return dot;
  });

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
  }

  prev?.addEventListener("click", () => showSlide(activeIndex - 1));
  next?.addEventListener("click", () => showSlide(activeIndex + 1));
  showSlide(activeIndex);
};

const getServiceGalleryCaption = (item) => item.caption || item.title || item.description || "Project example";

const renderServiceGallery = (root, items) => {
  if (!root || !items.length) return;
  root.innerHTML = `
    <div class="service-gallery-carousel" data-service-gallery-carousel>
      <button class="service-gallery-arrow service-gallery-arrow-prev" type="button" data-service-gallery-prev aria-label="Previous gallery image">&lsaquo;</button>
      <div class="service-gallery-viewport" data-service-gallery-viewport>
        <div class="service-gallery-track" data-service-gallery-track>
          ${items.map((item, index) => `
            <article class="service-gallery-slide ${index === 0 ? "is-active" : ""}" data-service-gallery-slide aria-hidden="${index === 0 ? "false" : "true"}">
              <img src="${escapeServiceComponentText(item.src)}" alt="${escapeServiceComponentText(item.alt)}"${buildResponsiveImageAttrs(item)}>
            </article>
          `).join("")}
        </div>
      </div>
      <button class="service-gallery-arrow service-gallery-arrow-next" type="button" data-service-gallery-next aria-label="Next gallery image">&rsaquo;</button>
      <div class="service-gallery-footer">
        <p class="service-gallery-caption" data-service-gallery-caption>${escapeServiceComponentText(getServiceGalleryCaption(items[0]))}</p>
        <div class="service-gallery-status">
          <div class="service-gallery-dots" data-service-gallery-dots aria-label="Gallery slides"></div>
          <span class="service-gallery-counter" data-service-gallery-counter>1 / ${items.length}</span>
        </div>
      </div>
    </div>
  `;

  initializeServiceGallery(root.querySelector("[data-service-gallery-carousel]"), items);
};

const initializeServiceGallery = (carousel, items) => {
  if (!carousel || !items.length) return;
  const viewport = carousel.querySelector("[data-service-gallery-viewport]");
  const track = carousel.querySelector("[data-service-gallery-track]");
  const slides = Array.from(carousel.querySelectorAll("[data-service-gallery-slide]"));
  const prev = carousel.querySelector("[data-service-gallery-prev]");
  const next = carousel.querySelector("[data-service-gallery-next]");
  const caption = carousel.querySelector("[data-service-gallery-caption]");
  const counter = carousel.querySelector("[data-service-gallery-counter]");
  const dotsRoot = carousel.querySelector("[data-service-gallery-dots]");
  if (!viewport || !track || !slides.length || !dotsRoot) return;

  let activeIndex = 0;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "service-gallery-dot";
    dot.setAttribute("aria-label", `Show gallery image ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    dotsRoot.appendChild(dot);
    return dot;
  });

  const updateTrackPosition = () => {
    const slide = slides[activeIndex];
    if (!slide) return;
    const viewportCenter = viewport.clientWidth / 2;
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    track.style.transform = `translate3d(${viewportCenter - slideCenter}px, 0, 0)`;
  };

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
    if (caption) caption.textContent = getServiceGalleryCaption(items[activeIndex]);
    if (counter) counter.textContent = `${activeIndex + 1} / ${slides.length}`;
    updateTrackPosition();
  }

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove("is-dragging");
    const delta = currentX - startX;
    if (Math.abs(delta) > 42) showSlide(activeIndex + (delta < 0 ? 1 : -1));
    else updateTrackPosition();
  };

  prev?.addEventListener("click", () => showSlide(activeIndex - 1));
  next?.addEventListener("click", () => showSlide(activeIndex + 1));
  viewport.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    currentX = event.clientX;
    carousel.classList.add("is-dragging");
    viewport.setPointerCapture?.(event.pointerId);
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    currentX = event.clientX;
  });
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("lostpointercapture", endDrag);
  window.addEventListener("resize", updateTrackPosition);
  slides.forEach((slide) => slide.querySelector("img")?.addEventListener("load", updateTrackPosition, { once: true }));
  showSlide(activeIndex);
};

const renderServiceImageBreak = (root, item) => {
  if (!root || !item) return;
  root.innerHTML = `
    <div class="hero-card">
      <img class="hero-photo" src="${escapeServiceComponentText(item.src)}" alt="${escapeServiceComponentText(item.alt)}"${buildResponsiveImageAttrs(item)}>
      <div class="hero-card-body">
        <div>
          <div class="mini-title">${escapeServiceComponentText(item.title)}</div>
          <div class="mini-copy">${escapeServiceComponentText(item.description)}</div>
        </div>
      </div>
    </div>
  `;
};

const renderAllServicePageMedia = (media = servicePageMedia) => {
  renderServiceBeforeAfter(document.querySelector("[data-service-before-after-root]"), media.beforeAfter || []);
  renderServiceGallery(document.querySelector("[data-service-gallery-root]"), media.gallery || []);
  document.querySelectorAll("[data-service-image-break]").forEach((root) => {
    renderServiceImageBreak(root, (media.imageBreaks || {})[root.dataset.serviceImageBreak]);
  });
};

window.renderServicePageMedia = renderAllServicePageMedia;

document.addEventListener("DOMContentLoaded", () => {
  renderAllServicePageMedia(window.cmsServicePageMedia || servicePageMedia);
});
