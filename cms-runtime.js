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
    .filter((node) => !node.closest("script,style,.ba-slider,.service-gallery-dots,.ba-dots,.calculator-layout,.estimate-modal"));

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

  const applyMediaToSection = (section, media = {}) => {
    if (media.beforeAfter?.length || media.gallery?.length || media.imageBreaks) {
      const payload = {
        beforeAfter: media.beforeAfter || window.servicePageMedia?.beforeAfter || [],
        gallery: media.gallery || window.servicePageMedia?.gallery || [],
        imageBreaks: media.imageBreaks || window.servicePageMedia?.imageBreaks || {}
      };
      window.cmsServicePageMedia = payload;
      window.renderServicePageMedia?.(payload);
    }

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
