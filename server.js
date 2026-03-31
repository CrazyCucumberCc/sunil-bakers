const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");
const UPLOAD_DIR = path.join(__dirname, "public", "uploads");
const SESSION_COOKIE = "sunil_admin_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "sunil-bakers-demo-secret-change-before-production";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const defaultContent = () => ({
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
    copy: "Owners buy bakery websites faster when the site proves it can showcase real output, not just branding language.",
    items: [
      { id: "gallery_1", image: "/img2feature.avif", alt: "Curated pastry and cake display", kicker: "Display Moments", title: "Signature counter presentation", wide: true },
      { id: "gallery_2", image: "/img3.avif", alt: "Custom celebration cake showcase", kicker: "Custom Finish", title: "Styled for birthdays and milestones", wide: false },
      { id: "gallery_3", image: "/blackforest.avif", alt: "Black forest cake", kicker: "Classic Favourite", title: "Black Forest appeal", wide: false },
      { id: "gallery_4", image: "/biscoffcake.webp", alt: "Biscoff cake", kicker: "Modern Crowd-Pleaser", title: "Biscoff luxury styling", wide: false },
      { id: "gallery_5", image: "/strawberry.avif", alt: "Strawberry cake", kicker: "Soft Celebration", title: "Fresh cream and berry tones", wide: false },
      { id: "gallery_6", image: "/rasmalai.avif", alt: "Rasmalai cake", kicker: "Indian Favourite", title: "Rasmalai-inspired richness", wide: false }
    ]
  },
  faq: {
    eyebrow: "FAQ",
    title: "Common customer questions,",
    accent: "answered clearly",
    copy: "A bakery owner is more likely to value the site when it reduces repeated customer questions and makes ordering easier.",
    items: [
      { id: "faq_1", question: "Do you make eggless cakes?", answer: "Yes. Sunil Bakers offers eggless celebration cakes with the same focus on softness, richness, and presentation.", open: true },
      { id: "faq_2", question: "How early should I enquire for a theme cake?", answer: "Advance discussion is best for custom themes so colors, message details, and finishing can be planned properly.", open: false },
      { id: "faq_3", question: "Can names, toppers, and custom writing be added?", answer: "Yes. Share the name, occasion, preferred colors, and inspiration so the cake can be tailored for the event.", open: false },
      { id: "faq_4", question: "How is custom pricing decided?", answer: "Final pricing depends on size, flavor, eggless preference, finishing detail, and theme complexity.", open: false },
      { id: "faq_5", question: "Is pickup possible for local orders?", answer: "Yes. Customers can call or WhatsApp to confirm handover timing and availability for local celebrations.", open: false },
      { id: "faq_6", question: "What details should I send for a fast quotation?", answer: "Send the cake type, occasion, flavor, date needed, eggless preference, and theme idea for the fastest response.", open: false }
    ]
  }
});

const defaultMenuCatalog = () => ({
  classic: [
    { id: "classic_1", name: "Vanilla Cake", description: "Light, creamy, and timeless with a polished celebration finish.", price: 450 },
    { id: "classic_2", name: "Pineapple Cake", description: "Fresh pineapple notes with soft sponge and elegant whipped styling.", price: 500 },
    { id: "classic_3", name: "Red Velvet Cake", description: "Velvety layers with luxurious texture and a rich premium look.", price: 700 },
    { id: "classic_4", name: "Black Current Cake", description: "A fruity, vibrant option with a refined bakery-style presentation.", price: 560 },
    { id: "classic_5", name: "Strawberry Cake", description: "Soft pink freshness and smooth cream layers for sweet celebrations.", price: 560 },
    { id: "classic_6", name: "Rasmalai Cake", description: "Indian dessert inspiration with festive richness and creamy depth.", price: 760 },
    { id: "classic_7", name: "Mango Cake", description: "Sunny mango flavor with a fresh, smooth, celebration-ready profile.", price: 580 }
  ],
  special: [
    { id: "special_1", name: "Black Forest Cake", description: "Chocolate, cream, and cherries brought together with timeless appeal.", price: 650 },
    { id: "special_2", name: "White Forest Cake", description: "A lighter forest-inspired cake with delicate elegance and creamy layers.", price: 680 },
    { id: "special_3", name: "Chocolate Truffle Cake", description: "Glossy, rich, and deeply indulgent with a premium chocolate finish.", price: 820 },
    { id: "special_4", name: "Fruit Slice Cake", description: "Fresh fruit detail and a bright, layered presentation for elegant occasions.", price: 740 },
    { id: "special_5", name: "Biscoff Cake", description: "Caramel biscuit richness with contemporary styling and crowd-pleasing flavor.", price: 950 }
  ],
  brownie: [{ id: "brownie_1", name: "Chocolate Truffle Brownie", description: "Dense, fudgy, and layered with decadent chocolate truffle indulgence.", price: 320 }]
});

const DEFAULTS = {
  settings: {
    businessName: "Sunil Bakers",
    phone: "+91 9988600189",
    whatsapp: "+91 9988600189",
    address: "Main Bazar, Railway Rd, near civil hospital, opposite Ballu Ram Dharamshala, Mandi Gobindgarh, Punjab 147301",
    businessHours: "Call or WhatsApp to confirm daily opening hours and pickup timing.",
    pickupWindow: "Pickup and celebration handover support available for local customers.",
    serviceArea: "Mandi Gobindgarh and nearby celebration orders.",
    orderNotice: "Theme cakes are best discussed in advance for cleaner finishing and personalization."
  },
  productionNote: {
    title: "Today's Production Focus",
    content: "Use this board to track custom cake follow-ups, confirm pickup timing, and keep the team aligned on priority orders.",
    updatedAt: null
  },
  menuCatalog: defaultMenuCatalog(),
  siteContent: defaultContent(),
  users: [],
  sessions: [],
  orders: []
};

let writeQueue = Promise.resolve();
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
app.use(express.static(path.join(__dirname, "public")));

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const adminLoginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

const id = (prefix) => `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
const text = (v) => String(v || "").replace(/[<>]/g, "").replace(/\r/g, "").trim();
const line = (v) => text(v);
const userName = (v) => text(v).toLowerCase().replace(/[^a-z0-9._-]/g, "");
const sign = (v) => crypto.createHmac("sha256", SESSION_SECRET).update(v).digest("hex");
const hashPassword = (pwd, salt = crypto.randomBytes(16).toString("hex")) => `${salt}:${crypto.pbkdf2Sync(pwd, salt, 120000, 64, "sha512").toString("hex")}`;
const cookie = (name, value, maxAge) => `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax; HttpOnly${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, digest] = stored.split(":");
  const candidate = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(candidate, "hex"));
}

function parseCookies(req) {
  const raw = req.headers.cookie;
  if (!raw) return {};
  return raw.split(";").reduce((acc, item) => {
    const [k, ...rest] = item.trim().split("=");
    acc[k] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch (_e) {
    await fs.writeFile(DATA_FILE, `${JSON.stringify(DEFAULTS, null, 2)}\n`, "utf8");
  }
}

function mergeContent(source = {}) {
  const d = defaultContent();
  return {
    hero: { ...d.hero, ...(source.hero || {}) },
    about: { ...d.about, ...(source.about || {}) },
    gallery: { ...d.gallery, ...(source.gallery || {}), items: Array.isArray(source.gallery?.items) && source.gallery.items.length ? source.gallery.items : d.gallery.items },
    faq: { ...d.faq, ...(source.faq || {}), items: Array.isArray(source.faq?.items) && source.faq.items.length ? source.faq.items : d.faq.items }
  };
}

function mergeMenuCatalog(source = {}) {
  const defaults = defaultMenuCatalog();
  const mergeCategory = (category) => {
    const sourceItems = Array.isArray(source[category]) ? source[category] : [];
    return defaults[category].map((item, index) => {
      const incoming = sourceItems.find((candidate) => candidate.id === item.id) || sourceItems[index] || {};
      return {
        ...item,
        ...incoming,
        id: text(incoming.id) || item.id,
        name: text(incoming.name) || item.name,
        description: line(incoming.description) || item.description,
        price: Number(incoming.price) > 0 ? Math.round(Number(incoming.price)) : item.price
      };
    });
  };
  return {
    classic: mergeCategory("classic"),
    special: mergeCategory("special"),
    brownie: mergeCategory("brownie")
  };
}

async function readStore() {
  await ensureStore();
  const parsed = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  return {
    ...DEFAULTS,
    ...parsed,
    settings: { ...DEFAULTS.settings, ...(parsed.settings || {}) },
    productionNote: { ...DEFAULTS.productionNote, ...(parsed.productionNote || {}) },
    menuCatalog: mergeMenuCatalog(parsed.menuCatalog),
    siteContent: mergeContent(parsed.siteContent),
    users: Array.isArray(parsed.users) ? parsed.users : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    orders: Array.isArray(parsed.orders) ? parsed.orders : []
  };
}

function queueWrite(mutator) {
  writeQueue = writeQueue.then(async () => {
    const store = await readStore();
    const next = (await mutator(store)) || store;
    await fs.writeFile(DATA_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    return next;
  });
  return writeQueue;
}

function publicUser(u) {
  return { id: u.id, username: u.username, displayName: u.displayName, role: u.role, active: u.active, createdAt: u.createdAt, updatedAt: u.updatedAt || null, lastLoginAt: u.lastLoginAt || null };
}

function publicOrder(o) {
  return {
    id: o.id, createdAt: o.createdAt, lastUpdatedAt: o.lastUpdatedAt || o.createdAt, status: o.status, customerName: o.customerName, email: o.email, phone: o.phone || "",
    cakeType: o.cakeType, cakeName: o.cakeName || "", occasion: o.occasion, flavor: o.flavor, dateNeeded: o.dateNeeded, pickupTime: o.pickupTime || "", eggless: o.eggless, message: o.message, internalNotes: o.internalNotes || "",
    listedPrice: o.listedPrice || "",
    quotedPrice: o.quotedPrice || "", pickupMode: o.pickupMode || "", source: o.source || "website"
  };
}

function whatsappLinks(order) {
  const phone = text(order.phone).replace(/[^\d]/g, "");
  if (!phone) return null;
  const number = phone.startsWith("91") ? phone : `91${phone}`;
  const url = (msg) => `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
  return {
    general: url(`Hi ${order.customerName}, this is Sunil Bakers regarding your order ${order.id}.`),
    quote: url(`Hi ${order.customerName}, Sunil Bakers here. Your cake request ${order.id} is ready for quotation. Price: ${order.quotedPrice || "to be shared"}. Please reply to confirm.`),
    ready: url(`Hi ${order.customerName}, your Sunil Bakers order ${order.id} is ready${order.pickupTime ? ` for ${order.pickupTime}` : ""}. Please coordinate pickup.`)
  };
}

function reports(orders) {
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const week = orders.filter((o) => new Date(o.createdAt).getTime() >= since).length;
  const top = (key) => {
    const map = new Map();
    orders.forEach((o) => {
      const v = text(o[key]);
      if (v) map.set(v, (map.get(v) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "No data yet";
  };
  return { ordersThisWeek: week, topCakeType: top("cakeType"), topFlavor: top("flavor"), pendingFollowUps: orders.filter((o) => ["new", "quoted", "confirmed"].includes(o.status)).length };
}

function dashboard(store, user) {
  const orders = [...store.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const counts = orders.reduce((acc, o) => ((acc[o.status] = (acc[o.status] || 0) + 1), acc), { new: 0, quoted: 0, confirmed: 0, kitchen: 0, ready: 0, completed: 0 });
  return {
    user: publicUser(user),
    stats: { totalOrders: orders.length, newOrders: counts.new, activeOrders: counts.new + counts.quoted + counts.confirmed + counts.kitchen + counts.ready, completedOrders: counts.completed, teamMembers: store.users.filter((u) => u.active).length },
    orderPipeline: counts,
    reports: reports(orders),
    orders: orders.map((o) => ({ ...publicOrder(o), whatsappLinks: whatsappLinks(o) })),
    settings: store.settings,
    productionNote: store.productionNote,
    menuCatalog: store.menuCatalog,
    siteContent: store.siteContent,
    team: store.users.map(publicUser)
  };
}

async function attachSession(res, store, userId) {
  const sid = id("session");
  const now = new Date().toISOString();
  store.sessions = store.sessions.filter((s) => new Date(s.expiresAt) > new Date());
  store.sessions.push({ id: sid, userId, createdAt: now, lastActiveAt: now, expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() });
  res.setHeader("Set-Cookie", cookie(SESSION_COOKIE, `${sid}.${sign(sid)}`, Math.floor(SESSION_TTL_MS / 1000)));
}

function clearSession(res) {
  res.setHeader("Set-Cookie", cookie(SESSION_COOKIE, "", 0));
}

async function requireAdmin(req, res, next) {
  try {
    const raw = parseCookies(req)[SESSION_COOKIE];
    if (!raw || !raw.includes(".")) return res.status(401).json({ success: false, message: "Authentication required" });
    const [sid, signature] = raw.split(".");
    if (sign(sid) !== signature) {
      clearSession(res);
      return res.status(401).json({ success: false, message: "Invalid session" });
    }
    const store = await readStore();
    store.sessions = store.sessions.filter((s) => new Date(s.expiresAt) > new Date());
    const session = store.sessions.find((s) => s.id === sid);
    const user = session ? store.users.find((u) => u.id === session.userId && u.active) : null;
    if (!session || !user) {
      clearSession(res);
      await queueWrite(() => store);
      return res.status(401).json({ success: false, message: "Session expired" });
    }
    session.lastActiveAt = new Date().toISOString();
    req.store = store;
    req.adminUser = user;
    req.sessionId = sid;
    await queueWrite(() => store);
    return next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(500).json({ success: false, message: "Unable to verify admin session" });
  }
}

const requireRole = (...roles) => (req, res, next) => (roles.includes(req.adminUser.role) ? next() : res.status(403).json({ success: false, message: "You do not have permission for this action." }));

function sanitizeContent(raw = {}) {
  const d = defaultContent();
  return {
    hero: { eyebrow: text(raw.hero?.eyebrow) || d.hero.eyebrow, titleSoft: text(raw.hero?.titleSoft) || d.hero.titleSoft, titleScript: text(raw.hero?.titleScript) || d.hero.titleScript, copy: line(raw.hero?.copy) || d.hero.copy },
    about: { eyebrow: text(raw.about?.eyebrow) || d.about.eyebrow, titleSoft: text(raw.about?.titleSoft) || d.about.titleSoft, titleScript: text(raw.about?.titleScript) || d.about.titleScript, lead: line(raw.about?.lead) || d.about.lead, body: line(raw.about?.body) || d.about.body },
    gallery: {
      eyebrow: text(raw.gallery?.eyebrow) || d.gallery.eyebrow, title: text(raw.gallery?.title) || d.gallery.title, accent: text(raw.gallery?.accent) || d.gallery.accent, copy: line(raw.gallery?.copy) || d.gallery.copy,
      items: Array.isArray(raw.gallery?.items) ? raw.gallery.items.slice(0, 12).map((item) => ({ id: text(item.id) || id("gallery"), image: text(item.image), alt: text(item.alt) || "Bakery gallery image", kicker: text(item.kicker) || "Gallery", title: text(item.title) || "Signature cake display", wide: Boolean(item.wide) })) : d.gallery.items
    },
    faq: {
      eyebrow: text(raw.faq?.eyebrow) || d.faq.eyebrow, title: text(raw.faq?.title) || d.faq.title, accent: text(raw.faq?.accent) || d.faq.accent, copy: line(raw.faq?.copy) || d.faq.copy,
      items: Array.isArray(raw.faq?.items) ? raw.faq.items.slice(0, 12).map((item, index) => ({ id: text(item.id) || `faq_${index + 1}`, question: text(item.question) || `Question ${index + 1}`, answer: line(item.answer) || "Answer coming soon.", open: Boolean(item.open) })) : d.faq.items
    }
  };
}

async function saveImage(dataUrl, originalName) {
  const match = String(dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data.");
  const allowed = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" };
  if (!allowed[match[1]]) throw new Error("Unsupported image type.");
  const ext = path.extname(originalName || "").toLowerCase() || allowed[match[1]];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 6 * 1024 * 1024) throw new Error("Image is too large. Keep uploads under 6 MB.");
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

function transporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000
  });
}

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/site-content", async (_req, res) => {
  const store = await readStore();
  res.json({ success: true, content: store.siteContent, settings: { orderNotice: store.settings.orderNotice, businessHours: store.settings.businessHours, pickupWindow: store.settings.pickupWindow } });
});

app.get("/api/menu-data", async (_req, res) => {
  const store = await readStore();
  res.json({ success: true, menuCatalog: store.menuCatalog });
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  if (text(req.body.honeypot)) return res.status(400).json({ success: false, message: "Bot detected" });
  const payload = {
    customerName: text(req.body.name), email: text(req.body.email), phone: text(req.body.phone), message: line(req.body.message), cakeType: text(req.body.cakeType), cakeName: text(req.body.cakeName), occasion: text(req.body.occasion), flavor: text(req.body.flavor), dateNeeded: text(req.body.dateNeeded), pickupTime: text(req.body.pickupTime), eggless: text(req.body.eggless), listedPrice: text(req.body.listedPrice)
  };
  if (!payload.customerName || !payload.email || !payload.message) return res.status(400).json({ success: false, message: "Name, email, and message are required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });
  const order = { id: id("order"), createdAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString(), status: "new", source: "website", internalNotes: "", quotedPrice: "", pickupMode: "Pickup", ...payload };
  await queueWrite((store) => ((store.orders.unshift(order)), store));
  const mailer = transporter();
  const receiver = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;
  const responseBody = { success: true, orderId: order.id, message: `Enquiry received. Reference ID: ${order.id}. We will contact you soon.` };
  res.json(responseBody);

  if (mailer && receiver) {
    Promise.resolve()
      .then(() =>
        mailer.sendMail({
          from: `"Sunil Bakers" <${process.env.EMAIL_USER}>`,
          to: receiver,
          replyTo: payload.email,
          subject: `New bakery enquiry from ${payload.customerName}`,
          text: [
            `Enquiry ID: ${order.id}`,
            `Name: ${payload.customerName}`,
            `Email: ${payload.email}`,
            payload.phone ? `Phone: ${payload.phone}` : "",
            payload.cakeType ? `Cake Type: ${payload.cakeType}` : "",
            payload.cakeName ? `Cake Name: ${payload.cakeName}` : "",
            payload.listedPrice ? `Listed Price: Rs ${payload.listedPrice}` : "",
            payload.occasion ? `Occasion: ${payload.occasion}` : "",
            payload.flavor ? `Flavor: ${payload.flavor}` : "",
            payload.dateNeeded ? `Date Needed: ${payload.dateNeeded}` : "",
            payload.pickupTime ? `Pickup Time: ${payload.pickupTime}` : "",
            payload.eggless ? `Eggless: ${payload.eggless}` : "",
            "",
            "Message:",
            payload.message
          ]
            .filter(Boolean)
            .join("\n")
        })
      )
      .catch((error) => {
        console.error("Email send failed:", error);
      });
  }
});

app.get("/api/admin/session", async (req, res) => {
  const store = await readStore();
  if (!store.users.length) return res.json({ success: true, authenticated: false, setupRequired: true });
  const raw = parseCookies(req)[SESSION_COOKIE];
  if (!raw || !raw.includes(".")) return res.json({ success: true, authenticated: false, setupRequired: false });
  const [sid, signature] = raw.split(".");
  if (sign(sid) !== signature) {
    clearSession(res);
    return res.json({ success: true, authenticated: false, setupRequired: false });
  }
  const session = store.sessions.find((s) => s.id === sid && new Date(s.expiresAt) > new Date());
  const user = session ? store.users.find((u) => u.id === session.userId && u.active) : null;
  if (!session || !user) {
    clearSession(res);
    return res.json({ success: true, authenticated: false, setupRequired: false });
  }
  return res.json({ success: true, authenticated: true, setupRequired: false, user: publicUser(user) });
});

app.post("/api/admin/setup", adminLoginLimiter, async (req, res) => {
  const displayName = text(req.body.displayName);
  const username = userName(req.body.username);
  const password = String(req.body.password || "");
  let created = null;
  if (!displayName || !username || password.length < 8) return res.status(400).json({ success: false, message: "Display name, username, and a password of at least 8 characters are required." });
  await queueWrite(async (store) => {
    if (store.users.length) return store;
    const now = new Date().toISOString();
    created = { id: id("user"), username, displayName, role: "owner", active: true, passwordHash: hashPassword(password), createdAt: now, updatedAt: now, lastLoginAt: now };
    store.users.push(created);
    await attachSession(res, store, created.id);
    return store;
  });
  if (!created) return res.status(409).json({ success: false, message: "Owner account already exists." });
  return res.json({ success: true, message: "Owner account created successfully.", user: publicUser(created) });
});

app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
  const username = userName(req.body.username);
  const password = String(req.body.password || "");
  let matched = null;
  if (!username || !password) return res.status(400).json({ success: false, message: "Username and password are required." });
  await queueWrite(async (store) => {
    const user = store.users.find((u) => u.username === username && u.active);
    if (!user || !verifyPassword(password, user.passwordHash)) return store;
    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    matched = user;
    await attachSession(res, store, user.id);
    return store;
  });
  if (!matched) return res.status(401).json({ success: false, message: "Incorrect username or password." });
  return res.json({ success: true, message: "Welcome back.", user: publicUser(matched) });
});

app.post("/api/admin/logout", requireAdmin, async (req, res) => {
  await queueWrite((store) => ((store.sessions = store.sessions.filter((s) => s.id !== req.sessionId)), store));
  clearSession(res);
  return res.json({ success: true, message: "Logged out successfully." });
});

app.get("/api/admin/dashboard", requireAdmin, async (req, res) => res.json({ success: true, data: dashboard(req.store, req.adminUser) }));

app.patch("/api/admin/profile", requireAdmin, async (req, res) => {
  const displayName = text(req.body.displayName);
  const username = userName(req.body.username);
  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");
  let updated = null;
  let errorMessage = "";
  if (!displayName || !username) return res.status(400).json({ success: false, message: "Display name and username are required." });
  await queueWrite((store) => {
    const user = store.users.find((u) => u.id === req.adminUser.id);
    if (!user) {
      errorMessage = "Unable to update profile.";
      return store;
    }
    if (store.users.some((u) => u.username === username && u.id !== user.id)) {
      errorMessage = "Username already exists.";
      return store;
    }
    if (newPassword) {
      if (newPassword.length < 8) {
        errorMessage = "New password must be at least 8 characters.";
        return store;
      }
      if (!verifyPassword(currentPassword, user.passwordHash)) {
        errorMessage = "Current password is incorrect.";
        return store;
      }
    }
    user.displayName = displayName;
    user.username = username;
    if (newPassword) user.passwordHash = hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    updated = user;
    return store;
  });
  if (errorMessage) return res.status(400).json({ success: false, message: errorMessage });
  return res.json({ success: true, message: "Profile updated successfully.", user: publicUser(updated) });
});

app.patch("/api/admin/orders/:orderId", requireAdmin, async (req, res) => {
  const orderId = text(req.params.orderId);
  const status = text(req.body.status).toLowerCase();
  const allowed = ["new", "quoted", "confirmed", "kitchen", "ready", "completed"];
  let updated = null;
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid order status." });
  await queueWrite((store) => {
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) return store;
    order.status = status;
    order.internalNotes = line(req.body.internalNotes);
    order.quotedPrice = text(req.body.quotedPrice);
    order.pickupMode = text(req.body.pickupMode);
    order.pickupTime = text(req.body.pickupTime);
    order.lastUpdatedAt = new Date().toISOString();
    updated = order;
    return store;
  });
  if (!updated) return res.status(404).json({ success: false, message: "Order not found." });
  return res.json({ success: true, message: "Order updated successfully.", order: { ...publicOrder(updated), whatsappLinks: whatsappLinks(updated) } });
});

app.patch("/api/admin/settings", requireAdmin, requireRole("owner", "manager"), async (req, res) => {
  const store = await queueWrite((s) => ((s.settings = { ...s.settings, businessHours: line(req.body.businessHours), pickupWindow: line(req.body.pickupWindow), serviceArea: line(req.body.serviceArea), orderNotice: line(req.body.orderNotice) }), s));
  return res.json({ success: true, message: "Business settings updated.", settings: store.settings });
});

app.patch("/api/admin/production-note", requireAdmin, async (req, res) => {
  const store = await queueWrite((s) => ((s.productionNote = { title: text(req.body.title) || "Today's Production Focus", content: line(req.body.content), updatedAt: new Date().toISOString() }), s));
  return res.json({ success: true, message: "Production note saved.", productionNote: store.productionNote });
});

app.patch("/api/admin/content", requireAdmin, requireRole("owner", "manager"), async (req, res) => {
  const store = await queueWrite((s) => ((s.siteContent = sanitizeContent(req.body)), s));
  return res.json({ success: true, message: "Website content updated.", siteContent: store.siteContent });
});

app.patch("/api/admin/menu", requireAdmin, requireRole("owner", "manager"), async (req, res) => {
  const categories = ["classic", "special", "brownie"];
  const nextMenu = {};
  categories.forEach((category) => {
    const items = Array.isArray(req.body[category]) ? req.body[category] : [];
    nextMenu[category] = items.map((item, index) => ({
      id: text(item.id) || `${category}_${index + 1}`,
      name: text(item.name) || `${category} cake`,
      description: line(item.description) || defaultMenuCatalog()[category][index]?.description || "",
      price: Number(item.price) > 0 ? Math.round(Number(item.price)) : 0
    }));
  });
  const store = await queueWrite((s) => ((s.menuCatalog = nextMenu), s));
  return res.json({ success: true, message: "Menu pricing updated.", menuCatalog: store.menuCatalog });
});

app.post("/api/admin/uploads", requireAdmin, requireRole("owner", "manager"), async (req, res) => {
  try {
    const url = await saveImage(req.body.imageData, text(req.body.filename) || "upload-image");
    return res.json({ success: true, message: "Image uploaded successfully.", url });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Unable to upload image." });
  }
});

app.post("/api/admin/users", requireAdmin, requireRole("owner"), async (req, res) => {
  const displayName = text(req.body.displayName);
  const username = userName(req.body.username);
  const role = text(req.body.role).toLowerCase() || "staff";
  const password = String(req.body.password || "");
  let created = null;
  if (!displayName || !username || password.length < 8 || !["owner", "manager", "staff"].includes(role)) return res.status(400).json({ success: false, message: "Display name, username, role, and a password of at least 8 characters are required." });
  await queueWrite((store) => {
    if (store.users.some((u) => u.username === username)) return store;
    const now = new Date().toISOString();
    created = { id: id("user"), username, displayName, role, active: true, passwordHash: hashPassword(password), createdAt: now, updatedAt: now, lastLoginAt: null };
    store.users.push(created);
    return store;
  });
  if (!created) return res.status(409).json({ success: false, message: "Username already exists." });
  return res.json({ success: true, message: "Team member added.", user: publicUser(created) });
});

app.patch("/api/admin/users/:userId", requireAdmin, requireRole("owner"), async (req, res) => {
  const userId = text(req.params.userId);
  let updated = null;
  let errorMessage = "";
  await queueWrite((store) => {
    const user = store.users.find((u) => u.id === userId);
    if (!user) {
      errorMessage = "Team member not found.";
      return store;
    }
    const nextRole = ["owner", "manager", "staff"].includes(text(req.body.role).toLowerCase()) ? text(req.body.role).toLowerCase() : user.role;
    const nextActive = typeof req.body.active === "boolean" ? req.body.active : user.active;
    const activeOwners = store.users.filter((u) => u.active && u.role === "owner");
    if (user.role === "owner" && (!nextActive || nextRole !== "owner") && activeOwners.length <= 1) {
      errorMessage = "At least one active owner account must remain.";
      return store;
    }
    if (req.body.password) {
      if (String(req.body.password).length < 8) {
        errorMessage = "Password must be at least 8 characters.";
        return store;
      }
    }
    user.displayName = text(req.body.displayName) || user.displayName;
    user.role = nextRole;
    user.active = nextActive;
    if (req.body.password) user.passwordHash = hashPassword(String(req.body.password));
    user.updatedAt = new Date().toISOString();
    updated = user;
    return store;
  });
  if (errorMessage) return res.status(errorMessage.includes("not found") ? 404 : 400).json({ success: false, message: errorMessage });
  return res.json({ success: true, message: "Team member updated.", user: publicUser(updated) });
});

app.use((req, res) => res.status(404).send("Page not found"));
ensureStore().then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))).catch((error) => {
  console.error("Failed to initialize data store:", error);
  process.exit(1);
});
