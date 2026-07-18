(() => {
  const SUPABASE_REST_URL = "https://gxtrpycepqnecoyxnonl.supabase.co/rest/v1";
  const SUPABASE_KEY = "sb_publishable_Sx1dm7TzcIntHfB6lrFctA_xoKF_EYU";
  const ROOT_PATH = "/couch-and-carpet-heroes-v2";
  const pageMap = [
    { page_key: "home", path: "/", title: "Home" },
    { page_key: "carpet-cleaning", path: "/carpet-cleaning/", title: "Carpet Cleaning" },
    { page_key: "upholstery-cleaning", path: "/upholstery-cleaning/", title: "Upholstery Cleaning" },
    { page_key: "mattress-cleaning", path: "/mattress-cleaning/", title: "Mattress Cleaning" },
    { page_key: "area-rug-cleaning", path: "/area-rug-cleaning/", title: "Area Rug Cleaning" }
  ];

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const normalizePath = () => {
    let path = window.location.pathname.replace(/\/index\.html$/, "/");
    if (path.startsWith(ROOT_PATH)) path = path.slice(ROOT_PATH.length) || "/";
    if (!path.endsWith("/")) path += "/";
    return path;
  };

  const currentPage = () => pageMap.find((page) => page.path === normalizePath()) || pageMap[0];

  const cmsFetch = async (table, query = "") => {
    const response = await fetch(`${SUPABASE_REST_URL}/${table}${query}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!response.ok) throw new Error(`CMS ${table} request failed: ${response.status}`);
    return response.json();
  };

  const slug = (value, fallback) => {
    const text = String(value || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return text || fallback;
  };

  const inferSectionType = (section) => {
    if (section.classList.contains("hero")) return "hero";
    if (section.classList.contains("reviews")) return "reviews";
    if (section.classList.contains("gallery") || section.querySelector("[data-service-gallery-root]")) return "gallery";
    if (section.classList.contains("booking-band")) return "final_cta";
    if (section.querySelector(".faq-grid")) return "faq";
    if (section.querySelector("[data-service-before-after-root]")) return "before_after";
    const text = section.textContent.toLowerCase();
    if (text.includes("related services")) return "related_services";
    if (text.includes("areas we serve") || text.includes("service area")) return "service_areas";
    if (text.includes("written by")) return "author";
    if (section.querySelector("[data-service-image-break]")) return "image_break";
    return "content";
  };

  const annotateSections = () => {
    const main = document.querySelector("main");
    if (!main) return [];
    const sections = Array.from(main.children).filter((node) => node.matches?.("section")).map((section, index) => {
      const heading = section.querySelector("h1,h2,h3")?.textContent?.trim();
      const key = section.dataset.cmsSection || `${String(index + 1).padStart(2, "0")}-${slug(heading, "section")}`;
      section.dataset.cmsSection = key;
      section.dataset.cmsType = section.dataset.cmsType || inferSectionType(section);
      return section;
    });
    const footer = document.querySelector("footer");
    if (footer) {
      footer.dataset.cmsSection = "footer";
      footer.dataset.cmsType = "footer";
      sections.push(footer);
    }
    return sections;
  };

  const editableTextNodes = (root) => Array.from(root.querySelectorAll("h1,h2,h3,h4,p,li,summary,a.btn,a:not(.brand):not(.phone-link),button.btn,.eyebrow,.lead,.footer-bottom,.top-note,.top-actions span,.breadcrumbs span[aria-current='page']"))
    .filter((node) => !node.closest("script,style,.ba-slider,.service-gallery-dots,.ba-dots,.calculator-layout,.estimate-modal,.review-card,.reviews-carousel,.review-modal"));

  const editableLinks = (root) => Array.from(root.querySelectorAll("a[href]"))
    .filter((node) => !node.closest(".calculator-layout,.estimate-modal"));

  const editableImages = (root) => Array.from(root.querySelectorAll("img"))
    .filter((node) => !node.closest(".calculator-layout,.estimate-modal"));

  const setMeta = (selector, attr, value) => {
    if (!value) return;
    const node = document.querySelector(selector);
    if (node) node.setAttribute(attr, value);
  };

  const applySeo = (page) => {
    const seo = page?.seo || {};
    if (seo.title) document.title = seo.title;
    setMeta("meta[name='description']", "content", seo.description);
    setMeta("link[rel='canonical']", "href", seo.canonical);
    setMeta("meta[property='og:title']", "content", seo.ogTitle || seo.title);
    setMeta("meta[property='og:description']", "content", seo.ogDescription || seo.description);
    setMeta("meta[property='og:image']", "content", seo.ogImage);
    setMeta("meta[property='og:url']", "content", seo.ogUrl || seo.canonical);
    setMeta("meta[name='twitter:title']", "content", seo.twitterTitle || seo.ogTitle || seo.title);
    setMeta("meta[name='twitter:description']", "content", seo.twitterDescription || seo.ogDescription || seo.description);
    setMeta("meta[name='twitter:image']", "content", seo.twitterImage || seo.ogImage);
    if (page?.schema_json && Object.keys(page.schema_json).length) {
      const script = document.querySelector("script[type='application/ld+json']");
      if (script) script.textContent = JSON.stringify(page.schema_json);
    }
  };

  const renderFaq = (section, faqs = []) => {
    const root = section.querySelector(".faq-grid");
    if (!root || !faqs.length) return;
    root.innerHTML = faqs.map((faq, index) => `
      <details ${index === 0 ? "open" : ""}>
        <summary>${escapeHtml(faq.question)}</summary>
        <p>${escapeHtml(faq.answer)}</p>
      </details>
    `).join("");
  };

  const mediaSrc = (item, phase) => item[`${phase}Src`] || item[`${phase}_image_url`] || "";
  const mediaAlt = (item, phase) => item[`${phase}Alt`] || item[`${phase}_alt`] || `${phase} cleaning image`;
  const framingStyle = (item, phase) => {
    const shared = Number(item.shared_zoom ?? item.zoom ?? 1) || 1;
    const phaseZoom = Number(item[`${phase}_zoom`] ?? 1) || 1;
    const x = Number(item[`${phase}_position_x`] ?? 50);
    const y = Number(item[`${phase}_position_y`] ?? 50);
    const offsetX = (50 - x) * 1.4;
    const offsetY = (50 - y) * 1.4;
    return `--ba-scale:${shared * phaseZoom}; --ba-x:${offsetX}%; --ba-y:${offsetY}%; object-position:${x}% ${y}%; transform:translate(var(--ba-x), var(--ba-y)) scale(var(--ba-scale)); transform-origin:center center;`;
  };

  const renderHomepageBeforeAfter = (section, items = []) => {
    const carousel = section.querySelector("[data-ba-carousel]");
    const slidesRoot = carousel?.querySelector(".ba-slides");
    if (!carousel || !slidesRoot || !items.length) return;
    slidesRoot.setAttribute("aria-busy", "false");
    slidesRoot.innerHTML = items.map((item, index) => `
      <article class="ba-slide ${index === 0 ? "is-active" : ""}" data-ba-slide>
        <div class="ba-slider-card">
          <div class="ba-slider" data-ba-slider style="--position: 50%; --position-num: .5;">
            <div class="ba-slider-base">
              <img class="ba-slider-img" src="${escapeHtml(mediaSrc(item, "after"))}" alt="${escapeHtml(mediaAlt(item, "after"))}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async" style="${framingStyle(item, "after")}">
            </div>
            <div class="ba-slider-after">
              <img class="ba-slider-img" src="${escapeHtml(mediaSrc(item, "before"))}" alt="${escapeHtml(mediaAlt(item, "before"))}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async" style="${framingStyle(item, "before")}">
            </div>
            <span class="ba-label ba-label-before">Before</span>
            <span class="ba-label ba-label-after">After</span>
            <div class="ba-divider" aria-hidden="true"></div>
            <input class="ba-range" type="range" min="1" max="99" value="50" aria-label="Compare ${escapeHtml(item.title || "cleaning result")} before and after">
          </div>
          <div class="ba-title">${escapeHtml(item.title || item.caption || "Before & After Result")}</div>
        </div>
      </article>
    `).join("");
    carousel.querySelectorAll("[data-ba-slider]").forEach((slider) => {
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
    window.initializeBeforeAfterCarousel?.(carousel);
  };

  const applyServicePageMedia = (media = {}) => {
    if (!(media.beforeAfter?.length || media.gallery?.length || media.imageBreaks)) return;
    const payload = {
      beforeAfter: media.beforeAfter || window.cmsServicePageMedia?.beforeAfter || window.servicePageMedia?.beforeAfter || [],
      gallery: media.gallery || window.cmsServicePageMedia?.gallery || window.servicePageMedia?.gallery || [],
      imageBreaks: media.imageBreaks || window.cmsServicePageMedia?.imageBreaks || window.servicePageMedia?.imageBreaks || {}
    };
    window.cmsServicePageMedia = payload;
    window.renderServicePageMedia?.(payload);
  };

  const initializeReviewCarousel = (section) => {
    const carousel = section.querySelector?.("[data-reviews-carousel]") || section;
    const track = carousel?.querySelector?.("[data-reviews-track]");
    if (!carousel || !track || carousel.dataset.reviewsInitialized === "true") return;
    carousel.dataset.reviewsInitialized = "true";
    const slides = Array.from(track.querySelectorAll("[data-review-slide],.review-card"));
    const counter = carousel.querySelector("[data-reviews-counter]");
    let active = 0;
    const visibleCount = () => window.innerWidth <= 620 ? 1 : (window.innerWidth <= 1080 ? 2 : 3);
    const update = () => {
      const max = Math.max(0, slides.length - visibleCount());
      active = Math.min(active, max);
      track.style.setProperty("--review-index", active);
      if (counter) counter.textContent = `${Math.min(active + 1, slides.length)} of ${slides.length}`;
      const prev = carousel.querySelector("[data-reviews-prev]");
      const next = carousel.querySelector("[data-reviews-next]");
      if (prev) prev.disabled = active <= 0;
      if (next) next.disabled = active >= max;
    };
    carousel.querySelector("[data-reviews-prev]")?.addEventListener("click", () => { active = Math.max(0, active - 1); update(); });
    carousel.querySelector("[data-reviews-next]")?.addEventListener("click", () => { active += 1; update(); });
    window.addEventListener("resize", update, { passive: true });
    update();
  };

  const renderReviews = (section, data = {}) => {
    const carousel = section.querySelector("[data-reviews-carousel]");
    if (!carousel) return;
    const reviews = (data.items || []).filter((review) => review.is_visible !== false);
    if (!reviews.length) return;
    const profileUrl = (source) => source === "Yelp" ? (data.yelpUrl || "#reviews") : (data.googleUrl || "#reviews");
    carousel.innerHTML = `
      <div class="reviews-viewport" data-reviews-viewport>
        <div class="review-grid" data-reviews-track>
          ${reviews.map((review, index) => {
            const source = review.source === "Yelp" ? "Yelp" : "Google";
            const url = profileUrl(source);
            const rating = Math.min(5, Math.max(1, Number(review.rating || 5)));
            return `
              <article class="review-card" data-review-slide data-source="${escapeHtml(source)}">
                <a class="review-badge" href="${escapeHtml(url)}" ${url === "#reviews" ? "" : `target="_blank" rel="noopener"`} data-review-source="${source.toLowerCase()}">${escapeHtml(source)}</a>
                <div class="stars" aria-label="${rating} out of 5 stars">${"&#9733;".repeat(rating)}${"&#9734;".repeat(5 - rating)}</div>
                <p class="review-text">${escapeHtml(review.text || "")}</p>
                ${(review.text || "").length > 150 ? `<button class="review-read-more" type="button" data-review-read="${index}">Read more</button>` : ""}
                <strong>${escapeHtml(review.name || "Customer")}</strong>
              </article>
            `;
          }).join("")}
        </div>
      </div>
      <div class="reviews-controls">
        <button class="reviews-arrow" type="button" data-reviews-prev aria-label="Previous review">&larr;</button>
        <span class="reviews-counter" data-reviews-counter></span>
        <button class="reviews-arrow" type="button" data-reviews-next aria-label="Next review">&rarr;</button>
      </div>
      <div class="review-modal" data-review-modal hidden>
        <div class="review-modal-panel" role="dialog" aria-modal="true" aria-label="Full customer review">
          <button class="review-modal-close" type="button" data-review-close aria-label="Close review">&times;</button>
          <div class="review-modal-source" data-review-modal-source></div>
          <div class="stars" data-review-modal-stars></div>
          <p data-review-modal-text></p>
          <strong data-review-modal-name></strong>
        </div>
      </div>
    `;
    const track = carousel.querySelector("[data-reviews-track]");
    const counter = carousel.querySelector("[data-reviews-counter]");
    let active = 0;
    const visibleCount = () => window.innerWidth <= 720 ? 1 : (window.innerWidth <= 1080 ? 2 : 3);
    const update = () => {
      const max = Math.max(0, reviews.length - visibleCount());
      active = Math.min(active, max);
      track.style.setProperty("--review-index", active);
      counter.textContent = `${Math.min(active + 1, reviews.length)} of ${reviews.length}`;
      carousel.querySelector("[data-reviews-prev]").disabled = active <= 0;
      carousel.querySelector("[data-reviews-next]").disabled = active >= max;
    };
    carousel.querySelector("[data-reviews-prev]")?.addEventListener("click", () => { active = Math.max(0, active - 1); update(); });
    carousel.querySelector("[data-reviews-next]")?.addEventListener("click", () => { active += 1; update(); });
    const modal = carousel.querySelector("[data-review-modal]");
    carousel.querySelectorAll("[data-review-read]").forEach((button) => {
      button.addEventListener("click", () => {
        const review = reviews[Number(button.dataset.reviewRead)];
        if (!review || !modal) return;
        const rating = Math.min(5, Math.max(1, Number(review.rating || 5)));
        modal.querySelector("[data-review-modal-source]").textContent = review.source === "Yelp" ? "Yelp review" : "Google review";
        modal.querySelector("[data-review-modal-stars]").innerHTML = "&#9733;".repeat(rating) + "&#9734;".repeat(5 - rating);
        modal.querySelector("[data-review-modal-text]").textContent = review.text || "";
        modal.querySelector("[data-review-modal-name]").textContent = review.name || "Customer";
        modal.hidden = false;
      });
    });
    modal?.querySelector("[data-review-close]")?.addEventListener("click", () => { modal.hidden = true; });
    modal?.addEventListener("click", (event) => { if (event.target === modal) modal.hidden = true; });
    window.addEventListener("resize", update, { passive: true });
    update();
  };

  const applyMediaToSection = (section, media = {}) => {
    if (media.beforeAfter?.length && section.querySelector("[data-ba-carousel]")) {
      renderHomepageBeforeAfter(section, media.beforeAfter);
    }
    applyServicePageMedia(media);

    (media.images || []).forEach((item, index) => {
      const img = editableImages(section)[index];
      if (!img) return;
      if (item.src) img.src = item.src;
      if (item.alt !== undefined) img.alt = item.alt;
      if (item.srcset !== undefined) {
        if (item.srcset) img.srcset = item.srcset;
        else img.removeAttribute("srcset");
      }
    });
  };

  const applySectionContent = (section, content = {}) => {
    const fields = content.fields || {};
    const texts = editableTextNodes(section);
    Object.entries(fields).forEach(([key, field]) => {
      const value = field?.value;
      if (value === undefined || value === null) return;
      const [kind, indexText, attr] = key.split(".");
      const index = Number(indexText);
      if (kind === "text") {
        const node = texts[index];
        if (node) node.textContent = value;
      }
      if (kind === "link") {
        const node = editableLinks(section)[index];
        if (node && attr === "href") node.setAttribute("href", value);
      }
      if (kind === "image") {
        const node = editableImages(section)[index];
        if (node && attr === "src") node.setAttribute("src", value);
        if (node && attr === "alt") node.setAttribute("alt", value);
      }
    });
    renderFaq(section, content.faqs || []);
    renderReviews(section, content.reviews || {});
    applyMediaToSection(section, content.media || {});
  };

  const createGenericSection = (row) => {
    const fields = row.content?.fields || {};
    const values = Object.values(fields).map((field) => field?.value).filter(Boolean);
    const section = document.createElement("section");
    section.dataset.cmsSection = row.section_key;
    section.dataset.cmsType = row.section_type || "content";
    section.innerHTML = `
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(values[0] || row.label || "New Section")}</h2>
          ${values[1] ? `<p>${escapeHtml(values[1])}</p>` : ""}
        </div>
      </div>
    `;
    return section;
  };

  const applySections = (rows) => {
    const main = document.querySelector("main");
    const sections = annotateSections();
    const byKey = new Map(sections.map((section) => [section.dataset.cmsSection, section]));
    const ordered = [...rows].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    ordered.forEach((row) => {
      const original = byKey.get(row.section_key);
      const source = row.content?.duplicate_of ? byKey.get(row.content.duplicate_of) : original;
      if (!main) return;
      if (!original && row.section_key === "footer") return;
      if (!original && row.section_type === "before_after" && row.content?.media?.beforeAfter?.length) {
        applyServicePageMedia(row.content.media);
        return;
      }
      const section = row.content?.duplicate_of && source ? source.cloneNode(true) : source;
      const resolvedSection = section || createGenericSection(row);
      if (row.content?.duplicate_of) resolvedSection.dataset.cmsSection = row.section_key;
      resolvedSection.hidden = row.is_visible === false;
      applySectionContent(resolvedSection, row.content);
      if (resolvedSection.matches("section")) main.appendChild(resolvedSection);
    });
  };

  const loadUniversalCms = async () => {
    const page = currentPage();
    annotateSections();
    document.querySelectorAll(".reviews").forEach(initializeReviewCarousel);
    try {
      const pageRows = await cmsFetch("cms_pages", `?page_key=eq.${encodeURIComponent(page.page_key)}&select=page_key,title,path,seo,schema_json,is_active&limit=1`);
      const pageRow = pageRows?.[0];
      if (!pageRow) return;
      applySeo(pageRow);
      const sections = await cmsFetch("cms_sections", `?page_key=eq.${encodeURIComponent(page.page_key)}&select=section_key,section_type,label,sort_order,is_visible,content&order=sort_order.asc`);
      if (sections?.length) applySections(sections);
    } catch (error) {
      console.info("Universal CMS unavailable; using static page fallback.", error.message);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadUniversalCms, { once: true });
  } else {
    loadUniversalCms();
  }
})();
