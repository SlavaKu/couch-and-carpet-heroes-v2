const carpetCleaningMedia = {
  beforeAfter: [
    {
      title: "Living Room Carpet Refresh",
      beforeSrc: "../assets/project-living-room.png",
      beforeAlt: "Before carpet cleaning in a lived-in Bay Area living room",
      afterSrc: "../assets/hero-clean-living-room.png",
      afterAlt: "After carpet cleaning showing a fresher living room carpet"
    },
    {
      title: "Office Carpet Traffic Lane Refresh",
      beforeSrc: "../assets/project-restaurant.png",
      beforeAlt: "Before commercial carpet cleaning in a high-traffic business space",
      afterSrc: "../assets/project-office.png",
      afterAlt: "After commercial carpet cleaning in a brighter office space"
    },
    {
      title: "Upholstery and Carpet Area Refresh",
      beforeSrc: "../assets/before-sofa.png",
      beforeAlt: "Before cleaning example with visible everyday soil near carpet and upholstery",
      afterSrc: "../assets/after-sofa.png",
      afterAlt: "After cleaning example showing a fresher carpet and upholstery area"
    }
  ],
  gallery: [
    {
      src: "../assets/hero-clean-living-room.png",
      alt: "Clean living room carpet after a professional cleaning service",
      title: "Fresh Living Room",
      description: "A clean, comfortable look for everyday family spaces."
    },
    {
      src: "../assets/project-living-room.png",
      alt: "Residential carpet cleaning example in a Bay Area living room",
      title: "Residential Carpet Care",
      description: "Carpet cleaning for rooms, hallways and high-traffic areas."
    },
    {
      src: "../assets/project-office.png",
      alt: "Clean office carpet after commercial carpet cleaning",
      title: "Office Carpet Cleaning",
      description: "A cleaner impression for employees, clients and guests."
    },
    {
      src: "../assets/project-restaurant.png",
      alt: "Commercial carpet cleaning example for a customer-facing space",
      title: "Commercial Spaces",
      description: "Practical cleaning for rentals, offices and shared spaces."
    }
  ],
  imageBreaks: {
    moveReady: {
      src: "../assets/hero-clean-living-room.png",
      alt: "Clean carpet in a bright living room ready for move-in or guests",
      title: "Move-ready rooms",
      description: "A clean carpet can help a home, rental or apartment feel fresher before the next chapter."
    },
    cleanVsReplace: {
      src: "../assets/project-office.png",
      alt: "Freshly cleaned carpet in a professional office space",
      title: "A smarter first step",
      description: "When carpet still has useful life left, professional cleaning can improve the space before replacement is considered."
    }
  }
};

const escapeServiceComponentText = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
})[char]);

const renderServiceBeforeAfter = (root, items) => {
  if (!root || !items.length) return;

  root.innerHTML = `
    <div class="ba-carousel hero-ba-carousel" data-service-ba-carousel>
      <div class="ba-carousel-top">
        <div>
          <h3>Carpet Cleaning Before & After</h3>
          <p>Browse temporary cleaning examples. Final project photos can be swapped in one data list later.</p>
        </div>
        <div class="ba-controls" aria-label="Carpet cleaning before and after controls">
          <button class="ba-nav-btn" type="button" data-service-ba-prev aria-label="Previous carpet cleaning example">&lsaquo;</button>
          <button class="ba-nav-btn" type="button" data-service-ba-next aria-label="Next carpet cleaning example">&rsaquo;</button>
        </div>
      </div>
      <div class="ba-slides">
        ${items.map((item, index) => `
          <article class="ba-slide ${index === 0 ? "is-active" : ""}" data-service-ba-slide aria-hidden="${index === 0 ? "false" : "true"}">
              <div class="ba-slider-card">
                <div class="ba-slider" data-service-ba-slider style="--position: 50%; --position-num: .5;">
                <img class="ba-slider-img" src="${escapeServiceComponentText(item.afterSrc)}" alt="${escapeServiceComponentText(item.afterAlt)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async"${index === 0 ? ' fetchpriority="high"' : ""}>
                <div class="ba-slider-after">
                  <img class="ba-slider-img" src="${escapeServiceComponentText(item.beforeSrc)}" alt="${escapeServiceComponentText(item.beforeAlt)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async"${index === 0 ? ' fetchpriority="high"' : ""}>
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
      <div class="ba-dots" data-service-ba-dots aria-label="Carpet cleaning before and after examples"></div>
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
    dot.setAttribute("aria-label", `Show carpet cleaning before and after example ${index + 1}`);
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

const renderServiceGallery = (root, items) => {
  if (!root || !items.length) return;
  root.innerHTML = `
    <div class="project-grid">
      ${items.map((item) => `
        <article class="project-card">
          <img src="${escapeServiceComponentText(item.src)}" alt="${escapeServiceComponentText(item.alt)}" loading="lazy" decoding="async">
          <div class="project-info">
            <h3>${escapeServiceComponentText(item.title)}</h3>
            <p>${escapeServiceComponentText(item.description)}</p>
          </div>
        </article>
      `).join("")}
    </div>
  `;
};

const renderServiceImageBreak = (root, item) => {
  if (!root || !item) return;
  root.innerHTML = `
    <div class="hero-card">
      <img class="hero-photo" src="${escapeServiceComponentText(item.src)}" alt="${escapeServiceComponentText(item.alt)}" loading="lazy" decoding="async">
      <div class="hero-card-body">
        <div>
          <div class="mini-title">${escapeServiceComponentText(item.title)}</div>
          <div class="mini-copy">${escapeServiceComponentText(item.description)}</div>
        </div>
      </div>
    </div>
  `;
};

document.addEventListener("DOMContentLoaded", () => {
  renderServiceBeforeAfter(document.querySelector("[data-service-before-after-root]"), carpetCleaningMedia.beforeAfter);
  renderServiceGallery(document.querySelector("[data-service-gallery-root]"), carpetCleaningMedia.gallery);
  document.querySelectorAll("[data-service-image-break]").forEach((root) => {
    renderServiceImageBreak(root, carpetCleaningMedia.imageBreaks[root.dataset.serviceImageBreak]);
  });
});
