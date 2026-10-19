/* ===== Bot Telegram báo lịch hẹn =====
   - Khách gửi form đặt lịch -> gửi tin tới mọi người nhận (người hoặc nhóm) kèm nút đổi trạng thái.
   - Bấm nút trên Telegram -> cập nhật trạng thái lịch hẹn; đổi trạng thái trong trang quản trị -> sửa lại tin trên Telegram.
   - Nhận lệnh bằng cách hỏi Telegram liên tục (long polling): không cần tên miền, HTTPS hay webhook.
   Cấu hình (có mã bot bí mật) nằm ở content/telegram.json, không bao giờ xuất ra website. */
"use strict";
const fsp = require("fs").promises;

const API = (process.env.TELEGRAM_API || "https://api.telegram.org").replace(/\/$/, "");
const TZ = "Asia/Ho_Chi_Minh";
const STATUS = { new: "🟡 Mới", contacted: "🔵 Đã liên hệ", done: "🟢 Hoàn thành", cancelled: "⚪ Đã hủy" };
const BUTTONS = [["contacted", "✅ Đã liên hệ"], ["done", "🏁 Hoàn thành"], ["cancelled", "❌ Hủy"], ["new", "↩ Đặt lại: Mới"]];
const SOURCES = { web: "Website", phone: "Điện thoại", zalo: "Zalo", facebook: "Facebook", walkin: "Khách đến cửa hàng", other: "Khác" };
const TOKEN_RE = /^\d{5,15}:[\w-]{30,60}$/;
const CHAT_RE = /^-?\d{1,20}$/;

const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const timeVN = t => new Date(t).toLocaleString("vi-VN", { timeZone: TZ, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

function createTelegram({ file, onStatus, siteName = () => "ROMAN", log = console }) {
  let cfg = { enabled: false, token: "", chats: [], publicUrl: "" };
  let me = null, lastError = "", offset = 0, gen = 0, polling = false, abort = null;
  const seen = new Map(); // các cuộc trò chuyện vừa nhắn bot, để chọn người nhận trong trang quản trị

  async function load() {
    try { cfg = Object.assign(cfg, JSON.parse(await fsp.readFile(file, "utf8"))); } catch (e) { /* chưa cấu hình */ }
    (cfg.seen || []).forEach(c => seen.set(String(c.id), c));
  }
  async function persist() {
    const tmp = `${file}.${process.pid}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(cfg, null, 2));
    await fsp.rename(tmp, file);
  }

  async function call(method, params, token = cfg.token, signal) {
    let r;
    try {
      r = await fetch(`${API}/bot${token}/${method}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params || {}), signal });
    } catch (e) {
      if (e.name === "AbortError") throw e;
      throw Object.assign(new Error("Không kết nối được tới Telegram"), { code: 0 });
    }
    const j = await r.json().catch(() => ({ ok: false, description: `HTTP ${r.status}`, error_code: r.status }));
    if (!j.ok) throw Object.assign(new Error(j.description || "Telegram báo lỗi"), { code: j.error_code, retryAfter: j.parameters && j.parameters.retry_after });
    return j.result;
  }

  /* ---------- Nội dung tin nhắn ---------- */
  function text(b) {
    const fresh = b.status === "new";
    const head = `${fresh ? "🔔 <b>LỊCH HẸN MỚI</b>" : "📋 <b>LỊCH HẸN</b>"} · ${esc(siteName())}`;
    const body = [
      `👤 <b>${esc(b.name)}</b>`,
      `📞 ${esc(b.phone)}`,
      b.car && `🚗 ${esc(b.car)}`,
      b.date && `📅 Ngày dự kiến: ${esc(b.date.split("-").reverse().join("/"))}`,
      b.topic && `🛠 ${esc(b.topic)}`,
      b.msg && `📝 ${esc(b.msg.length > 1200 ? b.msg.slice(0, 1200) + "…" : b.msg)}`,
      b.source && b.source !== "web" && `📥 Nguồn: ${esc(SOURCES[b.source] || b.source)}${b.createdBy ? ` · nhập bởi ${esc(b.createdBy)}` : ""}`,
      `🕒 ${b.source && b.source !== "web" ? "Nhập lúc" : "Gửi lúc"} ${timeVN(b.createdAt)}`,
    ].filter(Boolean).join("\n");
    const foot = `Trạng thái: <b>${STATUS[b.status] || esc(b.status)}</b>${b.statusBy ? ` · ${esc(b.statusBy)}, ${timeVN(b.statusAt)}` : ""}`;
    return [head, body, foot].join("\n\n");
  }
  function keyboard(b) {
    const btns = BUTTONS.filter(([s]) => s !== b.status && (s !== "new" || b.status !== "new")).map(([s, t]) => ({ text: t, callback_data: `st:${s}:${b.id}` }));
    const rows = [btns.slice(0, 2), btns.slice(2)].filter(r => r.length);
    if (/^https:\/\//.test(cfg.publicUrl || "")) rows.push([{ text: "Mở trang quản trị", url: `${cfg.publicUrl.replace(/\/+$/, "")}/admin/#/bookings` }]);
    return { inline_keyboard: rows };
  }

  /* Gửi có thử lại: chờ khi Telegram báo gửi quá nhanh (429), thử lại khi lỗi mạng */
  async function send(chat, payload) {
    for (let attempt = 0; ; attempt++) {
      try { return await call("sendMessage", Object.assign({ chat_id: chat, parse_mode: "HTML", disable_web_page_preview: true }, payload)); }
      catch (e) {
        if (attempt >= 3) throw e;
        if (e.code === 429) await sleep(((e.retryAfter || 3) + 1) * 1000);
        else if (e.code >= 400 && e.code < 500) throw e;
        else await sleep(2000 * (attempt + 1));
      }
    }
  }

  const ready = () => cfg.enabled && cfg.token && cfg.chats.length;

  /* Trả về danh sách tin đã gửi [{chat, id}] để sau này sửa lại khi đổi trạng thái */
  async function notifyBooking(b) {
    if (!ready()) return [];
    const sent = [];
    for (const c of cfg.chats) {
      try { const m = await send(c.id, { text: text(b), reply_markup: keyboard(b) }); sent.push({ chat: String(c.id), id: m.message_id }); }
      catch (e) { lastError = `Gửi tới ${c.name || c.id} thất bại: ${e.message}`; log.error(new Date().toISOString(), "[telegram]", lastError); }
    }
    return sent;
  }
  async function syncBooking(b, removed) {
    if (!cfg.token || !b.tg || !b.tg.length) return;
    for (const m of b.tg) {
      const payload = removed
        ? { chat_id: m.chat, message_id: m.id, parse_mode: "HTML", text: `${text(b)}\n\n🗑 <i>Lịch hẹn đã bị xóa trong trang quản trị</i>` }
        : { chat_id: m.chat, message_id: m.id, parse_mode: "HTML", text: text(b), reply_markup: keyboard(b), disable_web_page_preview: true };
      try { await call("editMessageText", payload); }
      catch (e) { if (!/not modified/i.test(e.message)) log.error(new Date().toISOString(), "[telegram] sửa tin", e.message); }
    }
  }
  async function test() {
    if (!cfg.token) throw new Error("Chưa nhập mã bot");
    if (!cfg.chats.length) throw new Error("Chưa có người nhận");
    const out = [];
    for (const c of cfg.chats) {
      try { await send(c.id, { text: `✅ Bot thông báo của <b>${esc(siteName())}</b> đã kết nối.\nTừ giờ mỗi lịch hẹn mới trên website sẽ được gửi vào đây.` }); out.push({ id: c.id, name: c.name, ok: true }); }
      catch (e) { out.push({ id: c.id, name: c.name, ok: false, error: e.message }); }
    }
    return out;
  }

  /* ---------- Nhận lệnh từ Telegram ---------- */
  const allowed = id => cfg.chats.some(c => String(c.id) === String(id));
  const nameOf = c => c.title || [c.first_name, c.last_name].filter(Boolean).join(" ") || (c.username ? "@" + c.username : String(c.id));
  function record(chat) {
    if (!chat) return;
    seen.set(String(chat.id), { id: String(chat.id), name: nameOf(chat), type: chat.type, at: Date.now() });
    if (seen.size > 30) seen.delete(seen.keys().next().value);
    /* Lưu lại để khởi động lại máy chủ vẫn còn danh sách người vừa nhắn bot */
    cfg.seen = [...seen.values()];
    persist().catch(() => {});
  }
  async function handle(u) {
    if (u.my_chat_member) record(u.my_chat_member.chat);
    if (u.message) {
      const m = u.message;
      record(m.chat);
      if (/^\/(start|id|chatid)\b/.test(m.text || "")) {
        await send(m.chat.id, { text: allowed(m.chat.id)
          ? `Chào bạn! Cuộc trò chuyện này đang nhận thông báo lịch hẹn của <b>${esc(siteName())}</b>.`
          : `Chào bạn! Chat ID của cuộc trò chuyện này là <code>${m.chat.id}</code>.\nVào trang quản trị → <b>Thông báo Telegram</b> để thêm làm người nhận.` }).catch(() => {});
      }
    }
    if (u.callback_query) {
      const q = u.callback_query, chatId = q.message && q.message.chat && q.message.chat.id;
      const answer = t => call("answerCallbackQuery", { callback_query_id: q.id, text: t }).catch(() => {});
      if (!allowed(chatId)) return answer("Cuộc trò chuyện này không có quyền cập nhật lịch hẹn");
      const m = /^st:(new|contacted|done|cancelled):([a-f0-9]{6,32})$/.exec(q.data || "");
      if (!m) return answer("Thao tác không hợp lệ");
      const b = await onStatus(m[2], m[1], nameOf(q.from || {}));
      return answer(b ? `Đã chuyển sang: ${STATUS[m[1]]}` : "Không tìm thấy lịch hẹn (có thể đã bị xóa)");
    }
  }
  async function loop(my) {
    polling = true;
    while (my === gen) {
      try {
        if (!me) { me = await call("getMe"); await call("deleteWebhook", { drop_pending_updates: false }); }
        abort = new AbortController();
        const ups = await call("getUpdates", { offset, timeout: 25, allowed_updates: ["message", "callback_query", "my_chat_member"] }, cfg.token, abort.signal);
        for (const u of ups) {
          offset = u.update_id + 1;
          await handle(u).catch(e => log.error(new Date().toISOString(), "[telegram] xử lý", e.message));
        }
        lastError = "";
      } catch (e) {
        if (my !== gen || e.name === "AbortError") break;
        lastError = e.code === 401 ? "Mã bot không đúng hoặc đã bị thu hồi" : e.code === 409 ? "Bot đang được một máy chủ khác sử dụng" : e.message;
        await sleep(e.code === 401 || e.code === 409 ? 60000 : 5000);
      }
    }
    if (my === gen) polling = false;
  }
  function restart() {
    gen++;
    if (abort) abort.abort();
    polling = false; me = null;
    if (cfg.enabled && cfg.token) loop(gen);
  }

  /* ---------- Cấu hình từ trang quản trị ---------- */
  function publicConfig() {
    return {
      enabled: cfg.enabled, hasToken: !!cfg.token, tokenHint: cfg.token ? `…${cfg.token.slice(-4)}` : "",
      chats: cfg.chats, publicUrl: cfg.publicUrl, polling, lastError,
      bot: me ? { username: me.username, name: me.first_name } : null,
      seen: [...seen.values()].sort((a, b) => b.at - a.at),
    };
  }
  async function update(p) {
    const next = Object.assign({}, cfg);
    if (typeof p.token === "string" && p.token.trim()) {
      const t = p.token.trim();
      if (!TOKEN_RE.test(t)) throw Object.assign(new Error("Mã bot chưa đúng định dạng (dạng 123456789:AA...)"), { status: 400 });
      try { await call("getMe", {}, t); } catch (e) { throw Object.assign(new Error(e.code === 401 ? "Telegram không chấp nhận mã bot này" : `Không kiểm tra được mã bot: ${e.message}`), { status: 400 }); }
      next.token = t;
    }
    if (p.token === null) { next.token = ""; next.enabled = false; }
    if (Array.isArray(p.chats)) {
      next.chats = p.chats.slice(0, 20).map(c => ({ id: String(c.id || "").trim(), name: String(c.name || "").slice(0, 80) }));
      const bad = next.chats.find(c => !CHAT_RE.test(c.id));
      if (bad) throw Object.assign(new Error(`Chat ID "${bad.id}" không hợp lệ (chỉ gồm số, nhóm bắt đầu bằng dấu -)`), { status: 400 });
    }
    if (typeof p.publicUrl === "string") {
      const u = p.publicUrl.trim();
      if (u && !/^https:\/\/[^\s/]+/.test(u)) throw Object.assign(new Error("Địa chỉ website phải bắt đầu bằng https://"), { status: 400 });
      next.publicUrl = u;
    }
    if (typeof p.enabled === "boolean") next.enabled = p.enabled && !!next.token;
    cfg = next;
    await persist();
    restart();
    return publicConfig();
  }

  return { load, start: restart, notifyBooking, syncBooking, test, publicConfig, update, STATUS };
}

module.exports = { createTelegram };
