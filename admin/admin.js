const SUPABASE_URL = "https://gxtrpycepqnecoyxnonl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Sx1dm7TzcIntHfB6lrFctA_xoKF_EYU";

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const authPanel = document.querySelector("[data-auth-panel]");
const adminPanel = document.querySelector("[data-admin-panel]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const statusMessage = document.querySelector("[data-status-message]");

const lists = {
  services: document.querySelector("[data-services-list]"),
  why: document.querySelector("[data-why-list]"),
  about: document.querySelector("[data-about-list]"),
  social: document.querySelector("[data-social-list]"),
  faqs: document.querySelector("[data-faq-list]")
};

const settingKeys = [
  "business_phone",
  "business_email",
  "whatsapp_number",
  "sms_number",
  "business_hours",
  "service_area_description"
];

const homepageFields = [
  { selector: "hero.eyebrow", section_key: "hero", content_key: "eyebrow" },
  { selector: "hero.title", section_key: "hero", content_key: "title" },
  { selector: "hero.subtitle", section_key: "hero", content_key: "subtitle" },
  { selector: "hero.cta_text", section_key: "hero", content_key: "cta_text" },
  { selector: "services.title", section_key: "services", content_key: "title" },
  { selector: "services.subtitle", section_key: "services", content_key: "subtitle" },
  { selector: "why.title", section_key: "why", content_key: "title" },
  { selector: "why.subtitle", section_key: "why", content_key: "subtitle" },
  { selector: "about.title", section_key: "about", content_key: "title" },
  { selector: "about.cta_text", section_key: "about", content_key: "cta_text" },
  { selector: "contact.title", section_key: "contact", content_key: "title" },
  { selector: "contact.description", section_key: "contact", content_key: "description" },
  { selector: "footer.description", section_key: "footer", content_key: "description" },
  { selector: "footer.copyright", section_key: "footer", content_key: "copyright" }
];

const homepageBySelector = Object.fromEntries(homepageFields.map((field) => [field.selector, field]));

const fallbackSettings = {
  business_phone: "650-519-6607",
  business_email: "info@ccheroes-pro.com",
  whatsapp_number: "16505196607",
  sms_number: "16505196607",
  business_hours: "Mon-Sun: 8AM-8PM",
  service_area_description: "Serving Mountain View and nearby Bay Area cities"
};

const fallbackHomepage = {
  "hero.eyebrow": "Local cleaning pros",
  "hero.title": "Professional Sofa & Carpet Cleaning in the Bay Area",
  "hero.subtitle": "Deep cleaning for sofas, carpets, rugs, mattresses and upholstery. Eco-friendly, safe for kids and pets, with clear estimated pricing before we start.",
  "hero.cta_text": "Get Instant Estimate",
  "services.title": "Cleaning Services",
  "services.subtitle": "Simple service cards, clear starting prices and an instant estimate builder for residential cleaning.",
  "why.title": "Why Choose Us",
  "why.subtitle": "Trust blocks are practical: what matters to the customer before booking.",
  "about.title": "About Couch and Carpet Heroes",
  "about.cta_text": "Get Estimate",
  "contact.title": "Book Your Cleaning in 2 Minutes",
  "contact.description": "Send your service type, city and photos. We reply with a clear estimate and available time windows. Final price is confirmed on-site before work starts.",
  "footer.description": "Professional sofa, carpet, rug, mattress and upholstery cleaning for homes and businesses.",
  "footer.copyright": "© 2026 Couch and Carpet Heroes. All rights reserved."
};

const fallbackServices = [
  { id: "fallback-carpet", service_key: "carpet_cleaning", title: "Carpet Cleaning", description: "Hot water extraction, fast drying, and odor treatment available.", button_text: "Estimate Carpet Cleaning", sort_order: 1, is_active: true },
  { id: "fallback-sofa", service_key: "sofa_cleaning", title: "Sofa Cleaning", description: "Deep fabric cleaning, stain treatment, and optional fabric protection.", button_text: "Estimate Sofa Cleaning", sort_order: 2, is_active: true },
  { id: "fallback-mattress", service_key: "mattress_cleaning", title: "Mattress Cleaning", description: "Deep sanitation, spot treatment, and odor removal available.", button_text: "Estimate Mattress Cleaning", sort_order: 3, is_active: true }
];

const fallbackWhyFeatures = [
  { id: "fallback-inspection", feature_key: "inspection", title: "Careful Inspection", description: "We check fabric type, stains and possible risks before cleaning.", icon_text: "✓", sort_order: 1, is_active: true },
  { id: "fallback-eco", feature_key: "eco_friendly", title: "Eco-Friendly Products", description: "Safe cleaning products for homes with kids and pets.", icon_text: "♻", sort_order: 2, is_active: true },
  { id: "fallback-scheduling", feature_key: "fast_scheduling", title: "Fast Scheduling", description: "Easy booking by text, photos and clear time windows.", icon_text: "⏱", sort_order: 3, is_active: true },
  { id: "fallback-pricing", feature_key: "clear_pricing", title: "Clear Pricing", description: "Estimate before arrival, final price confirmed on-site.", icon_text: "$", sort_order: 4, is_active: true },
  { id: "fallback-local", feature_key: "local_service", title: "Local Service", description: "Serving Mountain View and nearby Bay Area cities.", icon_text: "★", sort_order: 5, is_active: true },
  { id: "fallback-text", feature_key: "text_friendly", title: "Text Friendly", description: "Send photos by text for a faster and more accurate quote.", icon_text: "☏", sort_order: 6, is_active: true }
];

const fallbackAboutParagraphs = [
  { id: "fallback-about-1", paragraph_text: "Couch and Carpet Heroes helps Bay Area homes and businesses keep sofas, carpets, rugs, mattresses and upholstery clean, fresh and ready to use.", sort_order: 1, is_active: true },
  { id: "fallback-about-2", paragraph_text: "We focus on clear communication, careful inspection, eco-friendly products and practical estimates before work starts.", sort_order: 2, is_active: true }
];

const fallbackFaqs = [
  { id: "fallback-faq-1", question: "Do you need photos before giving a price?", answer: "Photos help us give a more accurate estimate, especially for sofas, rugs, stains and odor issues.", sort_order: 1, is_active: true },
  { id: "fallback-faq-2", question: "Are your products safe for kids and pets?", answer: "We use eco-friendly products and choose the cleaning method based on fabric type and soil level.", sort_order: 2, is_active: true },
  { id: "fallback-faq-3", question: "Can all stains be removed?", answer: "Many stains improve or disappear, but some old or chemical stains may remain. We explain the risk before starting.", sort_order: 3, is_active: true },
  { id: "fallback-faq-4", question: "What areas do you serve?", answer: "Mountain View and nearby Bay Area cities, including Palo Alto, Sunnyvale, Los Altos, Cupertino and San Jose areas.", sort_order: 4, is_active: true }
];

let services = [];
let whyFeatures = [];
let aboutParagraphs = [];
let socialLinks = [];
let faqs = [];

const setMessage = (element, message, type = "") => {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("success", type === "success");
  element.classList.toggle("error", type === "error");
};

const showAdmin = (isLoggedIn) => {
  authPanel.hidden = isLoggedIn;
  adminPanel.hidden = !isLoggedIn;
};

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const getSettingValue = (key) => document.querySelector(`[data-setting="${key}"]`)?.value.trim() || "";
const getHomepageValue = (selector) => document.querySelector(`[data-homepage="${selector}"]`)?.value.trim() || "";

const sortByOrder = (items) => {
  items.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
};

const setAllSettingInputs = (key, value) => {
  document.querySelectorAll(`[data-setting="${key}"]`).forEach((input) => {
    input.value = value || "";
  });
};

async function loadSettings() {
  settingKeys.forEach((key) => setAllSettingInputs(key, fallbackSettings[key] || ""));

  const { data, error } = await client
    .from("site_settings")
    .select("setting_key, setting_value")
    .in("setting_key", settingKeys);

  if (error) throw error;

  const values = Object.fromEntries((data || []).map((row) => [row.setting_key, row.setting_value]));
  settingKeys.forEach((key) => setAllSettingInputs(key, values[key] || fallbackSettings[key] || ""));
}

async function saveSettings(keys = settingKeys) {
  const rows = [...new Set(keys)].map((key) => ({
    setting_key: key,
    setting_value: getSettingValue(key),
    label: key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  }));

  const { error } = await client
    .from("site_settings")
    .upsert(rows, { onConflict: "setting_key" });

  if (error) throw error;
}

async function loadHomepageContent() {
  homepageFields.forEach((field) => {
    const input = document.querySelector(`[data-homepage="${field.selector}"]`);
    if (input) input.value = fallbackHomepage[field.selector] || "";
  });

  const { data, error } = await client
    .from("homepage_content")
    .select("section_key, content_key, content_value");

  if (error) throw error;

  const values = Object.fromEntries((data || []).map((row) => [`${row.section_key}.${row.content_key}`, row.content_value]));
  homepageFields.forEach((field) => {
    const input = document.querySelector(`[data-homepage="${field.selector}"]`);
    if (input) input.value = values[field.selector] || fallbackHomepage[field.selector] || "";
  });
}

async function saveHomepageContent(selectors = homepageFields.map((field) => field.selector)) {
  const rows = selectors.map((selector) => {
    const field = homepageBySelector[selector];
    return {
      section_key: field.section_key,
      content_key: field.content_key,
      content_value: getHomepageValue(selector)
    };
  });

  const { error } = await client
    .from("homepage_content")
    .upsert(rows, { onConflict: "section_key,content_key" });

  if (error) throw error;
}

async function loadServices() {
  services = fallbackServices.map((service) => ({ ...service }));
  renderServices();

  const { data, error } = await client
    .from("services")
    .select("id, service_key, title, description, button_text, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  services = data?.length ? data : fallbackServices.map((service) => ({ ...service }));
  renderServices();
}

function renderServices() {
  sortByOrder(services);
  lists.services.innerHTML = services.map((service, index) => `
    <article class="faq-editor" data-service-id="${service.id}">
      <div class="faq-row">
        <strong>Service ${index + 1}</strong>
        <label class="toggle-label">
          <input type="checkbox" data-service-field="is_active" ${service.is_active ? "checked" : ""}>
          Active
        </label>
      </div>
      <label>
        Title
        <input type="text" data-service-field="title" value="${escapeHtml(service.title || "")}">
      </label>
      <label>
        Description
        <textarea data-service-field="description" rows="3">${escapeHtml(service.description || "")}</textarea>
      </label>
      <label>
        Button text
        <input type="text" data-service-field="button_text" value="${escapeHtml(service.button_text || "")}">
      </label>
      <label>
        Display order
        <input type="number" data-service-field="sort_order" value="${Number(service.sort_order || index + 1)}">
      </label>
    </article>
  `).join("");
}

function syncServices() {
  document.querySelectorAll("[data-service-id]").forEach((card) => {
    const item = services.find((service) => service.id === card.dataset.serviceId);
    if (!item) return;
    item.title = card.querySelector('[data-service-field="title"]')?.value.trim() || "";
    item.description = card.querySelector('[data-service-field="description"]')?.value.trim() || "";
    item.button_text = card.querySelector('[data-service-field="button_text"]')?.value.trim() || "";
    item.sort_order = Number(card.querySelector('[data-service-field="sort_order"]')?.value || 0);
    item.is_active = Boolean(card.querySelector('[data-service-field="is_active"]')?.checked);
  });
}

async function saveServices() {
  syncServices();
  for (const service of services) {
    const { error } = await client.from("services").update({
      title: service.title,
      description: service.description,
      button_text: service.button_text,
      sort_order: service.sort_order,
      is_active: service.is_active
    }).eq("id", service.id);
    if (error) throw error;
  }
  await loadServices();
}

async function loadWhyFeatures() {
  whyFeatures = fallbackWhyFeatures.map((feature) => ({ ...feature }));
  renderWhyFeatures();

  const { data, error } = await client
    .from("why_features")
    .select("id, feature_key, title, description, icon_text, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  whyFeatures = data?.length ? data : fallbackWhyFeatures.map((feature) => ({ ...feature }));
  renderWhyFeatures();
}

function renderWhyFeatures() {
  sortByOrder(whyFeatures);
  lists.why.innerHTML = whyFeatures.map((feature, index) => `
    <article class="faq-editor" data-why-id="${feature.id}">
      <div class="faq-row">
        <strong>Feature ${index + 1}</strong>
        <label class="toggle-label">
          <input type="checkbox" data-why-field="is_active" ${feature.is_active ? "checked" : ""}>
          Active
        </label>
      </div>
      <label>
        Icon text
        <input type="text" data-why-field="icon_text" value="${escapeHtml(feature.icon_text || "")}">
      </label>
      <label>
        Title
        <input type="text" data-why-field="title" value="${escapeHtml(feature.title || "")}">
      </label>
      <label>
        Description
        <textarea data-why-field="description" rows="3">${escapeHtml(feature.description || "")}</textarea>
      </label>
      <label>
        Display order
        <input type="number" data-why-field="sort_order" value="${Number(feature.sort_order || index + 1)}">
      </label>
    </article>
  `).join("");
}

function syncWhyFeatures() {
  document.querySelectorAll("[data-why-id]").forEach((card) => {
    const item = whyFeatures.find((feature) => feature.id === card.dataset.whyId);
    if (!item) return;
    item.icon_text = card.querySelector('[data-why-field="icon_text"]')?.value.trim() || "";
    item.title = card.querySelector('[data-why-field="title"]')?.value.trim() || "";
    item.description = card.querySelector('[data-why-field="description"]')?.value.trim() || "";
    item.sort_order = Number(card.querySelector('[data-why-field="sort_order"]')?.value || 0);
    item.is_active = Boolean(card.querySelector('[data-why-field="is_active"]')?.checked);
  });
}

async function saveWhyFeatures() {
  syncWhyFeatures();
  for (const feature of whyFeatures) {
    const { error } = await client.from("why_features").update({
      icon_text: feature.icon_text,
      title: feature.title,
      description: feature.description,
      sort_order: feature.sort_order,
      is_active: feature.is_active
    }).eq("id", feature.id);
    if (error) throw error;
  }
  await loadWhyFeatures();
}

async function loadAboutParagraphs() {
  aboutParagraphs = fallbackAboutParagraphs.map((paragraph) => ({ ...paragraph }));
  renderAboutParagraphs();

  const { data, error } = await client
    .from("about_paragraphs")
    .select("id, paragraph_text, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  aboutParagraphs = data?.length ? data : fallbackAboutParagraphs.map((paragraph) => ({ ...paragraph }));
  renderAboutParagraphs();
}

function renderAboutParagraphs() {
  sortByOrder(aboutParagraphs);
  lists.about.innerHTML = aboutParagraphs.map((paragraph, index) => `
    <article class="faq-editor" data-about-id="${paragraph.id}">
      <div class="faq-row">
        <strong>Paragraph ${index + 1}</strong>
        <label class="toggle-label">
          <input type="checkbox" data-about-field="is_active" ${paragraph.is_active ? "checked" : ""}>
          Active
        </label>
      </div>
      <label>
        Paragraph text
        <textarea data-about-field="paragraph_text" rows="4">${escapeHtml(paragraph.paragraph_text || "")}</textarea>
      </label>
      <div class="faq-row">
        <label>
          Sort order
          <input type="number" data-about-field="sort_order" value="${Number(paragraph.sort_order || index + 1)}">
        </label>
        <button class="btn delete-btn" type="button" data-delete-about="${paragraph.id}">Delete Paragraph</button>
      </div>
    </article>
  `).join("");
}

function syncAboutParagraphs() {
  document.querySelectorAll("[data-about-id]").forEach((card) => {
    const item = aboutParagraphs.find((paragraph) => paragraph.id === card.dataset.aboutId);
    if (!item) return;
    item.paragraph_text = card.querySelector('[data-about-field="paragraph_text"]')?.value.trim() || "";
    item.sort_order = Number(card.querySelector('[data-about-field="sort_order"]')?.value || 0);
    item.is_active = Boolean(card.querySelector('[data-about-field="is_active"]')?.checked);
  });
}

async function saveAboutParagraphs() {
  syncAboutParagraphs();
  for (const paragraph of aboutParagraphs) {
    const payload = {
      paragraph_text: paragraph.paragraph_text,
      sort_order: Number(paragraph.sort_order || 0),
      is_active: Boolean(paragraph.is_active)
    };
    if (paragraph.id.startsWith("new-")) {
      const { error } = await client.from("about_paragraphs").insert(payload);
      if (error) throw error;
    } else {
      const { error } = await client.from("about_paragraphs").update(payload).eq("id", paragraph.id);
      if (error) throw error;
    }
  }
  await loadAboutParagraphs();
}

async function deleteAboutParagraph(id) {
  if (id.startsWith("new-")) {
    aboutParagraphs = aboutParagraphs.filter((paragraph) => paragraph.id !== id);
    renderAboutParagraphs();
    return;
  }
  const { error } = await client.from("about_paragraphs").delete().eq("id", id);
  if (error) throw error;
  aboutParagraphs = aboutParagraphs.filter((paragraph) => paragraph.id !== id);
  renderAboutParagraphs();
}

async function loadSocialLinks() {
  socialLinks = [];
  renderSocialLinks();

  const { data, error } = await client
    .from("social_links")
    .select("id, platform, url, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  socialLinks = data || [];
  renderSocialLinks();
}

function renderSocialLinks() {
  sortByOrder(socialLinks);
  lists.social.innerHTML = socialLinks.map((link, index) => `
    <article class="faq-editor" data-social-id="${link.id}">
      <div class="faq-row">
        <strong>Social Link ${index + 1}</strong>
        <label class="toggle-label">
          <input type="checkbox" data-social-field="is_active" ${link.is_active ? "checked" : ""}>
          Active
        </label>
      </div>
      <label>
        Platform
        <input type="text" data-social-field="platform" value="${escapeHtml(link.platform || "")}">
      </label>
      <label>
        URL
        <input type="url" data-social-field="url" value="${escapeHtml(link.url || "")}">
      </label>
      <div class="faq-row">
        <label>
          Sort order
          <input type="number" data-social-field="sort_order" value="${Number(link.sort_order || index + 1)}">
        </label>
        <button class="btn delete-btn" type="button" data-delete-social="${link.id}">Delete Link</button>
      </div>
    </article>
  `).join("");
}

function syncSocialLinks() {
  document.querySelectorAll("[data-social-id]").forEach((card) => {
    const item = socialLinks.find((link) => link.id === card.dataset.socialId);
    if (!item) return;
    item.platform = card.querySelector('[data-social-field="platform"]')?.value.trim() || "";
    item.url = card.querySelector('[data-social-field="url"]')?.value.trim() || "";
    item.sort_order = Number(card.querySelector('[data-social-field="sort_order"]')?.value || 0);
    item.is_active = Boolean(card.querySelector('[data-social-field="is_active"]')?.checked);
  });
}

async function saveSocialLinks() {
  syncSocialLinks();
  for (const link of socialLinks) {
    const payload = {
      platform: link.platform,
      url: link.url,
      sort_order: Number(link.sort_order || 0),
      is_active: Boolean(link.is_active)
    };
    if (link.id.startsWith("new-")) {
      const { error } = await client.from("social_links").insert(payload);
      if (error) throw error;
    } else {
      const { error } = await client.from("social_links").update(payload).eq("id", link.id);
      if (error) throw error;
    }
  }
  await loadSocialLinks();
}

async function deleteSocialLink(id) {
  if (id.startsWith("new-")) {
    socialLinks = socialLinks.filter((link) => link.id !== id);
    renderSocialLinks();
    return;
  }
  const { error } = await client.from("social_links").delete().eq("id", id);
  if (error) throw error;
  socialLinks = socialLinks.filter((link) => link.id !== id);
  renderSocialLinks();
}

async function loadFaqs() {
  faqs = fallbackFaqs.map((faq) => ({ ...faq }));
  renderFaqs();

  const { data, error } = await client
    .from("faqs")
    .select("id, question, answer, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  faqs = data?.length ? data : fallbackFaqs.map((faq) => ({ ...faq }));
  renderFaqs();
}

function renderFaqs() {
  sortByOrder(faqs);
  lists.faqs.innerHTML = faqs.map((faq, index) => `
    <article class="faq-editor" data-faq-id="${faq.id}">
      <div class="faq-row">
        <strong>FAQ ${index + 1}</strong>
        <label class="toggle-label">
          <input type="checkbox" data-faq-field="is_active" ${faq.is_active ? "checked" : ""}>
          Active
        </label>
      </div>
      <label>
        Question
        <input type="text" data-faq-field="question" value="${escapeHtml(faq.question || "")}">
      </label>
      <label>
        Answer
        <textarea data-faq-field="answer" rows="4">${escapeHtml(faq.answer || "")}</textarea>
      </label>
      <div class="faq-row">
        <label>
          Sort order
          <input type="number" data-faq-field="sort_order" value="${Number(faq.sort_order || index + 1)}">
        </label>
        <button class="btn delete-btn" type="button" data-delete-faq="${faq.id}">Delete FAQ</button>
      </div>
    </article>
  `).join("");
}

function syncFaqState() {
  document.querySelectorAll("[data-faq-id]").forEach((card) => {
    const id = card.dataset.faqId;
    const faq = faqs.find((item) => item.id === id);
    if (!faq) return;
    faq.question = card.querySelector('[data-faq-field="question"]')?.value.trim() || "";
    faq.answer = card.querySelector('[data-faq-field="answer"]')?.value.trim() || "";
    faq.sort_order = Number(card.querySelector('[data-faq-field="sort_order"]')?.value || 0);
    faq.is_active = Boolean(card.querySelector('[data-faq-field="is_active"]')?.checked);
  });
}

async function saveFaqs() {
  syncFaqState();
  for (const faq of faqs) {
    const payload = {
      question: faq.question,
      answer: faq.answer,
      sort_order: Number(faq.sort_order || 0),
      is_active: Boolean(faq.is_active)
    };
    if (faq.id.startsWith("new-")) {
      const { error } = await client.from("faqs").insert(payload);
      if (error) throw error;
    } else {
      const { error } = await client.from("faqs").update(payload).eq("id", faq.id);
      if (error) throw error;
    }
  }
  await loadFaqs();
}

async function deleteFaq(id) {
  if (id.startsWith("new-")) {
    faqs = faqs.filter((faq) => faq.id !== id);
    renderFaqs();
    return;
  }
  const { error } = await client.from("faqs").delete().eq("id", id);
  if (error) throw error;
  faqs = faqs.filter((faq) => faq.id !== id);
  renderFaqs();
}

async function loadAdminData() {
  setMessage(statusMessage, "Loading content...");
  const loaders = [
    ["Business Settings", loadSettings],
    ["Homepage Content", loadHomepageContent],
    ["Services", loadServices],
    ["Why Choose Us", loadWhyFeatures],
    ["About", loadAboutParagraphs],
    ["Footer Social Links", loadSocialLinks],
    ["FAQs", loadFaqs]
  ];
  const results = await Promise.allSettled(loaders.map(([, loader]) => loader()));
  const failed = results
    .map((result, index) => ({ result, name: loaders[index][0] }))
    .filter((entry) => entry.result.status === "rejected");

  failed.forEach((entry) => {
    console.error(`${entry.name} failed to load`, entry.result.reason);
  });

  if (failed.length) {
    setMessage(statusMessage, `Loaded with fallback content. Check: ${failed.map((entry) => entry.name).join(", ")}.`, "error");
    return;
  }

  setMessage(statusMessage, "Content loaded.", "success");
}

async function handleSave(action, successText) {
  setMessage(statusMessage, "Saving...");
  try {
    await action();
    setMessage(statusMessage, successText, "success");
  } catch (error) {
    console.error(error);
    setMessage(statusMessage, error.message || "Save failed.", "error");
  }
}

document.addEventListener("input", (event) => {
  const key = event.target.dataset.setting;
  if (!key) return;
  document.querySelectorAll(`[data-setting="${key}"]`).forEach((input) => {
    if (input !== event.target) input.value = event.target.value;
  });
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(loginMessage, "Signing in...");
  const formData = new FormData(loginForm);
  const email = formData.get("email");
  const password = formData.get("password");
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    setMessage(loginMessage, error.message, "error");
    return;
  }
  loginForm.reset();
  setMessage(loginMessage, "");
});

document.querySelector("[data-logout]").addEventListener("click", async () => {
  await client.auth.signOut();
});

document.querySelector("[data-save-settings]").addEventListener("click", () => {
  handleSave(() => saveSettings(settingKeys), "Business settings saved.");
});

document.querySelector("[data-save-homepage]").addEventListener("click", () => {
  handleSave(() => saveHomepageContent(["hero.eyebrow", "hero.title", "hero.subtitle", "hero.cta_text"]), "Homepage content saved.");
});

document.querySelector("[data-save-services]").addEventListener("click", () => {
  handleSave(async () => {
    await saveHomepageContent(["services.title", "services.subtitle"]);
    await saveServices();
  }, "Services section saved.");
});

document.querySelector("[data-save-why]").addEventListener("click", () => {
  handleSave(async () => {
    await saveHomepageContent(["why.title", "why.subtitle"]);
    await saveWhyFeatures();
  }, "Why section saved.");
});

document.querySelector("[data-save-about]").addEventListener("click", () => {
  handleSave(async () => {
    await saveHomepageContent(["about.title", "about.cta_text"]);
    await saveAboutParagraphs();
  }, "About section saved.");
});

document.querySelector("[data-save-contact]").addEventListener("click", () => {
  handleSave(async () => {
    await saveHomepageContent(["contact.title", "contact.description"]);
    await saveSettings(["business_phone", "business_email", "business_hours", "service_area_description"]);
  }, "Contact section saved.");
});

document.querySelector("[data-save-footer]").addEventListener("click", () => {
  handleSave(async () => {
    await saveHomepageContent(["footer.description", "footer.copyright"]);
    await saveSettings(["business_phone", "business_email"]);
    await saveSocialLinks();
  }, "Footer saved.");
});

document.querySelector("[data-save-faqs]").addEventListener("click", () => {
  handleSave(saveFaqs, "FAQs saved.");
});

document.querySelector("[data-add-about]").addEventListener("click", () => {
  syncAboutParagraphs();
  aboutParagraphs.push({
    id: `new-${Date.now()}`,
    paragraph_text: "",
    sort_order: aboutParagraphs.length + 1,
    is_active: true
  });
  renderAboutParagraphs();
});

document.querySelector("[data-add-social]").addEventListener("click", () => {
  syncSocialLinks();
  socialLinks.push({
    id: `new-${Date.now()}`,
    platform: "",
    url: "",
    sort_order: socialLinks.length + 1,
    is_active: true
  });
  renderSocialLinks();
});

document.querySelector("[data-add-faq]").addEventListener("click", () => {
  syncFaqState();
  faqs.push({
    id: `new-${Date.now()}`,
    question: "",
    answer: "",
    sort_order: faqs.length + 1,
    is_active: true
  });
  renderFaqs();
});

lists.about.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-about]");
  if (!button) return;
  if (!window.confirm("Delete this paragraph?")) return;
  setMessage(statusMessage, "Deleting paragraph...");
  try {
    await deleteAboutParagraph(button.dataset.deleteAbout);
    setMessage(statusMessage, "Paragraph deleted.", "success");
  } catch (error) {
    console.error(error);
    setMessage(statusMessage, error.message || "Delete failed.", "error");
  }
});

lists.social.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-social]");
  if (!button) return;
  if (!window.confirm("Delete this social link?")) return;
  setMessage(statusMessage, "Deleting social link...");
  try {
    await deleteSocialLink(button.dataset.deleteSocial);
    setMessage(statusMessage, "Social link deleted.", "success");
  } catch (error) {
    console.error(error);
    setMessage(statusMessage, error.message || "Delete failed.", "error");
  }
});

lists.faqs.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-faq]");
  if (!button) return;
  if (!window.confirm("Delete this FAQ?")) return;
  setMessage(statusMessage, "Deleting FAQ...");
  try {
    await deleteFaq(button.dataset.deleteFaq);
    setMessage(statusMessage, "FAQ deleted.", "success");
  } catch (error) {
    console.error(error);
    setMessage(statusMessage, error.message || "Delete failed.", "error");
  }
});

client.auth.onAuthStateChange(async (_event, session) => {
  showAdmin(Boolean(session));
  if (session) {
    try {
      await loadAdminData();
    } catch (error) {
      console.error(error);
      setMessage(statusMessage, error.message || "Could not load admin content.", "error");
    }
  }
});

client.auth.getSession().then(({ data }) => {
  showAdmin(Boolean(data.session));
  if (data.session) {
    loadAdminData().catch((error) => {
      console.error(error);
      setMessage(statusMessage, error.message || "Could not load admin content.", "error");
    });
  }
});
