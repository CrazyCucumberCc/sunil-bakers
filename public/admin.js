const THEME_KEY = "sunil-theme";
let state = null;

function defaultAdminMenuState() {
  return {
    classic: [
      {
        id: "classic_1",
        name: "Vanilla Cake",
        description: "Light, creamy, and timeless with a polished celebration finish.",
        price: 450
      },
      {
        id: "classic_2",
        name: "Pineapple Cake",
        description: "Fresh pineapple notes with soft sponge and elegant whipped styling.",
        price: 500
      },
      {
        id: "classic_3",
        name: "Red Velvet Cake",
        description: "Velvety layers with luxurious texture and a rich premium look.",
        price: 700
      },
      {
        id: "classic_4",
        name: "Black Current Cake",
        description: "A fruity, vibrant option with a refined bakery-style presentation.",
        price: 560
      },
      {
        id: "classic_5",
        name: "Strawberry Cake",
        description: "Soft pink freshness and smooth cream layers for sweet celebrations.",
        price: 560
      },
      {
        id: "classic_6",
        name: "Rasmalai Cake",
        description: "Indian dessert inspiration with festive richness and creamy depth.",
        price: 760
      },
      {
        id: "classic_7",
        name: "Mango Cake",
        description: "Sunny mango flavor with a fresh, smooth, celebration-ready profile.",
        price: 580
      }
    ],
    special: [
      {
        id: "special_1",
        name: "Black Forest Cake",
        description: "Chocolate, cream, and cherries brought together with timeless appeal.",
        price: 650
      },
      {
        id: "special_2",
        name: "White Forest Cake",
        description: "A lighter forest-inspired cake with delicate elegance and creamy layers.",
        price: 680
      },
      {
        id: "special_3",
        name: "Chocolate Truffle Cake",
        description: "Glossy, rich, and deeply indulgent with a premium chocolate finish.",
        price: 820
      },
      {
        id: "special_4",
        name: "Fruit Slice Cake",
        description: "Fresh fruit detail and a bright, layered presentation for elegant occasions.",
        price: 740
      },
      {
        id: "special_5",
        name: "Biscoff Cake",
        description: "Caramel biscuit richness with contemporary styling and crowd-pleasing flavor.",
        price: 950
      }
    ],
    brownie: [
      {
        id: "brownie_1",
        name: "Chocolate Truffle Brownie",
        description: "Dense, fudgy, and layered with decadent chocolate truffle indulgence.",
        price: 320
      }
    ]
  };
}

function defaultAdminContentState() {
  return {
    hero: {
      eyebrow: "Premium Cakes. Crafted Daily.",
      titleSoft: "Delicious Moments,",
      titleScript: "Crafted Fresh",
      copy:
        "A luxury-style bakery experience in Mandi Gobindgarh, serving fresh cakes, elegant eggless creations, and custom theme cakes made for celebrations that deserve more than ordinary."
    },
    about: {
      eyebrow: "About Sunil Bakers",
      titleSoft: "A local bakery with a",
      titleScript: "couture cake soul",
      lead:
        "Sunil Bakers brings together the warmth of a neighborhood bakery and the finish of a premium celebration studio.",
      body:
        "Located in Main Bazar, every cake is created to feel personal, polished, and occasion-ready. From everyday fresh cakes to detailed custom themes, the focus is always on softness, freshness, and elegant presentation."
    },
    gallery: {
      eyebrow: "Cake Gallery",
      title: "Real cake visuals that make the bakery feel",
      accent: "worth visiting",
      copy:
        "Owners buy bakery websites faster when the site proves it can showcase real output, not just branding language.",
      items: []
    },
    faq: {
      eyebrow: "FAQ",
      title: "Common customer questions,",
      accent: "answered clearly",
      copy:
        "A bakery owner is more likely to value the site when it reduces repeated customer questions and makes ordering easier.",
      items: []
    }
  };
}

function ensureContentState(rawContent) {
  const defaults = defaultAdminContentState();
  return {
    hero: {
      ...defaults.hero,
      ...(rawContent?.hero || {})
    },
    about: {
      ...defaults.about,
      ...(rawContent?.about || {})
    },
    gallery: {
      ...defaults.gallery,
      ...(rawContent?.gallery || {}),
      items: Array.isArray(rawContent?.gallery?.items) ? rawContent.gallery.items : []
    },
    faq: {
      ...defaults.faq,
      ...(rawContent?.faq || {}),
      items: Array.isArray(rawContent?.faq?.items) ? rawContent.faq.items : []
    }
  };
}

function ensureMenuState(rawMenu) {
  const defaults = defaultAdminMenuState();
  const mergeCategory = (category) =>
    defaults[category].map((item, index) => {
      const incoming = Array.isArray(rawMenu?.[category])
        ? rawMenu[category].find((candidate) => candidate?.id === item.id) || rawMenu[category][index] || {}
        : {};
      return {
        ...item,
        ...incoming,
        id: incoming?.id || item.id,
        name: incoming?.name || item.name,
        description: incoming?.description || item.description,
        price: Number(incoming?.price) > 0 ? Number(incoming.price) : item.price
      };
    });

  return {
    classic: mergeCategory("classic"),
    special: mergeCategory("special"),
    brownie: mergeCategory("brownie")
  };
}

function applyTheme(theme) {
  const root = document.documentElement;
  const toggle = document.querySelector("#theme-toggle");
  const isDark = theme === "dark";
  root.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  const color = getComputedStyle(root).getPropertyValue("--theme-color").trim();
  if (meta && color) meta.setAttribute("content", color);
  if (toggle) {
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    const label = toggle.querySelector(".theme-toggle-label");
    if (label) label.textContent = isDark ? "Light mode" : "Dark mode";
  }
}

function setupThemeToggle() {
  const toggle = document.querySelector("#theme-toggle");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const stored = localStorage.getItem(THEME_KEY);
  applyTheme(stored || (mediaQuery.matches ? "dark" : "light"));
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function status(id, message, type = "default") {
  const el = document.querySelector(`#${id}`);
  if (!el) return;
  el.textContent = message || "";
  el.dataset.state = type;
}

function toggleAuth(authenticated, setupRequired) {
  document.querySelector("#admin-auth-section").hidden = authenticated;
  document.querySelector("#admin-dashboard").hidden = !authenticated;
  document.querySelector("#setup-card").hidden = !setupRequired;
  document.querySelector("#login-card").hidden = setupRequired;
  document.querySelector("#admin-logout").hidden = !authenticated;
}

function cardsHtml(items, className, key, value, copy) {
  return items
    .map((item) => `<article class="${className}"><span class="admin-stat-label">${item[key]}</span><strong>${item[value]}</strong><p>${item[copy]}</p></article>`)
    .join("");
}

function renderStats(data) {
  document.querySelector("#admin-stats").innerHTML = cardsHtml(
    [
      { label: "Needs Reply", value: data.stats.newOrders, copy: "Fresh website enquiries waiting for your response." },
      { label: "In Progress", value: data.stats.activeOrders, copy: "Orders currently being quoted, prepared, or arranged." },
      { label: "Ready / Done", value: data.orderPipeline.ready + data.stats.completedOrders, copy: "Orders ready for pickup or already finished." }
    ],
    "admin-stat-card admin-stat-card-simple",
    "label",
    "value",
    "copy"
  );
  document.querySelector("#admin-reports").innerHTML = `
    <article class="admin-stat-card admin-report-card admin-note-card">
      <span class="admin-stat-label">Best Seller</span>
      <strong>${data.reports.topCakeType}</strong>
      <p>Most requested cake style right now.</p>
    </article>
    <article class="admin-stat-card admin-report-card admin-note-card">
      <span class="admin-stat-label">Popular Flavor</span>
      <strong>${data.reports.topFlavor}</strong>
      <p>Flavor customers are asking for most often.</p>
    </article>
  `;
}

function renderPipeline(pipeline) {
  const labels = [
    ["new", "New"],
    ["quoted", "Quoted"],
    ["kitchen", "In Kitchen"],
    ["ready", "Ready"]
  ];
  document.querySelector("#admin-pipeline").innerHTML = labels
    .map(
      ([value, label]) => `
        <article class="admin-pipeline-card">
          <span>${label}</span>
          <strong>${pipeline[value] || 0}</strong>
          <p>${label === "New" ? "Reply first" : label === "Quoted" ? "Awaiting customer response" : label === "In Kitchen" ? "Currently being prepared" : "Ready to hand over"}</p>
        </article>
      `
    )
    .join("");
}

function renderBarChart(pipeline) {
  const container = document.querySelector("#admin-bar-chart");
  if (!container) return;
  container.innerHTML = `
    <article class="admin-focus-card">
      <span class="admin-bar-label">Reply first</span>
      <strong>${pipeline.new || 0} new enquiries</strong>
      <p>Start with fresh messages so customers get a quick response.</p>
    </article>
    <article class="admin-focus-card">
      <span class="admin-bar-label">Prepare next</span>
      <strong>${pipeline.kitchen || 0} orders in kitchen</strong>
      <p>Check cake progress, details, and handover timing.</p>
    </article>
    <article class="admin-focus-card">
      <span class="admin-bar-label">Share updates</span>
      <strong>${pipeline.ready || 0} orders ready</strong>
      <p>Use the customer links below to send pickup or completion updates.</p>
    </article>
  `;
}

function orderStatusOptions(selected) {
  return [["new", "New"], ["quoted", "Quoted"], ["confirmed", "Confirmed"], ["kitchen", "In Kitchen"], ["ready", "Ready"], ["completed", "Completed"]]
    .map(([value, label]) => `<option value="${value}"${selected === value ? " selected" : ""}>${label}</option>`)
    .join("");
}

function renderOrders(orders) {
  const list = document.querySelector("#admin-orders-list");
  if (!orders.length) {
    list.innerHTML = `<article class="admin-order-card admin-empty-card"><h4>No enquiries yet</h4><p>Website leads will begin appearing here automatically.</p></article>`;
    return;
  }
  list.innerHTML = orders
    .map(
      (order) => `
        <article class="admin-order-card">
          <div class="admin-order-head">
            <div><span class="admin-order-id">${order.id}</span><h4>${order.customerName}</h4></div>
            <span class="admin-order-date">${new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div class="admin-order-meta">
            <span><strong>Email:</strong> ${order.email}</span>
            <span><strong>Phone:</strong> ${order.phone || "Not shared"}</span>
            <span><strong>Cake Type:</strong> ${order.cakeType || "Not shared"}</span>
            <span><strong>Selected Cake:</strong> ${order.cakeName || "Not shared"}</span>
            <span><strong>Occasion:</strong> ${order.occasion || "Not shared"}</span>
            <span><strong>Flavor:</strong> ${order.flavor || "Not shared"}</span>
            <span><strong>Date Needed:</strong> ${order.dateNeeded || "Not shared"}</span>
            <span><strong>Pickup Time:</strong> ${order.pickupTime || "Not shared"}</span>
            <span><strong>Listed Price:</strong> ${order.listedPrice ? `Rs ${order.listedPrice}` : "Not shared"}</span>
          </div>
          <p class="admin-order-message">${order.message}</p>
          <div class="admin-order-grid">
            <label><span>Status</span><select data-order-status="${order.id}">${orderStatusOptions(order.status)}</select></label>
            <label><span>Quoted Price</span><input type="text" data-order-quoted="${order.id}" value="${order.quotedPrice || ""}" placeholder="4500" /></label>
            <label><span>Pickup Mode</span><input type="text" data-order-pickup-mode="${order.id}" value="${order.pickupMode || ""}" placeholder="Pickup / Delivery" /></label>
            <label><span>Pickup Time</span><input type="text" data-order-pickup-time="${order.id}" value="${order.pickupTime || ""}" placeholder="6:30 PM" /></label>
            <label class="admin-order-notes"><span>Internal Notes</span><textarea data-order-notes="${order.id}" rows="4" placeholder="Quote, topper details, design notes, pickup reminders...">${order.internalNotes || ""}</textarea></label>
          </div>
          <div class="admin-order-actions-row">
            <button class="button button-primary admin-order-save" data-save-order="${order.id}" type="button">Save Order Update</button>
            ${
              order.whatsappLinks
                ? `
                  <a class="button button-secondary" href="${order.whatsappLinks.general}" target="_blank" rel="noreferrer">WhatsApp Customer</a>
                  <a class="button button-secondary" href="${order.whatsappLinks.quote}" target="_blank" rel="noreferrer">Send Quote</a>
                  <a class="button button-secondary" href="${order.whatsappLinks.ready}" target="_blank" rel="noreferrer">Ready for Pickup</a>
                `
                : `<span class="admin-order-hint">Add a phone number to use WhatsApp shortcuts.</span>`
            }
          </div>
        </article>
      `
    )
    .join("");
}

function renderProfile(data) {
  const form = document.querySelector("#profile-form");
  if (!form) return;
  form.elements.displayName.value = data.user.displayName || "";
  form.elements.username.value = data.user.username || "";
}

function renderProduction(data) {
  const form = document.querySelector("#production-form");
  form.elements.title.value = data.productionNote.title || "";
  form.elements.content.value = data.productionNote.content || "";
}

function renderSettings(data) {
  const form = document.querySelector("#settings-form");
  form.elements.businessHours.value = data.settings.businessHours || "";
  form.elements.pickupWindow.value = data.settings.pickupWindow || "";
  form.elements.serviceArea.value = data.settings.serviceArea || "";
  form.elements.orderNotice.value = data.settings.orderNotice || "";
}

function renderContent(data) {
  const form = document.querySelector("#content-form");
  form.elements.heroEyebrow.value = data.siteContent.hero.eyebrow || "";
  form.elements.heroTitleSoft.value = data.siteContent.hero.titleSoft || "";
  form.elements.heroTitleScript.value = data.siteContent.hero.titleScript || "";
  form.elements.heroCopy.value = data.siteContent.hero.copy || "";
  form.elements.aboutEyebrow.value = data.siteContent.about.eyebrow || "";
  form.elements.aboutTitleSoft.value = data.siteContent.about.titleSoft || "";
  form.elements.aboutTitleScript.value = data.siteContent.about.titleScript || "";
  form.elements.aboutLead.value = data.siteContent.about.lead || "";
  form.elements.aboutBody.value = data.siteContent.about.body || "";
}

function renderMenuEditor(data) {
  const container = document.querySelector("#admin-menu-editor");
  if (!container) return;

  const menuCatalog = ensureMenuState(data.menuCatalog);

  const sections = [
    ["classic", "Classic Cakes"],
    ["special", "Special Cakes"],
    ["brownie", "Brownies"]
  ];

  container.innerHTML = `
    <div class="admin-menu-tabs" role="tablist" aria-label="Cake pricing categories">
      ${sections
        .map(
          ([category, label], index) => `
            <button
              class="admin-menu-tab${index === 0 ? " is-active" : ""}"
              type="button"
              role="tab"
              data-menu-tab="${category}"
              aria-selected="${index === 0 ? "true" : "false"}"
            >
              ${label}
            </button>
          `
        )
        .join("")}
    </div>
    <div class="admin-menu-panels">
      ${sections
        .map(
          ([category, label], index) => `
            <article class="admin-team-card admin-menu-category-card${index === 0 ? " is-active" : ""}" data-menu-panel="${category}">
              <div class="admin-team-head">
                <div><h4>${label}</h4><span>${category} • ${(menuCatalog[category] || []).length} editable items</span></div>
              </div>
              <p class="admin-order-hint">Swipe sideways or use the buttons to move through all priced cakes in this category.</p>
              <div class="admin-menu-controls" aria-label="${label} navigation">
                <button class="button button-secondary admin-menu-nav" type="button" data-menu-prev="${category}" aria-label="Show previous ${label.toLowerCase()} card">Previous Cake</button>
                <span class="admin-menu-position" data-menu-position="${category}">1 / ${(menuCatalog[category] || []).length}</span>
                <button class="button button-primary admin-menu-nav" type="button" data-menu-next="${category}" aria-label="Show next ${label.toLowerCase()} card">Next Cake</button>
              </div>
              <div class="admin-menu-swimlane" data-menu-lane="${category}">
                ${(menuCatalog[category] || [])
                  .map(
                    (item, index) => `
                      <article class="admin-menu-slide${index === 0 ? " is-active" : ""}" data-menu-slide="${category}" data-menu-index="${index}">
                        <div class="admin-menu-slide-top">
                          <span class="admin-team-role">Priced Cake</span>
                          <strong>30% advance: Rs ${Math.round((Number(item.price) || 0) * 0.3)}</strong>
                        </div>
                        <div class="admin-menu-list">
                          <label><span>Cake Name</span><input type="text" data-menu-name="${category}:${item.id}" value="${item.name}" /></label>
                          <label class="admin-menu-description"><span>Description</span><textarea data-menu-description="${category}:${item.id}" rows="4">${item.description || ""}</textarea></label>
                          <label><span>Price (Rs)</span><input type="number" min="0" step="1" data-menu-price="${category}:${item.id}" value="${item.price}" /></label>
                        </div>
                      </article>
                    `
                  )
                  .join("") || `<article class="admin-menu-slide admin-menu-empty"><p>No cakes are showing here yet. Refresh once, or save to rebuild this category.</p></article>`}
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderGallery(data) {
  const list = document.querySelector("#admin-gallery-list");
  list.innerHTML = data.siteContent.gallery.items
    .map(
      (item) => `
        <article class="admin-team-card">
          <div class="admin-team-head">
            <div><h4>${item.title}</h4><span>${item.kicker}</span></div>
            <span class="admin-team-role">${item.wide ? "Wide" : "Standard"}</span>
          </div>
          <div class="admin-gallery-thumb"><img src="${item.image}" alt="${item.alt}" loading="lazy" /></div>
          <div class="admin-team-editor">
            <label><span>Kicker</span><input type="text" data-gallery-kicker="${item.id}" value="${item.kicker}" /></label>
            <label><span>Title</span><input type="text" data-gallery-title="${item.id}" value="${item.title}" /></label>
            <label><span>Alt Text</span><input type="text" data-gallery-alt="${item.id}" value="${item.alt}" /></label>
            <label><span>Image URL</span><input type="text" data-gallery-image="${item.id}" value="${item.image}" /></label>
            <label><span>Width</span><select data-gallery-wide="${item.id}"><option value="false"${!item.wide ? " selected" : ""}>Standard</option><option value="true"${item.wide ? " selected" : ""}>Wide</option></select></label>
            <button class="button button-secondary" data-delete-gallery="${item.id}" type="button">Remove Image</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTeam(data) {
  const teamForm = document.querySelector("#team-form");
  const teamList = document.querySelector("#admin-team-list");
  const isOwner = data.user.role === "owner";
  const canManageContent = ["owner", "manager"].includes(data.user.role);

  document.querySelector("#admin-team").hidden = !isOwner;
  teamForm.hidden = !isOwner;
  document.querySelector("#admin-settings").hidden = !canManageContent;
  document.querySelector("#admin-content").hidden = !canManageContent;
  document.querySelector("#admin-menu").hidden = !canManageContent;
  document.querySelector("#admin-gallery").hidden = !canManageContent;

  if (!isOwner) {
    teamList.innerHTML = "";
    return;
  }

  teamList.innerHTML = data.team
    .map(
      (member) => `
        <article class="admin-team-card${!member.active ? " is-inactive" : ""}">
          <div class="admin-team-head">
            <div><h4>${member.displayName}</h4><span>${member.username}</span></div>
            <span class="admin-team-role">${member.role}</span>
          </div>
          <div class="admin-team-meta">
            <span><strong>Status:</strong> ${member.active ? "Active" : "Disabled"}</span>
            <span><strong>Last Login:</strong> ${member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : "No login yet"}</span>
          </div>
          <div class="admin-team-editor">
            <label><span>Display Name</span><input type="text" data-user-display-name="${member.id}" value="${member.displayName}" /></label>
            <label><span>Role</span><select data-user-role="${member.id}"><option value="staff"${member.role === "staff" ? " selected" : ""}>Staff</option><option value="manager"${member.role === "manager" ? " selected" : ""}>Manager</option><option value="owner"${member.role === "owner" ? " selected" : ""}>Owner</option></select></label>
            <label><span>Reset Password</span><input type="password" data-user-password="${member.id}" placeholder="Leave blank to keep current password" /></label>
            <label><span>Access</span><select data-user-active="${member.id}"><option value="true"${member.active ? " selected" : ""}>Active</option><option value="false"${!member.active ? " selected" : ""}>Disabled</option></select></label>
            <button class="button button-secondary" data-save-user="${member.id}" type="button">Save Member</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderDashboard(data) {
  state = {
    ...data,
    siteContent: ensureContentState(data.siteContent),
    menuCatalog: ensureMenuState(data.menuCatalog)
  };
  document.querySelector("#admin-greeting").textContent = `Welcome back, ${state.user.displayName}`;
  renderStats(state);
  renderPipeline(state.orderPipeline);
  renderBarChart(state.orderPipeline);
  renderOrders(state.orders);
  renderProduction(state);
  renderSettings(state);
  renderProfile(state);
  renderContent(state);
  renderMenuEditor(state);
  renderGallery(state);
  renderTeam(state);
}

async function loadDashboard() {
  const data = await api("/api/admin/dashboard");
  renderDashboard(data.data);
}

async function handleSession() {
  const session = await api("/api/admin/session", { method: "GET" });
  toggleAuth(session.authenticated, session.setupRequired);
  if (session.authenticated) {
    await loadDashboard();
  } else if (session.setupRequired) {
    status("auth-status", "Create the owner account to unlock the full bakery control panel.");
  } else {
    status("auth-status", "Sign in with the bakery credentials to manage orders and website content.");
  }
}

function contentPayloadFromState() {
  return JSON.parse(JSON.stringify(ensureContentState(state?.siteContent)));
}

function menuPayloadFromState() {
  return JSON.parse(JSON.stringify(ensureMenuState(state?.menuCatalog)));
}

async function saveGalleryContent() {
  const next = contentPayloadFromState();
  next.gallery.items = next.gallery.items.map((item) => ({
    ...item,
    kicker: document.querySelector(`[data-gallery-kicker="${item.id}"]`)?.value || item.kicker,
    title: document.querySelector(`[data-gallery-title="${item.id}"]`)?.value || item.title,
    alt: document.querySelector(`[data-gallery-alt="${item.id}"]`)?.value || item.alt,
    image: document.querySelector(`[data-gallery-image="${item.id}"]`)?.value || item.image,
    wide: document.querySelector(`[data-gallery-wide="${item.id}"]`)?.value === "true"
  }));
  await api("/api/admin/content", { method: "PATCH", body: JSON.stringify(next) });
}

async function uploadImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });

  const response = await api("/api/admin/uploads", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, imageData: dataUrl })
  });
  return response.url;
}

function setupAuth() {
  const setupForm = document.querySelector("#setup-form");
  const loginForm = document.querySelector("#login-form");
  const logoutButton = document.querySelector("#admin-logout");

  setupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status("auth-status", "Creating owner access...");
    try {
      await api("/api/admin/setup", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(setupForm).entries())) });
      setupForm.reset();
      status("auth-status", "Owner account created successfully.", "success");
      await handleSession();
    } catch (error) {
      status("auth-status", error.message, "error");
    }
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status("auth-status", "Signing in...");
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(loginForm).entries())) });
      loginForm.reset();
      status("auth-status", "Signed in successfully.", "success");
      await handleSession();
    } catch (error) {
      status("auth-status", error.message, "error");
    }
  });

  logoutButton?.addEventListener("click", async () => {
    try {
      await api("/api/admin/logout", { method: "POST", body: JSON.stringify({}) });
    } catch (_error) {
      /* empty */
    }
    state = null;
    toggleAuth(false, false);
    status("auth-status", "Signed out.", "success");
  });
}

function setupForms() {
  document.querySelector("#production-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status("production-status", "Saving production note...");
    try {
      await api("/api/admin/production-note", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      status("production-status", "Production note saved.", "success");
      await loadDashboard();
    } catch (error) {
      status("production-status", error.message, "error");
    }
  });

  document.querySelector("#settings-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status("settings-status", "Saving business settings...");
    try {
      await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      status("settings-status", "Business settings saved.", "success");
      await loadDashboard();
    } catch (error) {
      status("settings-status", error.message, "error");
    }
  });

  document.querySelector("#profile-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status("profile-status", "Saving your profile...");
    try {
      await api("/api/admin/profile", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      status("profile-status", "Profile updated.", "success");
      await loadDashboard();
    } catch (error) {
      status("profile-status", error.message, "error");
    }
  });

  document.querySelector("#content-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const next = contentPayloadFromState();
    next.hero.eyebrow = form.elements.heroEyebrow.value;
    next.hero.titleSoft = form.elements.heroTitleSoft.value;
    next.hero.titleScript = form.elements.heroTitleScript.value;
    next.hero.copy = form.elements.heroCopy.value;
    next.about.eyebrow = form.elements.aboutEyebrow.value;
    next.about.titleSoft = form.elements.aboutTitleSoft.value;
    next.about.titleScript = form.elements.aboutTitleScript.value;
    next.about.lead = form.elements.aboutLead.value;
    next.about.body = form.elements.aboutBody.value;
    status("content-status", "Saving homepage content...");
    try {
      await api("/api/admin/content", { method: "PATCH", body: JSON.stringify(next) });
      status("content-status", "Homepage content updated.", "success");
      await loadDashboard();
    } catch (error) {
      status("content-status", error.message, "error");
    }
  });

  document.querySelector("#save-menu-pricing")?.addEventListener("click", async () => {
    const next = menuPayloadFromState();
    Object.entries(next).forEach(([category, items]) => {
      next[category] = items.map((item) => ({
        ...item,
        name: document.querySelector(`[data-menu-name="${category}:${item.id}"]`)?.value || item.name,
        description: document.querySelector(`[data-menu-description="${category}:${item.id}"]`)?.value || item.description || "",
        price: Number(document.querySelector(`[data-menu-price="${category}:${item.id}"]`)?.value || item.price || 0)
      }));
    });

    status("menu-status", "Saving cake details...");
    try {
      await api("/api/admin/menu", { method: "PATCH", body: JSON.stringify(next) });
      status("menu-status", "Cake details updated.", "success");
      await loadDashboard();
    } catch (error) {
      status("menu-status", error.message, "error");
    }
  });

  document.querySelector("#team-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status("team-status", "Adding team member...");
    try {
      await api("/api/admin/users", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      event.currentTarget.reset();
      status("team-status", "Team member added.", "success");
      await loadDashboard();
    } catch (error) {
      status("team-status", error.message, "error");
    }
  });

  document.querySelector("#gallery-upload-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.image.files[0];
    if (!file) {
      status("gallery-status", "Please choose an image file.", "error");
      return;
    }

    status("gallery-status", "Uploading image...");
    try {
      const imageUrl = await uploadImage(file);
      const next = contentPayloadFromState();
      next.gallery.items.unshift({
        id: `gallery_${Date.now()}`,
        image: imageUrl,
        alt: form.elements.alt.value || "Bakery gallery image",
        kicker: form.elements.kicker.value || "Gallery",
        title: form.elements.title.value || "Signature cake display",
        wide: form.elements.wide.value === "true"
      });
      await api("/api/admin/content", { method: "PATCH", body: JSON.stringify(next) });
      form.reset();
      status("gallery-status", "Gallery image uploaded and published.", "success");
      await loadDashboard();
    } catch (error) {
      status("gallery-status", error.message, "error");
    }
  });

  document.querySelector("#save-gallery-items")?.addEventListener("click", async () => {
    status("gallery-status", "Saving gallery changes...");
    try {
      await saveGalleryContent();
      status("gallery-status", "Gallery changes saved.", "success");
      await loadDashboard();
    } catch (error) {
      status("gallery-status", error.message, "error");
    }
  });

}

function setupDelegation() {
  document.querySelector("#admin-menu-editor")?.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-menu-tab]");
    if (tab) {
      const target = tab.dataset.menuTab;
      document.querySelectorAll("[data-menu-tab]").forEach((button) => {
        const active = button.dataset.menuTab === target;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      document.querySelectorAll("[data-menu-panel]").forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.menuPanel === target);
      });
      return;
    }

    const prevButton = event.target.closest("[data-menu-prev]");
    if (prevButton) {
      moveMenuSlide(prevButton.dataset.menuPrev, -1);
      return;
    }

    const nextButton = event.target.closest("[data-menu-next]");
    if (nextButton) {
      moveMenuSlide(nextButton.dataset.menuNext, 1);
    }
  });

  document.querySelector("#admin-orders-list")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-save-order]");
    if (!button) return;
    const id = button.dataset.saveOrder;
    button.disabled = true;
    button.textContent = "Saving...";
    try {
      await api(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: document.querySelector(`[data-order-status="${id}"]`)?.value || "new",
          quotedPrice: document.querySelector(`[data-order-quoted="${id}"]`)?.value || "",
          pickupMode: document.querySelector(`[data-order-pickup-mode="${id}"]`)?.value || "",
          pickupTime: document.querySelector(`[data-order-pickup-time="${id}"]`)?.value || "",
          internalNotes: document.querySelector(`[data-order-notes="${id}"]`)?.value || ""
        })
      });
      await loadDashboard();
    } catch (error) {
      button.textContent = error.message;
      window.setTimeout(() => {
        button.textContent = "Save Order Update";
      }, 1200);
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector("#admin-team-list")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-save-user]");
    if (!button) return;
    const id = button.dataset.saveUser;
    status("team-status", "Updating team member...");
    try {
      await api(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          displayName: document.querySelector(`[data-user-display-name="${id}"]`)?.value || "",
          role: document.querySelector(`[data-user-role="${id}"]`)?.value || "staff",
          password: document.querySelector(`[data-user-password="${id}"]`)?.value || "",
          active: document.querySelector(`[data-user-active="${id}"]`)?.value === "true"
        })
      });
      status("team-status", "Team member updated.", "success");
      await loadDashboard();
    } catch (error) {
      status("team-status", error.message, "error");
    }
  });

  document.querySelector("#admin-gallery-list")?.addEventListener("click", async (event) => {
    const removeButton = event.target.closest("[data-delete-gallery]");
    if (!removeButton) return;
    const next = contentPayloadFromState();
    next.gallery.items = next.gallery.items.filter((item) => item.id !== removeButton.dataset.deleteGallery);
    status("gallery-status", "Removing gallery image...");
    try {
      await api("/api/admin/content", { method: "PATCH", body: JSON.stringify(next) });
      status("gallery-status", "Gallery image removed.", "success");
      await loadDashboard();
    } catch (error) {
      status("gallery-status", error.message, "error");
    }
  });

}

function moveMenuSlide(category, direction) {
  const slides = Array.from(document.querySelectorAll(`[data-menu-slide="${category}"]`));
  if (!slides.length) return;
  const currentIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains("is-active"))
  );
  const nextIndex = Math.min(slides.length - 1, Math.max(0, currentIndex + direction));
  slides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === nextIndex);
  });
  const position = document.querySelector(`[data-menu-position="${category}"]`);
  if (position) {
    position.textContent = `${nextIndex + 1} / ${slides.length}`;
  }
}

setupThemeToggle();
setupAuth();
setupForms();
setupDelegation();
handleSession().catch((error) => status("auth-status", error.message || "Unable to load admin session.", "error"));
