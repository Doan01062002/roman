/* ===== Máy chủ ROMAN: phục vụ website + trang quản trị /admin + API =====
   Chạy: npm start   (hoặc node server/index.js)
   Biến môi trường: PORT (mặc định 5173), HOST (mặc định 127.0.0.1; đặt 0.0.0.0 để máy khác trong mạng truy cập)
   Không cần cài thêm thư viện. */
"use strict";
const http = require("http"), fs = require("fs"), fsp = fs.promises, path = require("path"), crypto = require("crypto");
const { buildDataJs, patchHtml, validate, PAGE_FILES } = require("./build");
const { createTelegram } = require("./telegram");
const { generateSite, sitemapXml, robotsTxt } = require("./seo");
const { productSlugs, productPath } = require("./build");

const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const F = {
  site: path.join(CONTENT, "site.json"),
  admin: path.join(CONTENT, "admin.json"),
  users: path.join(CONTENT, "users.json"),
  activity: path.join(CONTENT, "activity.json"),
  stats: path.join(CONTENT, "stats.json"),
  bookings: path.join(CONTENT, "bookings.json"),
  backups: path.join(CONTENT, "backups"),
  photos: path.join(ROOT, "assets", "photos"),
  video: path.join(ROOT, "assets", "video"),
};
const PORT = +process.env.PORT || 5173;
const HOST = process.env.HOST || "127.0.0.1";
const SESSION_MS = 12 * 3600 * 1000;
const KEEP_BACKUPS = 30;
const PHOTO_SIZES = ["sm", "lg", "xl"];

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".mp4": "video/mp4", ".webm": "video/webm",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8",
};

/* ---------- Tiện ích ---------- */
const readJSON = async (file, fallback) => { try { return JSON.parse(await fsp.readFile(file, "utf8")); } catch (e) { if (fallback !== undefined) return fallback; throw e; } };
async function writeAtomic(file, data) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fsp.writeFile(tmp, data);
  await fsp.rename(tmp, file);
}
const writeJSON = (file, v) => writeAtomic(file, JSON.stringify(v, null, 2));
/* Ghi tuần tự: hai lần lưu gần nhau không chen vào nhau */
let queue = Promise.resolve();
const serial = fn => (queue = queue.then(fn, fn));

class HttpError extends Error { constructor(status, msg, extra) { super(msg); this.status = status; this.extra = extra; } }
/* Sau Nginx (TRUST_PROXY=1) mới tin header X-Forwarded-For, nếu không khách có thể giả IP để lách giới hạn */
const TRUST_PROXY = process.env.TRUST_PROXY === "1";
const clientIp = req => (TRUST_PROXY && String(req.headers["x-forwarded-for"] || "").split(",").pop().trim()) || req.socket.remoteAddress || "";
/* Chỉ coi là "trên máy này" khi kết nối trực tiếp từ localhost, không qua proxy */
const isLocal = req => !req.headers["x-forwarded-for"] && ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress);

function send(res, status, body, headers = {}) {
  const isObj = typeof body === "object" && !Buffer.isBuffer(body);
  res.writeHead(status, Object.assign({
    "Content-Type": isObj ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  }, headers));
  res.end(isObj ? JSON.stringify(body) : body);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const type = String(req.headers["content-type"] || "");
    if (!type.startsWith("application/json")) return reject(new HttpError(415, "Dữ liệu phải ở dạng JSON"));
    let size = 0; const chunks = [];
    req.on("data", c => {
      size += c.length;
      if (size > limit) { reject(new HttpError(413, "Dữ liệu gửi lên quá lớn")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch (e) { reject(new HttpError(400, "JSON không hợp lệ")); } });
    req.on("error", reject);
  });
}

/* Giới hạn số lần theo IP trong một khoảng thời gian */
function limiter(max, windowMs) {
  const hits = new Map();
  return ip => {
    const now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < windowMs);
    h.push(now); hits.set(ip, h);
    if (hits.size > 5000) hits.clear();
    return h.length <= max;
  };
}

/* ---------- Đăng nhập ---------- */
const sessions = new Map();
const loginFails = new Map();
const hashPassword = (password, salt) => crypto.scryptSync(String(password), salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex");

function getSession(req) {
  const m = String(req.headers.cookie || "").match(/(?:^|;\s*)roman_sid=([a-f0-9]{64})/);
  if (!m) return null;
  const s = sessions.get(m[1]);
  if (!s || s.exp < Date.now()) { sessions.delete(m[1]); return null; }
  return Object.assign({ token: m[1] }, s);
}
function startSession(req, res, user, role = "owner") {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { user, role, exp: Date.now() + SESSION_MS });
  const secure = req.headers["x-forwarded-proto"] === "https" || req.socket.encrypted ? "; Secure" : "";
  res.setHeader("Set-Cookie", `roman_sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}`);
}
function checkPasswordRules(username, password) {
  if (!/^[\w.@-]{3,40}$/.test(String(username || ""))) throw new HttpError(400, "Tên đăng nhập 3–40 ký tự, chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới, @ hoặc gạch ngang");
  if (String(password || "").length < 8) throw new HttpError(400, "Mật khẩu cần ít nhất 8 ký tự");
}
/* Tài khoản lưu ở content/users.json: [{ username, name, role: "owner" | "staff", salt, hash, createdAt, lastLogin }]
   owner (Quản trị viên): toàn quyền. staff (Nhân viên): lịch hẹn, lịch, khách hàng, thống kê, đổi mật khẩu của mình.
   Bản cũ dùng content/admin.json (một tài khoản) được tự chuyển sang khi đọc lần đầu. */
const adminExists = () => fs.existsSync(F.users) || fs.existsSync(F.admin);
const ROLES = { owner: "Quản trị viên", staff: "Nhân viên" };
async function loadUsers() {
  const list = await readJSON(F.users, null);
  if (list) return list;
  const a = await readJSON(F.admin, null);
  if (!a) return [];
  const migrated = [{ username: a.username, name: a.username, role: "owner", salt: a.salt, hash: a.hash, createdAt: a.updatedAt || new Date().toISOString() }];
  await writeJSON(F.users, migrated);
  return migrated;
}
const newSecret = password => { const salt = crypto.randomBytes(16).toString("hex"); return { salt, hash: hashPassword(password, salt) }; };
const publicUser = u => ({ username: u.username, name: u.name || u.username, role: u.role, createdAt: u.createdAt, lastLogin: u.lastLogin || null });
async function createAdmin(username, password) {
  await writeJSON(F.users, [{ username, name: username, role: "owner", ...newSecret(password), createdAt: new Date().toISOString() }]);
}
async function verifyLogin(username, password) {
  const u = (await loadUsers()).find(x => x.username === username);
  /* Vẫn tính băm khi sai tên đăng nhập để thời gian trả lời như nhau (không dò được tên nào tồn tại) */
  const got = Buffer.from(hashPassword(password, u ? u.salt : "0".repeat(32)), "hex");
  if (!u) return null;
  const want = Buffer.from(u.hash, "hex");
  return got.length === want.length && crypto.timingSafeEqual(got, want) ? u : null;
}
/* Đăng xuất mọi phiên của một người (khi đổi mật khẩu, đổi vai trò, xóa tài khoản) */
function dropSessions(username, exceptToken) {
  for (const [t, v] of sessions) if (v.user === username && t !== exceptToken) sessions.delete(t);
}

/* ---------- Nhật ký hoạt động (content/activity.json, giữ 3.000 dòng gần nhất) ---------- */
let actQueue = Promise.resolve();
function logAct(user, action, detail = "") {
  actQueue = actQueue.then(async () => {
    const list = await readJSON(F.activity, []);
    list.unshift({ at: new Date().toISOString(), user: user || "", action, detail: String(detail || "").slice(0, 600) });
    await writeJSON(F.activity, list.slice(0, 3000));
  }).catch(e => console.error(new Date().toISOString(), "[nhật ký]", e.message));
  return actQueue;
}
const vnd = n => `${Number(n || 0).toLocaleString("vi-VN")}₫`;
/* Tóm tắt thay đổi nội dung để ghi nhật ký: "Sửa giá Sàn 360 Premium (Xe 5 chỗ: 3.000.000₫ → 3.200.000₫) · Thông tin cửa hàng" */
function diffSummary(a, b) {
  const parts = [];
  const byId = l => Object.fromEntries((l || []).map(x => [x.id, x]));
  const pa = byId(a.products), pb = byId(b.products);
  const added = Object.keys(pb).filter(k => !pa[k]).map(k => pb[k].name);
  const removed = Object.keys(pa).filter(k => !pb[k]).map(k => pa[k].name);
  if (added.length) parts.push(`Thêm sản phẩm: ${added.join(", ")}`);
  if (removed.length) parts.push(`Xóa sản phẩm: ${removed.join(", ")}`);
  const prices = [], edited = [];
  Object.keys(pb).filter(k => pa[k]).forEach(k => {
    const x = pa[k], y = pb[k];
    if (JSON.stringify(x) === JSON.stringify(y)) return;
    const px = x.prices || [], py = y.prices || [];
    const ch = (y.options || []).map((o, i) => (px[i] || 0) !== (py[i] || 0) ? `${o}: ${px[i] ? vnd(px[i]) : "liên hệ"} → ${py[i] ? vnd(py[i]) : "liên hệ"}` : "").filter(Boolean);
    if (ch.length) prices.push(`${y.name} (${ch.join("; ")})`);
    const xs = Object.assign({}, x, { prices: 0 }), ys = Object.assign({}, y, { prices: 0 });
    if (JSON.stringify(xs) !== JSON.stringify(ys)) edited.push(y.name + (x.hidden !== y.hidden ? (y.hidden ? " (ẩn)" : " (hiện)") : ""));
  });
  if (prices.length) parts.push(`Sửa giá ${prices.join(", ")}`);
  if (edited.length) parts.push(`Sửa sản phẩm: ${edited.join(", ")}`);
  if (!added.length && !removed.length && JSON.stringify((a.products || []).map(x => x.id)) !== JSON.stringify((b.products || []).map(x => x.id))) parts.push("Đổi thứ tự sản phẩm");
  const names = { site: "Thông tin cửa hàng", social: "Mạng xã hội", categories: "Danh mục", hero: "Slide đầu trang", features: "Banner trang chủ", stories: "Câu chuyện", limousine: "Khối Limousine", notes: "Ghi chú trang chủ", materials: "Chất liệu da", photoAlt: "Mô tả ảnh", pages: "Trang nội dung", seo: "SEO" };
  for (const [k, n] of Object.entries(names)) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) parts.push(n);
  return parts.join(" · ") || "Không có thay đổi";
}

/* Thao tác ghi của trang quản trị: phải đăng nhập, gửi header riêng và cùng nguồn (chống CSRF) */
function requireAdmin(req, write) {
  const s = getSession(req);
  if (!s) throw new HttpError(401, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  if (write) {
    if (req.headers["x-roman-admin"] !== "1") throw new HttpError(403, "Yêu cầu không hợp lệ");
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) throw new HttpError(403, "Yêu cầu không cùng nguồn");
  }
  return s;
}

/* ---------- Nội dung ---------- */
async function saveContent(next, user, action = "Lưu nội dung") {
  const errors = validate(next);
  if (errors.length) throw new HttpError(422, "Dữ liệu chưa hợp lệ", { errors });
  const cur = await readJSON(F.site);
  await fsp.mkdir(F.backups, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  await fsp.writeFile(path.join(F.backups, `site-r${cur.rev}-${stamp}.json`), JSON.stringify(cur));
  const list = (await fsp.readdir(F.backups)).filter(f => /^site-r\d+-.*\.json$/.test(f)).sort((a, b) => fs.statSync(path.join(F.backups, b)).mtimeMs - fs.statSync(path.join(F.backups, a)).mtimeMs);
  for (const f of list.slice(KEEP_BACKUPS)) await fsp.unlink(path.join(F.backups, f)).catch(() => {});
  next.rev = (cur.rev || 0) + 1;
  next.updatedAt = new Date().toISOString();
  next.updatedBy = user;
  await writeJSON(F.site, next);
  siteName = (next.site && next.site.name) || siteName;
  await writeAtomic(path.join(ROOT, "js", "data.js"), buildDataJs(next));
  for (const f of PAGE_FILES) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const html = await fsp.readFile(p, "utf8"), out = patchHtml(html, next.seo && next.seo[f], next.rev);
    if (out !== html) await writeAtomic(p, out);
  }
  try { generateSite(next); } catch (e) { console.error(new Date().toISOString(), "[seo]", e); }
  logAct(user, action, diffSummary(cur, next));
  return next;
}

/* ---------- Ảnh ---------- */
const slugify = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").toLowerCase()
  .replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "anh";
async function listPhotos() {
  const names = new Map();
  for (const f of await fsp.readdir(F.photos)) {
    const m = f.match(/^(.+)-(sm|lg|xl)\.jpg$/);
    if (!m) continue;
    const st = await fsp.stat(path.join(F.photos, f));
    const e = names.get(m[1]) || { name: m[1], sizes: [], bytes: 0, mtime: 0 };
    e.sizes.push(m[2]); e.bytes += st.size; e.mtime = Math.max(e.mtime, st.mtimeMs);
    names.set(m[1], e);
  }
  return [...names.values()].sort((a, b) => b.mtime - a.mtime || a.name.localeCompare(b.name));
}
/* Ảnh đang được dùng ở đâu (tìm tên ảnh trong toàn bộ nội dung) */
function photoUsage(content, name) {
  const where = [];
  const has = v => JSON.stringify(v).includes(`"${name}"`);
  content.products.forEach(p => { if (has(p.photos || [])) where.push(`Sản phẩm: ${p.name}`); });
  content.categories.forEach(c => { if (c.photo === name) where.push(`Danh mục: ${c.name}`); });
  content.hero.forEach(h => { if (h.photo === name) where.push(`Slide: ${h.title}`); });
  content.features.forEach(f => { if (f.photo === name) where.push(`Banner: ${f.title}`); });
  content.stories.forEach(s => { if (s.photo === name || has(s.pool || [])) where.push(`Câu chuyện: ${s.title}`); });
  if (content.limousine && content.limousine.photo === name) where.push("Khối Limousine");
  if (has(content.pages)) where.push("Trang nội dung");
  return where;
}
function decodeJpeg(b64) {
  const buf = Buffer.from(String(b64 || ""), "base64");
  if (buf.length < 100 || buf[0] !== 0xff || buf[1] !== 0xd8) throw new HttpError(400, "Ảnh phải là JPEG");
  if (buf.length > 12 * 1024 * 1024) throw new HttpError(413, "Ảnh quá lớn (tối đa 12MB mỗi cỡ)");
  return buf;
}

/* ---------- Lịch hẹn ---------- */
const BOOKING_STATUS = ["new", "contacted", "done", "cancelled"];
const BOOKING_LABEL = { new: "Mới", contacted: "Đã liên hệ", done: "Hoàn thành", cancelled: "Đã hủy" };
const BOOKING_SOURCES = ["web", "phone", "zalo", "facebook", "walkin", "other"];
/* Đọc thông tin lịch hẹn từ form (dùng chung cho website và thêm tay trong trang quản trị) */
function bookingFrom(b) {
  const item = {
    id: crypto.randomBytes(6).toString("hex"), createdAt: new Date().toISOString(),
    name: clean(b.name, 80), phone: clean(b.phone, 20), car: clean(b.car, 100),
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(b.date || "")) ? b.date : "",
    topic: clean(b.topic, 100), msg: clean(b.msg, 1500), status: "new", note: "", source: "web",
  };
  if (!item.name) throw new HttpError(400, "Vui lòng nhập họ tên");
  if ((item.phone.match(/\d/g) || []).length < 8) throw new HttpError(400, "Số điện thoại chưa đúng");
  return item;
}
const clean = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);
const bookingIpLimit = limiter(6, 10 * 60 * 1000);
const bookingGlobalLimit = limiter(300, 3600 * 1000);

/* ---------- Thông báo Telegram ---------- */
let siteName = "ROMAN";
const tg = createTelegram({ file: path.join(CONTENT, "telegram.json"), siteName: () => siteName, onStatus: (id, status, by) => setBookingStatus(id, status, by) });
async function setBookingStatus(id, status, by) {
  const b = await serial(async () => {
    const list = await readJSON(F.bookings, []);
    const x = list.find(y => y.id === id);
    if (!x) return null;
    const now = new Date().toISOString();
    Object.assign(x, { status, statusBy: by, statusAt: now, updatedAt: now });
    await writeJSON(F.bookings, list);
    return x;
  });
  if (b) { tg.syncBooking(b).catch(() => {}); logAct(`${by} (Telegram)`, "Đổi trạng thái lịch hẹn", `${b.name} · ${b.phone} → ${BOOKING_LABEL[status]}`); }
  return b;
}
/* Gửi thông báo sau khi đã trả lời khách (khách không phải chờ Telegram) và ghi lại mã tin để sửa khi đổi trạng thái */
function notifyBooking(item) {
  tg.notifyBooking(item).then(sent => sent.length && serial(async () => {
    const list = await readJSON(F.bookings, []);
    const x = list.find(y => y.id === item.id);
    if (x) { x.tg = sent; await writeJSON(F.bookings, list); }
  })).catch(e => console.error(new Date().toISOString(), "[telegram]", e.message));
}

/* ---------- Thống kê truy cập ẩn danh (content/stats.json) ----------
   Không dùng cookie, không lưu IP: mỗi ngày đếm lượt xem từng trang, số người truy cập (mã băm IP + trình duyệt
   với khóa ngẫu nhiên đổi mỗi ngày, không thể dò ngược) và trang giới thiệu khách tới (Google, Facebook...). */
const STAT_DAYS = 400;
let stats = { days: {}, uniq: { day: "", salt: "", keys: [] } }, statsDirty = false;
const dayVN = (t = Date.now()) => new Date(t + 7 * 3600e3).toISOString().slice(0, 10);
const trackLimit = limiter(240, 10 * 60 * 1000);
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|zalo|curl|wget|python|node-fetch/i;
function trackPath(raw) {
  const m = /^(\/[a-z0-9\-/.]*)(\?cat=[a-z0-9-]+)?$/.exec(String(raw || "").slice(0, 160));
  if (!m) return null;
  let p = m[1] === "/index.html" ? "/" : m[1];
  if (p === "/category.html") return p + (m[2] || "");
  if (p === "/" || /^\/san-pham\/[a-z0-9-]+\/$/.test(p) || /^\/(support|about|chinh-sach|so-do-trang)\.html$/.test(p)) return p;
  return null;
}
async function loadStats() { stats = await readJSON(F.stats, stats); stats.days = stats.days || {}; stats.uniq = stats.uniq || { day: "", salt: "", keys: [] }; }
async function flushStats() {
  if (!statsDirty) return;
  statsDirty = false;
  const days = Object.keys(stats.days).sort();
  days.slice(0, Math.max(0, days.length - STAT_DAYS)).forEach(d => delete stats.days[d]);
  await writeJSON(F.stats, stats).catch(e => { statsDirty = true; console.error("[thống kê]", e.message); });
}
function track(req, body) {
  const ua = String(req.headers["user-agent"] || "");
  if (!ua || BOT_UA.test(ua) || !trackLimit(clientIp(req))) return;
  const p = trackPath(body.p);
  if (!p) return;
  const d = dayVN(), day = stats.days[d] || (stats.days[d] = { v: 0, u: 0, pages: {}, refs: {} });
  day.v++;
  if (day.pages[p] || Object.keys(day.pages).length < 400) day.pages[p] = (day.pages[p] || 0) + 1;
  const U = stats.uniq;
  if (U.day !== d) { U.day = d; U.salt = crypto.randomBytes(12).toString("hex"); U.keys = []; }
  const key = crypto.createHash("sha256").update(U.salt + clientIp(req) + ua).digest("hex").slice(0, 16);
  if (!U.keys.includes(key) && U.keys.length < 100000) { U.keys.push(key); day.u++; }
  const ref = String(body.r || "").toLowerCase().replace(/^www\./, "").replace(/[^a-z0-9.-]/g, "").slice(0, 60);
  if (ref && ref !== String(req.headers.host || "").replace(/:\d+$/, "") && (day.refs[ref] || Object.keys(day.refs).length < 100)) day.refs[ref] = (day.refs[ref] || 0) + 1;
  statsDirty = true;
}
async function statsReport(n) {
  const c = await readJSON(F.site);
  const slugs = productSlugs(c), byPath = {};
  c.products.forEach(p => { if (slugs[p.id]) byPath["/" + productPath(slugs[p.id])] = p.name; });
  const cats = Object.fromEntries(c.categories.map(x => [x.id, x.name]));
  const label = p => p === "/" ? "Trang chủ" : byPath[p] || (p.startsWith("/category.html") ? `Danh mục: ${cats[(p.split("=")[1] || "")] || "Tất cả dịch vụ"}` : { "/support.html": "Hỗ trợ & đặt lịch", "/about.html": "Giới thiệu", "/chinh-sach.html": "Chính sách", "/so-do-trang.html": "Sơ đồ trang" }[p] || p);
  const days = [], pages = {}, refs = {};
  for (let i = n - 1; i >= 0; i--) {
    const d = dayVN(Date.now() - i * 86400e3), x = stats.days[d] || { v: 0, u: 0, pages: {}, refs: {} };
    days.push({ d, v: x.v, u: x.u });
    for (const [k, v] of Object.entries(x.pages)) pages[k] = (pages[k] || 0) + v;
    for (const [k, v] of Object.entries(x.refs)) refs[k] = (refs[k] || 0) + v;
  }
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
  return {
    since: Object.keys(stats.days).sort()[0] || null, days,
    pages: top(pages).slice(0, 40).map(([path, v]) => ({ path, label: label(path), product: !!byPath[path], v })),
    refs: top(refs).slice(0, 15).map(([host, v]) => ({ host, v })),
  };
}

/* ---------- Định tuyến API ---------- */
async function api(req, res, url) {
  const p = url.pathname, m = req.method;
  const seg = p.split("/").filter(Boolean); // ["api", ...]

  if (p === "/api/session" && m === "GET") {
    const s = getSession(req);
    const u = s ? (await loadUsers()).find(x => x.username === s.user) : null;
    return send(res, 200, { loggedIn: !!s, user: s ? s.user : null, name: u ? u.name : null, role: s ? s.role : null, setup: !adminExists(), canSetup: !adminExists() && isLocal(req) });
  }
  if (p === "/api/setup" && m === "POST") {
    if (adminExists()) throw new HttpError(409, "Tài khoản quản trị đã được tạo");
    if (!isLocal(req)) throw new HttpError(403, "Chỉ tạo được tài khoản đầu tiên trên chính máy chạy máy chủ (localhost)");
    if (req.headers["x-roman-admin"] !== "1") throw new HttpError(403, "Yêu cầu không hợp lệ");
    const b = await readBody(req, 10_000);
    checkPasswordRules(b.username, b.password);
    await createAdmin(b.username, b.password);
    startSession(req, res, b.username, "owner");
    logAct(b.username, "Tạo tài khoản quản trị đầu tiên");
    return send(res, 200, { ok: true });
  }
  if (p === "/api/login" && m === "POST") {
    if (req.headers["x-roman-admin"] !== "1") throw new HttpError(403, "Yêu cầu không hợp lệ");
    const ip = clientIp(req), f = loginFails.get(ip) || { n: 0, until: 0 };
    if (f.until > Date.now()) throw new HttpError(429, `Đăng nhập sai quá nhiều lần. Thử lại sau ${Math.ceil((f.until - Date.now()) / 60000)} phút`);
    const b = await readBody(req, 10_000);
    const u = await verifyLogin(String(b.username || ""), String(b.password || ""));
    if (u) {
      loginFails.delete(ip);
      startSession(req, res, u.username, u.role);
      const list = await loadUsers(), x = list.find(y => y.username === u.username);
      if (x) { x.lastLogin = new Date().toISOString(); await writeJSON(F.users, list); }
      logAct(u.username, "Đăng nhập");
      return send(res, 200, { ok: true });
    }
    f.n += 1;
    if (f.n >= 8) { f.until = Date.now() + 15 * 60 * 1000; f.n = 0; }
    loginFails.set(ip, f);
    await new Promise(r => setTimeout(r, 400));
    throw new HttpError(401, "Sai tên đăng nhập hoặc mật khẩu");
  }
  if (p === "/api/logout" && m === "POST") {
    const s = getSession(req);
    if (s) sessions.delete(s.token);
    res.setHeader("Set-Cookie", "roman_sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
    return send(res, 200, { ok: true });
  }

  if (p === "/api/track" && m === "POST") {
    const b = await readBody(req, 2000).catch(() => ({}));
    track(req, b || {});
    res.writeHead(204, { "Cache-Control": "no-store" });
    return res.end();
  }

  /* Form đặt lịch công khai trên website */
  if (p === "/api/bookings" && m === "POST") {
    const ip = clientIp(req);
    if (!bookingIpLimit(ip) || !bookingGlobalLimit("all")) throw new HttpError(429, "Bạn gửi quá nhiều yêu cầu, vui lòng gọi hotline");
    const b = await readBody(req, 20_000);
    if (clean(b.website, 200)) return send(res, 200, { ok: true }); // bot điền ô bẫy
    const item = bookingFrom(b);
    await serial(async () => {
      const list = await readJSON(F.bookings, []);
      list.unshift(item);
      await writeJSON(F.bookings, list.slice(0, 5000));
    });
    notifyBooking(item);
    return send(res, 201, { ok: true });
  }

  /* ----- Từ đây trở xuống cần đăng nhập ----- */
  const write = m !== "GET";
  const s = requireAdmin(req, write);
  /* Nhân viên không được sửa nội dung, ảnh, cài đặt, tài khoản, sao lưu, xem nhật ký hay xóa lịch hẹn */
  const ownerOnly = (p === "/api/content" && m !== "GET") || (p.startsWith("/api/photos") && m !== "GET") || /^\/api\/(telegram|backups|users|activity)(\/|$)/.test(p) || (seg[1] === "bookings" && m === "DELETE");
  if (ownerOnly && s.role !== "owner") throw new HttpError(403, "Tài khoản Nhân viên không có quyền làm thao tác này. Hãy nhờ Quản trị viên.");

  if (p === "/api/password" && m === "POST") {
    const b = await readBody(req, 10_000);
    if (!(await verifyLogin(s.user, String(b.current || "")))) throw new HttpError(400, "Mật khẩu hiện tại không đúng");
    const newName = String(b.username || s.user).trim();
    checkPasswordRules(newName, b.next);
    await serial(async () => {
      const list = await loadUsers(), u = list.find(x => x.username === s.user);
      if (!u) throw new HttpError(404, "Không tìm thấy tài khoản");
      if (newName !== u.username && list.some(x => x.username === newName)) throw new HttpError(409, "Tên đăng nhập này đã có người dùng");
      Object.assign(u, { username: newName, ...newSecret(b.next), updatedAt: new Date().toISOString() });
      await writeJSON(F.users, list);
    });
    dropSessions(s.user, s.token);
    sessions.get(s.token).user = newName;
    logAct(newName, "Đổi mật khẩu", newName !== s.user ? `Đổi tên đăng nhập từ ${s.user}` : "");
    return send(res, 200, { ok: true });
  }

  /* ----- Tài khoản & phân quyền (chỉ Quản trị viên) ----- */
  if (p === "/api/users" && m === "GET") return send(res, 200, (await loadUsers()).map(publicUser));
  if (p === "/api/users" && m === "POST") {
    const b = await readBody(req, 10_000);
    const username = String(b.username || "").trim(), role = ROLES[b.role] ? b.role : "staff";
    checkPasswordRules(username, b.password);
    await serial(async () => {
      const list = await loadUsers();
      if (list.some(x => x.username === username)) throw new HttpError(409, "Tên đăng nhập này đã có người dùng");
      list.push({ username, name: clean(b.name, 60) || username, role, ...newSecret(b.password), createdAt: new Date().toISOString() });
      await writeJSON(F.users, list);
    });
    logAct(s.user, "Tạo tài khoản", `${username} (${ROLES[role]})`);
    return send(res, 201, { ok: true });
  }
  if (seg[1] === "users" && seg[2] && (m === "PATCH" || m === "DELETE")) {
    const target = decodeURIComponent(seg[2]);
    const b = m === "PATCH" ? await readBody(req, 10_000) : {};
    let note = "";
    await serial(async () => {
      const list = await loadUsers(), i = list.findIndex(x => x.username === target);
      if (i < 0) throw new HttpError(404, "Không tìm thấy tài khoản");
      const owners = list.filter(x => x.role === "owner").length;
      if (m === "DELETE") {
        if (target === s.user) throw new HttpError(400, "Không thể tự xóa tài khoản đang đăng nhập");
        if (list[i].role === "owner" && owners <= 1) throw new HttpError(400, "Phải còn ít nhất một Quản trị viên");
        list.splice(i, 1); note = "Xóa tài khoản";
      } else {
        const u = list[i], changes = [];
        if (b.name !== undefined) { u.name = clean(b.name, 60) || u.username; changes.push("tên hiển thị"); }
        if (b.role !== undefined && b.role !== u.role) {
          if (!ROLES[b.role]) throw new HttpError(400, "Vai trò không hợp lệ");
          if (u.role === "owner" && owners <= 1) throw new HttpError(400, "Phải còn ít nhất một Quản trị viên");
          u.role = b.role; changes.push(`vai trò → ${ROLES[b.role]}`);
        }
        if (b.password !== undefined) { checkPasswordRules(u.username, b.password); Object.assign(u, newSecret(b.password)); changes.push("đặt lại mật khẩu"); }
        note = `Sửa tài khoản (${changes.join(", ")})`;
      }
      await writeJSON(F.users, list);
    });
    if (m === "DELETE" || b.role !== undefined || b.password !== undefined) dropSessions(target, target === s.user ? s.token : null);
    logAct(s.user, note, target);
    return send(res, 200, { ok: true });
  }
  if (p === "/api/activity" && m === "GET") {
    const n = Math.min(3000, Math.max(1, +url.searchParams.get("limit") || 500));
    return send(res, 200, (await readJSON(F.activity, [])).slice(0, n));
  }
  if (p === "/api/stats" && m === "GET") {
    await flushStats();
    return send(res, 200, await statsReport(Math.min(365, Math.max(1, +url.searchParams.get("days") || 30))));
  }

  if (p === "/api/content" && m === "GET") return send(res, 200, await readJSON(F.site));
  if (p === "/api/content" && m === "PUT") {
    const b = await readBody(req, 5 * 1024 * 1024);
    const saved = await serial(async () => {
      const cur = await readJSON(F.site);
      if (+b.rev !== +cur.rev) throw new HttpError(409, "Nội dung vừa được lưu ở nơi khác. Hãy tải lại trang quản trị trước khi lưu để không ghi đè.", { rev: cur.rev });
      return saveContent(b.content, s.user);
    });
    return send(res, 200, { ok: true, rev: saved.rev, updatedAt: saved.updatedAt });
  }

  if (p === "/api/photos" && m === "GET") return send(res, 200, await listPhotos());
  if (p === "/api/photos" && m === "POST") {
    const b = await readBody(req, 40 * 1024 * 1024);
    const bufs = PHOTO_SIZES.map(k => decodeJpeg(b.files && b.files[k]));
    const name = await serial(async () => {
      let base = slugify(b.name), n = base, i = 2;
      while (fs.existsSync(path.join(F.photos, `${n}-sm.jpg`))) n = `${base}-${i++}`;
      for (let k = 0; k < PHOTO_SIZES.length; k++) await fsp.writeFile(path.join(F.photos, `${n}-${PHOTO_SIZES[k]}.jpg`), bufs[k]);
      return n;
    });
    logAct(s.user, "Tải ảnh lên", name);
    return send(res, 201, { ok: true, name });
  }
  if (seg[1] === "photos" && seg[2] && m === "DELETE") {
    const name = seg[2];
    if (!/^[a-z0-9-]+$/.test(name)) throw new HttpError(400, "Tên ảnh không hợp lệ");
    const used = photoUsage(await readJSON(F.site), name);
    if (used.length) throw new HttpError(409, "Ảnh đang được dùng, hãy gỡ ảnh khỏi các mục trước khi xóa", { used });
    for (const k of PHOTO_SIZES) await fsp.unlink(path.join(F.photos, `${name}-${k}.jpg`)).catch(() => {});
    logAct(s.user, "Xóa ảnh", name);
    return send(res, 200, { ok: true });
  }
  if (seg[1] === "photos" && seg[2] && seg[3] === "usage" && m === "GET") return send(res, 200, photoUsage(await readJSON(F.site), seg[2]));

  if (p === "/api/videos" && m === "GET") {
    const files = await fsp.readdir(F.video);
    return send(res, 200, files.filter(f => /^[\w-]+\.mp4$/.test(f) && !/-sm\.mp4$/.test(f)).map(f => f.replace(/\.mp4$/, ""))
      .map(n => ({ name: n, small: files.includes(`${n}-sm.mp4`), poster: files.includes(`${n}-poster.jpg`) })));
  }

  if (p === "/api/bookings" && m === "GET") return send(res, 200, await readJSON(F.bookings, []));
  /* Lịch hẹn nhận qua điện thoại, Zalo, khách đến trực tiếp... (nhập tay trong trang quản trị) */
  if (p === "/api/bookings/manual" && m === "POST") {
    const b = await readBody(req, 20_000);
    const item = Object.assign(bookingFrom(b), {
      source: BOOKING_SOURCES.includes(b.source) && b.source !== "web" ? b.source : "phone",
      status: BOOKING_STATUS.includes(b.status) ? b.status : "new", createdBy: s.user, note: clean(b.note, 2000),
    });
    await serial(async () => {
      const list = await readJSON(F.bookings, []);
      list.unshift(item);
      await writeJSON(F.bookings, list.slice(0, 5000));
    });
    if (b.notify) notifyBooking(item);
    logAct(s.user, "Thêm lịch hẹn", `${item.name} · ${item.phone}${item.topic ? " · " + item.topic : ""}`);
    return send(res, 201, { ok: true, id: item.id });
  }
  if (seg[1] === "bookings" && seg[2] && (m === "PATCH" || m === "DELETE")) {
    const b = m === "PATCH" ? await readBody(req, 20_000) : {};
    let changed = null, removed = null;
    await serial(async () => {
      const list = await readJSON(F.bookings, []);
      const i = list.findIndex(x => x.id === seg[2]);
      if (i < 0) throw new HttpError(404, "Không tìm thấy lịch hẹn");
      const now = new Date().toISOString();
      if (m === "DELETE") removed = list.splice(i, 1)[0];
      else {
        if (b.status !== undefined && b.status !== list[i].status) {
          if (!BOOKING_STATUS.includes(b.status)) throw new HttpError(400, "Trạng thái không hợp lệ");
          Object.assign(list[i], { status: b.status, statusBy: s.user, statusAt: now });
          changed = list[i];
        }
        if (b.note !== undefined) list[i].note = clean(b.note, 2000);
        list[i].updatedAt = now;
      }
      await writeJSON(F.bookings, list);
    });
    if (changed) { tg.syncBooking(changed).catch(() => {}); logAct(s.user, "Đổi trạng thái lịch hẹn", `${changed.name} · ${changed.phone} → ${BOOKING_LABEL[changed.status]}`); }
    if (removed) { tg.syncBooking(removed, true).catch(() => {}); logAct(s.user, "Xóa lịch hẹn", `${removed.name} · ${removed.phone}`); }
    return send(res, 200, { ok: true });
  }

  if (seg[1] === "bookings" && seg[2] && seg[3] === "notify" && m === "POST") {
    const cfg = tg.publicConfig();
    if (!cfg.hasToken) throw new HttpError(400, "Chưa cài mã bot Telegram");
    if (!cfg.enabled) throw new HttpError(400, "Thông báo Telegram đang tắt. Vào Thông báo Telegram để bật");
    if (!cfg.chats.length) throw new HttpError(400, "Chưa có người nhận. Vào Thông báo Telegram để thêm người nhận");
    const b = (await readJSON(F.bookings, [])).find(x => x.id === seg[2]);
    if (!b) throw new HttpError(404, "Không tìm thấy lịch hẹn");
    const sent = await tg.notifyBooking(b);
    if (!sent.length) throw new HttpError(502, `Không gửi được: ${tg.publicConfig().lastError || "lỗi Telegram"}`);
    await serial(async () => {
      const list = await readJSON(F.bookings, []);
      const x = list.find(y => y.id === b.id);
      if (x) { x.tg = (x.tg || []).concat(sent); await writeJSON(F.bookings, list); }
    });
    return send(res, 200, { ok: true, sent: sent.length });
  }

  if (p === "/api/telegram" && m === "GET") return send(res, 200, tg.publicConfig());
  if (p === "/api/telegram" && m === "POST") {
    const b = await readBody(req, 20_000);
    let out;
    try { out = await tg.update(b); } catch (e) { throw new HttpError(e.status || 502, e.message); }
    logAct(s.user, "Cài đặt Telegram", `${out.enabled ? "Bật" : "Tắt"} thông báo · ${out.chats.length} người nhận`);
    return send(res, 200, out);
  }
  if (p === "/api/telegram/test" && m === "POST") {
    try { return send(res, 200, { results: await tg.test() }); } catch (e) { throw new HttpError(400, e.message); }
  }

  if (p === "/api/backups" && m === "GET") {
    await fsp.mkdir(F.backups, { recursive: true });
    const out = [];
    for (const f of await fsp.readdir(F.backups)) {
      if (!/^site-r\d+-.*\.json$/.test(f)) continue;
      const st = await fsp.stat(path.join(F.backups, f));
      out.push({ file: f, rev: +f.match(/^site-r(\d+)/)[1], size: st.size, mtime: st.mtimeMs });
    }
    return send(res, 200, out.sort((a, b) => b.mtime - a.mtime));
  }
  if (seg[1] === "backups" && seg[2]) {
    const file = seg[2];
    if (!/^site-r\d+-[\w-]+\.json$/.test(file)) throw new HttpError(400, "Tên bản sao lưu không hợp lệ");
    const data = await readJSON(path.join(F.backups, file), null);
    if (!data) throw new HttpError(404, "Không tìm thấy bản sao lưu");
    if (m === "GET") return send(res, 200, data);
    if (seg[3] === "restore" && m === "POST") {
      const saved = await serial(() => saveContent(data, s.user, `Khôi phục bản sao lưu (phiên bản ${data.rev})`));
      return send(res, 200, { ok: true, rev: saved.rev });
    }
  }
  throw new HttpError(404, "Không có API này");
}

/* ---------- Phục vụ tệp tĩnh ---------- */
function staticPath(pathname) {
  let p;
  try { p = decodeURIComponent(pathname); } catch (e) { return null; }
  if (p.includes("\0")) return null;
  if (p.endsWith("/")) p += "index.html";
  p = path.posix.normalize(p);
  const ok = /^\/(assets|css|js|admin)\//.test(p) || /^\/[\w.-]+\.html$/.test(p) || /^\/san-pham\/[a-z0-9-]+\/index\.html$/.test(p) || ["/favicon.ico", "/robots.txt", "/sitemap.xml"].includes(p);
  if (!ok || p.split("/").some(x => x.startsWith("."))) return null;
  const abs = path.join(ROOT, p);
  return abs.startsWith(ROOT + path.sep) ? abs : null;
}

const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "SAMEORIGIN" };
const ADMIN_CSP = "default-src 'self'; img-src 'self' data: blob:; media-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'";

/* Tên miền đang được truy cập (dùng cho sitemap khi chưa khai báo địa chỉ website trong trang quản trị) */
const originOf = req => `${req.headers["x-forwarded-proto"] === "https" || req.socket.encrypted ? "https" : "http"}://${req.headers.host}`;
/* Bản xem thử qua đường link tạm (Cloudflare Tunnel, ngrok...): không cho Google lập chỉ mục */
const isTempHost = req => /\.(trycloudflare\.com|ngrok-free\.app|ngrok\.io|ngrok\.app|loca\.lt)$/i.test(String(req.headers.host || "").replace(/:\d+$/, ""));
async function serveStatic(req, res, url) {
  if (isTempHost(req)) res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (url.pathname === "/admin") { res.writeHead(301, { Location: "/admin/" }); return res.end(); }
  /* SEO: sitemap.xml và robots.txt luôn khớp nội dung mới nhất */
  if (url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt") {
    const c = await readJSON(F.site);
    const base = String(c.site.siteUrl || "").trim().replace(/\/+$/, "") || originOf(req);
    const xml = url.pathname === "/sitemap.xml";
    res.writeHead(200, { "Content-Type": xml ? "application/xml; charset=utf-8" : "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" });
    if (!xml && isTempHost(req)) return res.end("User-agent: *\nDisallow: /\n");
    return res.end(xml ? sitemapXml(c, base) : robotsTxt(base));
  }
  /* Địa chỉ cũ product.html?id=... chuyển hẳn (301) sang trang riêng của sản phẩm */
  if (url.pathname === "/product.html" && url.searchParams.get("id")) {
    const slug = productSlugs(await readJSON(F.site))[url.searchParams.get("id")];
    if (slug) { res.writeHead(301, { Location: "/" + productPath(slug) }); return res.end(); }
  }
  if (/^\/san-pham\/[a-z0-9-]+$/.test(url.pathname)) { res.writeHead(301, { Location: url.pathname + "/" }); return res.end(); }
  const abs = staticPath(url.pathname === "/" ? "/index.html" : url.pathname);
  let st = abs && await fsp.stat(abs).catch(() => null);
  if (!st || !st.isFile()) {
    const nf = path.join(ROOT, "404.html");
    res.writeHead(404, Object.assign({ "Content-Type": MIME[".html"], "Cache-Control": "no-cache" }, SEC));
    return fs.createReadStream(nf).pipe(res);
  }
  const ext = path.extname(abs).toLowerCase();
  const etag = `W/"${st.size}-${Math.floor(st.mtimeMs)}"`;
  const headers = Object.assign({
    "Content-Type": MIME[ext] || "application/octet-stream", ETag: etag, "Accept-Ranges": "bytes",
    "Cache-Control": abs.startsWith(F.video) ? "public, max-age=86400" : "no-cache",
  }, SEC);
  if (url.pathname.startsWith("/admin/")) headers["Content-Security-Policy"] = ADMIN_CSP;
  if (req.headers["if-none-match"] === etag) { res.writeHead(304, headers); return res.end(); }
  /* Hỗ trợ tải từng đoạn (Range) để video phát và tua mượt */
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if (range && (range[1] || range[2])) {
    let start = range[1] ? +range[1] : st.size - +range[2], end = range[1] && range[2] ? +range[2] : st.size - 1;
    if (start >= st.size || start > end) { res.writeHead(416, { "Content-Range": `bytes */${st.size}` }); return res.end(); }
    end = Math.min(end, st.size - 1);
    res.writeHead(206, Object.assign(headers, { "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": end - start + 1 }));
    return req.method === "HEAD" ? res.end() : fs.createReadStream(abs, { start, end }).pipe(res);
  }
  res.writeHead(200, Object.assign(headers, { "Content-Length": st.size }));
  return req.method === "HEAD" ? res.end() : fs.createReadStream(abs).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method Not Allowed");
    return await serveStatic(req, res, url);
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, Object.assign({ error: e.message }, e.extra || {}));
    console.error(new Date().toISOString(), req.method, url.pathname, e);
    if (!res.headersSent) send(res, 500, { error: "Lỗi máy chủ, vui lòng thử lại" });
  }
});

if (!fs.existsSync(F.site)) {
  console.error("Chưa có content/site.json. Chạy: node server/migrate.js");
  process.exit(1);
}
(async () => {
  try { siteName = JSON.parse(fs.readFileSync(F.site, "utf8")).site.name || siteName; } catch (e) { /* dùng tên mặc định */ }
  try { generateSite(JSON.parse(fs.readFileSync(F.site, "utf8"))); } catch (e) { console.error("[seo]", e); }
  await loadStats();
  setInterval(flushStats, 60000).unref();
  for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { flushStats().finally(() => process.exit(0)); });
  await tg.load();
  tg.start();
})();
server.listen(PORT, HOST, () => {
  const base = `http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`;
  console.log(`ROMAN đang chạy: ${base}`);
  console.log(`Trang quản trị: ${base}/admin/` + (adminExists() ? "" : "  (lần đầu: mở trang này trên máy này để tạo tài khoản)"));
});
