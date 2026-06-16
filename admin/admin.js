const SUPABASE_URL = "https://gxtrpycepqnecoyxnonl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Sx1dm7TzcIntHfB6lrFctA_xoKF_EYU";

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const authPanel = document.querySelector("[data-auth-panel]");
const adminPanel = document.querySelector("[data-admin-panel]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const statusMessage = document.querySelector("[data-status-message]");
const faqList = document.querySelector("[data-faq-list]");

const settingKeys = ["business_phone", "business_email", "whatsapp_number", "sms_number"];
const homepageFields = [
  { selector: "hero.title", section_key: "hero", content_key: "title" },
  { selector: "hero.subtitle", section_key: "hero", content_key: "subtitle" },
  { selector: "hero.cta_text", section_key: "hero", content_key: "cta_text" }
];

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

const sortFaqs = () => {
  faqs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
};

const escapeHtml = (value = "") => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

async function loadSettings() {
  const { data, error } = await client
    .from("site_settings")
    .select("setting_key, setting_value")
    .in("setting_key", settingKeys);

  if (error) throw error;

  const values = Object.fromEntries((data || []).map((row) => [row.setting_key, row.setting_value]));
  settingKeys.forEach((key) => {
    const input = document.querySelector(`[data-setting="${key}"]`);
    if (input) input.value = values[key] || "";
  });
}

async function saveSettings() {
  const rows = settingKeys.map((key) => {
    const input = document.querySelector(`[data-setting="${key}"]`);
    return {
      setting_key: key,
      setting_value: input?.value.trim() || "",
      label: input?.closest("label")?.childNodes[0]?.textContent.trim() || key
    };
  });

  const { error } = await client
    .from("site_settings")
    .upsert(rows, { onConflict: "setting_key" });

  if (error) throw error;
}

async function loadHomepageContent() {
  const { data, error } = await client
    .from("homepage_content")
    .select("section_key, content_key, content_value")
    .eq("section_key", "hero");

  if (error) throw error;

  const values = Object.fromEntries((data || []).map((row) => [`${row.section_key}.${row.content_key}`, row.content_value]));
  homepageFields.forEach((field) => {
    const input = document.querySelector(`[data-homepage="${field.selector}"]`);
    if (input) input.value = values[field.selector] || "";
  });
}

async function saveHomepageContent() {
  const rows = homepageFields.map((field) => {
    const input = document.querySelector(`[data-homepage="${field.selector}"]`);
    return {
      section_key: field.section_key,
      content_key: field.content_key,
      content_value: input?.value.trim() || ""
    };
  });

  const { error } = await client
    .from("homepage_content")
    .upsert(rows, { onConflict: "section_key,content_key" });

  if (error) throw error;
}

async function loadFaqs() {
  const { data, error } = await client
    .from("faqs")
    .select("id, question, answer, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  faqs = data || [];
  renderFaqs();
}

function renderFaqs() {
  sortFaqs();
  faqList.innerHTML = faqs.map((faq, index) => `
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
  await Promise.all([loadSettings(), loadHomepageContent(), loadFaqs()]);
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
  handleSave(saveSettings, "Business settings saved.");
});

document.querySelector("[data-save-homepage]").addEventListener("click", () => {
  handleSave(saveHomepageContent, "Homepage content saved.");
});

document.querySelector("[data-save-faqs]").addEventListener("click", () => {
  handleSave(saveFaqs, "FAQs saved.");
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

faqList.addEventListener("click", async (event) => {
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
