const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");

menuBtn?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
  menuBtn.textContent = isOpen ? "×" : "☰";
});

mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    menuBtn?.setAttribute("aria-expanded", "false");
    if (menuBtn) menuBtn.textContent = "☰";
  });
});

const sliders = document.querySelectorAll("[data-ba-slider]");

sliders.forEach((slider) => {
  const range = slider.querySelector(".ba-range");
  const update = () => {
    const value = Number(range.value);
    slider.style.setProperty("--position", `${value}%`);
    slider.style.setProperty("--position-num", String(value / 100));
  };
  range.addEventListener("input", update);
  update();
});

const beforeAfterCarousels = document.querySelectorAll("[data-ba-carousel]");

beforeAfterCarousels.forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-ba-slide]"));
  const prev = carousel.querySelector("[data-ba-prev]");
  const next = carousel.querySelector("[data-ba-next]");
  const dotsRoot = carousel.querySelector("[data-ba-dots]");
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "ba-dot";
    dot.setAttribute("aria-label", `Show before and after example ${index + 1}`);
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
});

const calculator = document.querySelector("[data-calculator]");

if (calculator) {
  const categoryPicker = calculator.querySelector("[data-category-picker]");
  const panelsRoot = calculator.querySelector("[data-calculator-panels]");
  const summaryRoot = calculator.querySelector("[data-summary]");
  const alertRoot = calculator.querySelector("[data-calculator-alert]");
  const whatsappButton = calculator.querySelector("[data-whatsapp]");
  const mobileTotal = document.querySelector("[data-mobile-total]");

  const phone = "16505196607";
  const minimumServiceCall = 120;

  // Edit prices here when Couch and Carpet Heroes updates the service menu.
  const pricingData = {
    categories: [
      { key: "carpet", label: "Carpet Cleaning" },
      { key: "upholstery", label: "Upholstery Cleaning" },
      { key: "mattress", label: "Mattress Cleaning" },
      { key: "rug", label: "Area Rug Cleaning" }
    ],
    cleaningLevels: {
      refresh: {
        label: "Refresh Clean",
        shortLabel: "Refresh",
        multiplier: 1,
        description: "Best for light dirt, regular maintenance, and freshening up."
      },
      deep: {
        label: "Deep Clean",
        shortLabel: "Deep Clean",
        multiplier: 1.25,
        badge: "Most Popular",
        description: "Best for visible stains, kids, pets, and high-traffic use."
      },
      restoration: {
        label: "Restoration Clean",
        shortLabel: "Restoration",
        multiplier: 1.6,
        description: "Best for heavy soil, odors, pet accidents, and long-term neglect."
      }
    },
    carpet: {
      areaTypes: {
        small: { label: "Small Room / Bedroom", price: 90 },
        standard: { label: "Standard Room", price: 120 },
        large: { label: "Large Living Room", price: 160 },
        xl: { label: "Extra Large / Open Space", price: 220 }
      },
      stairs: {
        none: { label: "No stairs", steps: 0 },
        range_1_10: { label: "1-10 steps", steps: 8 },
        range_11_16: { label: "11-16 steps", steps: 14 },
        range_17_24: { label: "17-24 steps", steps: 20 },
        range_25_plus: { label: "25+ steps", steps: 28 },
        custom: { label: "Custom number of steps", steps: null }
      },
      stairPrice: 6
    },
    upholstery: {
      furnitureTypes: {
        dining_chair: { label: "Dining Chair", price: 30 },
        armchair: { label: "Armchair", price: 90 },
        recliner: { label: "Recliner", price: 120 },
        ottoman: { label: "Ottoman", price: 60 },
        loveseat: { label: "Loveseat / 2-Seat Sofa", price: 160 },
        sofa_3: { label: "3-Seat Sofa", price: 220 },
        sofa_4: { label: "4-Seat Sofa", price: 270 },
        sectional: { label: "Sectional / L-Shape Sofa", price: 340 }
      },
      fabrics: {
        unsure: { label: "I'm not sure", multiplier: 1 },
        synthetic: { label: "Synthetic / Microfiber", multiplier: 1 },
        cotton: { label: "Cotton / Linen Blend", multiplier: 1.1 },
        velvet: { label: "Velvet", multiplier: 1.15 },
        wool: { label: "Wool", multiplier: 1.25 },
        delicate: { label: "Delicate / Designer Fabric", multiplier: 1.35 }
      },
      odors: {
        none: { label: "No odor issue", price: 0 },
        light: { label: "Light odor", price: 40 },
        strong: { label: "Strong odor / pet accident", price: 90 }
      }
    },
    mattress: {
      sizes: {
        twin: { label: "Twin", price: 100 },
        full: { label: "Full", price: 120 },
        queen: { label: "Queen", price: 150 },
        king: { label: "King / California King", price: 190 }
      },
      sides: {
        one: { label: "One side", multiplier: 1 },
        both: { label: "Both sides", multiplier: 1.4 }
      },
      issues: {
        none: { label: "No special issue", price: 0 },
        stains: { label: "Stains", price: 40 },
        odor: { label: "Odor", price: 60 },
        biological: { label: "Urine / biological accident", price: 100 }
      }
    },
    rug: {
      sizes: {
        small: { label: "Small up to 5x7", price: 110 },
        medium: { label: "Medium 6x9 / 8x10", price: 170 },
        large: { label: "Large 9x12+", price: 260 },
        oversized: { label: "Oversized / Custom", custom: true }
      },
      materials: {
        unsure: { label: "I'm not sure", multiplier: 1 },
        synthetic: { label: "Synthetic", multiplier: 1 },
        wool: { label: "Wool", multiplier: 1.25 },
        cotton: { label: "Cotton", multiplier: 1.15 },
        delicate: { label: "Silk / Viscose / Delicate", custom: true }
      }
    }
  };

  const state = {
    selected: new Set(),
    items: {
      carpet: [],
      upholstery: [],
      mattress: [],
      rug: []
    }
  };

  const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const money = (value) => `$${Math.round(value).toLocaleString("en-US")}`;
  const round10 = (value) => Math.round(value / 10) * 10;
  const qty = (value) => Math.max(1, Number.parseInt(value, 10) || 1);
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);

  const defaults = {
    carpet: () => ({ id: uid(), areaType: "standard", quantity: 1, level: "deep", stairs: "none", customSteps: 1 }),
    upholstery: () => ({ id: uid(), furnitureType: "sofa_3", quantity: 1, fabric: "unsure", level: "deep", odor: "none" }),
    mattress: () => ({ id: uid(), size: "queen", side: "one", level: "deep", issue: "none" }),
    rug: () => ({ id: uid(), size: "medium", material: "unsure", level: "deep" })
  };

  const ensureItem = (category) => {
    if (state.items[category] && state.items[category].length === 0) {
      state.items[category].push(defaults[category]());
    }
  };

  const optionMarkup = (options, selected) => Object.entries(options)
    .map(([key, option]) => `<option value="${key}" ${key === selected ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
    .join("");

  const selectField = (label, field, options, selected) => `
    <div class="field">
      <label>${label}
        <select data-field="${field}">${optionMarkup(options, selected)}</select>
      </label>
    </div>
  `;

  const quantityField = (value) => `
    <div class="field">
      <label>Quantity
        <input data-field="quantity" type="number" min="1" step="1" value="${qty(value)}">
      </label>
    </div>
  `;

  const levelField = (id, selected) => `
    <fieldset class="level-field field-full">
      <legend>Cleaning level</legend>
      <div class="level-grid">
        ${Object.entries(pricingData.cleaningLevels).map(([key, level]) => `
          <label class="level-card">
            <input type="radio" name="level-${id}" data-field="level" value="${key}" ${key === selected ? "checked" : ""}>
            <span>
              ${level.badge ? `<em class="popular-pill">${level.badge}</em>` : ""}
              <strong>${escapeHtml(level.label)}</strong>
              <small>${escapeHtml(level.description)}</small>
            </span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `;

  const renderCategories = () => {
    categoryPicker.innerHTML = pricingData.categories.map((category) => `
      <label class="category-option">
        <input type="checkbox" value="${category.key}" ${state.selected.has(category.key) ? "checked" : ""}>
        <span>${category.label}</span>
      </label>
    `).join("");
  };

  const itemCard = (category, item, index) => {
    const labels = { carpet: "Carpet area", upholstery: "Furniture item", mattress: "Mattress", rug: "Area rug" };
    const remove = state.items[category].length > 1 ? `<button class="remove-btn" type="button" data-remove="${item.id}">Remove</button>` : "";
    let fields = "";

    if (category === "carpet") {
      fields = `
        ${selectField("Area type", "areaType", pricingData.carpet.areaTypes, item.areaType)}
        ${quantityField(item.quantity)}
        ${levelField(item.id, item.level)}
        ${selectField("Stairs", "stairs", pricingData.carpet.stairs, item.stairs)}
        <div class="field ${item.stairs === "custom" ? "" : "hidden"}">
          <label>Custom number of steps
            <input data-field="customSteps" type="number" min="1" step="1" value="${qty(item.customSteps)}">
          </label>
        </div>
      `;
    }

    if (category === "upholstery") {
      fields = `
        ${selectField("Furniture type", "furnitureType", pricingData.upholstery.furnitureTypes, item.furnitureType)}
        ${quantityField(item.quantity)}
        ${selectField("Fabric type", "fabric", pricingData.upholstery.fabrics, item.fabric)}
        ${selectField("Odor / pet issue", "odor", pricingData.upholstery.odors, item.odor)}
        ${levelField(item.id, item.level)}
      `;
    }

    if (category === "mattress") {
      fields = `
        ${selectField("Mattress size", "size", pricingData.mattress.sizes, item.size)}
        ${selectField("Cleaning side", "side", pricingData.mattress.sides, item.side)}
        ${selectField("Issue", "issue", pricingData.mattress.issues, item.issue)}
        ${levelField(item.id, item.level)}
      `;
    }

    if (category === "rug") {
      fields = `
        ${selectField("Rug size", "size", pricingData.rug.sizes, item.size)}
        ${selectField("Material", "material", pricingData.rug.materials, item.material)}
        <p class="helper-note field-full">Tip: many rugs have a material label under one corner. You can check it or send us a photo.</p>
        ${levelField(item.id, item.level)}
      `;
    }

    return `
      <article class="item-card" data-category="${category}" data-item="${item.id}">
        <div class="item-head"><strong>${labels[category]} ${index + 1}</strong>${remove}</div>
        <div class="field-grid">${fields}</div>
      </article>
    `;
  };

  const renderPanels = () => {
    const meta = {
      carpet: ["Carpet Cleaning", "+ Add another carpet area"],
      upholstery: ["Upholstery Cleaning", "+ Add another furniture item"],
      mattress: ["Mattress Cleaning", "+ Add another mattress"],
      rug: ["Area Rug Cleaning", "+ Add another rug"]
    };

    panelsRoot.innerHTML = Array.from(state.selected).map((category) => `
      <section class="calculator-panel" data-panel="${category}">
        <div class="panel-head">
          <span class="step-badge">2</span>
          <div>
            <h3>${meta[category][0]}</h3>
            <p>Add each item separately for a clearer estimated range.</p>
          </div>
        </div>
        <div class="item-stack">${state.items[category].map((item, index) => itemCard(category, item, index)).join("")}</div>
        <button class="add-btn" type="button" data-add="${category}">${meta[category][1]}</button>
      </section>
    `).join("");
  };

  function calculateCarpetTotal() {
    let total = 0;
    const lines = [];
    state.items.carpet.forEach((item) => {
      const area = pricingData.carpet.areaTypes[item.areaType];
      const level = pricingData.cleaningLevels[item.level];
      const count = qty(item.quantity);
      const amount = area.price * level.multiplier * count;
      total += amount;
      lines.push({ label: `${area.label} x${count} - ${level.shortLabel}`, amount });
      const stair = pricingData.carpet.stairs[item.stairs];
      const steps = item.stairs === "custom" ? qty(item.customSteps) : stair.steps;
      if (steps > 0) {
        const stairAmount = steps * pricingData.carpet.stairPrice;
        total += stairAmount;
        lines.push({ label: `Stairs, ${steps} steps`, amount: stairAmount });
      }
    });
    return { title: "Carpet Cleaning", total, lines, hasCustom: false };
  }

  function calculateUpholsteryTotal() {
    let total = 0;
    const lines = [];
    state.items.upholstery.forEach((item) => {
      const furniture = pricingData.upholstery.furnitureTypes[item.furnitureType];
      const fabric = pricingData.upholstery.fabrics[item.fabric];
      const level = pricingData.cleaningLevels[item.level];
      const odor = pricingData.upholstery.odors[item.odor];
      const count = qty(item.quantity);
      const amount = ((furniture.price * level.multiplier * fabric.multiplier) + odor.price) * count;
      total += amount;
      lines.push({ label: `${furniture.label} x${count} - ${level.shortLabel}${odor.price ? `, ${odor.label}` : ""}`, amount });
    });
    return { title: "Upholstery Cleaning", total, lines, hasCustom: false };
  }

  function calculateMattressTotal() {
    let total = 0;
    const lines = [];
    state.items.mattress.forEach((item) => {
      const size = pricingData.mattress.sizes[item.size];
      const side = pricingData.mattress.sides[item.side];
      const level = pricingData.cleaningLevels[item.level];
      const issue = pricingData.mattress.issues[item.issue];
      const amount = (size.price * side.multiplier * level.multiplier) + issue.price;
      total += amount;
      lines.push({ label: `${size.label} - ${side.label}, ${level.shortLabel}${issue.price ? `, ${issue.label}` : ""}`, amount });
    });
    return { title: "Mattress Cleaning", total, lines, hasCustom: false };
  }

  function calculateRugTotal() {
    let total = 0;
    let hasCustom = false;
    const lines = [];
    state.items.rug.forEach((item) => {
      const size = pricingData.rug.sizes[item.size];
      const material = pricingData.rug.materials[item.material];
      const level = pricingData.cleaningLevels[item.level];
      if (size.custom || material.custom) {
        hasCustom = true;
        lines.push({ label: `${size.label} - ${material.label}, ${level.shortLabel}`, custom: true });
        return;
      }
      const amount = size.price * material.multiplier * level.multiplier;
      total += amount;
      lines.push({ label: `${size.label} - ${material.label}, ${level.shortLabel}`, amount });
    });
    return { title: "Area Rug Cleaning", total, lines, hasCustom };
  }

  const calculateEstimate = () => {
    const categories = [];
    if (state.selected.has("carpet")) categories.push(calculateCarpetTotal());
    if (state.selected.has("upholstery")) categories.push(calculateUpholsteryTotal());
    if (state.selected.has("mattress")) categories.push(calculateMattressTotal());
    if (state.selected.has("rug")) categories.push(calculateRugTotal());
    const rawTotal = categories.reduce((sum, category) => sum + category.total, 0);
    const total = rawTotal > 0 ? Math.max(rawTotal, minimumServiceCall) : 0;
    return {
      categories,
      rawTotal,
      total,
      low: total ? round10(total * 0.9) : 0,
      high: total ? round10(total * 1.15) : 0,
      hasCustom: categories.some((category) => category.hasCustom)
    };
  };

  function renderEstimateSummary() {
    const estimate = calculateEstimate();
    if (estimate.categories.length === 0) {
      summaryRoot.innerHTML = `<div class="summary-empty">Select one or more residential cleaning services to build your estimated quote.</div><p class="summary-note">Photos help us confirm the exact price before arrival.</p>`;
      if (mobileTotal) mobileTotal.textContent = "Text for quote";
      return;
    }

    const totalText = estimate.total ? `${money(estimate.low)} - ${money(estimate.high)}` : "Custom quote";
    summaryRoot.innerHTML = `
      ${estimate.categories.map((category) => `
        <div class="summary-category">
          <h4>${category.title}</h4>
          <ul class="summary-lines">
            ${category.lines.map((line) => `<li class="summary-line"><span>${escapeHtml(line.label)}</span><strong>${line.custom ? "Custom quote" : money(line.amount)}</strong></li>`).join("")}
          </ul>
          <div class="category-subtotal"><span>Subtotal</span><strong>${category.total ? money(category.total) : "Custom quote"}</strong></div>
        </div>
      `).join("")}
      ${estimate.rawTotal > 0 && estimate.rawTotal < minimumServiceCall ? `<p class="custom-note">$${minimumServiceCall} minimum service call applied.</p>` : ""}
      ${estimate.hasCustom ? `<p class="custom-note">Some selected items require a custom quote. Please send photos for an exact estimate.</p>` : ""}
      <div class="summary-total"><span>Estimated Total</span><strong>${totalText}</strong></div>
      <p class="summary-note">This is an estimate. Final price depends on size, fabric, stains, odor, access, and condition.</p>
      <p class="summary-note">Photos help us confirm the exact price before arrival.</p>
    `;
    if (mobileTotal) mobileTotal.textContent = totalText;
  }

  function buildWhatsAppMessage() {
    const estimate = calculateEstimate();
    const range = estimate.total ? `${money(estimate.low)} - ${money(estimate.high)}` : "Custom quote required";
    const items = estimate.categories.flatMap((category) => [
      `${category.title}:`,
      ...category.lines.map((line) => `- ${line.label}: ${line.custom ? "Custom quote required" : money(line.amount)}`)
    ]);
    return [
      "Hello, I used your website estimate calculator.",
      "",
      "Selected services:",
      ...items,
      "",
      "Estimated range:",
      range,
      "",
      "I would like an exact quote."
    ].join("\n");
  }

  const renderAll = () => {
    renderCategories();
    renderPanels();
    renderEstimateSummary();
  };

  categoryPicker.addEventListener("change", (event) => {
    const input = event.target.closest("input[type='checkbox']");
    if (!input) return;
    if (input.checked) {
      state.selected.add(input.value);
      ensureItem(input.value);
    } else {
      state.selected.delete(input.value);
    }
    renderAll();
  });

  panelsRoot.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add]");
    const remove = event.target.closest("[data-remove]");
    if (add) {
      const category = add.dataset.add;
      state.items[category].push(defaults[category]());
      renderAll();
    }
    if (remove) {
      const card = remove.closest(".item-card");
      const category = card.dataset.category;
      state.items[category] = state.items[category].filter((item) => item.id !== remove.dataset.remove);
      ensureItem(category);
      renderAll();
    }
  });

  panelsRoot.addEventListener("input", (event) => {
    const field = event.target.dataset.field;
    if (!field) return;
    const card = event.target.closest(".item-card");
    const item = state.items[card.dataset.category].find((entry) => entry.id === card.dataset.item);
    if (!item) return;
    item[field] = event.target.type === "number" ? qty(event.target.value) : event.target.value;
    if (event.target.type === "number" && Number(event.target.value) < 1) event.target.value = 1;
    renderEstimateSummary();
  });

  panelsRoot.addEventListener("change", (event) => {
    const field = event.target.dataset.field;
    if (!field) return;
    const card = event.target.closest(".item-card");
    const item = state.items[card.dataset.category].find((entry) => entry.id === card.dataset.item);
    if (!item) return;
    item[field] = event.target.type === "number" ? qty(event.target.value) : event.target.value;
    if (card.dataset.category === "carpet" && field === "stairs") {
      renderPanels();
    }
    renderEstimateSummary();
  });

  whatsappButton.addEventListener("click", () => {
    if (state.selected.size === 0) {
      alertRoot.textContent = "Please select at least one cleaning service first.";
      setTimeout(() => { alertRoot.textContent = ""; }, 4000);
      return;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage())}`, "_blank", "noopener");
  });

  document.querySelectorAll("[data-jump-service]").forEach((link) => {
    link.addEventListener("click", () => {
      const category = link.dataset.jumpService;
      state.selected.add(category);
      ensureItem(category);
      renderAll();
    });
  });

  renderAll();
}
