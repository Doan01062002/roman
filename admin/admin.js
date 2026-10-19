/* ===== Trang quản trị ROMAN =====
   Toàn bộ nội dung website nằm trong S.c (bản sao làm việc của content/site.json).
   Sửa ở bất kỳ màn hình nào cũng chỉ đổi S.c; bấm "Lưu thay đổi" (hoặc Ctrl+S) mới ghi lên máy chủ và cập nhật website.
   Lịch hẹn và ảnh được lưu ngay khi thao tác (không cần bấm Lưu). */
"use strict";

/* ---------- Tiện ích chung ---------- */
const $ = (s, r = document) => r.querySelector(s);
const clone = v => JSON.parse(JSON.stringify(v));
const money = n => Number(n || 0).toLocaleString("vi-VN");
const digits = s => String(s || "").replace(/\D/g, "");
const slugify = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").toLowerCase();
const thumb = n => `../assets/photos/${encodeURIComponent(n)}-sm.jpg`;
const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };
const timeVN = t => new Date(t).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

const I = (d, w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  home: I('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z"/>'),
  cal: I('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  box: I('<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/>'),
  grid: I('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  layout: I('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>'),
  file: I('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'),
  leaf: I('<path d="M4 20c8 0 16-6 16-16C10 4 4 10 4 20Z"/><path d="M4 20 14 10"/>'),
  image: I('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  store: I('<path d="M4 9h16l-1-5H5ZM5 9v11h14V9M9 20v-6h6v6"/>'),
  search: I('<circle cx="10.5" cy="10.5" r="7"/><path d="m20.5 20.5-4.8-4.8"/>'),
  archive: I('<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>'),
  user: I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  up: I('<path d="m6 15 6-6 6 6"/>', 16), down: I('<path d="m6 9 6 6 6-6"/>', 16),
  left: I('<path d="m15 6-6 6 6 6"/>', 16), right: I('<path d="m9 6 6 6-6 6"/>', 16),
  trash: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', 16),
  copy: I('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>', 16),
  edit: I('<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m14 6 4 4"/>', 16),
  eye: I('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>', 16),
  eyeOff: I('<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>', 16),
  menu: I('<path d="M4 6h16M4 12h16M4 18h16"/>', 20), x: I('<path d="M6 6l12 12M18 6 6 18"/>', 18),
  ext: I('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', 16),
  phone: I('<path d="M5 3.5h3.2l1.6 4.3-2.2 1.4a12 12 0 0 0 7.2 7.2l1.4-2.2 4.3 1.6V19a1.8 1.8 0 0 1-1.9 1.8A16.5 16.5 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5Z"/>', 16),
  chev: I('<path d="m9 6 6 6-6 6"/>', 16),
  alert: I('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>'),
  checkCircle: I('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16 9.8"/>'),
  clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  car: I('<path d="M5 17h14v-4.5l-1.8-4.6A2 2 0 0 0 15.3 6.5H8.7a2 2 0 0 0-1.9 1.4L5 12.5Z"/><path d="M5 12.5h14M7.5 17v2M16.5 17v2"/><circle cx="8" cy="14.7" r=".6"/><circle cx="16" cy="14.7" r=".6"/>'),
  logout: I('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>'),
  send: I('<path d="M21 3 10 14M21 3l-7 18-4-7-7-4Z"/>'),
  chat: I('<path d="M4 5h16v11H9l-5 4Z"/>'),
  save: I('<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z"/><path d="M8 3v5h7M8 21v-7h8v7"/>'),
  inbox: I('<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6Z"/>'),
  info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>'),
  calGrid: I('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01"/>'),
  users: I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5 5 0 0 1 3.5 6"/>'),
  chart: I('<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3M20 16V6"/>'),
  tag: I('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z"/><circle cx="8" cy="8" r="1.5"/>'),
  shield: I('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>'),
  history: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>', 16),
  bell: I('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>'),
};

/* Tạo phần tử an toàn: chuỗi luôn được chèn dạng chữ (không phải HTML), chỉ "html" dùng cho biểu tượng cố định */
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (["value", "checked", "disabled", "hidden", "multiple", "readOnly", "selected"].includes(k)) el[k] = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false && c !== "") el.append(c instanceof Node ? c : String(c));
  return el;
}
/* Thay nội dung phần tử; bỏ qua null/false/"" và trải phẳng mảng */
const put = (el, ...kids) => el.replaceChildren(...kids.flat(Infinity).filter(k => k != null && k !== false && k !== "").map(k => (k instanceof Node ? k : String(k))));
const iconBtn = (icon, label, disabled, fn, cls = "") => h("button", { type: "button", class: `icon-btn ${cls}`, title: label, "aria-label": label, disabled, onclick: fn, html: ICON[icon] });

/* ---------- Trạng thái ---------- */
const S = { role: "owner", name: "", tg: null, c: null, rev: 0, dirty: false, saving: false, user: "", photos: [], videos: [], bookings: [], fresh: new WeakSet() };

function toast(msg, type = "", list) {
  const t = h("div", { class: `toast ${type}`, html: type === "ok" ? ICON.checkCircle : type === "bad" ? ICON.alert : ICON.info },
    h("div", null, msg, list && list.length ? h("ul", null, list.slice(0, 8).map(x => h("li", null, x))) : null));
  $("#toasts").append(t);
  setTimeout(() => t.remove(), type === "bad" ? 9000 : 3800);
}

async function api(method, url, body, retried) {
  const opt = { method, credentials: "same-origin", headers: { "X-Roman-Admin": "1" } };
  if (body !== undefined) { opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
  let r;
  try { r = await fetch(url, opt); } catch (e) { throw Object.assign(new Error("Không kết nối được máy chủ. Kiểm tra máy chủ còn chạy không."), { status: 0 }); }
  let data = null;
  try { data = await r.json(); } catch (e) { /* không phải JSON */ }
  if (r.status === 401 && !retried && S.c && !/\/api\/(login|password)/.test(url)) {
    await reLogin();
    return api(method, url, body, true);
  }
  if (!r.ok) throw Object.assign(new Error((data && data.error) || `Lỗi ${r.status}`), { status: r.status, data });
  return data;
}

/* ---------- Hộp thoại ---------- */
function modal({ title, body, foot, size = "", onClose }) {
  const prevFocus = document.activeElement;
  const close = () => { bg.remove(); document.removeEventListener("keydown", onKey); prevFocus && prevFocus.focus && prevFocus.focus(); };
  const cancel = () => { close(); onClose && onClose(); };
  const onKey = e => { if (e.key === "Escape") cancel(); };
  const bg = h("div", { class: "modal-bg", onmousedown: e => { if (e.target === bg) cancel(); } },
    h("div", { class: `modal ${size}`, role: "dialog", "aria-modal": "true", "aria-label": title },
      h("div", { class: "modal-h" }, h("h2", null, title), iconBtn("x", "Đóng", false, cancel)),
      h("div", { class: "modal-b" }, body),
      foot && h("div", { class: "modal-f" }, foot)));
  document.body.append(bg);
  document.addEventListener("keydown", onKey);
  setTimeout(() => (bg.querySelector("input, select, textarea, .modal-f .btn-dark") || bg.querySelector("button")).focus(), 30);
  return { close, cancel, el: bg };
}

/* ---------- Ô nhập gắn với dữ liệu ---------- */
let markDirty = () => {};
const dirty = () => markDirty();
const fld = (label, control, o = {}) => h(o.div ? "div" : "label", { class: "fld" }, h("span", { class: "fld-l" }, label, o.count || null), control, o.hint && h("small", { class: "fld-h" }, o.hint));
function input(obj, key, o = {}) {
  const el = h(o.rows ? "textarea" : "input", {
    type: o.rows ? null : (o.type || "text"), rows: o.rows, value: obj[key] == null ? "" : obj[key], placeholder: o.ph,
    readOnly: o.ro, class: o.mono ? "mono" : null, list: o.list, maxlength: o.max, inputmode: o.inputmode, autocomplete: o.ac || "off", spellcheck: o.mono ? "false" : null,
  });
  el.addEventListener("input", () => { obj[key] = el.value; dirty(); o.on && o.on(el.value, el); });
  return el;
}
const tf = (obj, key, label, o = {}) => fld(label, input(obj, key, o), o);
function counted(obj, key, label, max, o = {}) {
  const c = h("span", { class: "fld-c" });
  const upd = v => { c.textContent = `${String(v || "").length}/${max}`; c.classList.toggle("over", String(v || "").length > max); };
  const el = input(obj, key, Object.assign({}, o, { on: (v, e) => { upd(v); o.on && o.on(v, e); } }));
  upd(obj[key]);
  return fld(label, el, { count: c, hint: o.hint });
}
function sel(obj, key, options, o = {}) {
  const el = h("select", { onchange: () => { obj[key] = el.value; dirty(); o.on && o.on(el.value); } }, options.map(([v, l]) => h("option", { value: v }, l)));
  el.value = obj[key] == null ? "" : String(obj[key]);
  if (el.selectedIndex < 0 && options.length) el.selectedIndex = 0;
  return el;
}
function chk(obj, key, label, o = {}) {
  const el = h("input", { type: "checkbox", checked: o.invert ? !obj[key] : !!obj[key] });
  el.addEventListener("change", () => { obj[key] = o.invert ? !el.checked : el.checked; dirty(); o.on && o.on(el.checked); });
  return h("label", { class: "check" }, el, label);
}
function moneyInput(get, set) {
  const el = h("input", { type: "text", inputmode: "numeric", value: get() ? money(get()) : "", placeholder: "0" });
  el.addEventListener("input", () => {
    const n = +digits(el.value) || 0;
    set(n); dirty();
    const pos = el.value.length - el.selectionStart;
    el.value = n ? money(n) : "";
    el.setSelectionRange(Math.max(0, el.value.length - pos), Math.max(0, el.value.length - pos));
  });
  return h("div", { class: "money" }, el, h("span", null, "₫"));
}

/* Danh sách các khối (thêm, xóa, đổi thứ tự) */
function listEd(arr, o) {
  const box = h("div", { class: "list" });
  const draw = () => {
    put(box, ...arr.map((it, i) => {
      const t = h("b", null, o.title ? o.title(it, i) : `Mục ${i + 1}`);
      const li = h("div", { class: "li" + (o.collapsed ? " collapsed" : "") });
      const toggle = o.collapsed !== undefined ? iconBtn("chev", "Mở / thu gọn", false, () => li.classList.toggle("collapsed")) : null;
      li.append(
        h("div", { class: "li-head" }, toggle, t, h("div", { class: "li-tools" },
          iconBtn("up", "Đưa lên", i === 0, () => { move(arr, i, -1); dirty(); draw(); }),
          iconBtn("down", "Đưa xuống", i === arr.length - 1, () => { move(arr, i, 1); dirty(); draw(); }),
          iconBtn("trash", "Xóa", arr.length <= (o.min || 0), () => {
            const why = o.canDelete && o.canDelete(it);
            if (why) return toast(why, "bad");
            if (!confirm(`Xóa "${t.textContent}"?`)) return;
            arr.splice(i, 1); dirty(); draw(); o.onChange && o.onChange();
          }, "danger"))),
        h("div", { class: "li-body" }, o.item(it, i, draw)));
      if (o.title) li.addEventListener("input", () => { t.textContent = o.title(it, i); });
      return li;
    }), o.add && (!o.max || arr.length < o.max) ? h("button", { type: "button", class: "btn btn-sm add-row", onclick: () => { const n = o.add(); arr.push(n); dirty(); o.onAdd && o.onAdd(n); draw(); o.onChange && o.onChange(); } }, "+ " + (o.addLabel || "Thêm")) : null);
  };
  draw();
  return box;
}
/* Danh sách chuỗi; onRename(cũ, mới) gọi khi rời ô (để đổi tên nhóm cập nhật luôn sản phẩm) */
function strList(arr, o = {}) {
  const box = h("div", { class: "list" });
  const draw = () => put(box, ...arr.map((s, i) => {
    let before = s;
    const locked = !!(o.locked && o.locked.includes(s));
    const el = h(o.rows ? "textarea" : "input", { type: o.rows ? null : "text", rows: o.rows, value: s, placeholder: o.ph || "", readOnly: locked, title: locked ? o.lockedHint : null });
    el.addEventListener("focus", () => { before = arr[i]; });
    el.addEventListener("input", () => { arr[i] = el.value; dirty(); });
    el.addEventListener("change", () => { if (o.onRename && before !== el.value) o.onRename(before, el.value); before = el.value; });
    return h("div", { class: "sl-row" }, el,
      iconBtn("up", "Đưa lên", i === 0, () => { move(arr, i, -1); dirty(); draw(); }, "mv"),
      iconBtn("down", "Đưa xuống", i === arr.length - 1, () => { move(arr, i, 1); dirty(); draw(); }, "mv"),
      iconBtn("trash", locked ? o.lockedHint : "Xóa", locked, () => {
        const why = o.canDelete && o.canDelete(arr[i]);
        if (why) return toast(why, "bad");
        arr.splice(i, 1); dirty(); draw();
      }, "danger"));
  }), h("button", { type: "button", class: "btn btn-sm add-row", onclick: () => { arr.push(""); dirty(); draw(); box.querySelectorAll(".sl-row > input, .sl-row > textarea")[arr.length - 1]?.focus(); } }, "+ " + (o.addLabel || "Thêm dòng")));
  draw();
  return box;
}
const section = (title, sub, ...body) => h("section", { class: "card sec" }, h("div", { class: "sec-h" }, h("div", null, h("h2", null, title), sub && h("p", null, sub))), h("div", { class: "sec-b" }, body));
const tabs = (items, current, onPick) => h("div", { class: "tabs", role: "tablist" }, items.map(([id, label, badge]) => h("button", { type: "button", role: "tab", class: id === current ? "on" : "", "aria-selected": String(id === current), onclick: () => onPick(id) }, label, badge != null && h("span", { class: "badge" }, String(badge)))));

const mdHelp = () => h("details", { class: "help" }, h("summary", null, "Cách định dạng văn bản và chèn thông tin cửa hàng"),
  h("ul", null,
    h("li", null, h("code", null, "**chữ đậm**"), " → ", h("b", null, "chữ đậm")),
    h("li", null, h("code", null, "[Chính sách bảo hành](chinh-sach.html#bao-hanh)"), " → liên kết"),
    h("li", null, "Dòng bắt đầu bằng ", h("code", null, "- "), " là danh sách chấm; ", h("code", null, "1. "), " là danh sách số; ", h("code", null, "### "), " là tiêu đề nhỏ"),
    h("li", null, "Để một dòng trống giữa hai đoạn văn"),
    h("li", null, "Tự điền thông tin: ", ["{hotline}", "{hotline2}", "{email}", "{store}", "{warehouse}", "{hours}"].map(x => [h("code", null, x), " "]), " · số để gọi: ", h("code", null, "tel:{hotlineTel}"))));

/* ---------- Ảnh ---------- */
const altOf = n => (S.c.photoAlt && S.c.photoAlt[n]) || "";
async function blobToB64(blob) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(blob); });
}
/* Tạo 3 cỡ ảnh ngay trên trình duyệt: vẽ lại qua canvas nên mất EXIF/GPS */
async function uploadFiles(files, onProg) {
  const names = [], list = [...files];
  for (let k = 0; k < list.length; k++) {
    const file = list[k];
    if (!/^image\//.test(file.type)) { toast(`Bỏ qua "${file.name}": không phải tệp ảnh`, "bad"); continue; }
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: "from-image" }); } catch (e) { toast(`Không đọc được ảnh "${file.name}" (hãy dùng JPG hoặc PNG)`, "bad"); continue; }
    if (bmp.width < 960) toast(`Ảnh "${file.name}" chỉ rộng ${bmp.width}px, có thể bị mờ khi hiển thị lớn`, "");
    const out = {};
    for (const [key, w] of [["sm", 960], ["lg", 1440], ["xl", 1920]]) {
      const tw = Math.min(w, bmp.width), th = Math.round(bmp.height * tw / bmp.width);
      const cv = h("canvas", { width: tw, height: th }), ctx = cv.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, tw, th);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, 0, 0, tw, th);
      out[key] = await blobToB64(await new Promise(r => cv.toBlob(r, "image/jpeg", key === "sm" ? 0.84 : 0.86)));
    }
    try {
      const r = await api("POST", "/api/photos", { name: file.name, files: out });
      names.push(r.name);
    } catch (e) { toast(`Tải "${file.name}" thất bại: ${e.message}`, "bad"); }
    onProg && onProg((k + 1) / list.length);
  }
  S.photos = await api("GET", "/api/photos");
  if (names.length) toast(`Đã tải lên ${names.length} ảnh`, "ok");
  return names;
}
function uploadButton(label, after) {
  const file = h("input", { type: "file", accept: "image/*", multiple: true, hidden: true });
  const prog = h("div", { class: "progress", hidden: true }, h("span"));
  file.addEventListener("change", async () => {
    if (!file.files.length) return;
    prog.hidden = false;
    const names = await uploadFiles(file.files, p => { prog.firstChild.style.width = p * 100 + "%"; });
    prog.hidden = true; file.value = "";
    after && after(names);
  });
  return h("div", null, h("button", { type: "button", class: "btn btn-sm", onclick: () => file.click() }, label), file, prog);
}
function pickPhotos({ multi, selected = [], title }) {
  return new Promise(resolve => {
    let chosen = selected.slice(), q = "";
    const grid = h("div", { class: "pick-grid" });
    const drawGrid = () => put(grid, ...S.photos.filter(p => !q || norm(p.name + " " + altOf(p.name)).includes(q)).map(p => {
      const i = chosen.indexOf(p.name);
      return h("button", { type: "button", class: "pick" + (i >= 0 ? " on" : ""), title: altOf(p.name) || p.name, "aria-pressed": String(i >= 0), onclick: () => {
        if (!multi) return done([p.name]);
        i >= 0 ? chosen.splice(i, 1) : chosen.push(p.name);
        drawGrid();
      } }, h("img", { src: thumb(p.name), alt: "", loading: "lazy" }), multi && i >= 0 && h("span", { class: "ord" }, String(i + 1)), h("span", null, p.name));
    }));
    const search = h("input", { type: "search", placeholder: "Tìm theo tên hoặc mô tả ảnh…", oninput: e => { q = norm(e.target.value); drawGrid(); } });
    const up = uploadButton("Tải ảnh mới lên", names => { if (multi) chosen.push(...names); else if (names[0]) return done([names[0]]); drawGrid(); });
    const m = modal({
      title: title || (multi ? "Chọn ảnh (bấm theo thứ tự muốn hiển thị)" : "Chọn ảnh"),
      body: [h("div", { class: "row" }, h("div", { style: "flex:1;min-width:200px" }, search), up), grid],
      foot: multi ? [h("span", { class: "muted small", style: "margin-right:auto" }, "Ảnh số 1 là ảnh đại diện"), h("button", { type: "button", class: "btn", onclick: () => m.cancel() }, "Hủy"), h("button", { type: "button", class: "btn btn-dark", onclick: () => done(chosen) }, "Xong")] : null,
      onClose: () => resolve(null),
    });
    const done = v => { m.close(); resolve(v); };
    drawGrid();
  });
}
function photoField(obj, key, label, o = {}) {
  const wrap = h("div", { class: "fld" });
  const draw = () => {
    const n = obj[key];
    put(wrap, h("span", { class: "fld-l" }, label),
      h("div", { class: "photo-field" }, n ? h("img", { src: thumb(n), alt: altOf(n) }) : h("div", { class: "photo-empty" }, "Chưa có ảnh"),
        h("div", { style: "display:grid;gap:6px" },
          h("div", { class: "row" },
            h("button", { type: "button", class: "btn btn-sm", onclick: async () => { const r = await pickPhotos({ multi: false }); if (r) { obj[key] = r[0]; dirty(); draw(); o.on && o.on(r[0]); } } }, n ? "Đổi ảnh" : "Chọn ảnh"),
            n && !o.required && h("button", { type: "button", class: "btn btn-sm btn-ghost", onclick: () => { obj[key] = ""; dirty(); draw(); } }, "Bỏ ảnh")),
          n && h("span", { class: "small muted" }, altOf(n) || n))),
      o.hint && h("small", { class: "fld-h" }, o.hint));
  };
  draw();
  return wrap;
}
function photoList(arr, o = {}) {
  const box = h("div", { class: "photo-list" });
  const draw = () => put(box, ...arr.map((n, i) => h("div", { class: "ph-item" },
    h("img", { src: thumb(n), alt: altOf(n), title: altOf(n) || n }),
    i === 0 && h("span", { class: "pill info ph-main" }, o.firstLabel || "Đại diện"),
    h("div", { class: "ph-tools" },
      iconBtn("left", "Sang trái", i === 0, () => { move(arr, i, -1); dirty(); draw(); }),
      iconBtn("right", "Sang phải", i === arr.length - 1, () => { move(arr, i, 1); dirty(); draw(); }),
      iconBtn("trash", "Bỏ ảnh này", false, () => { arr.splice(i, 1); dirty(); draw(); }, "danger")))),
  h("button", { type: "button", class: "ph-add", onclick: async () => { const r = await pickPhotos({ multi: true, selected: arr }); if (r) { arr.splice(0, arr.length, ...r); dirty(); draw(); } } }, "+ Thêm / chọn ảnh"));
  draw();
  return box;
}

/* ---------- Sản phẩm: giá ---------- */
const optsOf = p => (p.options && p.options.length ? p.options : ["Tiêu chuẩn"]);
const isPriced = p => !!(p.prices && p.prices.length === optsOf(p).length && p.prices.every(n => n > 0));
const minPrice = p => (isPriced(p) ? Math.min(...p.prices) : 0);
const priceLabel = p => (isPriced(p) ? `${new Set(p.prices).size > 1 ? "từ " : ""}${money(minPrice(p))}₫ / ${p.unit || "bộ"}` : "Liên hệ báo giá");
const catOf = id => S.c.categories.find(c => c.id === id);
const productLabel = id => { const p = S.c.products.find(x => x.id === id); return p ? `${p.name}${p.hidden ? " (đang ẩn)" : ""}` : `${id} (không tồn tại)`; };
function uniqueId(base, taken) { let id = base || "moi", i = 2; while (taken.has(id)) id = `${base}-${i++}`; return id; }

/* Chọn danh sách sản phẩm (dùng cho thẻ dưới banner, khối Limousine) */
function productPicker(arr, o = {}) {
  const box = h("div", { class: "list" });
  const opts = () => S.c.products.map(p => [p.id, `${p.name}${p.hidden ? " (đang ẩn)" : ""}`]);
  const draw = () => put(box, ...arr.map((id, i) => {
    const holder = { v: id };
    const s = sel(holder, "v", opts(), { on: v => { arr[i] = v; } });
    return h("div", { class: "sl-row" }, s,
      iconBtn("up", "Đưa lên", i === 0, () => { move(arr, i, -1); dirty(); draw(); }, "mv"),
      iconBtn("down", "Đưa xuống", i === arr.length - 1, () => { move(arr, i, 1); dirty(); draw(); }, "mv"),
      iconBtn("trash", "Bỏ", false, () => { arr.splice(i, 1); dirty(); draw(); }, "danger"));
  }), (!o.max || arr.length < o.max) && h("button", { type: "button", class: "btn btn-sm add-row", onclick: () => { arr.push(S.c.products[0].id); dirty(); draw(); } }, "+ Thêm sản phẩm"));
  draw();
  return box;
}
function linkSuggestions() {
  let dl = $("#links");
  if (dl) dl.remove();
  dl = h("datalist", { id: "links" },
    ["index.html", "category.html", "support.html#lien-he", "support.html#faq", "about.html", "chinh-sach.html#bao-hanh", "index.html#limousine"].map(v => h("option", { value: v })),
    S.c.categories.map(c => h("option", { value: `category.html?cat=${c.id}` }, c.name)),
    S.c.products.map(p => h("option", { value: `product.html?id=${p.id}` }, p.name)));
  document.body.append(dl);
}

/* ---------- Đăng nhập / tạo tài khoản ---------- */
function authCard(title, sub, fields, btnLabel, submit) {
  const err = h("p", { role: "alert", style: "color:var(--bad);font-weight:600" });
  const btn = h("button", { class: "btn btn-dark", type: "submit", style: "height:42px" }, btnLabel);
  const form = h("form", { class: "auth-card", onsubmit: async e => {
    e.preventDefault(); err.textContent = ""; btn.disabled = true;
    try { await submit(Object.fromEntries(new FormData(form))); } catch (x) { err.textContent = x.message; }
    btn.disabled = false;
  } }, h("img", { src: "../assets/logo-dark.svg", alt: "ROMAN" }), h("h1", null, title), sub && h("p", null, sub), fields, err, btn);
  return form;
}
/* Bố cục 2 cột: bên trái nhận diện thương hiệu, bên phải biểu mẫu */
const authShell = card => h("div", { class: "auth" },
  h("aside", { class: "auth-brand" },
    h("img", { src: "../assets/logo-badge.svg", alt: "" }),
    h("div", null,
      h("p", { class: "auth-eyebrow" }, "ROMAN · QUẢN TRỊ WEBSITE"),
      h("h2", null, "Quản lý nội dung, bảng giá và lịch hẹn ở cùng một nơi"),
      h("ul", null, ["Cập nhật giá, sản phẩm và hình ảnh chỉ trong vài giây", "Nhận lịch hẹn và báo ngay qua Telegram", "Tự động sao lưu mỗi lần lưu, khôi phục một chạm"].map(t => h("li", { html: ICON.checkCircle }, h("span", null, t))))),
    h("small", null, `© ${new Date().getFullYear()} ROMAN`)),
  h("main", { class: "auth-main" }, card));
const authField = (label, name, type = "text", ac = "") => fld(label, h("input", { name, type, required: true, autocomplete: ac }));
function renderLogin() {
  put($("#app"), authShell(authCard("Đăng nhập quản trị", "Quản lý nội dung, bảng giá và lịch hẹn của website ROMAN.",
    [authField("Tên đăng nhập", "username", "text", "username"), authField("Mật khẩu", "password", "password", "current-password")],
    "Đăng nhập", async d => { await api("POST", "/api/login", d); start(); })));
  $("#app input").focus();
}
function renderSetup(canSetup) {
  if (!canSetup) {
    put($("#app"), authShell(h("div", { class: "auth-card" }, h("img", { src: "../assets/logo-dark.svg", alt: "ROMAN" }), h("h1", null, "Chưa có tài khoản quản trị"),
      h("p", null, "Vì lý do an toàn, tài khoản đầu tiên chỉ tạo được trên chính máy đang chạy máy chủ. Hãy mở địa chỉ http://localhost:5173/admin/ trên máy đó."))));
    return;
  }
  put($("#app"), authShell(authCard("Tạo tài khoản quản trị", "Lần đầu sử dụng: đặt tên đăng nhập và mật khẩu (ít nhất 8 ký tự). Hãy ghi nhớ mật khẩu này.",
    [authField("Tên đăng nhập", "username", "text", "username"), authField("Mật khẩu", "password", "password", "new-password"), authField("Nhập lại mật khẩu", "password2", "password", "new-password")],
    "Tạo tài khoản", async d => {
      if (d.password !== d.password2) throw new Error("Hai lần nhập mật khẩu chưa khớp");
      await api("POST", "/api/setup", { username: d.username, password: d.password });
      start();
    })));
  $("#app input").focus();
}
/* Hết phiên khi đang sửa: đăng nhập lại trong hộp thoại, không mất phần đang sửa */
let reLoginWait = null;
function reLogin() {
  if (reLoginWait) return reLoginWait;
  reLoginWait = new Promise(resolve => {
    const form = authCard("Phiên đăng nhập đã hết hạn", "Đăng nhập lại để tiếp tục. Các thay đổi chưa lưu vẫn được giữ.",
      [authField("Tên đăng nhập", "username", "text", "username"), authField("Mật khẩu", "password", "password", "current-password")],
      "Đăng nhập", async d => { await api("POST", "/api/login", d, true); m.close(); reLoginWait = null; resolve(); });
    form.style.boxShadow = "none"; form.style.border = "0"; form.style.padding = "0";
    const m = modal({ title: "Đăng nhập lại", body: form, size: "sm", onClose: () => { reLoginWait = null; resolve(); } });
  });
  return reLoginWait;
}

/* ---------- Khung trang ---------- */
const NAV = [
  ["Chung", [["dashboard", "Tổng quan", "home"], ["bookings", "Lịch hẹn", "cal"], ["calendar", "Lịch theo tháng", "calGrid"], ["customers", "Khách hàng", "users"], ["stats", "Thống kê truy cập", "chart"]]],
  ["Nội dung website", [["products", "Sản phẩm & bảng giá", "box"], ["prices", "Sửa giá nhanh", "tag"], ["categories", "Danh mục", "grid"], ["home", "Trang chủ", "layout"], ["pages", "Trang nội dung", "file"], ["materials", "Chất liệu da", "leaf"], ["photos", "Thư viện ảnh", "image"]]],
  ["Cài đặt", [["site", "Thông tin cửa hàng", "store"], ["telegram", "Thông báo Telegram", "bell"], ["seo", "SEO & chia sẻ", "search"], ["team", "Tài khoản & phân quyền", "shield"], ["activity", "Nhật ký hoạt động", "history"], ["backups", "Sao lưu", "archive"], ["account", "Tài khoản của tôi", "user"]]],
];
/* Nhân viên chỉ thấy các màn vận hành; Quản trị viên thấy tất cả */
const STAFF_VIEWS = new Set(["bookings", "calendar", "customers", "stats", "account"]);
const ROLE_LABEL = { owner: "Quản trị viên", staff: "Nhân viên" };
const canSee = id => S.role === "owner" || STAFF_VIEWS.has(id);
const homeView = () => (S.role === "owner" ? "dashboard" : "bookings");
function renderShell() {
  const owner = S.role === "owner";
  const saveBtn = owner && h("button", { class: "btn btn-dark", id: "saveBtn", type: "button", onclick: save, title: "Lưu thay đổi (Ctrl + S)", html: ICON.save }, "Lưu thay đổi", h("kbd", null, "Ctrl S"));
  const state = owner && h("span", { class: "save-state", id: "saveState" }, h("span", { class: "dot" }), h("span", { id: "saveText" }));
  const shell = h("div", { class: "shell", id: "shell" },
    h("aside", { class: "side" },
      h("div", { class: "side-brand" }, h("img", { src: "../assets/logo-badge.svg", alt: "" }), h("div", null, h("b", null, "ROMAN"), h("small", null, "Quản trị website"))),
      h("nav", { "aria-label": "Mục quản trị" }, NAV.map(([g, all]) => [all, all.filter(([id]) => canSee(id))]).filter(([, items]) => items.length).map(([, items], gi) => [h("div", { class: "grp" }, NAV.find(([, a]) => a.includes(items[0]))[0]), items.map(([id, label, ic]) => h("a", { href: `#/${id}`, "data-nav": id, html: ICON[ic] }, h("span", null, label), id === "bookings" && h("span", { class: "badge", id: "bkBadge", hidden: true })))])),
      h("div", { class: "side-foot" }, h("div", { class: "user-card" },
        h("span", { class: "avatar" }, initials(S.name || S.user)),
        h("div", null, h("b", null, S.name || S.user), h("small", null, ROLE_LABEL[S.role] || "")),
        iconBtn("logout", "Đăng xuất", false, logout)))),
    h("div", { class: "main" },
      h("header", { class: "top" },
        h("button", { type: "button", class: "icon-btn menu-btn", "aria-label": "Mở menu", html: ICON.menu, onclick: () => $("#shell").classList.toggle("nav-open") }),
        h("div", { class: "top-title" }, h("span", { class: "crumb", id: "viewCrumb" }), h("h1", { id: "viewTitle" })), state,
        h("button", { type: "button", class: "qs-btn", onclick: quickSearch, "aria-label": "Tìm nhanh (Ctrl + K)", html: ICON.search }, h("span", null, "Tìm nhanh…"), h("kbd", null, "Ctrl K")),
        h("a", { class: "btn btn-view", href: "../index.html", target: "_blank", rel: "noopener", html: ICON.ext }, "Xem website"), saveBtn),
      h("main", { class: "view", id: "view" })));
  put($("#app"), shell);
  shell.querySelector(".side").addEventListener("click", e => { if (e.target.closest("a")) shell.classList.remove("nav-open"); });
  markDirty = () => { S.dirty = true; updateSaveState(); };
  updateSaveState();
  updateBookingBadge();
}
function updateSaveState() {
  const st = $("#saveState"), btn = $("#saveBtn");
  if (!st || !btn) return;
  st.classList.toggle("dirty", S.dirty);
  $("#saveText").textContent = S.saving ? "Đang lưu…" : S.dirty ? "Có thay đổi chưa lưu" : S.c.updatedAt ? `Đã lưu ${timeVN(S.c.updatedAt)}` : "Đã lưu";
  btn.disabled = !S.dirty || S.saving;
}
function updateBookingBadge() {
  const b = $("#bkBadge"), n = S.bookings.filter(x => x.status === "new").length;
  if (b) { b.hidden = !n; b.textContent = n; }
}
function setTitle(t) {
  const name = (location.hash.replace(/^#\/?/, "").split("/")[0] || "dashboard").replace(/^product$/, "products");
  const grp = NAV.find(([, items]) => items.some(([id]) => id === name));
  $("#viewCrumb").textContent = grp ? grp[0] : "";
  $("#viewTitle").textContent = t;
  document.title = `${t} · Quản trị ROMAN`;
}
/* Chữ cái đầu cho ảnh đại diện: "Nguyễn Văn An" -> "NA" */
function initials(name) {
  const w = String(name || "?").trim().split(/\s+/).filter(Boolean);
  return ((w[0] || "?")[0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
}
const emptyState = (icon, title, text) => h("div", { class: "empty", html: ICON[icon] }, h("b", null, title), text && h("span", null, text));

function clientValidate() {
  const err = [], ids = new Set(), cids = new Set();
  S.c.categories.forEach(c => {
    if (!SLUG.test(c.id || "")) err.push(`Danh mục "${c.name || "?"}": mã chưa hợp lệ`);
    if (cids.has(c.id)) err.push(`Danh mục: mã "${c.id}" bị trùng`);
    cids.add(c.id);
    if (!String(c.name || "").trim()) err.push("Có danh mục chưa có tên");
  });
  S.c.products.forEach(p => {
    if (!String(p.name || "").trim()) err.push("Có sản phẩm chưa có tên");
    if (!SLUG.test(p.id || "")) err.push(`Sản phẩm "${p.name || "?"}": mã chưa hợp lệ (chữ thường không dấu, số, gạch ngang)`);
    if (ids.has(p.id)) err.push(`Sản phẩm: mã "${p.id}" bị trùng`);
    ids.add(p.id);
  });
  return err;
}
async function save() {
  if (!S.dirty || S.saving) return;
  const errs = clientValidate();
  if (errs.length) return toast("Chưa lưu được, vui lòng sửa:", "bad", errs);
  S.saving = true; updateSaveState();
  try {
    const r = await api("PUT", "/api/content", { rev: S.rev, content: S.c });
    S.rev = r.rev; S.c.rev = r.rev; S.c.updatedAt = r.updatedAt; S.c.updatedBy = S.user;
    S.dirty = false;
    toast("Đã lưu. Website đã được cập nhật.", "ok");
  } catch (e) {
    if (e.status === 409) {
      const m = modal({ title: "Nội dung vừa được lưu ở nơi khác", size: "sm",
        body: h("p", null, "Có người (hoặc một tab khác) vừa lưu nội dung. Tải lại để lấy bản mới nhất; các thay đổi bạn chưa lưu ở đây sẽ bị bỏ."),
        foot: [h("button", { type: "button", class: "btn", onclick: () => m.cancel() }, "Để sau"), h("button", { type: "button", class: "btn btn-dark", onclick: async () => { m.close(); S.dirty = false; await loadAll(); route(); } }, "Tải lại bản mới")] });
    } else toast(e.message, "bad", e.data && e.data.errors);
  }
  S.saving = false; updateSaveState();
}
async function logout() {
  if (S.dirty && !confirm("Bạn có thay đổi chưa lưu. Vẫn đăng xuất?")) return;
  await api("POST", "/api/logout").catch(() => {});
  S.dirty = false; S.c = null;
  renderLogin();
}

/* ---------- Điều hướng ---------- */
const VIEWS = {};
function route() {
  if (!S.c) return;
  const [name = homeView(), ...rest] = location.hash.replace(/^#\/?/, "").split("/");
  const navId = name === "product" ? "products" : name;
  if (!VIEWS[name] || !canSee(navId)) { location.replace(`#/${homeView()}`); if (!canSee(navId)) toast("Tài khoản của bạn không có quyền mở mục này", "bad"); return; }
  const fn = VIEWS[name];
  document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === (name === "product" ? "products" : name)));
  const v = $("#view");
  put(v);
  window.scrollTo(0, 0);
  linkSuggestions();
  v.classList.remove("in");
  Promise.resolve(fn(v, rest.map(decodeURIComponent)))
    .catch(e => { v.append(h("div", { class: "note warn" }, e.message)); })
    .then(() => {
      /* Các khối hiện lần lượt (tắt khi máy bật giảm chuyển động) */
      [...v.children].forEach((el, i) => el.style.setProperty("--i", Math.min(i, 8)));
      void v.offsetWidth;
      v.classList.add("in");
    });
}

/* ---------- Tìm nhanh (Ctrl + K): nhảy tới màn hình, sản phẩm, lịch hẹn ---------- */
function quickSearch() {
  if ($(".qs")) return;
  const prev = document.activeElement;
  const items = [
    ...NAV.flatMap(([g, list]) => list.filter(([id]) => canSee(id)).map(([id, label, ic]) => ({ grp: "Màn hình", icon: ic, label, hint: g, href: `#/${id}` }))),
    ...(S.role !== "owner" ? [] : [["home/hero", "Slide đầu trang"], ["home/features", "Banner & thẻ sản phẩm"], ["pages/about", "Trang Giới thiệu"], ["pages/support", "Trang Hỗ trợ & FAQ"], ["pages/policy", "Trang Chính sách"]]
      .map(([href, label]) => ({ grp: "Màn hình", icon: "file", label, hint: "Nội dung", href: `#/${href}` }))),
    ...(S.role !== "owner" ? [] : S.c.products).map((p, i) => ({ grp: "Sản phẩm", icon: "box", label: p.name, hint: isPriced(p) ? priceLabel(p) : "Liên hệ báo giá", href: `#/product/${i}`, extra: `${p.id} ${p.sub}` })),
    ...S.bookings.slice(0, 200).map(b => ({ grp: "Lịch hẹn", icon: "cal", label: `${b.name} · ${b.phone}`, hint: BK[b.status][0], href: "#/bookings", extra: `${b.car} ${b.topic}` })),
  ];
  let sel = 0, shown = [];
  const list = h("div", { class: "qs-list", role: "listbox" });
  const input = h("input", { type: "search", placeholder: "Tìm màn hình, sản phẩm, khách đặt lịch…", "aria-label": "Tìm nhanh", autocomplete: "off" });
  const draw = () => {
    /* Khớp từng từ, không dấu: "san 360" tìm ra "Sàn ROMAN 360 Luxury" */
    const words = norm(input.value).split(/\s+/).filter(Boolean);
    shown = (words.length ? items.filter(x => { const hay = norm(`${x.label} ${x.hint} ${x.extra || ""}`); return words.every(w => hay.includes(w)); }) : items.filter(x => x.grp === "Màn hình")).slice(0, 40);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    let last = "";
    put(list, shown.length ? shown.map((x, i) => {
      const head = x.grp !== last ? h("div", { class: "qs-grp" }, x.grp) : null;
      last = x.grp;
      return [head, h("button", { type: "button", role: "option", "aria-selected": String(i === sel), class: "qs-item" + (i === sel ? " on" : ""), html: ICON[x.icon], onclick: () => go(x), onmousemove: () => { if (sel !== i) { sel = i; draw(); } } }, h("span", null, x.label), h("small", null, x.hint))];
    }) : h("div", { class: "qs-empty" }, "Không tìm thấy kết quả phù hợp"));
    list.querySelector(".qs-item.on")?.scrollIntoView({ block: "nearest" });
  };
  const close = () => { bg.remove(); prev && prev.focus && prev.focus(); };
  const go = x => { close(); location.hash = x.href; };
  input.addEventListener("input", () => { sel = 0; draw(); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); draw(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); draw(); }
    else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); go(shown[sel]); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  });
  const bg = h("div", { class: "qs", role: "dialog", "aria-modal": "true", "aria-label": "Tìm nhanh", onmousedown: e => { if (e.target === bg) close(); } },
    h("div", { class: "qs-box" }, input, list, h("div", { class: "qs-foot" }, h("span", null, h("kbd", null, "↑↓"), " chọn"), h("span", null, h("kbd", null, "Enter"), " mở"), h("span", null, h("kbd", null, "Esc"), " đóng"))));
  document.body.append(bg);
  draw();
  input.focus();
}

/* ===== Tổng quan ===== */
VIEWS.dashboard = async v => {
  setTitle("Tổng quan");
  const st7 = await api("GET", "/api/stats?days=7").catch(() => null);
  const views7 = st7 ? st7.days.reduce((a, d) => a + d.v, 0) : null;
  const c = S.c, site = c.site, P = c.products;
  const shown = P.filter(p => !p.hidden), noPrice = shown.filter(p => !isPriced(p)), noPhoto = shown.filter(p => !(p.photos && p.photos.length));
  const usedPhotos = new Set((JSON.stringify([c.products.map(p => p.photos), c.categories, c.hero, c.features, c.stories, c.limousine, c.pages]).match(/"[a-z0-9-]+"/g) || []).map(s => s.slice(1, -1)));
  const noAlt = S.photos.filter(p => usedPhotos.has(p.name) && !altOf(p.name));
  const newB = S.bookings.filter(b => b.status === "new");
  const todo = [
    [!!site.hours, "Giờ mở cửa", site.hours || "Chưa nhập: hiển thị ở chân trang, trang Giới thiệu và trang Hỗ trợ", "#/site"],
    [!!(site.legalName && site.taxCode), "Tên công ty và mã số thuế", site.legalName ? `${site.legalName}${site.taxCode ? " · MST " + site.taxCode : " · chưa có MST"}` : "Chưa nhập: nên có ở chân trang website", "#/site"],
    [c.social.some(s => s.url), "Mạng xã hội", c.social.some(s => s.url) ? c.social.filter(s => s.url).map(s => s.name).join(", ") : "Chưa có liên kết Facebook / Zalo / YouTube nên đang ẩn ở chân trang", "#/site"],
    [!noPrice.length, "Bảng giá", noPrice.length ? `${noPrice.length} sản phẩm đang hiển thị "Liên hệ báo giá": ${noPrice.slice(0, 4).map(p => p.name).join(", ")}${noPrice.length > 4 ? "…" : ""}` : "Mọi sản phẩm đều có giá niêm yết", "#/products/f/noprice"],
    [!noPhoto.length, "Ảnh sản phẩm", noPhoto.length ? `${noPhoto.length} sản phẩm chưa có ảnh thật` : "Mọi sản phẩm đều có ảnh", "#/products"],
    [!noAlt.length, "Mô tả ảnh", noAlt.length ? `${noAlt.length} ảnh đang dùng chưa có mô tả (giúp Google và người khiếm thị)` : "Ảnh đang dùng đều có mô tả", "#/photos"],
    [!!(S.tg && S.tg.enabled && S.tg.chats.length), "Thông báo Telegram", S.tg && S.tg.enabled && S.tg.chats.length ? `Đang gửi tới ${S.tg.chats.length} người nhận${S.tg.lastError ? " · có lỗi: " + S.tg.lastError : ""}` : "Chưa bật: lịch hẹn mới chỉ hiện trong trang quản trị", "#/telegram"],
    [!!site.formEndpoint, "Nhận lịch hẹn qua website", site.formEndpoint ? `Đang nhận tại ${site.formEndpoint}` : "Đang tắt: khách gửi form sẽ mở email", "#/site"],
  ];
  /* Lời chào theo buổi */
  const now = new Date(), hr = now.getHours();
  const greet = hr < 11 ? "Chào buổi sáng" : hr < 14 ? "Chào buổi trưa" : hr < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const dateLine = now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  /* Số lịch hẹn mỗi ngày trong 14 ngày gần nhất (tính theo giờ máy đang mở trang) */
  const days = [...Array(14)].map((_, i) => { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 13 + i); return d; });
  const dayKey = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const perDay = S.bookings.reduce((m, b) => { const k = dayKey(new Date(b.createdAt)); m[k] = (m[k] || 0) + 1; return m; }, {});
  const counts = days.map(d => perDay[dayKey(d)] || 0), max = Math.max(1, ...counts), total14 = counts.reduce((a, b) => a + b, 0);
  const chart = section("Lịch hẹn 14 ngày qua", "Số yêu cầu đặt lịch khách gửi từ website mỗi ngày",
    h("div", { class: "bars", role: "img", "aria-label": `Tổng ${total14} lịch hẹn trong 14 ngày qua` }, days.map((d, i) => h("div", {
      class: "bar" + (counts[i] ? "" : " zero") + (i === 13 ? " today" : ""), style: `--h:${Math.round(counts[i] / max * 100)}%;--i:${i}`,
      title: `${d.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}: ${counts[i]} lịch hẹn`,
    }, h("i"), h("span", null, i === 13 ? "Nay" : String(d.getDate()))))));
  chart.querySelector(".sec-h").append(h("div", { style: "text-align:right;flex:none" }, h("div", { class: "chart-total" }, String(total14)), h("small", { class: "muted" }, "lịch hẹn")));
  v.append(
    h("section", { class: "hello" },
      h("div", null,
        h("p", { class: "eyebrow" }, dateLine),
        h("h2", null, `${greet}, ${S.user}`),
        h("p", null, newB.length ? `Bạn có ${newB.length} lịch hẹn mới đang chờ liên hệ.` : "Không có lịch hẹn mới cần xử lý. Mọi thứ đang ổn.")),
      h("div", { class: "row" },
        h("a", { class: "btn btn-gold", href: "#/bookings", html: ICON.cal }, newB.length ? `Xử lý ${newB.length} lịch hẹn` : "Xem lịch hẹn"),
        h("button", { type: "button", class: "btn", html: ICON.box, onclick: newProduct }, "Thêm sản phẩm"),
        h("a", { class: "btn", href: "../index.html", target: "_blank", rel: "noopener", html: ICON.ext }, "Xem website"))),
    h("div", { class: "stats" },
      stat("#/bookings", "cal", newB.length, "Lịch hẹn mới chưa xử lý", newB.length > 0),
      stat("#/products", "box", shown.length, `Sản phẩm đang hiển thị${P.length - shown.length ? ` · ${P.length - shown.length} đang ẩn` : ""}`),
      stat("#/stats", "chart", views7 == null ? "–" : views7, "Lượt xem 7 ngày qua"),
      stat("#/photos", "image", S.photos.length, "Ảnh trong thư viện")),
    h("div", { class: "dash-grid" },
      chart,
      section("Lịch hẹn gần đây", null, S.bookings.length ? h("div", { class: "todo" }, S.bookings.slice(0, 5).map(b => h("a", { href: "#/bookings" }, h("span", { class: "avatar" }, initials(b.name)), h("span", null, h("b", null, b.name), h("small", null, `${b.topic || "Chưa chọn hạng mục"} · ${timeVN(b.createdAt)}`)), h("span", { class: `status s-${b.status}` }, BK[b.status][0])))) : emptyState("inbox", "Chưa có lịch hẹn", "Khi khách gửi form đặt lịch trên website, yêu cầu sẽ hiện ở đây."))),
    sectionMeter("Mức độ hoàn thiện website", "Những thông tin còn thiếu, bấm vào từng mục để bổ sung", todo.filter(x => x[0]).length, todo.length,
      h("div", { class: "todo todo-2" }, todo.sort((a, b) => a[0] - b[0]).map(([ok, t, d, href]) => h("a", { href }, h("span", { class: "ic" + (ok ? " ok" : ""), html: ok ? ICON.checkCircle : ICON.alert }), h("span", null, h("b", null, t), h("small", null, d))))),
      h("p", { class: "small muted" }, `Nội dung phiên bản ${c.rev}${c.updatedAt ? ` · lưu lần cuối ${timeVN(c.updatedAt)}${c.updatedBy ? ` bởi ${c.updatedBy}` : ""}` : ""}`)));
};

const stat = (href, icon, n, label, hot) => h("a", { class: "card stat" + (hot ? " hot" : ""), href }, h("span", { class: "stat-ic", html: ICON[icon] }), h("div", null, h("b", null, String(n)), h("span", null, label)));
function sectionMeter(title, sub, done, total, ...body) {
  const sec = section(title, sub, ...body);
  sec.querySelector(".sec-h").append(h("span", { class: "meter", title: `${done}/${total} mục đã hoàn thiện` }, h("i", { style: `--p:${Math.round(done / total * 100)}%` }), `${done}/${total}`));
  return sec;
}

/* ===== Lịch hẹn ===== */
const BK = { new: ["Mới", "warn"], contacted: ["Đã liên hệ", "info"], done: ["Hoàn thành", "ok"], cancelled: ["Đã hủy", ""] };
VIEWS.bookings = async v => {
  setTitle("Lịch hẹn");
  let filter = "all", q = "";
  try { S.bookings = await api("GET", "/api/bookings"); updateBookingBadge(); } catch (e) { toast(e.message, "bad"); }
  const head = h("div"), list = h("div", { class: "bk-list" });
  const draw = () => {
    const counts = Object.keys(BK).reduce((o, k) => (o[k] = S.bookings.filter(b => b.status === k).length, o), {});
    put(head, 
      tabs([["all", "Tất cả", S.bookings.length], ...Object.entries(BK).map(([k, [l]]) => [k, l, counts[k]])], filter, id => { filter = id; draw(); }),
      h("div", { class: "toolbar" },
        h("input", { type: "search", placeholder: "Tìm tên, số điện thoại, xe…", value: q, oninput: e => { q = norm(e.target.value); drawList(); } }),
        h("span", { class: "grow", style: "flex:1" }),
        h("button", { type: "button", class: "btn btn-sm btn-dark", html: ICON.plus, onclick: () => bookingForm({}, draw) }, "Thêm lịch hẹn"),
        h("button", { type: "button", class: "btn btn-sm", onclick: async () => { S.bookings = await api("GET", "/api/bookings"); updateBookingBadge(); draw(); toast("Đã làm mới"); } }, "Làm mới"),
        h("button", { type: "button", class: "btn btn-sm", onclick: exportCsv }, "Xuất Excel (CSV)")));
    drawList();
  };
  const drawList = () => {
    const items = S.bookings.filter(b => (filter === "all" || b.status === filter) && (!q || norm([b.name, b.phone, b.car, b.topic, b.msg, b.note].join(" ")).includes(q)));
    put(list, ...(items.length ? items.map(bookingRow) : [h("div", { class: "card" }, S.bookings.length ? emptyState("search", "Không có lịch hẹn phù hợp", "Thử đổi từ khóa tìm kiếm hoặc chọn trạng thái khác.") : emptyState("inbox", "Chưa có lịch hẹn nào", "Khi khách gửi form \"Đặt lịch\" trên website, yêu cầu sẽ hiện ở đây và được báo qua Telegram nếu đã bật."))]));
  };
  const bookingRow = b => {
    /* Trạng thái lịch hẹn lưu ngay, không ảnh hưởng nút "Lưu thay đổi" của nội dung */
    const status = h("select", { "aria-label": "Trạng thái", onchange: async () => {
      const val = status.value;
      try { await api("PATCH", `/api/bookings/${b.id}`, { status: val }); b.status = val; updateBookingBadge(); toast(`Đã chuyển sang "${BK[val][0]}"`); draw(); } catch (e) { toast(e.message, "bad"); status.value = b.status; }
    } }, Object.entries(BK).map(([k, [l]]) => h("option", { value: k }, l)));
    status.value = b.status;
    const note = h("textarea", { rows: 2, placeholder: "Ghi lại kết quả gọi, báo giá… (khách không thấy)", value: b.note || "" });
    note.addEventListener("change", async () => { try { await api("PATCH", `/api/bookings/${b.id}`, { note: note.value }); b.note = note.value; toast("Đã lưu ghi chú"); } catch (e) { toast(e.message, "bad"); } });
    const tel = digits(b.phone);
    const meta = (icon, label, value) => h("div", { html: ICON[icon] }, h("dt", null, label), h("dd", null, value));
    const tgBtn = !(b.tg && b.tg.length) && h("button", { type: "button", class: "btn btn-sm", title: "Lịch hẹn này chưa được báo qua Telegram", html: ICON.send, onclick: async e => {
      const btn = e.currentTarget; btn.disabled = true;
      try { await api("POST", `/api/bookings/${b.id}/notify`); toast("Đã gửi lịch hẹn qua Telegram", "ok"); S.bookings = await api("GET", "/api/bookings"); draw(); }
      catch (x) { toast(x.message, "bad"); btn.disabled = false; }
    } }, "Gửi Telegram");
    return h("article", { class: "bk" + (b.status === "new" ? " new" : "") },
      h("div", { class: "bk-main" },
        h("div", { class: "bk-head" },
          h("span", { class: "avatar" }, initials(b.name)),
          h("div", { class: "bk-who" }, h("h3", null, b.name), h("div", { class: "bk-sub" }, h("span", { class: `status s-${b.status}` }, BK[b.status][0]), b.topic && h("span", { class: "tag" }, b.topic), b.source && b.source !== "web" && h("span", { class: "pill" }, SOURCES[b.source] || b.source))),
          h("div", { class: "bk-contact" },
            h("a", { class: "btn btn-sm", href: `tel:${tel}`, html: ICON.phone, title: "Gọi điện" }, b.phone),
            h("a", { class: "btn btn-sm", href: `https://zalo.me/${tel}`, target: "_blank", rel: "noopener", html: ICON.chat, title: "Nhắn Zalo" }, "Zalo"))),
        h("dl", { class: "bk-meta" },
          meta("clock", b.source && b.source !== "web" ? "Nhập lúc" : "Gửi lúc", timeVN(b.createdAt)),
          b.car && meta("car", "Xe", b.car),
          b.date && meta("cal", "Ngày dự kiến", b.date.split("-").reverse().join("/"))),
        h("div", { class: "bk-msg" }, b.msg || h("span", { class: "muted" }, "Khách không để lại ghi chú.")),
        (b.statusBy || b.createdBy || (b.tg && b.tg.length)) && h("div", { class: "bk-foot" },
          b.createdBy && h("span", { html: ICON.user }, `Nhập bởi ${b.createdBy}`),
          b.statusBy && h("span", { html: ICON.user }, `Cập nhật bởi ${b.statusBy}, ${timeVN(b.statusAt)}`),
          b.tg && b.tg.length && h("span", { html: ICON.send }, `Đã báo qua Telegram (${b.tg.length})`))),
      h("div", { class: "bk-side" },
        fld("Trạng thái", status),
        fld("Ghi chú nội bộ", note),
        h("div", { class: "row" }, tgBtn,
          S.role === "owner" && h("button", { type: "button", class: "btn btn-sm btn-danger", html: ICON.trash, onclick: async () => {
            if (!confirm(`Xóa lịch hẹn của ${b.name}? Không thể hoàn tác.`)) return;
            try { await api("DELETE", `/api/bookings/${b.id}`); S.bookings = S.bookings.filter(x => x !== b); updateBookingBadge(); draw(); toast("Đã xóa lịch hẹn"); } catch (e) { toast(e.message, "bad"); }
          } }, "Xóa"))));
  };
  const exportCsv = () => {
    const cell = s => { let t = String(s == null ? "" : s); if (/^[=+\-@]/.test(t)) t = "'" + t; return `"${t.replace(/"/g, '""')}"`; };
    const rows = [["Thời gian", "Họ tên", "Điện thoại", "Xe", "Ngày dự kiến", "Hạng mục", "Ghi chú của khách", "Trạng thái", "Ghi chú nội bộ", "Nguồn"],
      ...S.bookings.map(b => [timeVN(b.createdAt), b.name, b.phone, b.car, b.date, b.topic, b.msg, BK[b.status][0], b.note, SOURCES[b.source || "web"]])];
    const blob = new Blob(["﻿" + rows.map(r => r.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = h("a", { href: URL.createObjectURL(blob), download: `lich-hen-roman-${new Date().toISOString().slice(0, 10)}.csv` });
    document.body.append(a); a.click(); a.remove();
  };
  v.append(head, list);
  draw();
};

/* ===== Sản phẩm ===== */
VIEWS.products = (v, args) => {
  setTitle("Sản phẩm & bảng giá");
  let q = "", cat = "", only = args[0] === "f" ? args[1] : "";
  const P = S.c.products;
  const table = h("tbody");
  const draw = () => {
    const rows = P.map((p, i) => ({ p, i })).filter(({ p }) => (!cat || p.cat === cat) && (!q || norm(`${p.name} ${p.nick || ""} ${p.id} ${p.sub}`).includes(q)) && (only !== "noprice" || !isPriced(p)));
    put(table, ...rows.map(({ p, i }) => h("tr", { class: p.hidden ? "is-hidden" : "" },
      h("td", { class: "hide-sm" }, p.photos && p.photos[0] ? h("img", { class: "thumb", src: thumb(p.photos[0]), alt: "" }) : h("div", { class: "thumb" })),
      h("td", null, h("div", { class: "name" }, h("a", { href: `#/product/${i}` }, p.name || "(chưa có tên)")), h("div", { class: "small muted" }, p.id, p.tag && [" · ", p.tag])),
      h("td", { class: "hide-sm" }, (catOf(p.cat) || {}).name || p.cat, h("div", { class: "small muted" }, p.sub)),
      h("td", { class: "price" }, isPriced(p) ? priceLabel(p) : h("span", { class: "pill warn" }, "Liên hệ báo giá")),
      h("td", null, h("button", { type: "button", class: "vis" + (p.hidden ? "" : " on"), role: "switch", "aria-checked": String(!p.hidden), title: p.hidden ? "Đang ẩn khỏi website, bấm để hiện" : "Đang hiển thị, bấm để ẩn", onclick: () => { p.hidden = !p.hidden; dirty(); draw(); } }, h("i"), p.hidden ? "Đang ẩn" : "Đang hiện")),
      h("td", { class: "num" }, h("div", { class: "li-tools", style: "justify-content:flex-end" },
        h("a", { class: "icon-btn", href: `#/product/${i}`, title: "Sửa", "aria-label": "Sửa", html: ICON.edit }),
        iconBtn("copy", "Nhân bản", false, () => duplicateProduct(i)),
        iconBtn("up", "Đưa lên", i === 0, () => { move(P, i, -1); dirty(); draw(); }),
        iconBtn("down", "Đưa xuống", i === P.length - 1, () => { move(P, i, 1); dirty(); draw(); }),
        iconBtn("trash", "Xóa", false, () => deleteProduct(i, draw), "danger"))))));
    if (!rows.length) table.append(h("tr", null, h("td", { colspan: 6 }, emptyState("search", "Không có sản phẩm phù hợp", "Thử từ khóa khác hoặc chọn \"Tất cả danh mục\"."))));
  };
  const catSel = h("select", { onchange: e => { cat = e.target.value; draw(); } }, h("option", { value: "" }, "Tất cả danh mục"), S.c.categories.map(c => h("option", { value: c.id }, c.name)));
  v.append(
    h("p", { class: "lead" }, "Thứ tự trong bảng là thứ tự hiển thị trên website. Sản phẩm bị ẩn vẫn được giữ lại để bật lại khi cần."),
    h("div", { class: "toolbar" },
      h("input", { type: "search", placeholder: "Tìm sản phẩm…", oninput: e => { q = norm(e.target.value); draw(); } }), catSel,
      only === "noprice" && h("span", { class: "pill warn" }, "Đang lọc: chưa có giá", h("button", { type: "button", class: "icon-btn", style: "width:20px;height:20px", "aria-label": "Bỏ lọc", html: ICON.x, onclick: () => { only = ""; draw(); location.hash = "#/products"; } })),
      h("span", { style: "flex:1" }),
      h("button", { type: "button", class: "btn btn-dark", onclick: newProduct }, "+ Thêm sản phẩm")),
    h("div", { class: "card table-wrap" }, h("table", { class: "tbl" },
      h("thead", null, h("tr", null, h("th", { class: "hide-sm" }), h("th", null, "Tên sản phẩm"), h("th", { class: "hide-sm" }, "Danh mục"), h("th", null, "Giá niêm yết"), h("th", null, "Hiển thị"), h("th"))), table)));
  draw();
};
function newProduct() {
  const c0 = S.c.categories[0];
  const p = { id: "", cat: c0.id, sub: c0.sub[0] || "", name: "", tag: "", short: "", colors: [["Đen", "#1c1c1f"]], optionLabel: "Loại xe", options: ["Xe 5 chỗ", "Xe 7 chỗ"], prices: [0, 0], unit: "bộ", highlights: [], specs: {}, photos: [], autoPrice: true, hidden: true };
  S.fresh.add(p);
  S.c.products.push(p);
  dirty();
  location.hash = `#/product/${S.c.products.length - 1}`;
}
function duplicateProduct(i) {
  const src = S.c.products[i], p = clone(src);
  p.id = uniqueId(`${src.id}-ban-sao`, new Set(S.c.products.map(x => x.id)));
  p.name = `${src.name} (bản sao)`; p.hidden = true; delete p.nick;
  S.fresh.add(p);
  S.c.products.splice(i + 1, 0, p);
  dirty();
  toast("Đã tạo bản sao (đang ẩn). Sửa xong hãy bật Hiển thị.");
  location.hash = `#/product/${i + 1}`;
}
/* Các chỗ khác đang nhắc tới sản phẩm (thẻ dưới banner, khối Limousine, liên kết) */
function productRefs(id) {
  const c = S.c, refs = [];
  c.features.forEach(f => { if (f.cards.includes(id)) refs.push(`Banner "${f.title}"`); if (f.book === id) refs.push(`Nút Đặt lịch của banner "${f.title}"`); });
  if (c.limousine.cards.includes(id)) refs.push("Khối Limousine");
  [...c.hero, ...c.features, ...c.stories].forEach(x => { if (String(x.link || "").includes(`id=${id}`)) refs.push(`Liên kết "${x.title}"`); });
  return refs;
}
function deleteProduct(i, after) {
  const p = S.c.products[i], refs = productRefs(p.id);
  if (!confirm(`Xóa sản phẩm "${p.name}"?${refs.length ? `\n\nSản phẩm đang được dùng ở: ${refs.join(", ")}. Các thẻ này sẽ được gỡ.` : ""}\n\nNếu chỉ muốn tạm ngừng, hãy dùng nút Ẩn.`)) return;
  S.c.products.splice(i, 1);
  S.c.features.forEach(f => { f.cards = f.cards.filter(x => x !== p.id); if (f.book === p.id) f.book = ""; });
  S.c.limousine.cards = S.c.limousine.cards.filter(x => x !== p.id);
  dirty();
  after ? after() : (location.hash = "#/products");
}
function renameProductId(p, next) {
  const old = p.id;
  if (old === next) return;
  S.c.features.forEach(f => { f.cards = f.cards.map(x => (x === old ? next : x)); if (f.book === old) f.book = next; });
  S.c.limousine.cards = S.c.limousine.cards.map(x => (x === old ? next : x));
  [...S.c.hero, ...S.c.features, ...S.c.stories].forEach(x => { if (x.link) x.link = x.link.replace(new RegExp(`([?&]id=)${old}(?=$|[&#])`), `$1${next}`); });
  p.id = next;
}

VIEWS.product = (v, [idx]) => {
  const p = S.c.products[+idx];
  if (!p) { location.hash = "#/products"; return; }
  setTitle(p.name || "Sản phẩm mới");
  p.photos = p.photos || []; p.highlights = p.highlights || []; p.specs = p.specs || {}; p.colors = p.colors || []; p.options = p.options || [];
  const isNew = S.fresh.has(p);
  const back = h("div", { class: "row", style: "margin-bottom:14px" },
    h("a", { class: "btn btn-sm", href: "#/products", html: ICON.left }, "Danh sách sản phẩm"),
    h("span", { style: "flex:1" }),
    !isNew && h("a", { class: "btn btn-sm", href: `../product.html?id=${encodeURIComponent(p.id)}`, target: "_blank", rel: "noopener", html: ICON.ext }, "Xem trên website"),
    h("button", { type: "button", class: "btn btn-sm btn-danger", onclick: () => deleteProduct(+idx) }, "Xóa sản phẩm"));

  /* Cơ bản */
  const idInput = input(p, "id", { mono: true, ro: !isNew, ph: "vi-du-ghe-da-moi", hint: "" });
  let idTouched = !!p.id;
  idInput.addEventListener("input", () => { idTouched = true; });
  const nameInput = input(p, "name", { on: val => { setTitle(val || "Sản phẩm mới"); if (isNew && !idTouched) { p.id = uniqueId(slugify(val), new Set(S.c.products.filter(x => x !== p).map(x => x.id))); idInput.value = p.id; } } });
  const subHolder = h("div");
  const drawSub = () => {
    const c = catOf(p.cat) || { sub: [] };
    if (!c.sub.includes(p.sub)) p.sub = c.sub[0] || "";
    put(subHolder, fld("Nhóm con", sel(p, "sub", c.sub.map(s => [s, s])), { hint: "Thêm nhóm con ở mục Danh mục" }));
  };
  drawSub();
  const tagList = h("datalist", { id: "tags" }, ["Bán chạy", "Mới", "Giá tốt", "Thượng lưu", "Cao cấp", "Đồng bộ"].map(t => h("option", { value: t })));
  const basic = section("Thông tin cơ bản", null,
    fld("Tên sản phẩm *", nameInput),
    h("div", { class: "grid2" },
      tf(p, "nick", "Tên ngắn trên thẻ trang chủ", { ph: p.name, hint: "Để trống sẽ dùng tên sản phẩm" }),
      fld("Mã sản phẩm (dùng trong đường dẫn)", h("div", { class: "row", style: "flex-wrap:nowrap" }, idInput, !isNew && h("button", { type: "button", class: "btn btn-sm", onclick: () => {
        const next = prompt("Mã mới (chữ thường không dấu, số, gạch ngang). Lưu ý: liên kết cũ tới sản phẩm này sẽ không còn dùng được.", p.id);
        if (next == null) return;
        const n = slugify(next);
        if (!SLUG.test(n)) return toast("Mã chưa hợp lệ", "bad");
        if (S.c.products.some(x => x !== p && x.id === n)) return toast("Mã này đã có sản phẩm khác dùng", "bad");
        renameProductId(p, n); idInput.value = n; dirty(); toast("Đã đổi mã, các banner và liên kết đã được cập nhật");
      } }, "Đổi mã")), { div: true, hint: isNew ? "Tự tạo theo tên, có thể sửa" : "Đổi mã sẽ làm liên kết cũ không còn dùng được" })),
    h("div", { class: "grid3" },
      fld("Danh mục", sel(p, "cat", S.c.categories.map(c => [c.id, c.name]), { on: drawSub })),
      subHolder,
      fld("Nhãn nổi bật", h("span", null, input(p, "tag", { list: "tags", ph: "VD: Bán chạy" }), tagList), { hint: "Có nhãn thì sản phẩm xuất hiện ở mục \"Được đề xuất\" trang chủ" })),
    tf(p, "short", "Mô tả ngắn", { rows: 2, max: 200, hint: "Cũng dùng làm mô tả trên Google cho trang sản phẩm" }),
    tf(p, "slug", "Đường dẫn trang sản phẩm", { mono: true, ph: slugify(p.name || "ten-san-pham"), hint: `Trang sản phẩm: /san-pham/${slugify(p.slug || p.name) || "..."}/ — để trống thì tự tạo theo tên. Đổi đường dẫn sẽ làm liên kết cũ ngừng hoạt động.` }),
    chk(p, "hidden", "Ẩn sản phẩm khỏi website", { on: () => {} }));

  /* Giá */
  const priceBox = h("div", { class: "sec-b", style: "padding:0;gap:14px" });
  const preview = h("div", { class: "preview" });
  const drawPreview = () => {
    put(preview, h("div", { class: "small muted" }, "Hiển thị trên website"),
      isPriced(p) ? [h("b", null, `${money(minPrice(p))} VND`), ` / ${p.unit || "bộ"}`, new Set(p.prices).size > 1 && h("span", { class: "muted" }, " (giá thấp nhất)")] : h("b", null, "Liên hệ báo giá"),
      !isPriced(p) && p.prices && p.prices.length && p.prices.some(n => n > 0) && h("div", { class: "note warn", style: "margin-top:8px" }, "Cần nhập giá cho tất cả lựa chọn, nếu không website sẽ hiển thị \"Liên hệ báo giá\"."));
  };
  const drawPrices = () => {
    if (p.autoPrice === undefined) p.autoPrice = true;
    const contact = !p.prices;
    const rows = h("div", { class: "price-rows" }, optsOf(p).map((o, i) => h("div", { class: "price-row" },
      (() => { const el = h("input", { type: "text", value: p.options[i] == null ? o : p.options[i], placeholder: "Tên lựa chọn, VD: Xe 5 chỗ" }); el.addEventListener("input", () => { if (!p.options.length) p.options.push(""); p.options[i] = el.value; dirty(); }); return el; })(),
      contact ? h("span", { class: "muted small" }, "—") : moneyInput(() => p.prices[i], n => { p.prices[i] = n; drawPreview(); }),
      iconBtn("up", "Đưa lên", i === 0, () => { move(p.options, i, -1); p.prices && move(p.prices, i, -1); dirty(); drawPrices(); }, "mv"),
      iconBtn("down", "Đưa xuống", i === optsOf(p).length - 1, () => { move(p.options, i, 1); p.prices && move(p.prices, i, 1); dirty(); drawPrices(); }, "mv"),
      iconBtn("trash", "Xóa lựa chọn", optsOf(p).length <= 1, () => { p.options.splice(i, 1); p.prices && p.prices.splice(i, 1); dirty(); drawPrices(); }, "danger"))));
    put(priceBox, 
      h("div", { class: "grid3" },
        tf(p, "optionLabel", "Tên nhóm lựa chọn", { ph: "VD: Loại xe, Dòng xe", hint: "Hiện phía trên các nút lựa chọn" }),
        fld("Đơn vị tính", h("span", null, input(p, "unit", { list: "units", ph: "bộ", on: drawPreview }), h("datalist", { id: "units" }, ["bộ", "mét", "chiếc", "cái", "ghế", "xe"].map(u => h("option", { value: u })))), { hint: "VD: bộ, mét" }),
        h("div", { class: "fld", style: "align-content:end" }, chk({ v: contact }, "v", "Liên hệ báo giá (không hiện giá)", { on: on => {
          p.prices = on ? undefined : optsOf(p).map(() => 0);
          if (on) delete p.prices;
          drawPrices();
        } }))),
      h("div", null, h("div", { class: "fld-l", style: "margin-bottom:6px" }, contact ? "Các lựa chọn" : "Lựa chọn và giá niêm yết"), rows,
        h("button", { type: "button", class: "btn btn-sm add-row", style: "margin-top:8px", onclick: () => { if (!p.options.length) p.options.push("Tiêu chuẩn"); p.options.push(""); p.prices && p.prices.push(0); dirty(); drawPrices(); } }, "+ Thêm lựa chọn")),
      !contact && chk(p, "autoPrice", "Tự thêm dòng giá vào \"Đặc điểm nổi bật\" và \"Thông số\"", { invert: false, on: () => {} }),
      preview);
    drawPreview();
  };
  drawPrices();
  const prices = h("section", { class: "card sec" }, h("div", { class: "sec-h" }, h("div", null, h("h2", null, "Giá & lựa chọn"), h("p", null, "Mỗi lựa chọn (VD: xe 5 chỗ, xe 7 chỗ) có giá riêng. Website hiển thị giá thấp nhất và đổi giá khi khách chọn."))), h("div", { class: "sec-b" }, priceBox));

  /* Màu sắc */
  const TEX = [["", "Trơn"], ["leather", "Da"], ["suede", "Da lộn"], ["star", "Trần sao"], ["carbon", "Carbon"], ["wood", "Vân gỗ"], ["gloss", "Bóng"]];
  const colorBox = h("div", { class: "list" });
  const drawColors = () => put(colorBox, ...p.colors.map((c, i) => {
    const name = h("input", { type: "text", value: c[0], placeholder: "Tên màu" });
    const hex = h("input", { type: "text", class: "mono hex", value: c[1], maxlength: 7 });
    const pick = h("input", { type: "color", value: /^#[0-9a-f]{6}$/i.test(c[1]) ? c[1] : "#000000", "aria-label": "Chọn màu" });
    name.addEventListener("input", () => { c[0] = name.value; dirty(); });
    pick.addEventListener("input", () => { c[1] = pick.value; hex.value = pick.value; dirty(); });
    hex.addEventListener("input", () => { c[1] = hex.value; if (/^#[0-9a-f]{6}$/i.test(hex.value)) pick.value = hex.value; dirty(); });
    const tex = h("select", { onchange: () => { if (tex.value) c[2] = tex.value; else c.length = 2; dirty(); } }, TEX.map(([v2, l]) => h("option", { value: v2 }, l)));
    tex.value = c[2] || "";
    return h("div", { class: "color-row" }, name, pick, hex, tex,
      iconBtn("up", "Đưa lên", i === 0, () => { move(p.colors, i, -1); dirty(); drawColors(); }, "mv"),
      iconBtn("down", "Đưa xuống", i === p.colors.length - 1, () => { move(p.colors, i, 1); dirty(); drawColors(); }, "mv"),
      iconBtn("trash", "Xóa màu", p.colors.length <= 1, () => { p.colors.splice(i, 1); dirty(); drawColors(); }, "danger"));
  }), h("button", { type: "button", class: "btn btn-sm add-row", onclick: () => { p.colors.push(["", "#1c1c1f"]); dirty(); drawColors(); } }, "+ Thêm màu"));
  drawColors();

  /* Thông số dạng tên – giá trị (giữ thứ tự) */
  const specBox = h("div", { class: "list" });
  const drawSpecs = () => {
    const pairs = Object.entries(p.specs);
    const write = () => { p.specs = Object.fromEntries(pairs.filter(([k]) => k.trim())); dirty(); };
    put(specBox, ...pairs.map((kv, i) => {
      const k = h("input", { type: "text", value: kv[0], placeholder: "Tên thông số" });
      const val = h("textarea", { rows: 1, value: kv[1], placeholder: "Nội dung", style: "min-height:38px" });
      k.addEventListener("input", () => { kv[0] = k.value; write(); });
      val.addEventListener("input", () => { kv[1] = val.value; write(); });
      return h("div", { class: "kv-row" }, k, val,
        iconBtn("up", "Đưa lên", i === 0, () => { move(pairs, i, -1); write(); drawSpecs(); }, "mv"),
        iconBtn("down", "Đưa xuống", i === pairs.length - 1, () => { move(pairs, i, 1); write(); drawSpecs(); }, "mv"),
        iconBtn("trash", "Xóa", false, () => { pairs.splice(i, 1); write(); drawSpecs(); }, "danger"));
    }), h("button", { type: "button", class: "btn btn-sm add-row", onclick: () => { let k = "Thông số mới", n = 2; while (k in p.specs) k = `Thông số mới ${n++}`; p.specs[k] = ""; dirty(); drawSpecs(); } }, "+ Thêm thông số"));
  };
  drawSpecs();

  v.append(back, basic, prices,
    section("Ảnh sản phẩm", "Ảnh đầu tiên là ảnh đại diện trên thẻ sản phẩm; các ảnh còn lại hiện trong bộ ảnh của trang chi tiết.", photoList(p.photos)),
    section("Màu sắc & bề mặt", "Các nút chọn màu trên trang chi tiết. Kiểu bề mặt dùng cho hình minh họa khi chưa có ảnh.", colorBox),
    section("Đặc điểm nổi bật", p.autoPrice !== false && p.prices ? "Dòng giá niêm yết được tự thêm lên đầu, không cần nhập ở đây." : null, strList(p.highlights, { addLabel: "Thêm đặc điểm", rows: 1 })),
    section("Thông số & quy chuẩn dịch vụ", p.autoPrice !== false && p.prices ? "\"Đơn vị tính\", \"Giá niêm yết\" và \"Liên hệ\" được tự thêm, không cần nhập." : null, specBox));
};

/* ===== Danh mục ===== */
VIEWS.categories = v => {
  setTitle("Danh mục");
  const SHAPES = [["seat", "Ghế"], ["floor", "Sàn"], ["wheel", "Vô lăng"], ["trim", "Ốp nhựa"], ["headliner", "Trần"], ["dash", "Taplo"]];
  v.append(h("p", { class: "lead" }, "Danh mục hiển thị trên thanh menu, trang danh mục và chân trang. Nhóm con dùng để lọc sản phẩm trong từng danh mục."),
    listEd(S.c.categories, {
      title: c => c.name || "(chưa có tên)", collapsed: true, addLabel: "Thêm danh mục",
      canDelete: c => { const n = S.c.products.filter(p => p.cat === c.id).length; return n ? `Danh mục "${c.name}" còn ${n} sản phẩm. Hãy chuyển hoặc xóa các sản phẩm này trước.` : ""; },
      add: () => { const c = { id: "", name: "", shape: "seat", color: "#1f1f22", hue: 30, photo: "", desc: "", sub: ["Tất cả"] }; S.fresh.add(c); return c; },
      item: c => {
        const fresh = S.fresh.has(c);
        const idEl = input(c, "id", { mono: true, ro: !fresh, ph: "vi-du-danh-muc" });
        return [
          h("div", { class: "grid2" },
            tf(c, "name", "Tên danh mục *", { on: val => { if (fresh) { c.id = uniqueId(slugify(val), new Set(S.c.categories.filter(x => x !== c).map(x => x.id))); idEl.value = c.id; } } }),
            fld("Mã danh mục", idEl, { hint: fresh ? "Tự tạo theo tên" : "Không đổi được vì đường dẫn website đang dùng" })),
          tf(c, "desc", "Mô tả", { rows: 2 }),
          h("div", { class: "grid2" }, photoField(c, "photo", "Ảnh danh mục (menu)"), fld("Kiểu hình minh họa", sel(c, "shape", SHAPES), { hint: "Dùng khi sản phẩm chưa có ảnh" })),
          fld("Nhóm con", strList(c.sub, {
            addLabel: "Thêm nhóm con",
            /* Website dùng đúng tên 2 nhóm này cho khối Limousine và mục "Các loại da Nappa" */
            locked: c.id === "ghe-da" ? ["Ghế Limousine", "Ghế da ROMAN"] : [],
            lockedHint: "Nhóm này được website dùng cho chức năng riêng nên không đổi tên hoặc xóa được",
            canDelete: s => { const n = S.c.products.filter(p => p.cat === c.id && p.sub === s).length; return n ? `Nhóm "${s}" còn ${n} sản phẩm` : ""; },
            onRename: (a, b) => { const n = S.c.products.filter(p => p.cat === c.id && p.sub === a); n.forEach(p => { p.sub = b; }); if (n.length) toast(`Đã cập nhật nhóm cho ${n.length} sản phẩm`); },
          }), { div: true, hint: "Đổi tên nhóm sẽ tự cập nhật các sản phẩm thuộc nhóm đó" }),
        ];
      },
    }));
};

/* ===== Trang chủ ===== */
VIEWS.home = (v, [tab = "hero"]) => {
  setTitle("Trang chủ");
  const c = S.c, body = h("div");
  const pick = id => { location.hash = `#/home/${id}`; };
  v.append(tabs([["hero", "Slide đầu trang"], ["features", "Banner & thẻ sản phẩm"], ["stories", "Câu chuyện"], ["limo", "Khối Limousine"], ["notes", "Ghi chú cuối trang"]], tab, pick), body);
  const productOpts = [["", "(không có)"], ...c.products.map(p => [p.id, p.name])];
  if (tab === "hero") {
    body.append(h("p", { class: "lead" }, "Các slide chạy tự động ở đầu trang chủ. Slide có video sẽ phát video; ảnh dùng khi video chưa tải hoặc khách bật tiết kiệm dữ liệu."),
      listEd(c.hero, {
        title: s => s.title || "(chưa có tiêu đề)", collapsed: false, min: 1, addLabel: "Thêm slide",
        add: () => ({ eyebrow: "", title: "Slide mới", sub: "", cta: "Khám phá", link: "category.html", hue: 28, bg: "#f7f5f2", dark: false, video: "", photo: c.hero[0].photo, alt: "" }),
        item: s => [
          h("div", { class: "grid2" }, tf(s, "eyebrow", "Dòng chữ nhỏ phía trên"), tf(s, "title", "Tiêu đề lớn")),
          tf(s, "sub", "Mô tả ngắn", { rows: 2 }),
          h("div", { class: "grid2" }, tf(s, "cta", "Chữ trên nút"), tf(s, "link", "Nút dẫn tới", { list: "links", hint: "Chọn gợi ý hoặc nhập đường dẫn" })),
          h("div", { class: "grid2" },
            fld("Video nền", sel(s, "video", [["", "Không dùng video (chỉ ảnh)"], ...S.videos.map(x => [x.name, x.name + (x.small ? "" : " (thiếu bản điện thoại)")])]), { hint: "Video có sẵn trong assets/video" }),
            photoField(s, "photo", "Ảnh nền / ảnh thay thế", { required: true })),
          tf(s, "alt", "Mô tả hình (cho người khiếm thị và Google)", { rows: 2 }),
        ],
      }));
  }
  if (tab === "features") {
    body.append(h("p", { class: "lead" }, "Mỗi banner lớn đi kèm một hàng thẻ sản phẩm ngay bên dưới."),
      listEd(c.features, {
        title: f => f.title || "(chưa có tiêu đề)", collapsed: true, addLabel: "Thêm banner",
        add: () => ({ eyebrow: "", title: "Banner mới", sub: "", cta: "Khám phá", photo: "", alt: "", link: "category.html", book: "", side: "left", bg: "#f7f5f2", dark: false, hue: 28, art: [["seat", "#6e4127"]], cards: [] }),
        item: f => [
          h("div", { class: "grid2" }, tf(f, "eyebrow", "Dòng chữ nhỏ phía trên"), tf(f, "title", "Tiêu đề")),
          tf(f, "sub", "Mô tả ngắn", { rows: 2 }),
          h("div", { class: "grid3" }, tf(f, "cta", "Chữ trên nút"), tf(f, "link", "Nút dẫn tới", { list: "links" }), fld("Nút \"Đặt lịch\" cho sản phẩm", sel(f, "book", productOpts))),
          h("div", { class: "grid2" }, photoField(f, "photo", "Ảnh banner (toàn chiều rộng)"), fld("Vị trí chữ", sel(f, "side", [["left", "Bên trái"], ["right", "Bên phải"]]))),
          tf(f, "alt", "Mô tả hình", { rows: 2 }),
          fld("Thẻ sản phẩm bên dưới (nên có 4)", productPicker(f.cards, { max: 8 }), { div: true }),
        ],
      }));
  }
  if (tab === "stories") {
    body.append(h("p", { class: "lead" }, "Băng chuyền \"Khám phá những câu chuyện\". Mỗi bài có thể có nhiều ảnh; trang chủ tự chọn ảnh không trùng với các mục khác."),
      listEd(c.stories, {
        title: s => s.title || "(chưa có tiêu đề)", collapsed: true, addLabel: "Thêm câu chuyện",
        add: () => ({ title: "Câu chuyện mới", tag: "", desc: "", link: "support.html#faq", art: ["seat", "#d6c3a0"], bg: "#efe9e1", photo: "", pool: [] }),
        item: s => { s.pool = s.pool || (s.photo ? [s.photo] : []); return [
          tf(s, "title", "Tiêu đề"),
          h("div", { class: "grid2" }, tf(s, "tag", "Chủ đề"), tf(s, "link", "Dẫn tới", { list: "links" })),
          tf(s, "desc", "Mô tả", { rows: 2 }),
          fld("Ảnh", photoList(s.pool, { firstLabel: "Ưu tiên" }), { div: true }),
        ]; },
        onChange: () => {},
      }));
  }
  if (tab === "limo") {
    const L = c.limousine;
    body.append(
      section("Banner Limousine", null,
        h("div", { class: "grid2" }, tf(L, "eyebrow", "Dòng chữ nhỏ"), tf(L, "title", "Tiêu đề")),
        tf(L, "sub", "Mô tả", { rows: 2 }),
        photoField(L, "photo", "Ảnh banner"), tf(L, "alt", "Mô tả hình", { rows: 2 })),
      section("Sản phẩm trong khối", null, productPicker(L.cards, { max: 8 })),
      section("4 điểm nổi bật", null, listEd(L.pillars, {
        title: x => `${x.num} · ${x.title}`, addLabel: "Thêm điểm", max: 6,
        add: () => ({ num: String(L.pillars.length + 1).padStart(2, "0"), title: "", desc: "" }),
        item: x => h("div", { class: "grid3" }, tf(x, "num", "Số"), tf(x, "title", "Tiêu đề"), tf(x, "desc", "Mô tả")),
      })));
  }
  if (tab === "notes") {
    body.append(section("Ghi chú cuối trang chủ", "Mỗi dòng là một ghi chú, website tự thêm dấu * ở đầu.", strList(c.notes, { rows: 2, addLabel: "Thêm ghi chú" })));
  }
};

/* ===== Trang nội dung ===== */
VIEWS.pages = (v, [tab = "about"]) => {
  setTitle("Trang nội dung");
  const P = S.c.pages, body = h("div");
  v.append(tabs([["about", "Giới thiệu"], ["support", "Hỗ trợ & đặt lịch"], ["policy", "Chính sách"]], tab, id => { location.hash = `#/pages/${id}`; }), body);
  const head = (o, label) => section(label || "Đầu trang", null, h("div", { class: "grid2" }, tf(o, "eyebrow", "Dòng chữ nhỏ"), tf(o, "title", "Tiêu đề trang (H1)")), tf(o, "lead", "Đoạn giới thiệu", { rows: 2 }));
  const secHead = o => h("div", { class: "grid3" }, tf(o, "eyebrow", "Dòng chữ nhỏ"), tf(o, "title", "Tiêu đề mục"), tf(o, "sub", "Mô tả mục"));
  const link = href => h("a", { class: "btn btn-sm", href: `../${href}`, target: "_blank", rel: "noopener", html: ICON.ext }, "Xem trang");
  if (tab === "about") {
    const A = P.about;
    body.append(h("div", { class: "row end", style: "margin-bottom:12px" }, link("about.html")), mdHelp(), h("div", { style: "height:14px" }),
      head(A),
      section("Khối giới thiệu", null, h("div", { class: "grid2" }, tf(A, "heroEyebrow", "Dòng chữ nhỏ"), tf(A, "heroTitle", "Tiêu đề")), tf(A, "heroBody", "Nội dung", { rows: 6 }), photoField(A, "heroImage", "Ảnh bên cạnh")),
      section("Dải số liệu", "Chỉ nên đưa số liệu có thật", listEd(A.stats, { title: x => `${x.value} · ${x.label}`, addLabel: "Thêm số liệu", max: 6, add: () => ({ value: "", label: "" }), item: x => h("div", { class: "grid2" }, tf(x, "value", "Số / chữ lớn"), tf(x, "label", "Mô tả")) })),
      section("Quy trình", null, secHead(A.process), listEd(A.process.steps, { title: (x, i) => `Bước ${i + 1} · ${x.title}`, addLabel: "Thêm bước", add: () => ({ title: "", body: "" }), item: x => [tf(x, "title", "Tên bước"), tf(x, "body", "Nội dung", { rows: 3 })] })),
      section("Cửa hàng & tổng kho", "Địa chỉ, hotline và giờ mở cửa lấy từ mục Thông tin cửa hàng", secHead(A.stores), h("div", { class: "grid2" }, tf(A.stores, "storeName", "Tên thẻ cửa hàng"), tf(A.stores, "warehouseName", "Tên thẻ tổng kho"))),
      section("Tuyển dụng", "Xóa hết vị trí thì mục Tuyển dụng tự ẩn", secHead(A.jobs), listEd(A.jobs.items, { title: x => x.title || "(chưa có tên)", addLabel: "Thêm vị trí", add: () => ({ title: "", body: "" }), item: x => [tf(x, "title", "Vị trí"), tf(x, "body", "Mô tả", { rows: 3 })] })));
  }
  if (tab === "support") {
    const Sp = P.support, B = Sp.booking;
    body.append(h("div", { class: "row end", style: "margin-bottom:12px" }, link("support.html")), mdHelp(), h("div", { style: "height:14px" }),
      head(Sp),
      section("Các thẻ đầu trang", null, listEd(Sp.cards, {
        title: x => x.title || "(chưa có tiêu đề)", addLabel: "Thêm thẻ", max: 6, add: () => ({ label: "", title: "", body: "", cta: "", link: "", style: "line" }),
        item: x => [h("div", { class: "grid2" }, tf(x, "label", "Dòng chữ nhỏ"), tf(x, "title", "Tiêu đề")), tf(x, "body", "Nội dung", { rows: 2 }),
          h("div", { class: "grid3" }, tf(x, "cta", "Chữ trên nút"), tf(x, "link", "Nút dẫn tới", { list: "links", hint: "Gọi điện: tel:{hotlineTel}" }), fld("Kiểu nút", sel(x, "style", [["line", "Viền"], ["gold", "Nền vàng"]])))],
      })),
      section("Câu hỏi thường gặp", null, secHead(Sp.faq), listEd(Sp.faq.items, { title: x => x.q || "(chưa có câu hỏi)", collapsed: true, addLabel: "Thêm câu hỏi", add: () => ({ q: "", a: "" }), item: x => [tf(x, "q", "Câu hỏi"), tf(x, "a", "Trả lời", { rows: 4 })] })),
      section("Form đặt lịch", null, secHead(B),
        fld("Các hạng mục khách chọn trong form", strList(B.topics, { addLabel: "Thêm hạng mục" }), { div: true, hint: "Khi khách bấm Đặt lịch từ một sản phẩm, hạng mục trùng tên danh mục được chọn sẵn" }),
        h("div", { class: "grid2" }, tf(B, "sideEyebrow", "Khung bên: dòng chữ nhỏ"), tf(B, "sideTitle", "Khung bên: tiêu đề")), tf(B, "sideBody", "Khung bên: nội dung", { rows: 2 })));
  }
  if (tab === "policy") {
    const Po = P.policy;
    const updated = input(Po, "updated", { ph: "dd/mm/yyyy" });
    body.append(h("div", { class: "row end", style: "margin-bottom:12px" }, link("chinh-sach.html")), mdHelp(), h("div", { style: "height:14px" }),
      head(Po),
      section("Ngày cập nhật", null, h("div", { class: "row" }, h("div", { style: "width:180px" }, updated), h("button", { type: "button", class: "btn btn-sm", onclick: () => { Po.updated = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); updated.value = Po.updated; dirty(); } }, "Đặt là hôm nay"))),
      h("div", { class: "note warn", style: "margin-bottom:18px" }, "Các chính sách hiện là bản mẫu chung. Hãy sửa cho đúng chính sách thật của cửa hàng (thời hạn bảo hành, điều kiện đổi trả…) trước khi dùng chính thức."),
      section("Các mục chính sách", "Mã mục là phần sau dấu # trong đường dẫn, VD chinh-sach.html#bao-hanh", listEd(Po.sections, {
        title: (x, i) => `${i + 1}. ${x.title}`, collapsed: true, addLabel: "Thêm mục",
        canDelete: x => (["bao-hanh", "bao-mat", "dieu-khoan"].includes(x.id) ? "Mục này đang được liên kết từ chân trang và trang Hỗ trợ nên không xóa được. Có thể sửa nội dung." : ""),
        add: () => ({ id: uniqueId("muc-moi", new Set(Po.sections.map(x => x.id))), title: "Mục mới", body: "" }),
        item: x => [h("div", { class: "grid2" }, tf(x, "title", "Tiêu đề"), tf(x, "id", "Mã mục", { mono: true, ro: ["bao-hanh", "bao-mat", "dieu-khoan"].includes(x.id) })), tf(x, "body", "Nội dung", { rows: 12 })],
      })));
  }
};

/* ===== Chất liệu da ===== */
VIEWS.materials = v => {
  setTitle("Chất liệu da");
  v.append(h("p", { class: "lead" }, "Hiển thị trong mục \"Các loại da Nappa\" ở trang chi tiết các sản phẩm thuộc nhóm \"Ghế da ROMAN\"."),
    listEd(S.c.materials, { title: m => m.name || "(chưa có tên)", addLabel: "Thêm chất liệu", add: () => ({ name: "", lines: [""] }), item: m => [tf(m, "name", "Tên chất liệu"), fld("Đặc điểm", strList(m.lines, { addLabel: "Thêm đặc điểm" }), { div: true })] }));
};

/* ===== Thư viện ảnh ===== */
VIEWS.photos = v => {
  setTitle("Thư viện ảnh");
  let q = "", usedOnly = "";
  const grid = h("div", { class: "lib-grid" });
  const used = () => new Set((JSON.stringify([S.c.products.map(p => p.photos), S.c.categories, S.c.hero, S.c.features, S.c.stories, S.c.limousine, S.c.pages]).match(/"[a-z0-9-]+"/g) || []).map(s => s.slice(1, -1)));
  const draw = () => {
    const u = used();
    const list = S.photos.filter(p => (!q || norm(p.name + " " + altOf(p.name)).includes(q)) && (!usedOnly || (usedOnly === "used") === u.has(p.name)));
    put(grid, ...list.map(p => {
      const alt = h("textarea", { rows: 2, placeholder: "Mô tả ảnh: ai/cái gì trong ảnh, màu sắc…", value: altOf(p.name) });
      alt.addEventListener("input", () => { S.c.photoAlt[p.name] = alt.value; if (!alt.value) delete S.c.photoAlt[p.name]; dirty(); });
      return h("div", { class: "lib-card" },
        h("a", { href: `../assets/photos/${p.name}-xl.jpg`, target: "_blank", rel: "noopener", title: "Xem ảnh lớn" }, h("img", { src: thumb(p.name), alt: altOf(p.name), loading: "lazy" })),
        h("div", { class: "lib-b" },
          h("div", { class: "lib-n" }, h("span", { style: "flex:1" }, p.name), u.has(p.name) ? h("span", { class: "pill ok" }, "Đang dùng") : h("span", { class: "pill" }, "Chưa dùng")),
          h("span", { class: "small muted" }, `${Math.round(p.bytes / 1024)} KB · ${p.sizes.length === 3 ? "đủ 3 cỡ" : "thiếu cỡ " + ["sm", "lg", "xl"].filter(x => !p.sizes.includes(x)).join(", ")}`),
          alt,
          h("div", { class: "row" },
            h("button", { type: "button", class: "btn btn-sm", onclick: async () => { const where = await api("GET", `/api/photos/${p.name}/usage`).catch(() => []); toast(where.length ? `Đang dùng ở: ${where.join("; ")}` : "Ảnh chưa được dùng (theo nội dung đã lưu)"); } }, "Dùng ở đâu?"),
            h("button", { type: "button", class: "btn btn-sm btn-danger", onclick: async () => {
              if (u.has(p.name)) return toast("Ảnh đang được dùng. Hãy gỡ ảnh khỏi sản phẩm / banner rồi lưu trước khi xóa.", "bad");
              if (!confirm(`Xóa vĩnh viễn ảnh "${p.name}"?`)) return;
              try { await api("DELETE", `/api/photos/${p.name}`); S.photos = S.photos.filter(x => x !== p); if (S.c.photoAlt[p.name]) { delete S.c.photoAlt[p.name]; dirty(); } draw(); toast("Đã xóa ảnh"); } catch (e) { toast(e.data && e.data.used ? `${e.message}: ${e.data.used.join("; ")}` : e.message, "bad"); }
            } }, "Xóa"))));
    }));
    if (!list.length) grid.append(h("div", { class: "empty" }, "Không có ảnh phù hợp."));
  };
  const file = h("input", { type: "file", accept: "image/*", multiple: true, hidden: true });
  const prog = h("div", { class: "progress", hidden: true }, h("span"));
  const run = async files => { prog.hidden = false; await uploadFiles(files, x => { prog.firstChild.style.width = x * 100 + "%"; }); prog.hidden = true; prog.firstChild.style.width = 0; draw(); };
  file.addEventListener("change", () => { if (file.files.length) run(file.files).then(() => { file.value = ""; }); });
  const drop = h("div", { class: "drop" },
    h("b", null, "Kéo thả ảnh vào đây hoặc ", h("button", { type: "button", class: "btn btn-sm", onclick: () => file.click() }, "Chọn ảnh từ máy")),
    h("span", { class: "small muted" }, "Ảnh JPG/PNG, nên rộng từ 1920px. Hệ thống tự tạo 3 cỡ (960, 1440, 1920px) và xóa thông tin vị trí GPS trong ảnh."), file, prog);
  drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", e => { e.preventDefault(); drop.classList.remove("over"); if (e.dataTransfer.files.length) run(e.dataTransfer.files); });
  v.append(drop, h("div", { class: "toolbar", style: "margin-top:16px" },
    h("input", { type: "search", placeholder: "Tìm theo tên hoặc mô tả…", oninput: e => { q = norm(e.target.value); draw(); } }),
    h("select", { onchange: e => { usedOnly = e.target.value; draw(); } }, h("option", { value: "" }, "Tất cả ảnh"), h("option", { value: "used" }, "Đang dùng"), h("option", { value: "unused" }, "Chưa dùng")),
    h("span", { class: "muted small" }, `${S.photos.length} ảnh · mô tả ảnh được lưu khi bấm "Lưu thay đổi"`)), grid);
  draw();
};

/* ===== Thông tin cửa hàng ===== */
VIEWS.site = v => {
  setTitle("Thông tin cửa hàng");
  const s = S.c.site;
  v.append(
    section("Thương hiệu", null, h("div", { class: "grid2" }, tf(s, "name", "Tên thương hiệu"), tf(s, "tagline", "Khẩu hiệu")),
      tf(s, "siteUrl", "Địa chỉ website (tên miền)", { type: "url", mono: true, ph: "https://romanauto.vn", hint: "Dùng cho Google: sitemap, đường dẫn chuẩn, ảnh khi chia sẻ link. Để trống khi chưa có tên miền (máy chủ tự dùng tên miền đang truy cập)." })),
    section("Liên hệ", "Dùng ở thanh menu, chân trang, trang Hỗ trợ, Giới thiệu và Chính sách", h("div", { class: "grid3" }, tf(s, "hotline", "Hotline chính", { type: "tel" }), tf(s, "hotline2", "Hotline phụ", { type: "tel" }), tf(s, "email", "Email", { type: "email" })),
      h("div", { class: "grid2" }, tf(s, "store", "Địa chỉ cửa hàng"), tf(s, "warehouse", "Địa chỉ tổng kho")),
      tf(s, "hours", "Giờ mở cửa", { ph: "VD: 8:00 – 18:00, Thứ 2 – Chủ nhật", hint: "Để trống thì không hiển thị" })),
    section("Thông tin pháp lý", "Hiển thị ở chân trang khi có", h("div", { class: "grid2" }, tf(s, "legalName", "Tên công ty / hộ kinh doanh", { ph: "VD: Công ty TNHH ..." }), tf(s, "taxCode", "Mã số thuế"))),
    section("Mạng xã hội", "Chỉ hiện ở chân trang những mục có liên kết", S.c.social.map(x => tf(x, "url", x.name, { type: "url", ph: x.name === "Zalo" ? "https://zalo.me/0927098098" : `https://www.${x.name.toLowerCase()}.com/...` }))),
    section("Nhận lịch hẹn", null,
      tf(s, "formEndpoint", "Địa chỉ nhận form đặt lịch", { mono: true, hint: "Mặc định /api/bookings: lịch hẹn về mục Lịch hẹn trong trang quản trị. Để trống: nút gửi sẽ mở email của khách với nội dung có sẵn." }),
      h("div", { class: "note" }, "Nếu đưa website lên hosting tĩnh (không chạy máy chủ Node), form sẽ tự chuyển sang gửi qua email.")));
};

/* ===== Thông báo Telegram =====
   Cài đặt này lưu riêng (không qua nút "Lưu thay đổi" của nội dung); mã bot không bao giờ gửi ngược về trình duyệt. */
VIEWS.telegram = async v => {
  setTitle("Thông báo Telegram");
  let T = S.tg = await api("GET", "/api/telegram");
  const form = { enabled: T.enabled, token: "", chats: clone(T.chats), publicUrl: T.publicUrl || "" };
  const statusBox = h("div"), chatBox = h("div", { class: "list" }), seenBox = h("div", { class: "list" });
  const drawStatus = () => put(statusBox,
    !T.hasToken ? h("div", { class: "note warn" }, "Chưa có mã bot. Làm theo các bước bên dưới để bắt đầu.")
      : T.lastError ? h("div", { class: "note warn" }, `Bot đang gặp lỗi: ${T.lastError}`)
      : !T.chats.length ? h("div", { class: "note warn" }, T.bot ? `Bot @${T.bot.username} đã kết nối nhưng CHƯA CÓ NGƯỜI NHẬN, nên chưa gửi được thông báo nào. ` : "Đã lưu mã bot nhưng CHƯA CÓ NGƯỜI NHẬN. ", "Làm tiếp bước 3 và 4 bên dưới.")
      : !T.enabled ? h("div", { class: "note warn" }, `Thông báo đang TẮT. Tích "Bật gửi thông báo lịch hẹn qua Telegram" ở mục Tùy chọn rồi bấm Lưu.`)
      : h("div", { class: "note" }, T.bot ? `Bot @${T.bot.username} (${T.bot.name}) đang hoạt động. ` : "Đang kết nối tới Telegram… ", `Thông báo đang BẬT, gửi tới ${T.chats.length} người nhận.`));
  const drawChats = () => {
    put(chatBox, form.chats.map((c, i) => {
      const name = h("input", { type: "text", value: c.name, placeholder: "Tên gợi nhớ, VD: Anh Chung / Nhóm tư vấn" });
      const id = h("input", { type: "text", class: "mono", value: c.id, placeholder: "Chat ID, VD: 123456789 hoặc -100123..." });
      name.addEventListener("input", () => { c.name = name.value; });
      id.addEventListener("input", () => { c.id = id.value.trim(); });
      return h("div", { class: "kv-row", style: "grid-template-columns:minmax(0,1fr) minmax(0,1fr) 30px" }, name, id,
        iconBtn("trash", "Bỏ người nhận", false, () => { form.chats.splice(i, 1); drawChats(); drawSeen(); }, "danger"));
    }), h("button", { type: "button", class: "btn btn-sm add-row", onclick: () => { form.chats.push({ id: "", name: "" }); drawChats(); } }, "+ Nhập Chat ID thủ công"));
  };
  const drawSeen = () => put(seenBox, T.seen.length ? T.seen.map(c => {
    const added = form.chats.some(x => String(x.id) === c.id);
    return h("div", { class: "row", style: "padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:#fff" },
      h("span", { style: "flex:1;min-width:0" }, h("b", null, c.name), h("small", { class: "muted", style: "display:block" }, `${c.type === "private" ? "Cá nhân" : "Nhóm"} · ${c.id} · ${timeVN(c.at)}`)),
      added ? h("span", { class: "pill ok" }, "Đã thêm") : h("button", { type: "button", class: "btn btn-sm", onclick: () => { form.chats.push({ id: c.id, name: c.name }); drawChats(); drawSeen(); } }, "Thêm làm người nhận"));
  }) : h("p", { class: "muted small", style: "margin:0" }, T.hasToken ? "Chưa có ai nhắn bot. Mở Telegram, tìm bot và gửi /start, rồi bấm Làm mới." : "Lưu mã bot trước, sau đó nhắn /start cho bot."));
  const refresh = async () => { T = S.tg = await api("GET", "/api/telegram"); drawStatus(); drawSeen(); };

  const tokenInput = h("input", { type: "password", autocomplete: "off", placeholder: T.hasToken ? `Đã lưu mã bot (${T.tokenHint}). Nhập mã mới nếu muốn thay` : "Dán mã bot, dạng 123456789:AAH..." });
  tokenInput.addEventListener("input", () => { form.token = tokenInput.value.trim(); });
  const enabled = h("input", { type: "checkbox", checked: form.enabled });
  enabled.addEventListener("change", () => { form.enabled = enabled.checked; });
  const url = h("input", { type: "url", value: form.publicUrl, placeholder: "https://romanauto.vn" });
  url.addEventListener("input", () => { form.publicUrl = url.value; });

  const saveBtn = h("button", { type: "button", class: "btn btn-dark", onclick: async () => {
    saveBtn.disabled = true;
    try {
      const body = { enabled: form.enabled, chats: form.chats.filter(c => c.id), publicUrl: form.publicUrl };
      if (form.token) body.token = form.token;
      T = S.tg = await api("POST", "/api/telegram", body);
      form.token = ""; tokenInput.value = "";
      tokenInput.placeholder = `Đã lưu mã bot (${T.tokenHint}). Nhập mã mới nếu muốn thay`;
      form.chats = clone(T.chats); enabled.checked = form.enabled = T.enabled;
      drawStatus(); drawChats(); drawSeen();
      toast(T.enabled ? "Đã lưu. Thông báo Telegram đang bật." : (form.enabled === false && body.enabled ? "Đã lưu. Cần có mã bot để bật thông báo." : "Đã lưu cài đặt Telegram."), "ok");
      setTimeout(() => { if (location.hash === "#/telegram") refresh(); }, 2500);
      if (T.hasToken && !T.chats.length) toast("Chưa có người nhận: nhắn /start cho bot rồi bấm Làm mới ở mục Người vừa nhắn bot.", "bad");
    } catch (e) { toast(e.message, "bad"); }
    saveBtn.disabled = false;
  } }, "Lưu cài đặt Telegram");
  const testBtn = h("button", { type: "button", class: "btn", onclick: async () => {
    testBtn.disabled = true;
    try {
      const r = await api("POST", "/api/telegram/test");
      const bad = r.results.filter(x => !x.ok);
      if (bad.length) toast("Một số người nhận chưa nhận được tin:", "bad", bad.map(x => `${x.name || x.id}: ${x.error}`));
      else toast(`Đã gửi tin thử tới ${r.results.length} người nhận`, "ok");
    } catch (e) { toast(e.message, "bad"); }
    testBtn.disabled = false;
  } }, "Gửi tin thử");

  drawStatus(); drawChats(); drawSeen();
  v.append(
    h("p", { class: "lead" }, "Mỗi khi khách gửi form đặt lịch trên website, bot nhắn ngay vào Telegram kèm nút \"Đã liên hệ / Hoàn thành / Hủy\". Bấm nút trên Telegram là trạng thái trong trang quản trị đổi theo, và ngược lại."),
    statusBox, h("div", { style: "height:14px" }),
    section("Cách cài đặt (làm một lần)", null, h("ol", { style: "margin:0;padding-left:20px;display:grid;gap:6px" },
      h("li", null, "Mở Telegram, tìm ", h("b", null, "@BotFather"), ", gửi lệnh ", h("code", null, "/newbot"), ", đặt tên bot (VD: ROMAN Lịch hẹn) và tên đăng nhập kết thúc bằng \"bot\"."),
      h("li", null, "BotFather gửi lại một mã dạng ", h("code", null, "123456789:AAH..."), ". Dán mã đó vào ô bên dưới rồi bấm ", h("b", null, "Lưu cài đặt Telegram"), ". Không chia sẻ mã này cho ai."),
      h("li", null, "Mỗi người cần nhận thông báo mở bot vừa tạo và bấm ", h("b", null, "Bắt đầu"), " (/start). Muốn cả nhóm cùng nhận: thêm bot vào nhóm rồi gửi ", h("code", null, "/start"), " trong nhóm."),
      h("li", null, "Bấm ", h("b", null, "Làm mới"), " ở mục \"Người vừa nhắn bot\", chọn ", h("b", null, "Thêm làm người nhận"), ", tích \"Bật gửi thông báo\", lưu, rồi bấm ", h("b", null, "Gửi tin thử"), "."))),
    section("Mã bot", null, fld("Mã bot (token) từ @BotFather", tokenInput, { hint: "Mã được lưu trên máy chủ; trang này không hiển thị lại mã đầy đủ." }),
      T.hasToken && h("div", null, h("button", { type: "button", class: "btn btn-sm btn-danger", onclick: async () => {
        if (!confirm("Gỡ mã bot? Thông báo Telegram sẽ dừng.")) return;
        try { S.tg = await api("POST", "/api/telegram", { token: null }); toast("Đã gỡ mã bot"); route(); } catch (e) { toast(e.message, "bad"); }
      } }, "Gỡ mã bot"))),
    section("Người nhận thông báo", "Cá nhân hoặc nhóm Telegram, tối đa 20. Nhớ bấm Lưu sau khi thêm.", chatBox,
      h("div", { class: "row", style: "margin-top:6px" }, h("b", { style: "flex:1" }, "Người vừa nhắn bot"), h("button", { type: "button", class: "btn btn-sm", onclick: async () => { await refresh(); toast("Đã làm mới"); } }, "Làm mới")), seenBox),
    section("Tùy chọn", null,
      h("label", { class: "check" }, enabled, "Bật gửi thông báo lịch hẹn qua Telegram"),
      fld("Địa chỉ website (để có nút \"Mở trang quản trị\" trong tin nhắn)", url, { hint: "Chỉ dùng địa chỉ https, VD https://romanauto.vn. Để trống nếu chưa có tên miền." })),
    h("div", { class: "row" }, saveBtn, testBtn));
};

/* ===== SEO ===== */
VIEWS.seo = v => {
  setTitle("SEO & chia sẻ");
  const NAMES = { "index.html": "Trang chủ", "category.html": "Danh mục / bảng giá", "product.html": "Chi tiết sản phẩm", "support.html": "Hỗ trợ & đặt lịch", "about.html": "Giới thiệu", "chinh-sach.html": "Chính sách", "so-do-trang.html": "Sơ đồ trang", "404.html": "Trang không tìm thấy" };
  v.append(h("p", { class: "lead" }, "Tiêu đề và mô tả hiện trên Google và khi chia sẻ link qua Facebook, Zalo. Trang danh mục và trang sản phẩm tự đặt tiêu đề theo nội dung khi mở."),
    ...Object.keys(S.c.seo).map(f => {
      const o = S.c.seo[f];
      const serp = h("div", { class: "serp" });
      const upd = () => put(serp, h("div", { class: "u" }, `romanauto.vn › ${f.replace(".html", "")}`), h("div", { class: "t" }, o.title || "(chưa có tiêu đề)"), h("div", { class: "d" }, o.description || "(chưa có mô tả)"));
      upd();
      return section(NAMES[f] || f, f, counted(o, "title", "Tiêu đề", 60, { on: upd }), counted(o, "description", "Mô tả", 160, { rows: 3, on: upd }), h("div", null, h("div", { class: "fld-l", style: "margin-bottom:6px" }, "Xem trước trên Google"), serp));
    }));
};

/* ===== Sao lưu ===== */
VIEWS.backups = async v => {
  setTitle("Sao lưu");
  const list = h("tbody");
  const load = async () => {
    const items = await api("GET", "/api/backups");
    put(list, ...(items.length ? items.map(b => h("tr", null,
      h("td", null, timeVN(b.mtime)), h("td", null, `Phiên bản ${b.rev}`), h("td", { class: "hide-sm" }, `${Math.round(b.size / 1024)} KB`),
      h("td", { class: "num" }, h("div", { class: "row end" },
        h("button", { type: "button", class: "btn btn-sm", onclick: async () => { const data = await api("GET", `/api/backups/${b.file}`); download(data, b.file); } }, "Tải về"),
        h("button", { type: "button", class: "btn btn-sm", onclick: async () => {
          if (!confirm(`Khôi phục nội dung về phiên bản ${b.rev} (${timeVN(b.mtime)})?\n\nNội dung hiện tại sẽ được tự sao lưu trước khi khôi phục.${S.dirty ? "\nCác thay đổi chưa lưu sẽ bị bỏ." : ""}`)) return;
          try { await api("POST", `/api/backups/${b.file}/restore`); S.dirty = false; await loadAll(); toast("Đã khôi phục. Website đã được cập nhật.", "ok"); route(); } catch (e) { toast(e.message, "bad"); }
        } }, "Khôi phục"))))) : [h("tr", null, h("td", { colspan: 4, class: "empty" }, "Chưa có bản sao lưu. Mỗi lần bấm Lưu, bản trước đó sẽ được giữ lại ở đây."))]));
  };
  const download = (data, name) => {
    const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })), download: name });
    document.body.append(a); a.click(); a.remove();
  };
  const imp = h("input", { type: "file", accept: "application/json,.json", hidden: true });
  imp.addEventListener("change", async () => {
    const f = imp.files[0]; imp.value = "";
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data.products || !data.categories || !data.site || !data.pages) throw new Error("Tệp không phải nội dung website ROMAN");
      if (!confirm(`Nạp nội dung từ "${f.name}" (${data.products.length} sản phẩm)? Nội dung đang sửa sẽ bị thay thế; bấm "Lưu thay đổi" để áp dụng lên website.`)) return;
      data.rev = S.rev;
      S.c = data; dirty(); toast("Đã nạp tệp. Kiểm tra lại rồi bấm Lưu thay đổi.", "ok");
    } catch (e) { toast(`Không đọc được tệp: ${e.message}`, "bad"); }
  });
  v.append(
    section("Sao lưu tự động", "Hệ thống giữ 30 bản gần nhất, mỗi bản là nội dung ngay trước một lần lưu.", h("div", { class: "card table-wrap", style: "box-shadow:none" }, h("table", { class: "tbl" }, h("thead", null, h("tr", null, h("th", null, "Thời điểm"), h("th", null, "Bản"), h("th", { class: "hide-sm" }, "Dung lượng"), h("th"))), list))),
    section("Sao lưu thủ công", "Nên tải về định kỳ và cất ở nơi khác (Google Drive, USB…).", h("div", { class: "row" },
      h("button", { type: "button", class: "btn", onclick: () => download(S.c, `roman-noi-dung-${new Date().toISOString().slice(0, 10)}.json`) }, "Tải nội dung hiện tại (.json)"),
      h("button", { type: "button", class: "btn", onclick: () => imp.click() }, "Nạp từ tệp .json"), imp),
      h("p", { class: "small muted" }, "Ảnh không nằm trong tệp sao lưu: hãy sao lưu riêng thư mục assets/photos.")));
  await load();
};

/* ===== Tài khoản ===== */
VIEWS.account = v => {
  setTitle("Tài khoản của tôi");
  const d = { username: S.user, current: "", next: "", next2: "" };
  const err = h("p", { role: "alert", style: "color:var(--bad);font-weight:600;margin:0" });
  const form = h("form", { onsubmit: async e => {
    e.preventDefault(); err.textContent = "";
    if (d.next !== d.next2) { err.textContent = "Hai lần nhập mật khẩu mới chưa khớp"; return; }
    try { await api("POST", "/api/password", { current: d.current, next: d.next, username: d.username }); S.user = d.username; toast("Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.", "ok"); form.reset(); }
    catch (x) { err.textContent = x.message; }
  } },
  section("Đổi tên đăng nhập / mật khẩu", null,
    tf(d, "username", "Tên đăng nhập", { ac: "username" }),
    tf(d, "current", "Mật khẩu hiện tại", { type: "password", ac: "current-password" }),
    h("div", { class: "grid2" }, tf(d, "next", "Mật khẩu mới (ít nhất 8 ký tự)", { type: "password", ac: "new-password" }), tf(d, "next2", "Nhập lại mật khẩu mới", { type: "password", ac: "new-password" })),
    err, h("div", null, h("button", { class: "btn btn-dark", type: "submit" }, "Cập nhật"))));
  v.append(form, section("Quên mật khẩu?", null, h("p", { class: "muted", style: "margin:0" }, S.role === "owner" ? "Quản trị viên khác có thể đặt lại mật khẩu cho bạn ở mục Tài khoản & phân quyền. Nếu không còn ai đăng nhập được: trên máy chạy máy chủ, xóa tệp content/users.json rồi mở http://localhost:5173/admin/ để tạo lại tài khoản Quản trị viên (nội dung website không bị ảnh hưởng)." : "Hãy nhờ Quản trị viên đặt lại mật khẩu cho bạn ở mục Tài khoản & phân quyền.")));
  /* Các ô mật khẩu không thuộc nội dung website nên không bật trạng thái "chưa lưu" */
  const keep = markDirty;
  markDirty = () => { if (!form.contains(document.activeElement)) keep(); };
  window.addEventListener("hashchange", () => { markDirty = keep; }, { once: true });
};

/* ---------- Khởi động ---------- */
async function loadAll() {
  const [c, photos, videos, bookings, tgc] = await Promise.all([api("GET", "/api/content"), api("GET", "/api/photos"), api("GET", "/api/videos"), api("GET", "/api/bookings"), api("GET", "/api/telegram").catch(() => null)]);
  S.tg = tgc;
  S.c = c; S.rev = c.rev; S.photos = photos; S.videos = videos; S.bookings = bookings; S.dirty = false;
  updateSaveState(); updateBookingBadge();
}
async function start() {
  const s = await api("GET", "/api/session");
  if (s.setup) return renderSetup(s.canSetup);
  if (!s.loggedIn) return renderLogin();
  S.user = s.user; S.name = s.name || s.user; S.role = s.role || "owner";
  await loadAll();
  renderShell();
  route();
}
window.addEventListener("hashchange", route);
/* Trạng thái lịch hẹn có thể đổi từ Telegram: làm mới mỗi phút */
setInterval(async () => {
  if (!S.c || document.hidden) return;
  try {
    const list = await api("GET", "/api/bookings");
    const changed = JSON.stringify(list.map(b => [b.id, b.status])) !== JSON.stringify(S.bookings.map(b => [b.id, b.status]));
    S.bookings = list; updateBookingBadge();
    if (changed && location.hash.startsWith("#/bookings") && !(document.activeElement && document.activeElement.closest(".bk"))) route();
  } catch (e) { /* bỏ qua lỗi mạng tạm thời */ }
}, 60000);
window.addEventListener("beforeunload", e => { if (S.dirty) { e.preventDefault(); e.returnValue = ""; } });
window.addEventListener("keydown", e => {
  if (!S.c || !(e.ctrlKey || e.metaKey)) return;
  const k = e.key.toLowerCase();
  if (k === "s") { e.preventDefault(); if (S.role === "owner") save(); }
  if (k === "k" && $("#shell")) { e.preventDefault(); quickSearch(); }
});
/* Chạy sau khi mọi tệp script đã nạp (các màn hình ở admin-ops.js đăng ký vào VIEWS) */
document.addEventListener("DOMContentLoaded", () => start().catch(e => { put($("#app"), h("div", { class: "auth" }, h("div", { class: "auth-card" }, h("h1", null, "Không mở được trang quản trị"), h("p", null, e.message)))); }));
