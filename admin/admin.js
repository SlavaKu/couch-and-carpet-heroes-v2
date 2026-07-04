const SUPABASE_URL = "https://gxtrpycepqnecoyxnonl.supabase.co";
const SUPABASE_REST_URL = "https://gxtrpycepqnecoyxnonl.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable_Sx1dm7TzcIntHfB6lrFctA_xoKF_EYU";
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const STORAGE_BUCKET = "before-after";

const pageFallbacks = [
  { page_key: "home", title: "Home", path: "../" },
  { page_key: "carpet-cleaning", title: "Carpet Cleaning", path: "../carpet-cleaning/" },
  { page_key: "upholstery-cleaning", title: "Upholstery Cleaning", path: "../upholstery-cleaning/" },
  { page_key: "mattress-cleaning", title: "Mattress Cleaning", path: "../mattress-cleaning/" },
  { page_key: "area-rug-cleaning", title: "Area Rug Cleaning", path: "../area-rug-cleaning/" }
];

const authPanel = document.querySelector("[data-auth-panel]");
const adminPanel = document.querySelector("[data-admin-panel]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const statusMessage = document.querySelector("[data-status-message]");
const pageSelector = document.querySelector("[data-page-selector]");
const sectionList = document.querySelector("[data-section-list]");
const sectionEditor = document.querySelector("[data-section-editor]");
const saveStatus = document.querySelector("[data-save-status]");
const seoInputs = Array.from(document.querySelectorAll("[data-seo]"));
const schemaInput = document.querySelector("[data-schema-json]");

let pages = [...pageFallbacks];
let currentPageKey = "home";
let currentPage = null;
let sections = [];
let activeSectionKey = null;
let dirty = false;
const activeBeforeAfterIndexBySection = {};

const setMessage = (node, text = "", type = "") => {
  node.textContent = text;
  node.className = node.className.replace(/\s?(success|error)/g, "");
  if (type) node.classList.add(type);
};

const setDirty = (value = true) => {
  dirty = value;
  saveStatus.value = value ? "Unsaved changes" : "Saved";
};

const cmsRequest = async (table, query = "") => {
  const response = await fetch(`${SUPABASE_REST_URL}/${table}${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!response.ok) throw new Error(`Supabase ${table} request failed: ${response.status}`);
  return response.json();
};

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const slug = (value, fallback) => {
  const text = String(value || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return text || fallback;
};

const inferSectionType = (section) => {
  if (section.classList.contains("hero")) return "hero";
  if (section.classList.contains("gallery") || section.querySelector("[data-service-gallery-root]")) return "gallery";
  if (section.classList.contains("booking-band")) return "final_cta";
  if (section.querySelector(".faq-grid")) return "faq";
  if (section.querySelector("[data-service-before-after-root]")) return "before_after";
  if (section.querySelector("[data-service-image-break]")) return "image_break";
  const text = section.textContent.toLowerCase();
  if (text.includes("related services")) return "related_services";
  if (text.includes("areas we serve") || text.includes("service area")) return "service_areas";
  if (text.includes("written by")) return "author";
  return "content";
};

const friendlyTypeLabels = {
  hero: "Hero",
  gallery: "Gallery",
  final_cta: "Final CTA",
  faq: "FAQ",
  before_after: "Before / After",
  image_break: "Image Break",
  related_services: "Related Services",
  service_areas: "Service Areas",
  author: "Author Section",
  footer: "Footer",
  content: "Page Section"
};

const friendlyType = (type) => friendlyTypeLabels[type] || "Page Section";

const makeFriendlyLabel = (sectionType, node, fieldIndex) => {
  const tag = node.tagName.toLowerCase();
  const text = node.textContent.trim();
  if (sectionType === "hero") {
    if (node.matches(".breadcrumbs span[aria-current='page']")) return "Breadcrumb Text";
    if (node.matches(".eyebrow")) return "Hero Label";
    if (tag === "h1") return "Main Title";
    if (node.matches(".lead") || tag === "p") return "Hero Description";
    if (node.matches("a.btn") && fieldIndex < 6) return fieldIndex <= 4 ? "Primary Button Text" : "Secondary Button Text";
  }
  if (sectionType === "final_cta") {
    if (node.matches(".eyebrow")) return "CTA Label";
    if (tag === "h2") return "CTA Title";
    if (tag === "h3") return "CTA Card Title";
    if (tag === "p") return "CTA Text";
    if (node.matches("a.btn")) return "Button Text";
  }
  if (sectionType === "faq") {
    if (node.matches(".eyebrow")) return "FAQ Label";
    if (tag === "h2") return "FAQ Section Title";
    if (tag === "p" && !node.closest("details")) return "FAQ Intro Text";
    if (tag === "summary") return "FAQ Question";
    if (node.closest("details")) return "FAQ Answer";
  }
  if (sectionType === "related_services") {
    if (node.matches(".eyebrow")) return "Related Services Label";
    if (tag === "h2") return "Related Services Title";
    if (tag === "p" && !node.closest(".service-card")) return "Related Services Intro";
    if (tag === "h3" || node.closest(".service-top")) return "Service Name";
    if (tag === "p") return "Service Description";
  }
  if (sectionType === "service_areas") {
    if (node.matches(".eyebrow")) return "Service Areas Label";
    if (tag === "h2") return "Service Areas Title";
    if (tag === "h3") return "Local Area Heading";
    if (tag === "p") return "Service Area Text";
  }
  if (sectionType === "author") {
    if (tag === "h3") return "Author Heading";
    if (tag === "p") return "Author Bio";
  }
  if (sectionType === "footer") {
    if (tag === "h3") return "Footer Column Heading";
    if (tag === "p") return "Footer Description";
    if (node.matches("a")) return "Footer Link Label";
    if (node.matches(".footer-bottom")) return "Copyright Text";
  }
  if (node.matches(".eyebrow")) return "Section Label";
  if (tag === "h1" || tag === "h2") return "Section Title";
  if (tag === "h3" || tag === "h4") return "Card Title";
  if (tag === "p") return text.length > 120 ? "Body Text" : "Description";
  if (tag === "li") return "Bullet Item";
  if (node.matches("a.btn")) return "Button Text";
  if (node.matches("a")) return "Link Label";
  return "Text";
};

const makeFriendlyLinkLabel = (sectionType, node, index) => {
  if (sectionType === "hero") return index === 0 ? "Primary Button Link" : "Secondary Button Link";
  if (sectionType === "final_cta") return index === 0 ? "Primary CTA Link" : "Secondary CTA Link";
  if (sectionType === "related_services") return "Service Link";
  if (sectionType === "footer") return "Footer Link URL";
  return node.classList.contains("btn") ? "Button Link" : "Link URL";
};

const textNodes = (root) => Array.from(root.querySelectorAll("h1,h2,h3,h4,p,li,summary,a.btn,a:not(.brand):not(.phone-link),button.btn,.eyebrow,.lead,.footer-bottom,.top-note,.top-actions span,.breadcrumbs span[aria-current='page']"))
  .filter((node) => !node.closest("script,style,.ba-slider,.service-gallery-dots,.ba-dots,.calculator-layout,.estimate-modal"));

const linkNodes = (root) => Array.from(root.querySelectorAll("a[href]"))
  .filter((node) => !node.closest(".calculator-layout,.estimate-modal"));

const imageNodes = (root) => Array.from(root.querySelectorAll("img"))
  .filter((node) => !node.closest(".calculator-layout,.estimate-modal"));

const getMeta = (doc, selector, attr = "content") => doc.querySelector(selector)?.getAttribute(attr) || "";

const parseSchema = (doc) => {
  try {
    return JSON.parse(doc.querySelector("script[type='application/ld+json']")?.textContent || "{}");
  } catch {
    return {};
  }
};

const extractFaqs = (section) => Array.from(section.querySelectorAll(".faq-grid details")).map((item) => ({
  question: item.querySelector("summary")?.textContent.trim() || "",
  answer: item.querySelector("p")?.textContent.trim() || ""
})).filter((faq) => faq.question || faq.answer);

const extractMedia = (section) => {
  const images = imageNodes(section).map((img) => ({
    src: img.getAttribute("src") || "",
    alt: img.getAttribute("alt") || "",
    srcset: img.getAttribute("srcset") || ""
  }));
  return images.length ? { images } : {};
};

const extractServiceMedia = (html) => {
  const match = html.match(/window\.servicePageMedia\s*=\s*({[\s\S]*?});\s*<\/script>/);
  if (!match) return {};
  try {
    return Function(`"use strict"; return (${match[1]});`)();
  } catch {
    return {};
  }
};

const homeBeforeAfterFallback = [
  {
    title: "Sectional Sofa Restoration",
    beforeSrc: "assets/before-sofa.png",
    beforeAlt: "Before sofa cleaning",
    afterSrc: "assets/after-sofa.png",
    afterAlt: "After sofa cleaning",
    shared_zoom: 1,
    before_zoom: 1,
    after_zoom: 1,
    before_position_x: 50,
    before_position_y: 50,
    after_position_x: 50,
    after_position_y: 50
  },
  {
    title: "Living Room Sofa and Carpet Refresh",
    beforeSrc: "assets/project-living-room.png",
    beforeAlt: "Before living room cleaning",
    afterSrc: "assets/hero-clean-living-room.png",
    afterAlt: "After living room cleaning",
    shared_zoom: 1,
    before_zoom: 1,
    after_zoom: 1,
    before_position_x: 50,
    before_position_y: 50,
    after_position_x: 50,
    after_position_y: 50
  }
];

const extractPageModel = async (page) => {
  const fetchPath = page.path.startsWith("../") ? page.path : `..${page.path === "/" ? "/" : page.path}`;
  const response = await fetch(fetchPath);
  if (!response.ok) throw new Error(`Could not fetch ${page.title}`);
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const serviceMedia = extractServiceMedia(html);
  const mainSections = Array.from(doc.querySelectorAll("main > section"));
  const extractedSections = mainSections.map((section, index) => {
    const label = section.querySelector("h1,h2,h3")?.textContent.trim() || `Section ${index + 1}`;
    const type = inferSectionType(section);
    const fields = {};
    textNodes(section).forEach((node, fieldIndex) => {
      fields[`text.${fieldIndex}`] = {
        label: makeFriendlyLabel(type, node, fieldIndex),
        value: node.textContent.trim()
      };
    });
    linkNodes(section).forEach((node, linkIndex) => {
      fields[`link.${linkIndex}.href`] = {
        label: makeFriendlyLinkLabel(type, node, linkIndex),
        value: node.getAttribute("href") || ""
      };
    });
    imageNodes(section).forEach((node, imageIndex) => {
      fields[`image.${imageIndex}.src`] = { label: `Image ${imageIndex + 1} URL`, value: node.getAttribute("src") || "" };
      fields[`image.${imageIndex}.alt`] = { label: `Image ${imageIndex + 1} Alt Text`, value: node.getAttribute("alt") || "" };
    });
    const media = extractMedia(section);
    if ((type === "before_after" || section.querySelector("[data-service-before-after-root]")) && serviceMedia.beforeAfter) media.beforeAfter = serviceMedia.beforeAfter;
    if (section.querySelector("[data-ba-carousel]")) media.beforeAfter = homeBeforeAfterFallback;
    if (type === "gallery" && serviceMedia.gallery) media.gallery = serviceMedia.gallery;
    if (section.querySelector("[data-service-image-break]") && serviceMedia.imageBreaks) media.imageBreaks = serviceMedia.imageBreaks;
    return {
      section_key: `${String(index + 1).padStart(2, "0")}-${slug(label, "section")}`,
      section_type: type,
      label,
      sort_order: (index + 1) * 10,
      is_visible: true,
      content: {
        fields,
        faqs: extractFaqs(section),
        media
      }
    };
  });

  const footer = doc.querySelector("footer");
  if (footer) {
    const fields = {};
    textNodes(footer).forEach((node, index) => {
      fields[`text.${index}`] = { label: makeFriendlyLabel("footer", node, index), value: node.textContent.trim() };
    });
    linkNodes(footer).forEach((node, index) => {
      fields[`link.${index}.href`] = { label: makeFriendlyLinkLabel("footer", node, index), value: node.getAttribute("href") || "" };
    });
    extractedSections.push({
      section_key: "footer",
      section_type: "footer",
      label: "Footer",
      sort_order: 9990,
      is_visible: true,
      content: { fields, media: extractMedia(footer) }
    });
  }

  return {
    page_key: page.page_key,
    title: page.title,
    path: page.path.replace("..", "") || "/",
    seo: {
      title: doc.title,
      description: getMeta(doc, "meta[name='description']"),
      canonical: getMeta(doc, "link[rel='canonical']", "href"),
      ogTitle: getMeta(doc, "meta[property='og:title']"),
      ogDescription: getMeta(doc, "meta[property='og:description']"),
      ogImage: getMeta(doc, "meta[property='og:image']"),
      ogUrl: getMeta(doc, "meta[property='og:url']")
    },
    schema_json: parseSchema(doc),
    sections: extractedSections
  };
};

const renderPageOptions = () => {
  pageSelector.innerHTML = pages.map((page) => `<option value="${page.page_key}">${escapeHtml(page.title)}</option>`).join("");
  pageSelector.value = currentPageKey;
};

const activeSection = () => sections.find((section) => section.section_key === activeSectionKey);

const renderSections = () => {
  sectionList.innerHTML = sections.map((section, index) => `
    <button class="section-item ${section.section_key === activeSectionKey ? "is-active" : ""} ${section.is_visible ? "" : "is-hidden"}" draggable="true" data-section-key="${escapeHtml(section.section_key)}">
      <span class="section-meta">
        <strong>${escapeHtml(section.label)}</strong>
        <span class="pill">${escapeHtml(friendlyType(section.section_type))}</span>
        <span class="small-note">${section.is_visible ? "Visible" : "Hidden"} - Position ${index + 1}</span>
      </span>
      <span class="drag-handle" aria-hidden="true">::</span>
    </button>
  `).join("");
  document.querySelector("[data-duplicate-section]").disabled = !activeSection();
  document.querySelector("[data-toggle-section]").disabled = !activeSection();
};

const sectionFieldInput = (key, field) => {
  const value = field?.value || "";
  let label = field?.label || key;
  if (/^(h\d|p|a|li|summary|button|div|span|img)\s+\d+/i.test(label) || /^link \d+ href$/i.test(label)) {
    if (key.startsWith("link.")) label = "Button or Link URL";
    else if (key.includes(".alt")) label = "Image Alt Text";
    else if (key.includes(".src")) label = "Image URL";
    else label = "Text";
  }
  const isLong = value.length > 90 || label.includes("Description") || label.includes("Text") || label.includes("Bio") || label.includes("Answer");
  return `
    <label>
      ${escapeHtml(label)}
      ${isLong
        ? `<textarea data-field-key="${escapeHtml(key)}" rows="3">${escapeHtml(value)}</textarea>`
        : `<input data-field-key="${escapeHtml(key)}" value="${escapeHtml(value)}">`}
    </label>
  `;
};

const fieldGroups = (section) => {
  const entries = Object.entries(section.content.fields || {});
  const groups = { main: [], cards: [], links: [], images: [] };
  entries.forEach(([key, field]) => {
    const label = field.label || "";
    if (key.startsWith("link.")) groups.links.push([key, field]);
    else if (key.startsWith("image.")) groups.images.push([key, field]);
    else if (label.includes("Card") || label.includes("Bullet") || label.includes("Service Name") || label.includes("Service Description")) groups.cards.push([key, field]);
    else groups.main.push([key, field]);
  });
  return groups;
};

const renderFieldPanel = (title, description, entries) => entries.length ? `
  <div class="subpanel">
    <div class="card-head compact"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></div></div>
    <div class="form-grid">${entries.map(([key, field]) => sectionFieldInput(key, field)).join("")}</div>
  </div>
` : "";

const renderFaqEditor = (section) => {
  const faqs = section.content.faqs || [];
  return `
    <div class="subpanel">
      <div class="card-head compact">
        <div><h3>FAQ</h3><p>Add, edit, delete and reorder questions.</p></div>
        <button class="btn btn-secondary" type="button" data-add-faq>Add FAQ</button>
      </div>
      <div class="faq-list">
        ${faqs.map((faq, index) => `
          <div class="faq-editor" data-faq-index="${index}">
            <div class="row-actions">
              <button class="btn btn-secondary" type="button" data-faq-up="${index}">Up</button>
              <button class="btn btn-secondary" type="button" data-faq-down="${index}">Down</button>
              <button class="btn btn-danger" type="button" data-faq-delete="${index}">Delete</button>
            </div>
            <label>Question<input data-faq-field="question" value="${escapeHtml(faq.question)}"></label>
            <label>Answer<textarea data-faq-field="answer" rows="3">${escapeHtml(faq.answer)}</textarea></label>
          </div>
        `).join("")}
      </div>
    </div>
  `;
};

const beforeAfterValue = (item, key, fallback) => item[key] ?? fallback;
const beforeAfterImage = (item, phase) => phase === "before"
  ? (item.beforeSrc || item.src || "")
  : (item.afterSrc || "");
const beforeAfterAlt = (item, phase) => phase === "before"
  ? (item.beforeAlt || item.alt || "")
  : (item.afterAlt || "");
const beforeAfterStyle = (item, phase) => {
  const shared = Number(item.shared_zoom ?? item.zoom ?? 1) || 1;
  const phaseZoom = Number(item[`${phase}_zoom`] ?? 1) || 1;
  const x = Number(item[`${phase}_position_x`] ?? 50);
  const y = Number(item[`${phase}_position_y`] ?? 50);
  const offsetX = (50 - x) * 1.4;
  const offsetY = (50 - y) * 1.4;
  return `--ba-scale:${shared * phaseZoom}; --ba-x:${offsetX}%; --ba-y:${offsetY}%; object-position:${x}% ${y}%; transform:translate(var(--ba-x), var(--ba-y)) scale(var(--ba-scale)); transform-origin:center center;`;
};
const clampBeforeAfterIndex = (section, items) => {
  const key = section.section_key;
  const current = activeBeforeAfterIndexBySection[key] ?? 0;
  const max = Math.max(0, items.length - 1);
  activeBeforeAfterIndexBySection[key] = Math.min(Math.max(0, current), max);
  return activeBeforeAfterIndexBySection[key];
};

const renderBeforeAfterVisual = (item, phase, title) => `
  <div class="ba-admin-image-panel ba-admin-${phase}">
    <div class="ba-admin-panel-head">
      <h4>${title} image</h4>
      <label class="ba-upload-button">
        Upload / Replace ${title}
        <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" ${phase === "before" ? "data-media-upload-before" : "data-media-upload-after"}>
      </label>
    </div>
    <div class="ba-admin-fields">
      <label>Image URL<input data-media-field="${phase === "before" ? "src" : "afterSrc"}" data-media-url-input="${phase}" value="${escapeHtml(beforeAfterImage(item, phase))}" placeholder="Paste or upload an image"></label>
      <label>Caption<input data-media-field="${phase === "before" ? "beforeCaption" : "afterCaption"}" value="${escapeHtml(item[`${phase}Caption`] || item.caption || item.title || "")}"></label>
      <label>Alt text<input data-media-field="${phase === "before" ? "alt" : "afterAlt"}" value="${escapeHtml(beforeAfterAlt(item, phase))}"></label>
    </div>
    <div class="ba-admin-image-frame">
      <img data-ba-preview-image="${phase}" src="${escapeHtml(beforeAfterImage(item, phase))}" alt="" style="${beforeAfterStyle(item, phase)}">
    </div>
    <div class="ba-admin-sliders">
      <label>${title} zoom <output>${escapeHtml(beforeAfterValue(item, `${phase}_zoom`, 1))}</output><input type="range" min="1" max="3" step="0.05" data-media-field="${phase}_zoom" value="${escapeHtml(beforeAfterValue(item, `${phase}_zoom`, 1))}"></label>
      <label>${title} horizontal position <output>${escapeHtml(beforeAfterValue(item, `${phase}_position_x`, 50))}</output><input type="range" min="0" max="100" step="1" data-media-field="${phase}_position_x" value="${escapeHtml(beforeAfterValue(item, `${phase}_position_x`, 50))}"></label>
      <label>${title} vertical position <output>${escapeHtml(beforeAfterValue(item, `${phase}_position_y`, 50))}</output><input type="range" min="0" max="100" step="1" data-media-field="${phase}_position_y" value="${escapeHtml(beforeAfterValue(item, `${phase}_position_y`, 50))}"></label>
    </div>
  </div>
`;

const renderBeforeAfterEditor = (section, items = []) => {
  const index = clampBeforeAfterIndex(section, items);
  const item = items[index] || { title: "New before and after", beforeSrc: "", beforeAlt: "", afterSrc: "", afterAlt: "" };
  return `
    <div class="subpanel media-editor ba-carousel-editor" data-before-after-editor>
      <div class="ba-editor-toolbar">
        <div>
          <h3>Before / After</h3>
          <p>One pair at a time with large previews and framing controls.</p>
        </div>
        <div class="ba-counter" data-ba-counter>Pair ${items.length ? index + 1 : 0} of ${items.length}</div>
        <div class="ba-toolbar-actions">
          <button class="btn btn-secondary" type="button" data-ba-prev ${index <= 0 ? "disabled" : ""}>Previous</button>
          <button class="btn btn-secondary" type="button" data-ba-next ${index >= items.length - 1 ? "disabled" : ""}>Next</button>
          <button class="btn btn-secondary" type="button" data-add-media="beforeAfter">Add Pair</button>
          <button class="btn btn-secondary" type="button" data-ba-duplicate ${!items.length ? "disabled" : ""}>Duplicate Pair</button>
          <button class="btn btn-danger" type="button" data-media-delete ${!items.length ? "disabled" : ""}>Delete Pair</button>
        </div>
      </div>
      ${items.length ? `
        <div class="ba-active-pair" data-media-kind="beforeAfter" data-media-index="${index}">
          <div class="ba-pair-actions">
            <button class="btn btn-secondary" type="button" data-media-up ${index <= 0 ? "disabled" : ""}>Move Earlier</button>
            <button class="btn btn-secondary" type="button" data-media-down ${index >= items.length - 1 ? "disabled" : ""}>Move Later</button>
            <label class="ba-shared-control">Overall zoom <output>${escapeHtml(beforeAfterValue(item, "shared_zoom", beforeAfterValue(item, "zoom", 1)))}</output><input type="range" min="1" max="3" step="0.05" data-media-field="shared_zoom" value="${escapeHtml(beforeAfterValue(item, "shared_zoom", beforeAfterValue(item, "zoom", 1)))}"></label>
          </div>
          <div class="ba-admin-grid">
            ${renderBeforeAfterVisual(item, "before", "Before")}
            ${renderBeforeAfterVisual(item, "after", "After")}
          </div>
          <div class="ba-public-preview" aria-label="Before and after public preview">
            <div class="ba-public-frame" data-ba-public-frame style="--ba-divider:50%;">
              <img data-ba-preview-image="after" src="${escapeHtml(beforeAfterImage(item, "after"))}" alt="" style="${beforeAfterStyle(item, "after")}">
              <div class="ba-public-before">
                <img data-ba-preview-image="before" src="${escapeHtml(beforeAfterImage(item, "before"))}" alt="" style="${beforeAfterStyle(item, "before")}">
              </div>
              <span class="ba-label-before">Before</span>
              <span class="ba-label-after">After</span>
              <span class="ba-public-divider"></span>
              <button class="ba-public-handle" type="button" aria-label="Drag before after divider" data-ba-divider-handle></button>
            </div>
            <p>${escapeHtml(item.title || item.caption || item.beforeCaption || item.afterCaption || "Before / After preview")}</p>
          </div>
        </div>
      ` : `<div class="empty-state">No before/after pairs yet. Add a pair to start.</div>`}
    </div>
  `;
};

const updateBeforeAfterDivider = (frame, clientX) => {
  const rect = frame.getBoundingClientRect();
  if (!rect.width) return;
  const percent = Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100));
  frame.style.setProperty("--ba-divider", `${percent}%`);
};
const updateBeforeAfterPreview = (row, item) => {
  if (!row || !item) return;
  ["before", "after"].forEach((phase) => {
    const src = beforeAfterImage(item, phase);
    const style = beforeAfterStyle(item, phase);
    row.querySelectorAll(`[data-ba-preview-image="${phase}"]`).forEach((img) => {
      img.src = src;
      img.setAttribute("style", style);
    });
  });
  row.querySelectorAll("input[type='range']").forEach((input) => {
    const output = input.closest("label")?.querySelector("output");
    if (output) output.textContent = input.value;
  });
};
const mediaItemEditor = (kind, item, index) => {
  const src = item.src || item.beforeSrc || "";
  const alt = item.alt || item.beforeAlt || "";
  const afterSrc = item.afterSrc || "";
  const afterAlt = item.afterAlt || "";
  const zoom = item.shared_zoom ?? item.zoom ?? 1;
  const beforeZoom = item.before_zoom ?? 1;
  const afterZoom = item.after_zoom ?? 1;
  const beforeX = item.before_position_x ?? 50;
  const beforeY = item.before_position_y ?? 50;
  const afterX = item.after_position_x ?? 50;
  const afterY = item.after_position_y ?? 50;
  return `
    <div class="media-row ${kind === "beforeAfter" ? "media-row-stack" : ""}" data-media-kind="${kind}" data-media-index="${index}">
      <div class="${kind === "beforeAfter" ? "ba-visual-editor" : "media-preview-card"}">
        ${kind === "beforeAfter" ? `
          <div class="ba-preview-grid">
            <figure><img class="preview-img" src="${escapeHtml(src)}" alt=""><figcaption>Before</figcaption></figure>
            <figure><img class="preview-img" src="${escapeHtml(afterSrc)}" alt=""><figcaption>After</figcaption></figure>
          </div>
          <div class="ba-live-preview">
            <img src="${escapeHtml(afterSrc || src)}" alt="" style="object-position:${afterX}% ${afterY}%; transform:scale(${Number(zoom) * Number(afterZoom)}); transform-origin:${afterX}% ${afterY}%;">
            <span>Live preview</span>
          </div>
        ` : `<img class="preview-img" src="${escapeHtml(src || afterSrc)}" alt="">`}
      </div>
      <div class="form-grid">
        <label>${kind === "gallery" ? "Caption" : "Caption / Title"}<input data-media-field="title" value="${escapeHtml(item.title || item.caption || "")}"></label>
        <label>${kind === "beforeAfter" ? "Before image URL" : "Image URL"}<input data-media-field="src" value="${escapeHtml(src)}"></label>
        <label>${kind === "beforeAfter" ? "Before alt text" : "Alt text"}<input data-media-field="alt" value="${escapeHtml(alt)}"></label>
        ${kind === "beforeAfter" ? `
          <label>After image URL<input data-media-field="afterSrc" value="${escapeHtml(afterSrc)}"></label>
          <label>After alt text<input data-media-field="afterAlt" value="${escapeHtml(afterAlt)}"></label>
          <label>Overall zoom<input type="range" min="1" max="3" step="0.05" data-media-field="shared_zoom" value="${escapeHtml(zoom)}"></label>
          <label>Before zoom<input type="range" min="1" max="3" step="0.05" data-media-field="before_zoom" value="${escapeHtml(beforeZoom)}"></label>
          <label>After zoom<input type="range" min="1" max="3" step="0.05" data-media-field="after_zoom" value="${escapeHtml(afterZoom)}"></label>
          <label>Before horizontal position<input type="range" min="0" max="100" step="1" data-media-field="before_position_x" value="${escapeHtml(beforeX)}"></label>
          <label>Before vertical position<input type="range" min="0" max="100" step="1" data-media-field="before_position_y" value="${escapeHtml(beforeY)}"></label>
          <label>After horizontal position<input type="range" min="0" max="100" step="1" data-media-field="after_position_x" value="${escapeHtml(afterX)}"></label>
          <label>After vertical position<input type="range" min="0" max="100" step="1" data-media-field="after_position_y" value="${escapeHtml(afterY)}"></label>
        ` : ""}
        ${kind === "gallery" ? `<label>Caption<input data-media-field="caption" value="${escapeHtml(item.caption || "")}"></label>` : ""}
      </div>
      <div class="row-actions">
        ${kind === "beforeAfter" ? `
          <label class="file-action">Replace before<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-media-upload-before></label>
          <label class="file-action">Replace after<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-media-upload-after></label>
        ` : `<label class="file-action">Replace image<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-media-upload></label>`}
        <button class="btn btn-secondary" type="button" data-media-up>Up</button>
        <button class="btn btn-secondary" type="button" data-media-down>Down</button>
        <button class="btn btn-danger" type="button" data-media-delete>Delete</button>
      </div>
    </div>
  `;
};

const renderMediaEditor = (section) => {
  const media = section.content.media || {};
  const blocks = [];
  if (section.section_type === "before_after" || media.beforeAfter?.length) {
    blocks.push(renderBeforeAfterEditor(section, media.beforeAfter || []));
  }
  if (section.section_type === "gallery" || media.gallery?.length) {
    blocks.push(`
      <div class="subpanel media-editor">
        <div class="card-head compact"><div><h3>Gallery</h3><p>Large carousel images, captions and alt text.</p></div><button class="btn btn-secondary" type="button" data-add-media="gallery">Add Image</button></div>
        ${(media.gallery || []).map((item, index) => mediaItemEditor("gallery", item, index)).join("")}
      </div>
    `);
  }
  if (media.images?.length) {
    blocks.push(`
      <div class="subpanel media-editor">
        <div class="card-head compact"><div><h3>Section Images</h3><p>Replace inline images without changing layout.</p></div></div>
        ${media.images.map((item, index) => mediaItemEditor("images", item, index)).join("")}
      </div>
    `);
  }
  if (media.imageBreaks && Object.keys(media.imageBreaks).length) {
    blocks.push(`
      <div class="subpanel media-editor">
        <div class="card-head compact"><div><h3>Image Breaks</h3><p>Update visual break photos, captions and alt text.</p></div></div>
        ${Object.entries(media.imageBreaks).map(([key, item]) => `
          <div class="media-row" data-image-break-key="${escapeHtml(key)}">
            <div class="media-preview-card"><img class="preview-img" src="${escapeHtml(item.src || "")}" alt=""></div>
            <div class="form-grid">
              <label>Caption / Title<input data-image-break-field="title" value="${escapeHtml(item.title || "")}"></label>
              <label>Image URL<input data-image-break-field="src" value="${escapeHtml(item.src || "")}"></label>
              <label>Alt text<input data-image-break-field="alt" value="${escapeHtml(item.alt || "")}"></label>
              <label>Description<textarea data-image-break-field="description" rows="3">${escapeHtml(item.description || "")}</textarea></label>
            </div>
            <div class="row-actions">
              <label class="file-action">Replace image<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-image-break-upload></label>
            </div>
          </div>
        `).join("")}
      </div>
    `);
  }
  return blocks.join("");
};

const renderSectionEditor = () => {
  const section = activeSection();
  if (!section) {
    sectionEditor.className = "empty-state";
    sectionEditor.textContent = "Choose a section to edit.";
    return;
  }
  const groups = fieldGroups(section);
  sectionEditor.className = "editor-fields";
  sectionEditor.innerHTML = `
    <div class="form-grid">
      <label>Section Name<input data-section-prop="label" value="${escapeHtml(section.label)}"></label>
      <label>Section Type<input value="${escapeHtml(friendlyType(section.section_type))}" readonly></label>
      <label class="toggle-line"><input type="checkbox" data-section-visible ${section.is_visible ? "checked" : ""}> Visible on public page</label>
    </div>
    ${renderFieldPanel(section.section_type === "hero" ? "Hero Content" : "Section Content", "Edit the main labels, headings and body copy for this section.", groups.main)}
    ${renderFieldPanel("Cards and Bullet Items", "Edit repeated cards, service labels and list items used in this section.", groups.cards)}
    ${renderFieldPanel("Buttons and Links", "Edit button destinations and service links.", groups.links)}
    ${renderFieldPanel("Inline Images", "Edit image URLs and alt text when this section includes inline images.", groups.images)}
    ${(section.content.faqs || []).length || section.section_type === "faq" ? renderFaqEditor(section) : ""}
    ${renderMediaEditor(section)}
  `;
};

const renderSeo = () => {
  const seo = currentPage?.seo || {};
  seoInputs.forEach((input) => {
    input.value = seo[input.dataset.seo] || "";
  });
  schemaInput.value = JSON.stringify(currentPage?.schema_json || {}, null, 2);
};

const renderAll = () => {
  renderPageOptions();
  renderSeo();
  renderSections();
  renderSectionEditor();
};

const loadPages = async () => {
  try {
    const rows = await cmsRequest("cms_pages", "?select=page_key,title,path,sort_order,is_active&order=sort_order.asc");
    if (rows?.length) pages = rows;
  } catch (error) {
    setMessage(statusMessage, "CMS tables are not available yet. Load defaults and save after running the SQL migration.", "error");
  }
  renderPageOptions();
};

const loadPageFromCms = async (pageKey) => {
  const page = pages.find((item) => item.page_key === pageKey) || pageFallbacks[0];
  currentPageKey = pageKey;
  setMessage(statusMessage, "Loading page...");
  try {
    const pageRows = await cmsRequest("cms_pages", `?page_key=eq.${encodeURIComponent(pageKey)}&select=page_key,title,path,seo,schema_json&limit=1`);
    const sectionRows = await cmsRequest("cms_sections", `?page_key=eq.${encodeURIComponent(pageKey)}&select=section_key,section_type,label,sort_order,is_visible,content&order=sort_order.asc`);
    if (pageRows?.[0] && sectionRows?.length) {
      currentPage = { ...page, ...pageRows[0] };
      sections = sectionRows;
      activeSectionKey = sections[0]?.section_key || null;
      setMessage(statusMessage, "Loaded from Supabase.", "success");
    } else {
      await loadDefaultsFromSite(false);
      setMessage(statusMessage, "Loaded current site defaults. Save to publish CMS-managed content.", "success");
    }
  } catch (error) {
    await loadDefaultsFromSite(false);
    setMessage(statusMessage, "Loaded defaults from current site. Run SQL migration before saving.", "error");
  }
  setDirty(false);
  renderAll();
};

const loadDefaultsFromSite = async (markDirty = true) => {
  const page = pages.find((item) => item.page_key === currentPageKey) || pageFallbacks[0];
  const model = await extractPageModel(page);
  currentPage = model;
  sections = model.sections;
  activeSectionKey = sections[0]?.section_key || null;
  setDirty(markDirty);
  renderAll();
};

const uploadMedia = async (file) => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `before-after/${currentPageKey}-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined
  });
  if (error) throw error;
  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
};

const savePage = async () => {
  if (!currentPage) return;
  setMessage(statusMessage, "Saving...");
  seoInputs.forEach((input) => {
    currentPage.seo = currentPage.seo || {};
    currentPage.seo[input.dataset.seo] = input.value.trim();
  });
  try {
    currentPage.schema_json = schemaInput.value.trim() ? JSON.parse(schemaInput.value) : {};
  } catch {
    setMessage(statusMessage, "Schema JSON is invalid.", "error");
    return;
  }

  const pagePayload = {
    page_key: currentPage.page_key,
    title: currentPage.title || pages.find((page) => page.page_key === currentPageKey)?.title || currentPageKey,
    path: currentPage.path || "/",
    seo: currentPage.seo || {},
    schema_json: currentPage.schema_json || {},
    sort_order: pages.findIndex((page) => page.page_key === currentPageKey) * 10,
    is_active: true
  };
  const { error: pageError } = await client.from("cms_pages").upsert(pagePayload, { onConflict: "page_key" });
  if (pageError) {
    setMessage(statusMessage, `${pageError.message}. Run /supabase/migrations/admin_cms.sql if needed.`, "error");
    return;
  }
  const rows = sections.map((section, index) => ({
    page_key: currentPageKey,
    section_key: section.section_key,
    section_type: section.section_type,
    label: section.label,
    sort_order: (index + 1) * 10,
    is_visible: section.is_visible,
    content: section.content || {}
  }));
  const { error: sectionsError } = await client.from("cms_sections").upsert(rows, { onConflict: "page_key,section_key" });
  if (sectionsError) {
    setMessage(statusMessage, sectionsError.message, "error");
    return;
  }
  await client.from("cms_revisions").insert({ page_key: currentPageKey, snapshot: { page: pagePayload, sections: rows } });
  setDirty(false);
  setMessage(statusMessage, "Saved successfully.", "success");
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(loginMessage, "Signing in...");
  const form = new FormData(loginForm);
  const { error } = await client.auth.signInWithPassword({
    email: form.get("email"),
    password: form.get("password")
  });
  if (error) {
    setMessage(loginMessage, error.message, "error");
    return;
  }
  await showApp();
});

document.querySelector("[data-logout]").addEventListener("click", async () => {
  await client.auth.signOut();
  authPanel.hidden = false;
  adminPanel.hidden = true;
});

pageSelector.addEventListener("change", () => loadPageFromCms(pageSelector.value));
document.querySelector("[data-load-current]").addEventListener("click", () => loadPageFromCms(currentPageKey));
document.querySelector("[data-seed-current]").addEventListener("click", async () => {
  await loadDefaultsFromSite(true);
  setMessage(statusMessage, "Defaults loaded from current public page. Review and save.", "success");
});
document.querySelector("[data-save-page]").addEventListener("click", savePage);

sectionList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-section-key]");
  if (!item) return;
  activeSectionKey = item.dataset.sectionKey;
  renderSections();
  renderSectionEditor();
});

let draggedKey = null;
sectionList.addEventListener("dragstart", (event) => {
  draggedKey = event.target.closest("[data-section-key]")?.dataset.sectionKey || null;
});
sectionList.addEventListener("dragover", (event) => event.preventDefault());
sectionList.addEventListener("drop", (event) => {
  event.preventDefault();
  const targetKey = event.target.closest("[data-section-key]")?.dataset.sectionKey;
  if (!draggedKey || !targetKey || draggedKey === targetKey) return;
  const draggedIndex = sections.findIndex((section) => section.section_key === draggedKey);
  const targetIndex = sections.findIndex((section) => section.section_key === targetKey);
  const [item] = sections.splice(draggedIndex, 1);
  sections.splice(targetIndex, 0, item);
  setDirty();
  renderSections();
});

sectionEditor.addEventListener("input", async (event) => {
  const section = activeSection();
  if (!section) return;
  const fieldKey = event.target.dataset.fieldKey;
  if (fieldKey) {
    section.content.fields[fieldKey].value = event.target.value;
    setDirty();
  }
  const prop = event.target.dataset.sectionProp;
  if (prop) {
    section[prop] = event.target.value;
    setDirty();
    renderSections();
  }
  const faqField = event.target.dataset.faqField;
  if (faqField) {
    const index = Number(event.target.closest("[data-faq-index]").dataset.faqIndex);
    section.content.faqs[index][faqField] = event.target.value;
    setDirty();
  }
  const mediaField = event.target.dataset.mediaField;
  if (mediaField) {
    const row = event.target.closest("[data-media-kind]");
    const kind = row.dataset.mediaKind;
    const index = Number(row.dataset.mediaIndex);
    const collection = kind === "images" ? section.content.media.images : section.content.media[kind];
    const value = event.target.value;
    if (kind === "beforeAfter" && mediaField === "src") collection[index].beforeSrc = value;
    else if (kind === "beforeAfter" && mediaField === "alt") collection[index].beforeAlt = value;
    else collection[index][mediaField] = value;
    if (mediaField === "title" && kind === "gallery") collection[index].caption = value;
    if (mediaField === "title" && kind === "beforeAfter") collection[index].caption = value;
    if (mediaField === "beforeCaption" && kind === "beforeAfter") collection[index].caption = value;
    if (mediaField === "afterCaption" && kind === "beforeAfter" && !collection[index].caption) collection[index].caption = value;
    if (kind === "beforeAfter") updateBeforeAfterPreview(row, collection[index]);
    setDirty();
  }
  const imageBreakField = event.target.dataset.imageBreakField;
  if (imageBreakField) {
    const key = event.target.closest("[data-image-break-key]").dataset.imageBreakKey;
    section.content.media.imageBreaks[key][imageBreakField] = event.target.value;
    setDirty();
  }
});

sectionEditor.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest("[data-ba-divider-handle]");
  const frame = handle?.closest("[data-ba-public-frame]");
  if (!frame) return;
  event.preventDefault();
  handle.setPointerCapture?.(event.pointerId);
  updateBeforeAfterDivider(frame, event.clientX);
  const move = (moveEvent) => updateBeforeAfterDivider(frame, moveEvent.clientX);
  const stop = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop, { once: true });
  window.addEventListener("pointercancel", stop, { once: true });
});
sectionEditor.addEventListener("change", async (event) => {
  const section = activeSection();
  if (!section) return;
  if (event.target.matches("[data-section-visible]")) {
    section.is_visible = event.target.checked;
    setDirty();
    renderSections();
  }
  if ((event.target.matches("[data-media-upload]") || event.target.matches("[data-media-upload-before]") || event.target.matches("[data-media-upload-after]")) && event.target.files?.[0]) {
    const row = event.target.closest("[data-media-kind]");
    const kind = row.dataset.mediaKind;
    const index = Number(row.dataset.mediaIndex);
    const collection = kind === "images" ? section.content.media.images : section.content.media[kind];
    let phase = null;
    if (kind === "beforeAfter") {
      phase = event.target.matches("[data-media-upload-after]") ? "after" : "before";
      const localUrl = URL.createObjectURL(event.target.files[0]);
      row.querySelectorAll(`[data-ba-preview-image="${phase}"]`).forEach((img) => { img.src = localUrl; });
    }
    setMessage(statusMessage, "Uploading image...");
    try {
      const url = await uploadMedia(event.target.files[0]);
      if (event.target.matches("[data-media-upload-before]")) collection[index].beforeSrc = url;
      else if (event.target.matches("[data-media-upload-after]")) collection[index].afterSrc = url;
      else if (kind === "beforeAfter" && !collection[index].beforeSrc) collection[index].beforeSrc = url;
      else collection[index].src = url;
      if (kind === "beforeAfter") {
        const input = row.querySelector(`[data-media-url-input="${phase}"]`);
        if (input) input.value = url;
        updateBeforeAfterPreview(row, collection[index]);
      }
      setDirty();
      setMessage(statusMessage, "Image uploaded.", "success");
      renderSectionEditor();
    } catch (error) {
      setMessage(statusMessage, error.message, "error");
    }
  }
  if (event.target.matches("[data-image-break-upload]") && event.target.files?.[0]) {
    setMessage(statusMessage, "Uploading image...");
    try {
      const url = await uploadMedia(event.target.files[0]);
      const key = event.target.closest("[data-image-break-key]").dataset.imageBreakKey;
      section.content.media.imageBreaks[key].src = url;
      setDirty();
      setMessage(statusMessage, "Image uploaded.", "success");
      renderSectionEditor();
    } catch (error) {
      setMessage(statusMessage, error.message, "error");
    }
  }
});

const moveItem = (items, index, direction) => {
  const next = index + direction;
  if (next < 0 || next >= items.length) return;
  [items[index], items[next]] = [items[next], items[index]];
};

sectionEditor.addEventListener("click", (event) => {
  const section = activeSection();
  if (!section) return;
  if (event.target.matches("[data-add-faq]")) {
    section.content.faqs = section.content.faqs || [];
    section.content.faqs.push({ question: "New question", answer: "New answer" });
    setDirty(); renderSectionEditor();
  }
  ["faqUp", "faqDown", "faqDelete"].forEach(() => {});
  const faqUp = event.target.dataset.faqUp;
  const faqDown = event.target.dataset.faqDown;
  const faqDelete = event.target.dataset.faqDelete;
  if (faqUp !== undefined) { moveItem(section.content.faqs, Number(faqUp), -1); setDirty(); renderSectionEditor(); }
  if (faqDown !== undefined) { moveItem(section.content.faqs, Number(faqDown), 1); setDirty(); renderSectionEditor(); }
  if (faqDelete !== undefined) { section.content.faqs.splice(Number(faqDelete), 1); setDirty(); renderSectionEditor(); }
  const addMedia = event.target.dataset.addMedia;
  if (addMedia) {
    section.content.media = section.content.media || {};
    section.content.media[addMedia] = section.content.media[addMedia] || [];
    section.content.media[addMedia].push(addMedia === "beforeAfter"
      ? { title: "New before and after", beforeSrc: "", beforeAlt: "", afterSrc: "", afterAlt: "", shared_zoom: 1, before_zoom: 1, after_zoom: 1, before_position_x: 50, before_position_y: 50, after_position_x: 50, after_position_y: 50 }
      : { src: "", alt: "", caption: "New gallery image" });
    if (addMedia === "beforeAfter") activeBeforeAfterIndexBySection[section.section_key] = section.content.media[addMedia].length - 1;
    setDirty(); renderSectionEditor();
  }
  const beforeAfterItems = section.content.media?.beforeAfter || [];
  if (event.target.matches("[data-ba-prev]")) {
    activeBeforeAfterIndexBySection[section.section_key] = Math.max(0, (activeBeforeAfterIndexBySection[section.section_key] || 0) - 1);
    renderSectionEditor();
  }
  if (event.target.matches("[data-ba-next]")) {
    activeBeforeAfterIndexBySection[section.section_key] = Math.min(beforeAfterItems.length - 1, (activeBeforeAfterIndexBySection[section.section_key] || 0) + 1);
    renderSectionEditor();
  }
  if (event.target.matches("[data-ba-duplicate]") && beforeAfterItems.length) {
    const index = clampBeforeAfterIndex(section, beforeAfterItems);
    const copy = JSON.parse(JSON.stringify(beforeAfterItems[index]));
    copy.title = `${copy.title || copy.caption || "Before and after"} Copy`;
    beforeAfterItems.splice(index + 1, 0, copy);
    activeBeforeAfterIndexBySection[section.section_key] = index + 1;
    setDirty(); renderSectionEditor();
  }
  if (event.target.matches("[data-media-delete]") && event.target.closest("[data-before-after-editor]") && !event.target.closest("[data-media-kind]")) {
    const index = clampBeforeAfterIndex(section, beforeAfterItems);
    beforeAfterItems.splice(index, 1);
    activeBeforeAfterIndexBySection[section.section_key] = Math.max(0, Math.min(index, beforeAfterItems.length - 1));
    setDirty(); renderSectionEditor();
  }
  const mediaRow = event.target.closest("[data-media-kind]");
  if (mediaRow && (event.target.matches("[data-media-up]") || event.target.matches("[data-media-down]") || event.target.matches("[data-media-delete]"))) {
    const kind = mediaRow.dataset.mediaKind;
    const index = Number(mediaRow.dataset.mediaIndex);
    const collection = kind === "images" ? section.content.media.images : section.content.media[kind];
    if (event.target.matches("[data-media-up]")) {
      moveItem(collection, index, -1);
      if (kind === "beforeAfter") activeBeforeAfterIndexBySection[section.section_key] = Math.max(0, index - 1);
    }
    if (event.target.matches("[data-media-down]")) {
      moveItem(collection, index, 1);
      if (kind === "beforeAfter") activeBeforeAfterIndexBySection[section.section_key] = Math.min(collection.length - 1, index + 1);
    }
    if (event.target.matches("[data-media-delete]")) {
      collection.splice(index, 1);
      if (kind === "beforeAfter") activeBeforeAfterIndexBySection[section.section_key] = Math.max(0, Math.min(index, collection.length - 1));
    }
    setDirty(); renderSectionEditor();
  }
});

document.querySelector("[data-toggle-section]").addEventListener("click", () => {
  const section = activeSection();
  if (!section) return;
  section.is_visible = !section.is_visible;
  setDirty(); renderSections(); renderSectionEditor();
});

document.querySelector("[data-duplicate-section]").addEventListener("click", () => {
  const section = activeSection();
  if (!section) return;
  const copy = JSON.parse(JSON.stringify(section));
  copy.section_key = `${section.section_key}-copy-${Date.now().toString(36)}`;
  copy.label = `${section.label} Copy`;
  copy.content.duplicate_of = section.section_key;
  const index = sections.findIndex((item) => item.section_key === section.section_key);
  sections.splice(index + 1, 0, copy);
  activeSectionKey = copy.section_key;
  setDirty(); renderAll();
});

document.querySelector("[data-add-section]").addEventListener("click", () => {
  const section = {
    section_key: `custom-${Date.now().toString(36)}`,
    section_type: "content",
    label: "New Section",
    sort_order: sections.length * 10,
    is_visible: true,
    content: {
      fields: {
        "text.0": { label: "Heading", value: "New Section" },
        "text.1": { label: "Paragraph", value: "Add helpful content here." }
      },
      faqs: [],
      media: {}
    }
  };
  sections.push(section);
  activeSectionKey = section.section_key;
  setDirty(); renderAll();
});

seoInputs.forEach((input) => {
  input.addEventListener("input", () => {
    currentPage.seo = currentPage.seo || {};
    currentPage.seo[input.dataset.seo] = input.value;
    setDirty();
  });
});
schemaInput.addEventListener("input", () => setDirty());

const showApp = async () => {
  authPanel.hidden = true;
  adminPanel.hidden = false;
  await loadPages();
  await loadPageFromCms(currentPageKey);
};

client.auth.getSession().then(({ data }) => {
  if (data.session) showApp();
});

