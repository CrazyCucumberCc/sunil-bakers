const menuData = {
  classic: [
    {
      name: "Vanilla Cake",
      image: "vanilla.avif",
      description: "Light, creamy, and timeless with a polished celebration finish."
    },
    {
      name: "Pineapple Cake",
      image: "pineapple.avif",
      description: "Fresh pineapple notes with soft sponge and elegant whipped styling."
    },
    {
      name: "Red Velvet Cake",
      image: "red velvet.jfif",
      description: "Velvety layers with luxurious texture and a rich premium look."
    },
    {
      name: "Black Current Cake",
      image: "black current.avif",
      description: "A fruity, vibrant option with a refined bakery-style presentation."
    },
    {
      name: "Strawberry Cake",
      image: "strawberry.avif",
      description: "Soft pink freshness and smooth cream layers for sweet celebrations."
    },
    {
      name: "Rasmalai Cake",
      image: "rasmalai.avif",
      description: "Indian dessert inspiration with festive richness and creamy depth."
    },
    {
      name: "Mango Cake",
      image: "mango.webp",
      description: "Sunny mango flavor with a fresh, smooth, celebration-ready profile."
    }
  ],
  special: [
    {
      name: "Black Forest Cake",
      image: "blackforest.avif",
      description: "Chocolate, cream, and cherries brought together with timeless appeal."
    },
    {
      name: "White Forest Cake",
      image: "whiteforest.jfif",
      description: "A lighter forest-inspired cake with delicate elegance and creamy layers."
    },
    {
      name: "Chocolate Truffle Cake",
      image: "chocolatetruffle.jfif",
      description: "Glossy, rich, and deeply indulgent with a premium chocolate finish."
    },
    {
      name: "Fruit Slice Cake",
      image: "fruitslice cake.webp",
      description: "Fresh fruit detail and a bright, layered presentation for elegant occasions."
    },
    {
      name: "Biscoff Cake",
      image: "biscoffcake.webp",
      description: "Caramel biscuit richness with contemporary styling and crowd-pleasing flavor."
    }
  ],
  brownie: [
    {
      name: "Chocolate Truffle Brownie",
      image: "chocolatetrufflebrownie.webp",
      description: "Dense, fudgy, and layered with decadent chocolate truffle indulgence."
    }
  ]
};

const defaultMenuPrices = {
  classic: [450, 500, 700, 560, 560, 760, 580],
  special: [650, 680, 820, 740, 950],
  brownie: [320]
};

Object.entries(defaultMenuPrices).forEach(([category, prices]) => {
  menuData[category] = menuData[category].map((item, index) => ({
    ...item,
    price: prices[index] || 0
  }));
});

const themeCakes = [
  { name: "Cocomelon", category: "kids", vibe: "Playful melody" },
  { name: "Doraemon", category: "kids", vibe: "Cartoon nostalgia" },
  { name: "Anniversary", category: "celebration", vibe: "Elegant romance" },
  { name: "Barber", category: "lifestyle", vibe: "Statement style" },
  { name: "Cricket", category: "lifestyle", vibe: "Match-day spirit" },
  { name: "Spider-Man", category: "heroes", vibe: "Action favourite" },
  { name: "Princess", category: "kids", vibe: "Royal pastel" },
  { name: "Pinkfong", category: "kids", vibe: "Bright sing-along" },
  { name: "Boss Baby", category: "baby", vibe: "Cute mischief" },
  { name: "Mickey Mouse", category: "kids", vibe: "Classic cartoon" },
  { name: "Butterfly", category: "celebration", vibe: "Soft elegance" },
  { name: "Krishna Ji", category: "celebration", vibe: "Sacred celebration" },
  { name: "Shinchan", category: "kids", vibe: "Fun character" },
  { name: "Chess", category: "lifestyle", vibe: "Sharp and modern" },
  { name: "Balloon", category: "celebration", vibe: "Party lift" },
  { name: "Doctor", category: "lifestyle", vibe: "Career tribute" },
  { name: "Crown", category: "celebration", vibe: "Luxury statement" },
  { name: "Best Dad", category: "celebration", vibe: "Heartfelt tribute" },
  { name: "Space", category: "kids", vibe: "Galaxy wonder" },
  { name: "Ocean", category: "kids", vibe: "Cool blue world" },
  { name: "Emoji", category: "kids", vibe: "Happy energy" },
  { name: "Anime", category: "heroes", vibe: "Fandom flair" },
  { name: "Pokemon", category: "heroes", vibe: "Collector favourite" },
  { name: "Gym", category: "lifestyle", vibe: "Power theme" },
  { name: "Car", category: "lifestyle", vibe: "Speed lover" },
  { name: "Avengers", category: "heroes", vibe: "Team power" },
  { name: "Safe Journey", category: "celebration", vibe: "Thoughtful send-off" },
  { name: "Cartoon", category: "kids", vibe: "Color pop" },
  { name: "It's a Boy", category: "baby", vibe: "Baby reveal" },
  { name: "Car & Bike", category: "lifestyle", vibe: "Dual thrill" }
];

const THEME_STORAGE_KEY = "sunil-theme";
const MENU_CATEGORIES = ["classic", "special", "brownie"];
let revealObserver;
let performanceFrame;
let menusRendered = false;
let themesRendered = false;
let pricedCakesCache = null;
const themeMarkupCache = new Map();
let enquiryPopupController;
const deferNonCritical =
  window.requestIdleCallback
    ? (callback) => window.requestIdleCallback(callback, { timeout: 1400 })
    : (callback) => window.setTimeout(callback, 220);

function setTextContent(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element && value) {
    element.textContent = value;
  }
}

function renderGalleryItems(items) {
  const grid = document.querySelector("#gallery-grid");
  if (!grid || !Array.isArray(items) || !items.length) {
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
        <article class="gallery-card${item.wide ? " gallery-card-wide" : ""} reveal">
          <img src="${item.image.replace(/^\//, "")}" alt="${item.alt}" loading="lazy" decoding="async" fetchpriority="low" />
          <div class="gallery-caption">
            <span>${item.kicker}</span>
            <strong>${item.title}</strong>
          </div>
        </article>
      `
    )
    .join("");

  setupRevealAnimation(grid);
}

async function loadSiteContent() {
  try {
    const response = await fetch("/api/site-content");
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const content = data.content || {};

    setTextContent("hero-eyebrow", content.hero?.eyebrow);
    setTextContent("hero-title-soft", content.hero?.titleSoft);
    setTextContent("hero-title-script", content.hero?.titleScript);
    setTextContent("hero-copy-text", content.hero?.copy);

    setTextContent("about-eyebrow", content.about?.eyebrow);
    setTextContent("about-title-soft", content.about?.titleSoft);
    setTextContent("about-title-script", content.about?.titleScript);
    setTextContent("about-lead-text", content.about?.lead);
    setTextContent("about-body-text", content.about?.body);

    setTextContent("gallery-eyebrow", content.gallery?.eyebrow);
    setTextContent("gallery-title-text", content.gallery?.title);
    setTextContent("gallery-title-accent", content.gallery?.accent);
    setTextContent("gallery-copy-text", content.gallery?.copy);

    renderGalleryItems(content.gallery?.items || []);
  } catch (_error) {
    /* Keep static fallback content if fetch fails. */
  }
}

async function loadMenuCatalog() {
  try {
    const response = await fetch("/api/menu-data");
    if (!response.ok) {
      populateCakeSelection();
      return;
    }

    const data = await response.json();
    if (data.menuCatalog) {
      let hasChanges = false;
      MENU_CATEGORIES.forEach((category) => {
        hasChanges =
          hasChanges ||
          menuData[category].some(
            (item, index) =>
              item.name !== (data.menuCatalog[category]?.[index]?.name || item.name) ||
              item.description !== (data.menuCatalog[category]?.[index]?.description || item.description) ||
              Number(item.price || 0) !== Number(data.menuCatalog[category]?.[index]?.price || item.price || 0)
          );
        menuData[category] = menuData[category].map((item, index) => ({
          ...item,
          ...(data.menuCatalog[category]?.[index] || {})
        }));
      });

      if (hasChanges) {
        pricedCakesCache = null;
        themeMarkupCache.clear();
      }

      if (menusRendered && hasChanges) {
        menusRendered = false;
        renderMenus();
      }
    }
  } catch (_error) {
    /* keep defaults */
  }

  populateCakeSelection();
}

function allPricedCakes() {
  if (!pricedCakesCache) {
    pricedCakesCache = MENU_CATEGORIES.flatMap((category) => menuData[category]);
  }
  return pricedCakesCache;
}

function populateCakeSelection() {
  const select = document.querySelector("#cake-name");
  if (!select) {
    return;
  }

  select.innerHTML = `<option value="">Select a priced cake</option>${allPricedCakes()
    .map((item) => `<option value="${item.name}" data-price="${item.price}">${item.name} - Rs ${item.price}</option>`)
    .join("")}`;
}

function updateCakeSelectionSummary() {
  const select = document.querySelector("#cake-name");
  const listedPrice = document.querySelector("#listed-price");
  const paymentNote = document.querySelector("#payment-note");

  if (!select || !listedPrice || !paymentNote) {
    return;
  }

  const selected = select.options[select.selectedIndex];
  const price = Number(selected?.dataset.price || 0);

  listedPrice.value = price ? String(price) : "";
  paymentNote.textContent = price
    ? `Listed cake price: Rs ${price}. Final theme and custom details can be confirmed after enquiry.`
    : "Choose a priced cake to see the listed price. Theme cakes and custom work are confirmed after enquiry.";
}

function setupEnquiryPopup() {
  if (enquiryPopupController) {
    return enquiryPopupController;
  }

  const popup = document.querySelector("#enquiry-popup");
  const title = document.querySelector("#enquiry-popup-title");
  const kicker = document.querySelector("#enquiry-popup-kicker");
  const message = document.querySelector("#enquiry-popup-message");
  const closeButton = document.querySelector("#enquiry-popup-close");
  const actionButton = document.querySelector("#enquiry-popup-action");

  if (!popup || !title || !kicker || !message) {
    enquiryPopupController = { open: () => {}, close: () => {} };
    return enquiryPopupController;
  }

  const close = () => {
    popup.hidden = true;
    popup.removeAttribute("data-state");
  };

  const open = ({ heading, body, state }) => {
    popup.hidden = false;
    popup.dataset.state = state || "info";
    kicker.textContent = state === "success" ? "Enquiry sent" : state === "error" ? "Submission failed" : "Enquiry update";
    title.textContent = heading || "Status";
    message.textContent = body || "";
    window.requestAnimationFrame(() => {
      (actionButton || closeButton)?.focus();
    });
  };

  closeButton?.addEventListener("click", close);
  actionButton?.addEventListener("click", close);
  popup.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.popupClose === "true") {
      close();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !popup.hidden) {
      close();
    }
  });

  enquiryPopupController = { open, close };
  return enquiryPopupController;
}

function isLitePerformanceMode() {
  const root = document.documentElement;
  if (root.getAttribute("data-performance") === "lite") {
    return true;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection && connection.saveData);
  const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const smallScreen = window.matchMedia("(max-width: 768px)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return saveData || lowMemory || lowCpu || smallScreen || reducedMotion;
}

function applyPerformanceMode() {
  document.documentElement.toggleAttribute("data-performance-lite", isLitePerformanceMode());
}

function schedulePerformanceModeUpdate() {
  if (performanceFrame) {
    return;
  }

  performanceFrame = window.requestAnimationFrame(() => {
    applyPerformanceMode();
    performanceFrame = undefined;
  });
}

function getRevealObserver() {
  if (revealObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return revealObserver;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  return revealObserver;
}

function createMenuCard(item) {
  return `
    <article class="menu-card reveal menu-card-selectable" data-cake-name="${item.name}" data-cake-price="${item.price}" tabindex="0">
      <div class="menu-card-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" fetchpriority="low" />
      </div>
      <div class="menu-card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="price-stack">
          <span class="cake-price">Rs ${item.price}</span>
          <span class="cake-advance">Theme quote on enquiry</span>
        </div>
        <span class="badge">Customization Available</span>
      </div>
    </article>
  `;
}

function getThemeAvatar(theme) {
  const avatarMap = {
    Cocomelon: { icon: "\u{1F349}", accent: "melon" },
    Doraemon: { icon: "\u{1F916}", accent: "sky" },
    Anniversary: { icon: "\u{1F48D}", accent: "rose" },
    Barber: { icon: "\u2702\uFE0F", accent: "espresso" },
    Cricket: { icon: "\u{1F3CF}", accent: "field" },
    "Spider-Man": { icon: "\u{1F578}\uFE0F", accent: "hero" },
    Princess: { icon: "\u{1F451}", accent: "royal" },
    Pinkfong: { icon: "\u{1F98A}", accent: "pink" },
    "Boss Baby": { icon: "\u{1F37C}", accent: "powder" },
    "Mickey Mouse": { icon: "\u{1F42D}", accent: "classic" },
    Butterfly: { icon: "\u{1F98B}", accent: "butter" },
    "Krishna Ji": { icon: "\u{1FA77}", accent: "sacred" },
    Shinchan: { icon: "\u{1F604}", accent: "sunny" },
    Chess: { icon: "\u265F\uFE0F", accent: "mono" },
    Balloon: { icon: "\u{1F388}", accent: "party" },
    Doctor: { icon: "\u{1FA7A}", accent: "mint" },
    Crown: { icon: "\u{1F451}", accent: "gold" },
    "Best Dad": { icon: "\u{1F499}", accent: "denim" },
    Space: { icon: "\u{1F680}", accent: "galaxy" },
    Ocean: { icon: "\u{1F30A}", accent: "ocean" },
    Emoji: { icon: "\u{1F60A}", accent: "joy" },
    Anime: { icon: "\u2728", accent: "violet" },
    Pokemon: { icon: "\u26A1", accent: "electric" },
    Gym: { icon: "\u{1F4AA}", accent: "iron" },
    Car: { icon: "\u{1F3CE}\uFE0F", accent: "speed" },
    Avengers: { icon: "\u{1F6E1}\uFE0F", accent: "hero" },
    "Safe Journey": { icon: "\u2708\uFE0F", accent: "sky" },
    Cartoon: { icon: "\u{1F3A8}", accent: "candy" },
    "It's a Boy": { icon: "\u{1F9F8}", accent: "powder" },
    "Car & Bike": { icon: "\u{1F3CD}\uFE0F", accent: "speed" }
  };

  return avatarMap[theme.name] || { icon: "\u{1F382}", accent: "gold" };
}

function getThemeTone(category) {
  const toneMap = {
    kids: "spark",
    celebration: "luxe",
    baby: "soft",
    heroes: "bold",
    lifestyle: "sharp"
  };

  return toneMap[category] || "spark";
}

function getThemeCategoryLabel(category) {
  const labelMap = {
    kids: "Kids Favourite",
    celebration: "Celebration",
    baby: "Baby Moment",
    heroes: "Hero Universe",
    lifestyle: "Lifestyle"
  };

  return labelMap[category] || "Theme Cake";
}

function renderMenus() {
  if (menusRendered) {
    return;
  }

  const classic = document.querySelector("#classic-menu");
  const special = document.querySelector("#special-menu");
  const brownie = document.querySelector("#brownie-menu");

  if (classic) {
    classic.innerHTML = menuData.classic.map(createMenuCard).join("");
  }

  if (special) {
    special.innerHTML = menuData.special.map(createMenuCard).join("");
  }

  if (brownie) {
    brownie.innerHTML = menuData.brownie.map(createMenuCard).join("");
  }

  menusRendered = true;
  setupRevealAnimation(document.querySelector("#menu"));
}

function selectCakeFromCard(cakeName, cakePrice) {
  const cakeType = document.querySelector('[name="cakeType"]');
  const cakeNameSelect = document.querySelector("#cake-name");
  const contactSection = document.querySelector("#contact");

  if (!cakeNameSelect) {
    return;
  }

  const option = [...cakeNameSelect.options].find((item) => item.value === cakeName);
  if (option) {
    cakeNameSelect.value = option.value;
  }

  if (cakeType) {
    cakeType.value = cakePrice >= 320 && cakePrice <= 950 ? "Classic Cake" : cakeType.value;
  }

  updateCakeSelectionSummary();

  if (contactSection) {
    contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setupMenuCardSelection() {
  const menuSection = document.querySelector("#menu");
  if (!menuSection) {
    return;
  }

  menuSection.addEventListener("click", (event) => {
    const card = event.target.closest(".menu-card-selectable");
    if (!card) {
      return;
    }

    selectCakeFromCard(card.dataset.cakeName || "", Number(card.dataset.cakePrice || 0));
  });

  menuSection.addEventListener("keydown", (event) => {
    const card = event.target.closest(".menu-card-selectable");
    if (!card || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    selectCakeFromCard(card.dataset.cakeName || "", Number(card.dataset.cakePrice || 0));
  });
}

function createThemeCard(theme) {
  const avatar = getThemeAvatar(theme);
  const tone = getThemeTone(theme.category);
  const label = getThemeCategoryLabel(theme.category);

  return `
    <article class="theme-card reveal" data-theme-category="${theme.category}" data-theme-tone="${tone}" tabindex="0">
      <div class="theme-card-aura"></div>
      <div class="theme-card-topline"></div>
      <div class="theme-meta">
        <div class="theme-symbol theme-symbol-${avatar.accent}">
          <span class="theme-avatar-emoji" aria-hidden="true">${avatar.icon}</span>
        </div>
        <div>
          <span class="theme-label">${label}</span>
          <h3>${theme.name}</h3>
        </div>
      </div>
      <div class="theme-vibe">${theme.vibe}</div>
      <div class="theme-card-footer">
        <span class="badge">Customization Available</span>
        <span class="theme-plus">+</span>
      </div>
    </article>
  `;
}

function updateThemeStudioMeta(items, activeFilter) {
  const count = document.querySelector("#theme-count");
  const focus = document.querySelector("#theme-focus");
  const focusLabel = activeFilter === "all" ? "All" : getThemeCategoryLabel(activeFilter);

  if (count) {
    count.textContent = String(items.length).padStart(2, "0");
  }

  if (focus) {
    focus.textContent = focusLabel;
  }
}

function renderThemes(activeFilter = "all") {
  const themeGrid = document.querySelector("#theme-grid");
  if (!themeGrid) {
    return;
  }

  const filteredThemes =
    activeFilter === "all"
      ? themeCakes
      : themeCakes.filter((theme) => theme.category === activeFilter);

  const cacheKey = activeFilter;
  const cachedMarkup = themeMarkupCache.get(cacheKey);
  themeGrid.innerHTML = cachedMarkup || filteredThemes.map(createThemeCard).join("");
  if (!cachedMarkup) {
    themeMarkupCache.set(cacheKey, themeGrid.innerHTML);
  }
  updateThemeStudioMeta(filteredThemes, activeFilter);
  themesRendered = true;
  setupRevealAnimation(themeGrid);
}

function setupDeferredSectionRendering() {
  const menuSection = document.querySelector("#menu");
  const themeSection = document.querySelector("#themes");
  const idleRender =
    window.requestIdleCallback ||
    ((callback) =>
      window.setTimeout(
        () =>
          callback({
            didTimeout: false,
            timeRemaining: () => 0
          }),
        700
      ));

  idleRender(() => {
    renderMenus();
    if (!themesRendered) {
      renderThemes();
    }
  });

  if (!("IntersectionObserver" in window)) {
    renderMenus();
    renderThemes();
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        if (entry.target === menuSection) {
          renderMenus();
          observer.unobserve(entry.target);
        }

        if (entry.target === themeSection) {
          if (!themesRendered) {
            renderThemes();
          }
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "260px 0px"
    }
  );

  if (menuSection) {
    sectionObserver.observe(menuSection);
  }

  if (themeSection) {
    sectionObserver.observe(themeSection);
  }
}

function setupThemeFilters() {
  const filterBar = document.querySelector("#theme-filter-bar");
  if (!filterBar) {
    return;
  }

  let activeFilter = filterBar.querySelector(".is-active")?.dataset.themeFilter || "all";
  filterBar.addEventListener("click", (event) => {
    const filter = event.target.closest("[data-theme-filter]");
    if (!filter || filter.dataset.themeFilter === activeFilter) {
      return;
    }

    activeFilter = filter.dataset.themeFilter || "all";
    filterBar.querySelectorAll("[data-theme-filter].is-active").forEach((item) => item.classList.remove("is-active"));
    filter.classList.add("is-active");
    renderThemes(activeFilter);
  });
}

function setupRevealAnimation(scope = document) {
  const elements =
    scope instanceof Element ? scope.querySelectorAll(".reveal") : document.querySelectorAll(".reveal");

  if (!elements.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || isLitePerformanceMode()) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = getRevealObserver();
  elements.forEach((element) => {
    if (!element.classList.contains("is-visible")) {
      observer.observe(element);
    }
  });
}

function setupNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector("#nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (!header || !toggle || !nav) {
    return;
  }

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeaderVisibility = () => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
    const navIsOpen = nav.classList.contains("is-open");

    if (currentScrollY <= 12 || navIsOpen) {
      header.classList.remove("is-hidden");
    } else if (scrollingDown && currentScrollY > 96 && scrollDelta > 6) {
      header.classList.add("is-hidden");
    } else if (!scrollingDown && scrollDelta > 4) {
      header.classList.remove("is-hidden");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    header.classList.remove("is-hidden");
  });

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(updateHeaderVisibility);
    },
    { passive: true }
  );

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      header.classList.remove("is-hidden");
    });
  });
}

function applyTheme(theme) {
  const root = document.documentElement;
  const toggle = document.querySelector("#theme-toggle");
  const isDark = theme === "dark";

  root.setAttribute("data-theme", theme);

  const themeColor = getComputedStyle(root).getPropertyValue("--theme-color").trim();
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta && themeColor) {
    themeColorMeta.setAttribute("content", themeColor);
  }

  if (toggle) {
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

    const label = toggle.querySelector(".theme-toggle-label");
    if (label) {
      label.textContent = isDark ? "Light mode" : "Dark mode";
    }
  }
}

function setupThemeToggle() {
  const toggle = document.querySelector("#theme-toggle");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  applyTheme(storedTheme || (mediaQuery.matches ? "dark" : "light"));

  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  });

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", ({ matches }) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(matches ? "dark" : "light");
      }
    });
  }
}

function setupMenuToolbar() {
  const toolbar = document.querySelector(".menu-toolbar");
  if (!toolbar) {
    return;
  }

  toolbar.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-scroll-target]");
    if (!chip) {
      return;
    }

    const section = document.getElementById(chip.dataset.scrollTarget);
    if (!section) {
      return;
    }

    toolbar.querySelectorAll("[data-scroll-target].is-active").forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function setupMobileEnhancements() {
  const nav = document.querySelector("#site-nav");
  const navToggle = document.querySelector("#nav-toggle");
  const mobileQuery = window.matchMedia("(max-width: 860px)");
  const compactQuery = window.matchMedia("(max-width: 768px)");
  const quickJumpBar = document.querySelector(".mobile-showcase-bar");
  const cakeTypeSelect = document.querySelector('[name="cakeType"]');
  const occasionInput = document.querySelector('[name="occasion"]');

  if (!nav || !navToggle) {
    return;
  }

  const closeNavigation = () => nav.classList.remove("is-open");
  let resizeFrame;
  const handleResize = () => {
    if (resizeFrame) {
      return;
    }

    resizeFrame = window.requestAnimationFrame(() => {
      schedulePerformanceModeUpdate();
      if (!mobileQuery.matches) {
        closeNavigation();
      }
      resizeFrame = undefined;
    });
  };

  window.addEventListener("resize", handleResize, { passive: true });

  if (typeof compactQuery.addEventListener === "function") {
    compactQuery.addEventListener("change", schedulePerformanceModeUpdate);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
    }
  });

  quickJumpBar?.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) {
      return;
    }

    const target = document.querySelector(link.getAttribute("href"));
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelector(".mobile-order-shortcuts")?.addEventListener("click", (event) => {
    const shortcut = event.target.closest("[data-cake-shortcut]");
    if (!shortcut || !cakeTypeSelect) {
      return;
    }

    const type = shortcut.dataset.cakeShortcut || "";
    cakeTypeSelect.value = type;
    document.querySelectorAll(".mobile-order-chip.is-active").forEach((chip) => chip.classList.remove("is-active"));
    shortcut.classList.add("is-active");
    updateCakeSelectionSummary();
    occasionInput?.scrollIntoView({ behavior: "smooth", block: "center" });
    occasionInput?.focus({ preventScroll: true });
  });
}

function setupContactForm() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  const whatsappButton = document.querySelector("#whatsapp-order");
  const cakeSelect = document.querySelector("#cake-name");
  const popup = setupEnquiryPopup();

  if (!form || !status) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');

  if (whatsappButton) {
    whatsappButton.addEventListener("click", () => {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const lines = [
        "Hi Sunil Bakers, I want to enquire about a cake order.",
        payload.name ? `Name: ${payload.name}` : "",
        payload.cakeType ? `Cake type: ${payload.cakeType}` : "",
        payload.cakeName ? `Selected cake: ${payload.cakeName}` : "",
        payload.listedPrice ? `Listed price: Rs ${payload.listedPrice}` : "",
        payload.occasion ? `Occasion: ${payload.occasion}` : "",
        payload.flavor ? `Flavor: ${payload.flavor}` : "",
        payload.dateNeeded ? `Date needed: ${payload.dateNeeded}` : "",
        payload.pickupTime ? `Pickup time: ${payload.pickupTime}` : "",
        payload.eggless ? `Eggless: ${payload.eggless}` : "",
        payload.message ? `Details: ${payload.message}` : ""
      ].filter(Boolean);

      const whatsappUrl = `https://wa.me/919988600189?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(whatsappUrl, "_blank", "noopener");
    });
  }

  if (cakeSelect) {
    cakeSelect.addEventListener("change", updateCakeSelectionSummary);
    updateCakeSelectionSummary();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    status.textContent = "Sending your enquiry...";
    submitButton.disabled = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      status.textContent = data.message;
      status.dataset.state = response.ok ? "success" : "error";

      if (response.ok) {
        form.reset();
        updateCakeSelectionSummary();
        popup.open({
          heading: "Enquiry sent successfully",
          body: data.message || "Your enquiry has been sent successfully. We will contact you soon.",
          state: "success"
        });
      } else {
        popup.open({
          heading: "Unable to send enquiry",
          body: data.message || "Something went wrong while sending your enquiry. Please try again.",
          state: "error"
        });
      }
    } catch (_error) {
      status.textContent = "Something went wrong. Please call or WhatsApp us directly.";
      status.dataset.state = "error";
      popup.open({
        heading: "Unable to send enquiry",
        body: "Something went wrong. Please call or WhatsApp us directly.",
        state: "error"
      });
    } finally {
      submitButton.disabled = false;
    }
  });
}

setupThemeToggle();
setupNavigation();
setupContactForm();

window.requestAnimationFrame(() => {
  setupMobileEnhancements();

  window.requestAnimationFrame(() => {
    deferNonCritical(() => {
      applyPerformanceMode();
      setupRevealAnimation();
      setupDeferredSectionRendering();
      setupMenuToolbar();
      setupMenuCardSelection();
      setupThemeFilters();
      loadSiteContent();
      loadMenuCatalog();
    });
  });
});
