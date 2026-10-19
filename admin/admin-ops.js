/* ===== Các màn vận hành của trang quản trị =====
   Lịch theo tháng, Khách hàng, Thống kê truy cập, Sửa giá nhanh, Tài khoản & phân quyền, Nhật ký hoạt động,
   cùng hộp thoại thêm lịch hẹn và xem chi tiết lịch hẹn. Dùng các hàm chung trong admin.js (h, api, modal, S...). */
"use strict";

const SOURCES = { web: "Website", phone: "Điện thoại", zalo: "Zalo", facebook: "Facebook", walkin: "Khách đến cửa hàng", other: "Khác" };
const dayVN = t => new Date(new Date(t).getTime() + 7 * 3600e3).toISOString().slice(0, 10);
const dmy = iso => (iso ? iso.split("-").reverse().join("/") : "");
const phoneKey = p => { let d = digits(p); if (d.startsWith("84")) d = "0" + d.slice(2); return d; };
const pct = (a, b) => (b ? `${(a / b * 100).toFixed(a / b < 0.1 ? 1 : 0)}%` : "–");
const csvDownload = (rows, file) => {
  const cell = x => { let t = String(x == null ? "" : x); if (/^[=+\-@]/.test(t)) t = "'" + t; return `"${t.replace(/"/g, '""')}"`; };
  const a = h("a", { href: URL.createObjectURL(new Blob(["﻿" + rows.map(r => r.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" })), download: file });
  document.body.append(a); a.click(); a.remove();
};
const statusPill = st => h("span", { class: `status s-${st}` }, BK[st] ? BK[st][0] : st);
async function reloadBookings() { S.bookings = await api("GET", "/api/bookings"); updateBookingBadge(); }

/* ---------- Thêm lịch hẹn (khách gọi điện, nhắn Zalo, đến cửa hàng...) ---------- */
function bookingForm(pre = {}, after) {
  const topics = (S.c.pages && S.c.pages.support && S.c.pages.support.booking.topics) || [];
  const field = (label, control, wide) => h("label", { class: "fld" + (wide ? " wide" : "") }, h("span", { class: "fld-l" }, label), control);
  const select = (name, opts, val) => { const el = h("select", { name }, opts.map(([v, l]) => h("option", { value: v }, l))); el.value = val; return el; };
  const err = h("p", { role: "alert", class: "form-err" });
  const form = h("form", { class: "mini-form", onsubmit: async e => {
    e.preventDefault(); err.textContent = "";
    const d = Object.fromEntries(new FormData(form));
    d.notify = !!form.notify.checked;
    try { await api("POST", "/api/bookings/manual", d); m.close(); toast("Đã thêm lịch hẹn", "ok"); await reloadBookings(); after && after(); }
    catch (x) { err.textContent = x.message; }
  } },
    field("Họ tên khách *", h("input", { type: "text", name: "name", required: true, maxlength: 80, value: pre.name || "", autocomplete: "off" })),
    field("Số điện thoại *", h("input", { name: "phone", type: "tel", required: true, maxlength: 20, value: pre.phone || "", autocomplete: "off" })),
    field("Hãng và dòng xe", h("input", { type: "text", name: "car", maxlength: 100, value: pre.car || "" })),
    field("Ngày hẹn thi công", h("input", { name: "date", type: "date", value: pre.date || "" })),
    field("Hạng mục", select("topic", topics.map(t => [t, t]), pre.topic || topics[0] || "")),
    field("Khách liên hệ qua", select("source", Object.entries(SOURCES).filter(([k]) => k !== "web"), pre.source || "phone")),
    field("Trạng thái", select("status", Object.entries(BK).map(([k, [l]]) => [k, l]), "new")),
    field("Ghi chú nội bộ", h("input", { type: "text", name: "note", maxlength: 300, placeholder: "VD: đã báo giá 7,5 triệu" })),
    field("Yêu cầu của khách", h("textarea", { name: "msg", rows: 3, maxlength: 1500, placeholder: "Màu da, hạng mục, thời gian mong muốn…" }), true),
    h("label", { class: "check wide" }, h("input", { type: "checkbox", name: "notify" }), "Báo lịch hẹn này qua Telegram cho cả nhóm"),
    err);
  const m = modal({ title: "Thêm lịch hẹn", body: form, size: "md",
    foot: [h("button", { type: "button", class: "btn", onclick: () => m.cancel() }, "Hủy"), h("button", { type: "button", class: "btn btn-dark", onclick: () => form.requestSubmit() }, "Lưu lịch hẹn")] });
}

/* ---------- Chi tiết một lịch hẹn (dùng ở Lịch theo tháng và Khách hàng) ---------- */
function bookingDetail(b, after) {
  const tel = digits(b.phone);
  const status = h("select", { onchange: async () => {
    try { await api("PATCH", `/api/bookings/${b.id}`, { status: status.value }); b.status = status.value; updateBookingBadge(); toast(`Đã chuyển sang "${BK[b.status][0]}"`); changed = true; }
    catch (e) { toast(e.message, "bad"); status.value = b.status; }
  } }, Object.entries(BK).map(([k, [l]]) => h("option", { value: k }, l)));
  status.value = b.status;
  const note = h("textarea", { rows: 3, value: b.note || "", placeholder: "Ghi chú nội bộ (khách không thấy)" });
  note.addEventListener("change", async () => { try { await api("PATCH", `/api/bookings/${b.id}`, { note: note.value }); b.note = note.value; toast("Đã lưu ghi chú"); changed = true; } catch (e) { toast(e.message, "bad"); } });
  let changed = false;
  const row = (k, val) => val && h("div", { class: "dt-row" }, h("dt", null, k), h("dd", null, val));
  modal({ title: b.name, size: "md", onClose: () => { if (changed && after) after(); },
    body: [
      h("div", { class: "row" }, statusPill(b.status), b.topic && h("span", { class: "tag" }, b.topic), h("span", { class: "pill" }, SOURCES[b.source || "web"]),
        h("span", { style: "flex:1" }),
        h("a", { class: "btn btn-sm", href: `tel:${tel}`, html: ICON.phone }, b.phone),
        h("a", { class: "btn btn-sm", href: `https://zalo.me/${tel}`, target: "_blank", rel: "noopener", html: ICON.chat }, "Zalo")),
      h("dl", { class: "dt" },
        row("Xe", b.car), row("Ngày hẹn", dmy(b.date)), row(b.source && b.source !== "web" ? "Nhập lúc" : "Gửi lúc", timeVN(b.createdAt)),
        row("Nhập bởi", b.createdBy), row("Cập nhật", b.statusBy && `${b.statusBy}, ${timeVN(b.statusAt)}`)),
      h("div", { class: "bk-msg" }, b.msg || h("span", { class: "muted" }, "Khách không để lại yêu cầu.")),
      h("div", { class: "grid2" }, fld("Trạng thái", status), fld("Ghi chú nội bộ", note)),
    ] });
}

/* ===== Lịch theo tháng ===== */
VIEWS.calendar = async v => {
  setTitle("Lịch theo tháng");
  await reloadBookings().catch(e => toast(e.message, "bad"));
  const now = new Date();
  let y = now.getFullYear(), mo = now.getMonth(), showCancelled = false;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayIso = iso(now);
  const box = h("div");
  const draw = () => {
    const first = new Date(y, mo, 1), start = new Date(y, mo, 1 - ((first.getDay() + 6) % 7));
    let cells = [...Array(42)].map((_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    if (cells[35].getMonth() !== mo) cells = cells.slice(0, 35);
    const list = S.bookings.filter(b => showCancelled || b.status !== "cancelled");
    const byDay = {};
    list.forEach(b => { if (b.date) (byDay[b.date] = byDay[b.date] || []).push(b); });
    const inMonth = list.filter(b => b.date && b.date.startsWith(`${y}-${String(mo + 1).padStart(2, "0")}`));
    const undated = list.filter(b => !b.date && (b.status === "new" || b.status === "contacted"));
    const chip = b => h("button", { type: "button", class: `cal-chip c-${b.status}`, title: `${b.name} · ${b.phone}${b.topic ? " · " + b.topic : ""}`, onclick: e => { e.stopPropagation(); bookingDetail(b, draw); } }, h("i"), h("span", null, b.name));
    put(box,
      h("div", { class: "cal-bar" },
        iconBtn("left", "Tháng trước", false, () => { mo--; if (mo < 0) { mo = 11; y--; } draw(); }),
        h("h2", null, `Tháng ${mo + 1}, ${y}`),
        iconBtn("right", "Tháng sau", false, () => { mo++; if (mo > 11) { mo = 0; y++; } draw(); }),
        h("button", { type: "button", class: "btn btn-sm", onclick: () => { y = now.getFullYear(); mo = now.getMonth(); draw(); } }, "Hôm nay"),
        h("span", { class: "muted small" }, `${inMonth.length} lịch hẹn trong tháng`),
        h("span", { style: "flex:1" }),
        h("label", { class: "check small" }, h("input", { type: "checkbox", checked: showCancelled, onchange: e => { showCancelled = e.target.checked; draw(); } }), "Hiện lịch đã hủy"),
        h("button", { type: "button", class: "btn btn-sm btn-dark", html: ICON.plus, onclick: () => bookingForm({}, draw) }, "Thêm lịch hẹn")),
      h("div", { class: "cal card" },
        [["Thứ 2", "T2"], ["Thứ 3", "T3"], ["Thứ 4", "T4"], ["Thứ 5", "T5"], ["Thứ 6", "T6"], ["Thứ 7", "T7"], ["Chủ nhật", "CN"]].map(([d, sh]) => h("div", { class: "cal-dow", title: d }, h("span", { class: "full" }, d), h("span", { class: "short" }, sh))),
        cells.map(d => {
          const k = iso(d), items = byDay[k] || [];
          return h("div", { class: "cal-cell" + (d.getMonth() !== mo ? " out" : "") + (k === todayIso ? " today" : "") + (items.length ? " has" : ""),
            title: "Bấm vào ô trống để thêm lịch hẹn ngày này", onclick: () => bookingForm({ date: k }, draw) },
            h("span", { class: "cal-n" }, String(d.getDate())),
            items.slice(0, 3).map(chip),
            items.length > 3 && h("button", { type: "button", class: "cal-more", onclick: e => { e.stopPropagation(); dayList(k, items); } }, `+${items.length - 3} lịch hẹn`));
        })),
      h("div", { class: "cal-legend" }, Object.entries(BK).map(([k, [l]]) => h("span", null, h("i", { class: `c-${k}` }), l))),
      section(`Chưa hẹn ngày thi công (${undated.length})`, "Lịch hẹn mới hoặc đã liên hệ nhưng chưa chốt ngày: gọi lại cho khách để hẹn",
        undated.length ? h("div", { class: "undated" }, undated.map(chip)) : h("p", { class: "muted" }, "Không có lịch hẹn nào đang chờ chốt ngày.")));
  };
  const dayList = (k, items) => modal({ title: `Lịch hẹn ngày ${dmy(k)}`, size: "sm", body: h("div", { class: "undated" }, items.map(b => h("button", { type: "button", class: `cal-chip c-${b.status}`, onclick: () => bookingDetail(b, draw) }, h("i"), h("span", null, `${b.name} · ${b.topic || ""}`)))) });
  v.append(box);
  draw();
};

/* ===== Khách hàng ===== */
VIEWS.customers = async v => {
  setTitle("Khách hàng");
  await reloadBookings().catch(e => toast(e.message, "bad"));
  let q = "", sort = "recent";
  const groups = () => {
    const map = new Map();
    S.bookings.forEach(b => {
      const k = phoneKey(b.phone) || b.id;
      const g = map.get(k) || { key: k, phone: b.phone, items: [] };
      g.items.push(b); map.set(k, g);
    });
    return [...map.values()].map(g => {
      g.items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const last = g.items[0];
      return Object.assign(g, { name: last.name, last, cars: [...new Set(g.items.map(x => x.car).filter(Boolean))], done: g.items.filter(x => x.status === "done").length });
    });
  };
  const body = h("tbody"), info = h("span", { class: "muted small" });
  const draw = () => {
    let list = groups().filter(g => !q || norm([g.name, g.phone, g.cars.join(" "), g.items.map(x => x.topic + " " + x.note).join(" ")].join(" ")).includes(q));
    list.sort(sort === "count" ? (a, b) => b.items.length - a.items.length : sort === "name" ? (a, b) => a.name.localeCompare(b.name, "vi") : (a, b) => b.last.createdAt.localeCompare(a.last.createdAt));
    info.textContent = `${list.length} khách hàng`;
    put(body, list.length ? list.map(g => h("tr", { class: "click", tabindex: 0, onclick: () => customerModal(g), onkeydown: e => { if (e.key === "Enter") customerModal(g); } },
      h("td", null, h("div", { class: "row", style: "flex-wrap:nowrap" }, h("span", { class: "avatar" }, initials(g.name)), h("div", null, h("div", { class: "name" }, g.name), h("div", { class: "small muted" }, g.cars.join(", ") || "Chưa có thông tin xe")))),
      h("td", { class: "mono-num" }, g.phone),
      h("td", { class: "num" }, String(g.items.length)),
      h("td", { class: "hide-sm" }, timeVN(g.last.createdAt)),
      h("td", null, statusPill(g.last.status)),
      h("td", { class: "hide-sm" }, h("span", { class: "pill" }, SOURCES[g.last.source || "web"])))) :
      [h("tr", null, h("td", { colspan: 6 }, emptyState("users", S.bookings.length ? "Không tìm thấy khách hàng" : "Chưa có khách hàng", "Khách hàng được tạo tự động từ các lịch hẹn (gộp theo số điện thoại).")))]);
  };
  const customerModal = g => {
    const tel = digits(g.phone);
    const m = modal({ title: g.name, size: "md", body: [
      h("div", { class: "row" },
        h("a", { class: "btn btn-sm", href: `tel:${tel}`, html: ICON.phone }, g.phone),
        h("a", { class: "btn btn-sm", href: `https://zalo.me/${tel}`, target: "_blank", rel: "noopener", html: ICON.chat }, "Zalo"),
        h("span", { style: "flex:1" }),
        h("button", { type: "button", class: "btn btn-sm btn-dark", html: ICON.plus, onclick: () => { m.close(); bookingForm({ name: g.name, phone: g.phone, car: g.cars[0] || "" }, draw); } }, "Thêm lịch hẹn cho khách")),
      h("div", { class: "kpis kpis-3" },
        h("div", null, h("b", null, String(g.items.length)), h("span", null, "Lần đặt lịch")),
        h("div", null, h("b", null, String(g.done)), h("span", null, "Đã hoàn thành")),
        h("div", null, h("b", null, timeVN(g.items[g.items.length - 1].createdAt).split(" ").pop()), h("span", null, "Lần đầu liên hệ"))),
      h("div", { class: "fld-l" }, "Lịch sử"),
      h("div", { class: "timeline" }, g.items.map(b => h("button", { type: "button", class: "tl-item", onclick: () => { m.close(); bookingDetail(b, draw); } },
        h("div", { class: "row" }, statusPill(b.status), h("b", null, b.topic || "Chưa chọn hạng mục"), h("span", { class: "muted small", style: "margin-left:auto" }, timeVN(b.createdAt))),
        (b.car || b.date) && h("div", { class: "small muted" }, [b.car, b.date && `hẹn ${dmy(b.date)}`].filter(Boolean).join(" · ")),
        b.msg && h("div", { class: "small" }, b.msg),
        b.note && h("div", { class: "small note-line" }, "Ghi chú: " + b.note)))),
    ] });
  };
  const exportCsv = () => csvDownload([["Họ tên", "Điện thoại", "Xe", "Số lần đặt lịch", "Đã hoàn thành", "Lần gần nhất", "Trạng thái gần nhất", "Nguồn gần nhất"],
    ...groups().map(g => [g.name, g.phone, g.cars.join("; "), g.items.length, g.done, timeVN(g.last.createdAt), BK[g.last.status][0], SOURCES[g.last.source || "web"]])], `khach-hang-roman-${new Date().toISOString().slice(0, 10)}.csv`);
  const sortSel = h("select", { onchange: e => { sort = e.target.value; draw(); } }, [["recent", "Mới liên hệ gần đây"], ["count", "Đặt lịch nhiều nhất"], ["name", "Theo tên A–Z"]].map(([k, l]) => h("option", { value: k }, l)));
  v.append(
    h("p", { class: "lead" }, "Khách hàng được gộp tự động từ các lịch hẹn theo số điện thoại. Bấm vào một khách để xem lịch sử và gọi lại."),
    h("div", { class: "toolbar" }, h("input", { type: "search", placeholder: "Tìm tên, số điện thoại, xe…", oninput: e => { q = norm(e.target.value); draw(); } }), sortSel, info, h("span", { style: "flex:1" }),
      h("button", { type: "button", class: "btn btn-sm", onclick: exportCsv }, "Xuất Excel (CSV)")),
    h("div", { class: "card table-wrap" }, h("table", { class: "tbl" },
      h("thead", null, h("tr", null, h("th", null, "Khách hàng"), h("th", null, "Điện thoại"), h("th", { class: "num" }, "Lần đặt"), h("th", { class: "hide-sm" }, "Gần nhất"), h("th", null, "Trạng thái"), h("th", { class: "hide-sm" }, "Nguồn"))), body)));
  draw();
};

/* ===== Thống kê truy cập ===== */
VIEWS.stats = async (v, [range = "30"]) => {
  setTitle("Thống kê truy cập");
  const n = [7, 30, 90].includes(+range) ? +range : 30;
  const [st] = await Promise.all([api("GET", `/api/stats?days=${n}`), reloadBookings().catch(() => {})]);
  const from = st.days[0].d;
  const webBookings = S.bookings.filter(b => (b.source || "web") === "web" && dayVN(b.createdAt) >= from);
  const allBookings = S.bookings.filter(b => dayVN(b.createdAt) >= from);
  const perDay = {};
  allBookings.forEach(b => { const d = dayVN(b.createdAt); perDay[d] = (perDay[d] || 0) + 1; });
  const views = st.days.reduce((a, d) => a + d.v, 0), visitors = st.days.reduce((a, d) => a + d.u, 0);
  const max = Math.max(1, ...st.days.map(d => d.v));
  const every = n <= 14 ? 1 : n <= 31 ? 5 : 15;
  const kpi = (label, value, sub) => h("div", { class: "card stat" }, h("div", null, h("b", null, String(value)), h("span", null, label), sub && h("small", { class: "muted" }, sub)));
  const bars = h("div", { class: "bars", style: `grid-template-columns:repeat(${n}, minmax(0, 1fr));gap:${n > 31 ? 2 : n > 14 ? 4 : 8}px`, role: "img", "aria-label": `Lượt xem ${n} ngày qua` },
    st.days.map((d, i) => h("div", { class: "bar" + (d.v ? "" : " zero") + (i === n - 1 ? " today" : ""), style: `--h:${Math.round(d.v / max * 100)}%;--i:${Math.min(i, 30)}`, title: `${dmy(d.d)}: ${d.v} lượt xem · ${d.u} người · ${perDay[d.d] || 0} lịch hẹn` },
      h("i"), h("span", null, i === n - 1 ? "Nay" : (i % every === 0 ? d.d.slice(8) : "")))));
  const top = (rows, labelOf, valOf, total) => rows.length ? h("div", { class: "rank" }, rows.map(r => h("div", { class: "rank-row" },
    h("div", { class: "rank-l" }, labelOf(r)), h("div", { class: "rank-bar" }, h("i", { style: `width:${Math.max(2, valOf(r) / total * 100)}%` })), h("b", null, String(valOf(r)))))) : h("p", { class: "muted" }, "Chưa có dữ liệu trong khoảng thời gian này.");
  const products = st.pages.filter(x => x.product), pages = st.pages.filter(x => !x.product);
  const refTotal = st.refs.reduce((a, r) => a + r.v, 0);
  const refRows = [...st.refs.map(r => ({ l: r.host, v: r.v })), ...(views - refTotal > 0 ? [{ l: "Truy cập trực tiếp / không rõ", v: views - refTotal }] : [])];
  v.append(
    tabs([["7", "7 ngày"], ["30", "30 ngày"], ["90", "90 ngày"]], String(n), id => { location.hash = `#/stats/${id}`; }),
    h("div", { class: "stats" },
      kpi("Lượt xem trang", views.toLocaleString("vi-VN")),
      kpi("Người truy cập", visitors.toLocaleString("vi-VN"), "đếm theo từng ngày"),
      kpi("Lịch hẹn từ website", webBookings.length, `${allBookings.length} lịch hẹn tất cả nguồn`),
      kpi("Tỷ lệ đặt lịch", pct(webBookings.length, visitors), "lịch hẹn website / người truy cập")),
    section(`Lượt xem ${n} ngày qua`, "Rê chuột lên cột để xem số người truy cập và lịch hẹn của ngày đó", bars),
    h("div", { class: "grid2" },
      section("Sản phẩm được xem nhiều", null, top(products.slice(0, 10), r => r.label, r => r.v, Math.max(1, ...products.map(x => x.v)))),
      section("Trang được xem nhiều", null, top(pages.slice(0, 10), r => r.label, r => r.v, Math.max(1, ...pages.map(x => x.v))))),
    section("Khách đến từ đâu", "Trang web đã dẫn khách tới website (Google, Facebook, Zalo…)", top(refRows, r => r.l, r => r.v, Math.max(1, ...refRows.map(r => r.v)))),
    h("p", { class: "small muted" }, `Thống kê ẩn danh: không dùng cookie, không lưu địa chỉ IP, không đếm lượt xem của máy tìm kiếm. ${st.since ? `Bắt đầu ghi nhận từ ${dmy(st.since)}.` : "Chưa có lượt xem nào được ghi nhận."}`));
};

/* ===== Sửa giá nhanh ===== */
VIEWS.prices = v => {
  setTitle("Sửa giá nhanh");
  const orig = Object.fromEntries(S.c.products.map(p => [p.id, JSON.stringify([p.prices || null, p.unit || ""])]));
  let cat = "", q = "";
  const body = h("div", { class: "price-table" });
  const filtered = () => S.c.products.filter(p => (!cat || p.cat === cat) && (!q || norm(p.name).includes(q)));
  const draw = () => {
    const list = filtered();
    put(body, list.length ? S.c.categories.filter(c => list.some(p => p.cat === c.id)).map(c => h("section", { class: "card sec" },
      h("div", { class: "sec-h" }, h("div", null, h("h2", null, c.name))),
      h("div", { class: "pt-rows" }, list.filter(p => p.cat === c.id).map(p => {
        const i = S.c.products.indexOf(p);
        const rowEl = h("div", { class: "pt-row" });
        const mark = () => rowEl.classList.toggle("chg", JSON.stringify([p.prices || null, p.unit || ""]) !== orig[p.id]);
        const unit = h("input", { type: "text", class: "pt-unit", value: p.unit || "bộ", "aria-label": "Đơn vị tính", list: "units-q" });
        unit.addEventListener("input", () => { p.unit = unit.value; dirty(); mark(); });
        put(rowEl,
          h("div", { class: "pt-name" }, h("a", { href: `#/product/${i}` }, p.name), p.hidden && h("span", { class: "pill" }, "Đang ẩn")),
          p.prices ? h("div", { class: "pt-opts" }, optsOf(p).map((o, j) => h("label", { class: "pt-opt" }, h("span", null, o), moneyInput(() => p.prices[j], n => { p.prices[j] = n; mark(); }))), h("label", { class: "pt-opt pt-u" }, h("span", null, "Đơn vị"), unit))
            : h("div", { class: "pt-opts" }, h("span", { class: "pill warn" }, "Liên hệ báo giá"), h("button", { type: "button", class: "btn btn-sm", onclick: () => { p.prices = optsOf(p).map(() => 0); p.unit = p.unit || "bộ"; dirty(); draw(); } }, "Đặt giá")));
        mark();
        return rowEl;
      })))) : [h("div", { class: "card" }, emptyState("search", "Không có sản phẩm phù hợp"))]);
  };
  /* Tăng / giảm giá hàng loạt theo % cho các sản phẩm đang lọc, làm tròn */
  const bulk = { pct: "", round: "10000" };
  const pctIn = h("input", { type: "number", step: "0.5", placeholder: "VD: 5 hoặc -10", style: "width:150px", oninput: e => { bulk.pct = e.target.value; } });
  const roundSel = h("select", { style: "width:auto", onchange: e => { bulk.round = e.target.value; } }, [["1000", "Làm tròn 1.000₫"], ["10000", "Làm tròn 10.000₫"], ["50000", "Làm tròn 50.000₫"], ["100000", "Làm tròn 100.000₫"]].map(([k, l]) => h("option", { value: k }, l)));
  roundSel.value = "10000";
  const applyBulk = () => {
    const x = parseFloat(bulk.pct);
    if (!x) return toast("Nhập số phần trăm muốn tăng (số dương) hoặc giảm (số âm)", "bad");
    const r = +bulk.round, list = filtered().filter(p => p.prices && p.prices.some(n => n > 0));
    if (!list.length) return toast("Không có sản phẩm có giá trong bộ lọc hiện tại", "bad");
    if (!confirm(`${x > 0 ? "Tăng" : "Giảm"} ${Math.abs(x)}% giá của ${list.length} sản phẩm đang hiển thị trong bảng?\nGiá được làm tròn ${money(r)}₫. Bạn vẫn kiểm tra lại được trước khi bấm Lưu.`)) return;
    list.forEach(p => { p.prices = p.prices.map(n => (n > 0 ? Math.max(r, Math.round(n * (1 + x / 100) / r) * r) : n)); });
    dirty(); draw(); toast(`Đã điều chỉnh giá ${list.length} sản phẩm. Kiểm tra rồi bấm Lưu thay đổi.`, "ok");
  };
  const catSel = h("select", { onchange: e => { cat = e.target.value; draw(); } }, h("option", { value: "" }, "Tất cả danh mục"), S.c.categories.map(c => h("option", { value: c.id }, c.name)));
  v.append(
    h("p", { class: "lead" }, "Sửa giá mọi sản phẩm trên một màn hình. Ô có viền vàng là giá vừa đổi; bấm \"Lưu thay đổi\" để cập nhật website."),
    h("datalist", { id: "units-q" }, ["bộ", "mét", "chiếc", "cái", "ghế", "xe"].map(u => h("option", { value: u }))),
    h("div", { class: "toolbar" }, h("input", { type: "search", placeholder: "Tìm sản phẩm…", oninput: e => { q = norm(e.target.value); draw(); } }), catSel),
    section("Điều chỉnh hàng loạt", "Áp dụng cho các sản phẩm đang hiển thị trong bảng (theo bộ lọc phía trên)",
      h("div", { class: "row" }, h("span", null, "Thay đổi giá"), pctIn, h("span", null, "%"), roundSel, h("button", { type: "button", class: "btn btn-sm", onclick: applyBulk }, "Áp dụng"))),
    body);
  draw();
};

/* ===== Tài khoản & phân quyền ===== */
VIEWS.team = async v => {
  setTitle("Tài khoản & phân quyền");
  const body = h("tbody");
  const load = async () => {
    const users = await api("GET", "/api/users");
    put(body, users.map(u => {
      const me = u.username === S.user;
      const role = h("select", { "aria-label": "Vai trò", onchange: async () => {
        try { await api("PATCH", `/api/users/${encodeURIComponent(u.username)}`, { role: role.value }); toast(`Đã đổi vai trò của ${u.name}`, "ok"); if (me) location.reload(); }
        catch (e) { toast(e.message, "bad"); role.value = u.role; }
      } }, Object.entries(ROLE_LABEL).map(([k, l]) => h("option", { value: k }, l)));
      role.value = u.role;
      return h("tr", null,
        h("td", null, h("div", { class: "row", style: "flex-wrap:nowrap" }, h("span", { class: "avatar" }, initials(u.name)), h("div", null, h("div", { class: "name" }, u.name, me && h("span", { class: "pill info", style: "margin-left:8px" }, "Bạn")), h("div", { class: "small muted" }, u.username)))),
        h("td", null, role),
        h("td", { class: "hide-sm" }, u.lastLogin ? timeVN(u.lastLogin) : h("span", { class: "muted" }, "Chưa đăng nhập")),
        h("td", { class: "num" }, h("div", { class: "row end" },
          h("button", { type: "button", class: "btn btn-sm", onclick: () => resetPw(u) }, "Đặt lại mật khẩu"),
          h("button", { type: "button", class: "btn btn-sm btn-danger", disabled: me, title: me ? "Không thể tự xóa tài khoản đang đăng nhập" : "", onclick: async () => {
            if (!confirm(`Xóa tài khoản ${u.name} (${u.username})? Người này sẽ bị đăng xuất ngay.`)) return;
            try { await api("DELETE", `/api/users/${encodeURIComponent(u.username)}`); toast("Đã xóa tài khoản"); load(); } catch (e) { toast(e.message, "bad"); }
          } }, "Xóa"))));
    }));
  };
  const resetPw = u => {
    const pw = h("input", { type: "password", autocomplete: "new-password", minlength: 8 });
    const m = modal({ title: `Đặt lại mật khẩu cho ${u.name}`, size: "sm", body: [fld("Mật khẩu mới (ít nhất 8 ký tự)", pw), h("p", { class: "small muted" }, "Người này sẽ bị đăng xuất và phải đăng nhập lại bằng mật khẩu mới.")],
      foot: [h("button", { type: "button", class: "btn", onclick: () => m.cancel() }, "Hủy"), h("button", { type: "button", class: "btn btn-dark", onclick: async () => {
        try { await api("PATCH", `/api/users/${encodeURIComponent(u.username)}`, { password: pw.value }); m.close(); toast("Đã đặt lại mật khẩu", "ok"); if (u.username === S.user) location.reload(); } catch (e) { toast(e.message, "bad"); }
      } }, "Lưu mật khẩu")] });
  };
  const err = h("p", { role: "alert", class: "form-err" });
  const add = h("form", { class: "mini-form", onsubmit: async e => {
    e.preventDefault(); err.textContent = "";
    const d = Object.fromEntries(new FormData(add));
    try { await api("POST", "/api/users", d); toast(`Đã tạo tài khoản ${d.username}`, "ok"); add.reset(); load(); } catch (x) { err.textContent = x.message; }
  } },
    fld("Tên hiển thị", h("input", { type: "text", name: "name", maxlength: 60, placeholder: "VD: Anh Tuấn – tư vấn" })),
    fld("Tên đăng nhập", h("input", { type: "text", name: "username", required: true, maxlength: 40, autocomplete: "off", placeholder: "VD: tuan" })),
    fld("Mật khẩu (ít nhất 8 ký tự)", h("input", { name: "password", type: "password", required: true, minlength: 8, autocomplete: "new-password" })),
    fld("Vai trò", (() => { const el = h("select", { name: "role" }, Object.entries(ROLE_LABEL).map(([k, l]) => h("option", { value: k }, l))); el.value = "staff"; return el; })()),
    err, h("div", { class: "wide" }, h("button", { type: "submit", class: "btn btn-dark", html: ICON.plus }, "Tạo tài khoản")));
  v.append(
    h("div", { class: "grid2" },
      h("div", { class: "note" }, h("div", null, h("b", null, "Quản trị viên: "), "toàn quyền: sửa nội dung, giá, ảnh, cài đặt, tài khoản, sao lưu, nhật ký.")),
      h("div", { class: "note" }, h("div", null, h("b", null, "Nhân viên: "), "chỉ xem và xử lý Lịch hẹn, Lịch theo tháng, Khách hàng, Thống kê; không xóa được lịch hẹn, không sửa website."))),
    h("div", { style: "height:16px" }),
    section("Các tài khoản", null, h("div", { class: "table-wrap" }, h("table", { class: "tbl" }, h("thead", null, h("tr", null, h("th", null, "Người dùng"), h("th", null, "Vai trò"), h("th", { class: "hide-sm" }, "Đăng nhập gần nhất"), h("th"))), body))),
    section("Thêm tài khoản", "Gửi tên đăng nhập và mật khẩu cho người dùng; họ có thể tự đổi mật khẩu ở mục Tài khoản của tôi.", add));
  await load();
};

/* ===== Nhật ký hoạt động ===== */
VIEWS.activity = async v => {
  setTitle("Nhật ký hoạt động");
  const all = await api("GET", "/api/activity?limit=3000");
  let q = "", who = "", act = "", shown = 200;
  const body = h("tbody"), more = h("div", { class: "row end" });
  const users = [...new Set(all.map(x => x.user))].sort(), acts = [...new Set(all.map(x => x.action))].sort();
  const draw = () => {
    const list = all.filter(x => (!who || x.user === who) && (!act || x.action === act) && (!q || norm(`${x.user} ${x.action} ${x.detail}`).includes(q)));
    put(body, list.length ? list.slice(0, shown).map(x => h("tr", null,
      h("td", { class: "nowrap small" }, timeVN(x.at)),
      h("td", { class: "nowrap" }, x.user),
      h("td", null, h("b", null, x.action)),
      h("td", { class: "small detail" }, x.detail))) : [h("tr", null, h("td", { colspan: 4 }, emptyState("history", "Chưa có hoạt động phù hợp")))]);
    put(more, list.length > shown && h("button", { type: "button", class: "btn btn-sm", onclick: () => { shown += 300; draw(); } }, `Xem thêm (${list.length - shown} dòng)`));
  };
  const selOf = (opts, label, set) => h("select", { onchange: e => { set(e.target.value); shown = 200; draw(); } }, h("option", { value: "" }, label), opts.map(o => h("option", { value: o }, o)));
  v.append(
    h("p", { class: "lead" }, "Ghi lại ai đã đăng nhập, lưu nội dung (kèm tóm tắt thay đổi như giá cũ → giá mới), xử lý lịch hẹn, tải ảnh, đổi cài đặt. Giữ 3.000 dòng gần nhất."),
    h("div", { class: "toolbar" }, h("input", { type: "search", placeholder: "Tìm trong nhật ký…", oninput: e => { q = norm(e.target.value); shown = 200; draw(); } }),
      selOf(users, "Tất cả người dùng", x => { who = x; }), selOf(acts, "Tất cả hoạt động", x => { act = x; })),
    h("div", { class: "card table-wrap" }, h("table", { class: "tbl" }, h("thead", null, h("tr", null, h("th", null, "Thời gian"), h("th", null, "Người"), h("th", null, "Hoạt động"), h("th", null, "Chi tiết"))), body)),
    h("div", { style: "height:12px" }), more);
  draw();
};
