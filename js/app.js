/* ===== Giao diện dùng chung: header, footer, carousel, lưới sản phẩm ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => n.toLocaleString("vi-VN") + " VND";
const param = k => new URLSearchParams(location.search).get(k);
/* Trang riêng từng sản phẩm (san-pham/<ten>/) ghi mã sản phẩm vào <body data-id>; trang cũ product.html dùng ?id= */
const pageId = () => document.body.dataset.id || param("id");
/* Đường dẫn chuẩn SEO của sản phẩm; liên kết cũ product.html?id=... trong nội dung cũng được đổi sang */
const pUrl = p => p.url || `product.html?id=${p.id}`;
const fixLink = u => { const m = /^product\.html\?id=([\w-]+)(#.*)?$/.exec(u || ""); const p = m && PRODUCTS.find(x => x.id === m[1]); return p ? pUrl(p) + (m[2] || "") : u; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const artRaw = art, artCache = new Map();
art = (...a) => { const k = a.join("|"); if (!artCache.has(k)) artCache.set(k, artRaw(...a)); return artCache.get(k); };

/* Hình minh họa nằm ở art.js. Ảnh chụp studio thực tế nằm ở assets/photos/ */
const catById = id => CATEGORIES.find(c => c.id === id);
const ph = (name, size = "sm") => `assets/photos/${name}-${size}.jpg?v=5`;

/* Bộ chọn ảnh: mỗi vị trí trên trang chủ lấy ảnh ít được dùng nhất của dịch vụ, nên cùng một ảnh không lặp lại */
const photoUse = new Map();
const useCount = id => photoUse.get(id) || 0;
const claimPhoto = id => { if (id) photoUse.set(id, useCount(id) + 1); return id; };
const pickFrom = list => claimPhoto(list.reduce((best, id) => (useCount(id) < useCount(best) ? id : best), list[0]));
const pickPhoto = p => (p.photos && p.photos.length ? pickFrom(p.photos) : null);
const isPhoto = p => !!(p.image || p.photos);
const imgOf = (p, i = 0, size = "sm") => {
  if (p.photos) return ph(p.photos[0], size);
  const c = p.colors[i] || p.colors[0];
  return p.image || art(catById(p.cat).shape, c[1], c[2]);
};
const altOf = p => p.photos ? (PHOTO_ALT[p.photos[0]] || p.name) : "";
/* Giá: p.price > 0 là giá niêm yết thấp nhất; p.unit là đơn vị tính; chưa có giá thì hiển thị "Liên hệ báo giá" */
const hasPrice = p => p.price > 0;
const priceOf = p => (hasPrice(p) ? money(p.price) : "Liên hệ báo giá");
const unitOf = p => (hasPrice(p) && p.unit ? `<span class="unit">/ ${esc(p.unit)}</span>` : "");
const imgFor = (p, pid, size = "sm") => (typeof pid === "string" ? ph(pid, size) : imgOf(p, 0, size));
const altFor = (p, pid) => (typeof pid === "string" ? (PHOTO_ALT[pid] || p.name) : (altOf(p) || p.name));

/* ---------- Header / Footer ---------- */
const ICONS = {
  crown: '<svg class="logo-crest" width="30" height="30" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M6 25.5 4 12l7.5 5.2L18 8l6.5 9.2L32 12l-2 13.5H6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 29.5h22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="5.5" r="1.6" fill="currentColor"/><circle cx="4" cy="9.5" r="1.4" fill="currentColor"/><circle cx="32" cy="9.5" r="1.4" fill="currentColor"/></svg>',
  search: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="7"/><path d="m20.5 20.5-4.8-4.8"/></svg>',
  phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 3.5h3.2l1.6 4.3-2.2 1.4a12 12 0 0 0 7.2 7.2l1.4-2.2 4.3 1.6V19a1.8 1.8 0 0 1-1.9 1.8A16.5 16.5 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5Z"/></svg>',
  calendar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
  sparkle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/></svg>',
  ruler: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/></svg>',
  award: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
};

const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase().trim();

function renderHeader() {
  const current = param("cat") || (PRODUCTS.find(p => p.id === pageId()) || {}).cat || "";
  const page = document.body.dataset.page || "";
  const logo = SITE.logo
    ? `<img class="logo-img logo-img--light" src="${esc(SITE.logo)}?v=2" alt="${esc(SITE.name)}"><img class="logo-img logo-img--dark" src="${esc(SITE.logo.replace(/\.svg$/, "-dark.svg"))}?v=2" alt="" aria-hidden="true">`
    : `<span class="logo-word">${esc(SITE.name)}</span>`;
  const nav = CATEGORIES.map(c => {
    const items = PRODUCTS.filter(p => p.cat === c.id);
    const tiles = c.sub.map(s => ({ s, p: items.find(p => p.sub === s) })).filter(t => t.p);
    const catImg = c.photo ? ph(c.photo) : art(c.shape, c.color, c.tex);
    return `<li class="has-mega${current === c.id ? " active" : ""}">
      <a href="category.html?cat=${c.id}">${esc(c.name)}</a>
      <div class="mega"><div class="mega-clip"><div class="mega-in">
        <ul class="mega-grid" style="--cols:${Math.min(5, tiles.length + 1)}">
          ${tiles.map(t => `<li><a href="category.html?cat=${c.id}&sub=${encodeURIComponent(t.s)}"><span class="mega-thumb"><img class="${isPhoto(t.p) ? "photo" : ""}" src="${imgOf(t.p)}" alt=""></span><span class="mega-lbl">${esc(t.s)}</span></a></li>`).join("")}
          <li><a href="category.html?cat=${c.id}"><span class="mega-thumb"><img class="${c.photo ? "photo" : ""}" src="${catImg}" alt=""></span><span class="mega-lbl">Tất cả ${esc(c.name)}</span></a></li>
        </ul>
        <div class="mega-side"><p class="mega-h">KHÁM PHÁ CHẾ TÁC</p><ul>
          <li><a href="category.html?cat=${c.id}">Tất cả về ${esc(c.name)}</a></li>
          ${items.slice(0, 4).map(p => `<li><a href="${pUrl(p)}">${esc(p.name)}</a></li>`).join("")}
          <li class="mega-sep"><a href="support.html#lien-he">Đặt lịch thi công tại xưởng →</a></li>
          <li><a href="chinh-sach.html#bao-hanh">Chính sách bảo hành</a></li>
        </ul></div>
      </div></div></div></li>`;
  }).join("");
  const tel = SITE.hotline.replace(/\s/g, "");
  $("#header").outerHTML = `<a class="skip-link" href="${esc(location.pathname + location.search)}#main">Bỏ qua đến nội dung chính</a><header class="site-header">
    <div class="wrap header-bar">
      <a class="logo" href="index.html" aria-label="${esc(SITE.name)} - Trang chủ">${logo}</a>
      <ul class="nav js-mega" id="nav">${nav}<li class="nav-mobile-only"><a href="index.html#limousine">Ghế Chủ Tịch Limousine</a></li><li class="nav-right${page === "support" ? " active" : ""}"><a href="support.html">Hỗ Trợ</a></li><li class="${page === "about" ? "active" : ""}"><a href="about.html">Giới Thiệu</a></li><li class="nav-mobile-cta"><a class="btn btn-dark" href="support.html#lien-he">Đặt lịch hẹn tại xưởng</a><a class="btn btn-outline" href="tel:${tel}">Hotline: ${esc(SITE.hotline)}</a></li></ul>
      <div class="header-icons">
        <button class="icon-btn" id="searchToggle" aria-label="Tìm kiếm" aria-expanded="false">${ICONS.search}</button>
        <a class="icon-btn" href="support.html#lien-he" aria-label="Đặt lịch thi công" title="Đặt lịch thi công">${ICONS.calendar}</a>
        <a class="icon-btn" href="tel:${tel}" aria-label="Gọi hotline ${esc(SITE.hotline)}" title="Hotline ${esc(SITE.hotline)}">${ICONS.phone}</a>
        <button class="menu-toggle" aria-label="Menu" aria-controls="nav" aria-expanded="false" id="menuToggle"><span></span></button>
      </div>
    </div>
    <div class="nav-dim" aria-hidden="true"></div>
    <form class="search-drop" id="searchDrop" action="category.html" role="search" aria-hidden="true" inert><div class="search-clip"><div class="wrap">
      <input type="search" name="q" placeholder="Tìm dịch vụ: ghế chủ tịch Limousine, da Nappa, sàn 6D, vô lăng Carbon, trần sao..." aria-label="Tìm dịch vụ">
      <button class="btn btn-dark btn-sm">Tìm kiếm</button></div></div></form>
  </header>`;
  const header = $(".site-header"), navEl = $("#nav"), menuBtn = $("#menuToggle"), drop = $("#searchDrop"), searchBtn = $("#searchToggle");
  const megaItems = $$("#nav > li.has-mega");
  let closeTimer = 0, switchTimer = 0, lastScrollAt = 0;
  const syncSolid = () => { header.classList.toggle("solid", navEl.classList.contains("open")); header.classList.toggle("search-open", drop.classList.contains("open")); };
  const closeMegaImmediate = () => {
    clearTimeout(closeTimer);
    clearTimeout(switchTimer);
    megaItems.forEach(item => item.classList.remove("mega-active"));
    header.classList.remove("mega-open", "mega-switching");
  };
  const openMega = li => {
    clearTimeout(closeTimer);
    clearTimeout(switchTimer);
    navEl.classList.remove("mega-closed");
    const wasOpen = header.classList.contains("mega-open");
    if (wasOpen && !li.classList.contains("mega-active")) {
      header.classList.add("mega-switching");
    } else if (!wasOpen) {
      header.classList.remove("mega-switching");
    }
    megaItems.forEach(item => item.classList.toggle("mega-active", item === li));
    header.classList.add("mega-open");
  };
  const scheduleCloseMega = (delay = 140) => {
    clearTimeout(closeTimer);
    clearTimeout(switchTimer);
    closeTimer = setTimeout(closeMegaImmediate, delay);
  };
  const setSearch = open => {
    if (open && navEl.classList.contains("open")) { navEl.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open"); }
    if (open) closeMegaImmediate();
    drop.classList.toggle("open", open);
    drop.setAttribute("aria-hidden", String(!open));
    drop.toggleAttribute("inert", !open);
    searchBtn.setAttribute("aria-expanded", String(open));
    syncSolid();
    if (open) setTimeout(() => drop.querySelector("input")?.focus(), 40);
  };
  const setMenu = open => {
    if (open && drop.classList.contains("open")) setSearch(false);
    navEl.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    if (open) header.classList.remove("hide");
    syncSolid();
  };
  menuBtn.onclick = () => setMenu(!navEl.classList.contains("open"));
  searchBtn.onclick = () => setSearch(!drop.classList.contains("open"));
  navEl.addEventListener("click", e => {
    if (!e.target.closest("a[href]")) return;
    if (navEl.classList.contains("open")) setMenu(false);
    navEl.classList.add("mega-closed");
    closeMegaImmediate();
  });
  $$("#nav > li").forEach(li => {
    const hasMega = li.classList.contains("has-mega");
    li.addEventListener("mouseenter", () => {
      if (Date.now() - lastScrollAt < 150) return;
      clearTimeout(closeTimer);
      if (!hasMega) {
        scheduleCloseMega(90);
        return;
      }
      if (header.classList.contains("mega-open") && !li.classList.contains("mega-active")) {
        clearTimeout(switchTimer);
        switchTimer = setTimeout(() => openMega(li), 30);
      } else {
        openMega(li);
      }
    });
    li.addEventListener("mouseleave", () => {
      clearTimeout(switchTimer);
      scheduleCloseMega(140);
    });
    li.addEventListener("focusin", () => {
      if (hasMega) openMega(li);
    });
    li.addEventListener("focusout", e => {
      if (!header.contains(e.relatedTarget)) closeMegaImmediate();
    });
  });
  $(".nav-dim", header)?.addEventListener("mouseenter", () => scheduleCloseMega(60));
  addEventListener("scroll", () => {
    lastScrollAt = Date.now();
    if (header.classList.contains("mega-open")) closeMegaImmediate();
  }, { passive: true });
  addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (navEl.classList.contains("open")) { setMenu(false); menuBtn.focus(); return; }
    if (drop.classList.contains("open")) { setSearch(false); searchBtn.focus(); return; }
    if (navEl.contains(document.activeElement) || header.classList.contains("mega-open")) {
      navEl.classList.add("mega-closed");
      closeMegaImmediate();
      document.activeElement?.blur?.();
    }
  });
}

const SOCIAL_ICONS = {
  Facebook: '<path d="M14 8.5V6.8c0-.8.5-1 1-1h2V2.2h-2.8C11.1 2.2 10.5 4.4 10.5 6v2.5H8.2V12h2.3v9.8H14V12h2.7l.4-3.5Z"/>',
  YouTube: '<path d="M22 7.6a2.8 2.8 0 0 0-2-2C18.3 5.2 12 5.2 12 5.2s-6.3 0-8 .4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.6 12 29 29 0 0 0 2 16.4a2.8 2.8 0 0 0 2 2c1.7.4 8 .4 8 .4s6.3 0 8-.4a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .4-4.4 29 29 0 0 0-.4-4.4ZM10 15.1V8.9l5.3 3.1Z"/>',
  Instagram: '<path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM16.6 2H7.4A5.4 5.4 0 0 0 2 7.4v9.2A5.4 5.4 0 0 0 7.4 22h9.2a5.4 5.4 0 0 0 5.4-5.4V7.4A5.4 5.4 0 0 0 16.6 2Zm3.6 14.6a3.6 3.6 0 0 1-3.6 3.6H7.4a3.6 3.6 0 0 1-3.6-3.6V7.4a3.6 3.6 0 0 1 3.6-3.6h9.2a3.6 3.6 0 0 1 3.6 3.6Z"/>',
  Zalo: '<rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="12" y="15.2" font-size="7.5" font-weight="700" text-anchor="middle" font-family="Arial">Zalo</text>',
};

function renderFooter() {
  const tel = esc(SITE.hotline.replace(/\s/g, ""));
  const ext = ' <span aria-hidden="true">↗</span>';
  const cols = [
    ["Sản Phẩm & Dịch Vụ", [...CATEGORIES.map(c => `<a href="category.html?cat=${c.id}">${esc(c.name)}</a>`), `<a href="category.html?cat=ghe-da&sub=${encodeURIComponent("Ghế Limousine")}">Ghế chủ tịch Limousine</a>`]],
    ["Chất Liệu & Hạng Mục", [["Ghế Chủ Tịch Limousine", "limo-hermes"], ["Ghế Limousine Maybach", "limo-maybach"], ["Ghế da Sumi Fiber", "ghe-cong-nghiep"], ["Ghế da Nappa Fiber", "ghe-nappa-6d"], ["Ghế da Nappa Fiber Pro", "ghe-da-bo-y"], ["Ghế da Nappa Clear", "ghe-nappa-clear"], ["Ghế điện", "ghe-dien"], ["Sàn ROMAN 360 Premium", "san-6d"], ["Thảm ROMAN Signature", "tham-san-duc"], ["Trần da lộn", "tran-da-lon"]].map(([n, id]) => { const p = PRODUCTS.find(x => x.id === id); return p ? `<a href="${pUrl(p)}">${n}</a>` : ""; }).filter(Boolean)],
    ["Mua Sắm & Đặt Lịch", ['<a href="category.html">Bảng giá niêm yết</a>', '<a href="support.html#lien-he">Đặt lịch thi công tại xưởng</a>', '<a href="support.html?dv=limo-hermes#lien-he">Đặt chế tác ghế Limousine</a>', '<a href="about.html#cua-hang">Trực tiếp xem mẫu da</a>', '<a href="about.html#cua-hang">Cửa hàng &amp; tổng kho</a>']],
    ["Hỗ Trợ", ['<a href="support.html">Trung tâm hỗ trợ</a>', '<a href="support.html#faq">Câu hỏi thường gặp</a>', '<a href="chinh-sach.html#bao-hanh">Chính sách bảo hành</a>', `<a href="tel:${tel}">Hotline: ${esc(SITE.hotline)}</a>`, `<a href="tel:${esc(SITE.hotline2.replace(/\s/g, ""))}">Hotline: ${esc(SITE.hotline2)}</a>`, `<a href="mailto:${esc(SITE.email)}">Email hỗ trợ${ext}</a>`]],
    ["Giới Thiệu", ['<a href="about.html">Câu chuyện thương hiệu</a>', '<a href="about.html#quy-trinh">Quy trình chế tác</a>', '<a href="about.html#cua-hang">Cửa hàng &amp; tổng kho</a>', ...(PAGES.about.jobs.items.length ? ['<a href="about.html#tuyen-dung">Tuyển dụng</a>'] : [])]],
  ];
  const badgeHtml = SITE.badge ? `<img class="foot-badge" src="${esc(SITE.badge)}" alt="${esc(SITE.name)}" width="52" height="52">` : "";
  $("#footer").outerHTML = `<footer class="site-footer">
    <section class="foot-cta" aria-label="Đặt lịch xem mẫu"><div class="foot-cta-in">
      <div><p class="sec-eyebrow">${esc(SITE.name)} · Xưởng chế tác</p><h2>Trải nghiệm chất liệu trực tiếp tại xưởng</h2></div>
      <div class="row"><a class="btn btn-dark" href="support.html#lien-he">Đặt lịch xem mẫu</a><a class="btn btn-outline" href="tel:${tel}">Gọi ${esc(SITE.hotline)}</a></div>
    </div></section>
    <div class="foot-in">
    <div class="foot-grid">${cols.map(([t, l]) => `<div class="foot-col"><h2 class="foot-h">${t}</h2><ul>${l.map(x => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>
    <div class="foot-info">${badgeHtml}<p>Bản quyền ©${new Date().getFullYear()} ${esc(SITE.name)} bảo lưu mọi quyền.<br>${SITE.legalName ? `${esc(SITE.legalName)}${SITE.taxCode ? ` · MST: ${esc(SITE.taxCode)}` : ""}<br>` : ""}Cửa hàng: ${esc(SITE.store)}<br>Tổng kho: ${esc(SITE.warehouse)}<br>${SITE.hours ? `Giờ mở cửa: ${esc(SITE.hours)}<br>` : ""}Hotline: <b>${esc(SITE.hotline)}</b> – <b>${esc(SITE.hotline2)}</b> · Email: ${esc(SITE.email)}</p></div>
    <div class="foot-bottom"><div class="foot-legal"><b>Việt Nam/Tiếng Việt</b><a href="chinh-sach.html#dieu-khoan">Điều khoản sử dụng</a><a href="chinh-sach.html#bao-mat">Bảo mật</a><a href="so-do-trang.html">Sơ đồ trang</a></div>
      <div class="foot-social"${SOCIAL.some(x => x.url) ? "" : " hidden"}><span>Kết nối với Chúng tôi</span>${SOCIAL.filter(x => x.url).map(x => `<a href="${esc(x.url)}" aria-label="${esc(x.name)}" target="_blank" rel="noopener"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${SOCIAL_ICONS[x.name] || ""}</svg></a>`).join("")}</div></div>
  </div></footer>
  <button class="to-top" id="toTop" aria-label="Lên đầu trang" hidden><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M5 11.5 12 4.5l7 7"/></svg></button>`;
  const btn = $("#toTop");
  addEventListener("scroll", () => { btn.hidden = scrollY < 800; }, { passive: true });
  btn.onclick = () => { scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); $(".logo").focus(); };
}

/* ---------- Thẻ sản phẩm ---------- */
function productCard(p, pid) {
  const cat = catById(p.cat);
  const catLabel = p.sub === "Ghế Limousine" ? "Ghế Limousine" : (cat ? cat.name : p.sub);
  return `<article class="card">
    <a class="thumb" href="${pUrl(p)}">
      ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ""}
      <img class="${isPhoto(p) ? "photo" : ""}" src="${imgFor(p, pid)}" alt="${esc(altFor(p, pid))}" loading="lazy">
    </a>
    <div class="card-body">
      <div class="card-meta">
        <span class="card-cat">${esc(catLabel)}</span>
        <div class="swatches" aria-label="Tùy chọn màu">${p.colors.map(c => `<span class="sw" title="${esc(c[0])}" style="background:${esc(c[1])}"></span>`).join("")}</div>
      </div>
      <h3><a href="${pUrl(p)}">${esc(p.name)}</a></h3>
      <p>${esc(p.short)}</p>
      <div class="price">
        <div class="price-top">
          <span class="from">${hasPrice(p) ? "Giá niêm yết từ" : "Giá dịch vụ"}</span>
          ${p.old ? `<span class="price-save">Tiết kiệm ${money(p.old - p.price)}</span>` : ""}
        </div>
        <div class="price-row">
          <b>${priceOf(p)}</b>${unitOf(p)}
          ${p.old ? `<s>${money(p.old)}</s>` : ""}
        </div>
      </div>
      <div class="card-actions">
        <a class="btn btn-dark btn-sm" href="${pUrl(p)}">Tìm hiểu thêm</a>
        <a class="btn btn-outline btn-sm" href="support.html?dv=${p.id}#lien-he">Đặt lịch</a>
      </div>
    </div></article>`;
}

/* ---------- Trang chủ ---------- */
const collage = list => `<div class="collage n${list.length}">${list.map((a, i) => `<img class="c${i}" src="${art(...a)}" alt="">`).join("")}</div>`;
let ribbonN = 0;
const ribbon = hue => `<svg class="ribbon" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
  <defs><linearGradient id="rb${hue}-${ribbonN}" x1="0" x2="1"><stop offset="0" stop-color="hsl(${hue} 85% 42%)" stop-opacity=".15"/><stop offset=".35" stop-color="hsl(${hue} 85% 45%)"/><stop offset=".7" stop-color="hsl(${hue} 90% 62%)"/><stop offset="1" stop-color="hsl(${hue} 85% 45%)" stop-opacity=".25"/></linearGradient></defs>
  <path d="M520 700C760 420 960 820 1180 540S1400 300 1520 360" stroke="url(#rb${hue}-${ribbonN++})" stroke-width="120" fill="none" stroke-linecap="round"/>
  <path d="M520 652C760 372 960 772 1180 492S1400 252 1520 312" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/>
  <path d="M520 742C760 462 960 862 1180 582S1400 342 1520 402" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/></svg>`;

function initRail(sec) {
  const rail = $(".rail", sec), bar = $(".rail-bar span", sec), [prev, next] = $$(".rail-btn", sec);
  let raf = 0;
  const draw = () => {
    raf = 0;
    const max = rail.scrollWidth - rail.clientWidth, w = rail.scrollWidth ? rail.clientWidth / rail.scrollWidth : 1, x = rail.scrollLeft;
    bar.style.width = Math.min(100, w * 100) + "%";
    bar.style.transform = `translateX(${(max > 0 ? x / max : 0) * (1 / w - 1) * 100}%)`;
    prev.disabled = x <= 2;
    next.disabled = x >= max - 2;
  };
  const sync = () => { if (!raf) raf = requestAnimationFrame(draw); };
  $$(".rail-btn", sec).forEach(b => b.onclick = () => {
    const card = rail.querySelector(".rcard");
    const gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) || 24;
    const step = card ? (card.getBoundingClientRect().width + gap) * 2 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: +b.dataset.dir * step, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  /* B?ng chuy?n ch? cu?n ngang: n?u b? l?ch d?c (b?m Tab, cu?n t?i ph?n t?...) th? ??a v? ngay */
  rail.addEventListener("scroll", () => { if (rail.scrollTop) rail.scrollTop = 0; sync(); }, { passive: true }); addEventListener("resize", sync); draw();
}
const railShell = (title, items) => `<h2 class="rail-title">${esc(title)}</h2>
  <div class="rail-stage">
    <button class="rail-btn rail-btn--prev" data-dir="-1" aria-label="Tr??c"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
    <div class="rail" role="region" aria-label="${esc(title)}" tabindex="0">${items}</div>
    <button class="rail-btn rail-btn--next" data-dir="1" aria-label="Sau"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
  </div>
  <div class="rail-ctrl"><div class="rail-bar"><span></span></div></div>`;

const videoAsset = name => `assets/video/${name}?v=2`;

function initHome() {
  /* Hero (hd08-hero-kv-home) */
  const slides = HERO_SLIDES.map((s, i) => `<div class="hero-slide${s.photo ? " has-photo" : ""}${s.dark ? " is-dark" : ""}" style="background:${esc(s.bg)};--banner-bg:${esc(s.bg)}${s.photo ? `;--hero-img:url('${new URL(s.video ? videoAsset(s.video + "-poster-sm.jpg") : ph(s.photo, "sm"), document.baseURI).href}')` : ""}">${s.photo
      ? (s.video
        ? `<div class="hero-photo hero-photo--video" role="img" aria-label="${esc(s.alt || "")}"><video class="hero-video" data-src="${esc(s.video)}" muted playsinline webkit-playsinline x5-playsinline x5-video-player-type="h5-page" controlslist="nofullscreen nodownload noremoteplayback" preload="${i ? "none" : "metadata"}" poster="${videoAsset(s.video + "-poster.jpg")}" aria-hidden="true" tabindex="-1" disablepictureinpicture disableremoteplayback></video></div>`
        : `<div class="hero-photo"><img src="${ph(s.photo, "lg")}" alt="${esc(s.alt || "")}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></div>`)
      : ribbon(s.hue)}
    <div class="hero-inner">
      <div class="hero-copy">
        ${s.eyebrow ? `<p class="hero-eyebrow">${esc(s.eyebrow)}</p>` : ""}
        <${i ? "h2" : "h1"} class="hero-title">${esc(s.title)}</${i ? "h2" : "h1"}>
        <p class="hero-sub">${esc(s.sub)}</p>
        <div class="hero-ctas">
          <a class="btn btn-link" href="support.html#lien-he">Đặt lịch</a>
          <a class="btn btn-outline" href="${esc(fixLink(s.link))}">${esc(s.cta)}</a>
        </div>
      </div>
      ${s.photo ? "" : collage(s.art)}
    </div></div>`).join("");
  $("#hero").innerHTML = `<div class="hero-track" id="track">${slides}</div>
    <div class="hero-controls">
      <button class="hero-nav" id="heroPrev" aria-label="Slide trước"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
      <div class="dots" id="dots">${HERO_SLIDES.map((_, i) => `<button aria-label="Slide ${i + 1}: ${esc(HERO_SLIDES[i].title)}"></button>`).join("")}</div>
      <button class="hero-nav" id="heroNext" aria-label="Slide tiếp theo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
      <button class="hero-pause" id="pause" aria-label="Tạm dừng">❚❚</button>
    </div>`;
  let idx = 0, timer, hold = false, paused = false, offscreen = false;
  const hero = $("#hero");
  const slideEls = $$(".hero-slide");
  const dotEls = $$("#dots button");
  const small = matchMedia("(max-width: 900px)");
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  /* Một số trình duyệt trong ứng dụng (Zalo, Facebook, Messenger...) không cho phát video ngay trong trang:
     hễ gọi play() là bật trình phát toàn màn hình, nên mỗi lần cuộn qua banner video lại tự mở lên.
     Gặp trường hợp đó: thoát toàn màn hình, tắt video (chỉ giữ ảnh tĩnh) cho cả phiên truy cập. */
  let inlineBlocked = false;
  try { inlineBlocked = sessionStorage.getItem("roman-no-inline-video") === "1"; } catch (e) {}
  const noVid = () => saveData || inlineBlocked;
  const videos = slideEls.map(sl => sl.querySelector("video"));
  const FALLBACK_MS = 5500;

  /* Nạp nguồn video theo kích thước màn hình; chỉ nạp khi cần (slide đầu ngay, slide sau khi sắp tới lượt) */
  const loadVideo = v => {
    if (!v || v.dataset.ready || noVid()) return;
    v.dataset.ready = "1";
    v.src = videoAsset(v.dataset.src + (small.matches ? "-sm" : "") + ".mp4");
    v.preload = "auto";
    v.load();
  };
  const setProgress = (i, p) => dotEls[i] && dotEls[i].style.setProperty("--p", p.toFixed(3));
  const shouldPlay = () => !paused && !hold && !offscreen && !document.hidden;
  const playActive = () => {
    const v = videos[idx];
    if (!v || noVid() || !shouldPlay()) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => scheduleFallback());
  };
  const pauseAll = () => videos.forEach(v => v && v.pause());
  function blockInline() {
    if (inlineBlocked) return;
    inlineBlocked = true;
    try { sessionStorage.setItem("roman-no-inline-video", "1"); } catch (e) {}
    videos.forEach(v => {
      if (!v) return;
      try { if (v.webkitDisplayingFullscreen && v.webkitExitFullscreen) v.webkitExitFullscreen(); } catch (e) {}
      try { if (document.pictureInPictureElement === v) document.exitPictureInPicture(); } catch (e) {}
      v.pause();
      v.classList.remove("is-playing");
    });
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (fs) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} }
    scheduleFallback();
  }
  const next = () => go(idx + 1);

  /* Hẹn giờ chuyển slide: slide có video chuyển khi video chạy hết; slide không có video chuyển sau 5,5 giây */
  const scheduleFallback = () => {
    clearTimeout(timer);
    if (!shouldPlay()) return;
    const v = videos[idx];
    const live = v && !noVid() && v.readyState >= 2 && !v.paused;
    if (live) return; // sự kiện "ended" sẽ chuyển slide
    timer = setTimeout(next, FALLBACK_MS);
  };

  videos.forEach((v, i) => {
    if (!v) return;
    v.addEventListener("timeupdate", () => { if (i === idx && v.duration) setProgress(i, v.currentTime / v.duration); });
    v.addEventListener("ended", () => { if (i === idx) next(); });
    v.addEventListener("error", () => { if (i === idx) scheduleFallback(); });
    v.addEventListener("playing", () => v.classList.add("is-playing"));
    v.addEventListener("webkitbeginfullscreen", blockInline);
    v.addEventListener("enterpictureinpicture", blockInline);
    v.addEventListener("webkitpresentationmodechanged", () => { if (v.webkitPresentationMode && v.webkitPresentationMode !== "inline") blockInline(); });
  });
  ["fullscreenchange", "webkitfullscreenchange"].forEach(t => document.addEventListener(t, () => {
    const el = document.fullscreenElement || document.webkitFullscreenElement;
    if (el && (el.tagName === "VIDEO" || el.querySelector?.(".hero-video"))) blockInline();
  }));

  const go = n => {
    const prev = idx;
    idx = (n + HERO_SLIDES.length) % HERO_SLIDES.length;
    $("#track").style.transform = `translateX(-${idx * 100}%)`;
    dotEls.forEach((b, i) => { b.classList.toggle("on", i === idx); b.setAttribute("aria-current", i === idx); if (i !== idx) setProgress(i, i < idx ? 1 : 0); });
    slideEls.forEach((s, i) => { s.classList.toggle("is-active", i === idx); s.setAttribute("aria-hidden", i !== idx); s.inert = i !== idx; });
    /* video: slide cũ dừng sau khi mờ xong, slide mới phát từ đầu; nạp trước video kế tiếp */
    const pv = videos[prev];
    if (pv && prev !== idx) setTimeout(() => { if (idx !== prev) { pv.pause(); pv.currentTime = 0; } }, 1200);
    const v = videos[idx];
    if (v) { loadVideo(v); try { v.currentTime = 0; } catch (e) {} setProgress(idx, 0); }
    loadVideo(videos[(idx + 1) % videos.length]);
    clearTimeout(timer);
    if (v && !noVid()) { playActive(); timer = setTimeout(() => { if (shouldPlay() && v.paused) scheduleFallback(); }, 2500); }
    else scheduleFallback();
  };
  const auto = () => { clearTimeout(timer); if (!shouldPlay()) { pauseAll(); return; } videos[idx] && !noVid() ? playActive() : null; scheduleFallback(); };

  hero.addEventListener("focusin", () => { hold = true; auto(); });
  hero.addEventListener("focusout", e => { if (!hero.contains(e.relatedTarget)) { hold = false; auto(); } });
  document.addEventListener("visibilitychange", () => { auto(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { offscreen = e.intersectionRatio < 0.25; auto(); }, { threshold: [0, 0.25, 0.5] }).observe(hero);
  }
  dotEls.forEach((b, i) => b.onclick = () => go(i));
  $("#heroPrev").onclick = () => go(idx - 1);
  $("#heroNext").onclick = () => go(idx + 1);
  const pauseBtn = $("#pause");
  const syncPause = () => { pauseBtn.textContent = paused ? "▶" : "❚❚"; pauseBtn.setAttribute("aria-label", paused ? "Phát video và tự chuyển slide" : "Tạm dừng video và tự chuyển slide"); };
  pauseBtn.onclick = () => { paused = !paused; syncPause(); auto(); };
  syncPause(); go(0);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("hero-entered")));
  } else {
    hero.classList.add("hero-entered");
  }

  /* Tìm sản phẩm theo xe + tư vấn chọn sàn/thảm (js/finder.js) */
  if (typeof initFinder === "function") initFinder();

  /* Chiếm trước ảnh của các banner lớn để thẻ và mục khác không lấy trùng */
  FEATURES.forEach(f => claimPhoto(f.photo));
  if (typeof LIMOUSINE !== "undefined") claimPhoto(LIMOUSINE.photo);

  /* Chuỗi 3 Feature KV toàn chiều rộng (co76-feature-kv) + 4 thẻ vuông (co73-feature-cards) */
  $("#features").innerHTML = FEATURES.map(f => `
    <section class="kv kv--${f.side}${f.dark ? " kv--dark" : ""}${f.photo ? " has-photo" : ""} kv--photo-${esc(f.photo || "")}" style="background:${esc(f.bg)};--banner-bg:${esc(f.bg)}">${f.photo
      ? `<div class="kv-photo"><img src="${ph(f.photo, "xl")}" alt="${esc(f.alt || "")}" loading="lazy"></div>`
      : ribbon(f.hue)}
      <div class="kv-inner">
        <div class="kv-copy">
          ${f.eyebrow ? `<p class="kv-eyebrow">${esc(f.eyebrow)}</p>` : ""}
          <h2>${esc(f.title)}</h2>
          <p>${esc(f.sub)}</p>
          <div class="kv-ctas">
            <a class="btn btn-link" href="support.html?dv=${esc(f.book || "")}#lien-he">Đặt lịch</a>
            <a class="btn btn-outline" href="${esc(fixLink(f.link))}">${esc(f.cta || "Khám phá")}</a>
          </div>
        </div>
        ${f.photo ? "" : collage(f.art)}
      </div>
    </section>
    <section class="fcards">${f.cards.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean).map(p => { const pid = pickPhoto(p); return `<a class="fcard${isPhoto(p) ? " has-photo" : ""}" href="${pUrl(p)}">
        <div class="fcard-head">
          <h3>${esc(p.nick)}</h3>
        </div>
        <div class="fcard-media">
          <img src="${imgFor(p, pid)}"${pid ? ` srcset="${ph(pid, "sm")} 960w, ${ph(pid, "lg")} 1440w" sizes="(max-width: 900px) 288px, (max-width: 1180px) 48vw, 330px"` : ""} alt="${esc(pid ? (PHOTO_ALT[pid] || p.nick) : (altOf(p) || p.nick))}" loading="lazy">
        </div>
        <div class="fcard-foot">
          <span class="btn btn-dark btn-sm fcard-cta">Tìm hiểu thêm</span>
        </div>
      </a>`; }).join("")}
    </section>`).join("");

  /* Được đề xuất cho bạn (co78-recommended-product-carousel) */
  const rec = PRODUCTS.filter(p => p.tag && !String(p.id).startsWith("limo-")).map(p => { const pid = pickPhoto(p); return `<a class="rcard" href="${pUrl(p)}">
      <div class="rimg${isPhoto(p) ? " photo" : ""}">
        ${p.tag ? `<span class="rtag">${esc(p.tag)}</span>` : ""}
        <img src="${imgFor(p, pid)}" alt="${esc(altFor(p, pid))}" loading="lazy">
      </div>
      <div class="rbody">
        <h3>${esc(p.name)}</h3>
        <div class="rprice-wrap">
          <div class="rprice-top">
            <span class="rprice-lbl">${hasPrice(p) ? "Giá niêm yết từ" : "Giá dịch vụ"}</span>
            ${p.old ? `<p class="rdisc"><span>Tiết kiệm ${money(p.old - p.price)}</span></p>` : `<p class="rdisc rdisc--empty" aria-hidden="true">&nbsp;</p>`}
          </div>
          <div class="rprice-row">
            <p class="rprice"><b>${priceOf(p)}</b>${unitOf(p)}</p>
            ${p.old ? `<s class="rold">${money(p.old)}</s>` : ""}
          </div>
        </div>
      </div></a>`; }).join("");
  $("#rec").innerHTML = railShell("Được đề xuất cho bạn", rec);
  initRail($("#rec"));

  /* Khám phá những câu chuyện (co75-explore-carousel) */
  const st = STORIES.map(s => { const sid = s.pool && s.pool.length ? pickFrom(s.pool) : s.photo; return `<a class="rcard scard" href="${esc(fixLink(s.link))}">
    <div class="rimg${sid ? " photo" : ""}" style="background:${esc(s.bg)}">
      <img src="${sid ? ph(sid) : art(...s.art)}" alt="${esc(s.title)}" loading="lazy">
    </div>
    <div class="rbody">
      <h3>${esc(s.title)}</h3>
    </div></a>`; }).join("");
  $("#stories").innerHTML = railShell("Khám phá những câu chuyện", st);
  initRail($("#stories"));

  /* Thiết kế & Sản xuất Ghế Chủ Tịch Limousine (Cuối trang chủ) */
  if ($("#limousine") && typeof LIMOUSINE !== "undefined") {
    const limoSubUrl = `category.html?cat=ghe-da&sub=${encodeURIComponent("Ghế Limousine")}`;
    const limoItems = LIMOUSINE.cards.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
    $("#limousine").innerHTML = `
      <div class="kv kv--left has-photo limo-kv" style="background:${esc(LIMOUSINE.bg)};--banner-bg:${esc(LIMOUSINE.bg)}">
        <div class="kv-photo"><img src="${ph(LIMOUSINE.photo, "xl")}" alt="${esc(LIMOUSINE.alt)}" loading="lazy"></div>
        <div class="kv-inner">
          <div class="kv-copy">
            <div class="limo-badge-row">
              ${SITE.badge ? `<img class="limo-crest" src="${esc(SITE.badge)}" alt="" width="36" height="36">` : ""}
              <p class="kv-eyebrow">${esc(LIMOUSINE.eyebrow)}</p>
            </div>
            <h2>${esc(LIMOUSINE.title)}</h2>
            <p>${esc(LIMOUSINE.sub)}</p>
            <div class="kv-ctas">
              <a class="btn btn-link" href="support.html?dv=limo-hermes#lien-he">Đặt lịch</a>
              <a class="btn btn-dark" href="${limoSubUrl}">Xem các mẫu ghế</a>
            </div>
          </div>
        </div>
      </div>
      <div class="wrap limo-body">
        <div class="limo-head">
          <div>
            <p class="sec-eyebrow">BỘ SƯU TẬP LIMOUSINE</p>
            <h3 class="section-title">Ghế Chủ Tịch &amp; Khoang Thương Gia</h3>
          </div>
          <a class="btn btn-outline btn-sm" href="${limoSubUrl}">Xem tất cả</a>
        </div>
        <div class="grid limo-grid">${limoItems.map(p => productCard(p, pickPhoto(p))).join("")}</div>
        <div class="limo-pillars" aria-label="Quy trình thiết kế và sản xuất ghế chủ tịch Limousine">
          ${LIMOUSINE.pillars.map(pl => `<article class="limo-pillar">
            <span class="process-num">${esc(pl.num)}</span>
            <h4>${esc(pl.title)}</h4>
            <p>${esc(pl.desc)}</p>
          </article>`).join("")}
        </div>
      </div>`;
  }

  /* Ghi chú cuối trang (.text-editor.bg-light-gray) */
  $("#notes").innerHTML = `<div class="notes-in">${NOTES.map(n => `<p>*${esc(n)}</p>`).join("")}</div>`;
}

/* ---------- Trang danh mục / tìm kiếm ---------- */
function initCategory() {
  const catId = param("cat"), rawSub = param("sub"), rawQ = (param("q") || "").trim(), qNorm = norm(rawQ);
  const qTokens = qNorm ? qNorm.split(/\s+/).filter(Boolean) : [];
  const cat = catById(catId);
  const matchedSub = (cat && rawSub) ? cat.sub.find(s => s === rawSub || norm(s) === norm(rawSub)) : rawSub;
  const sub = matchedSub || rawSub;
  const subNorm = norm(sub);
  let sort = "default";
  const title = rawQ ? `Kết quả cho "${rawQ}"` : (sub || (cat ? cat.name : "Tất cả dịch vụ chế tác"));
  document.title = `${title} | ${SITE.name}`;
  $("#crumbs").innerHTML = `<a href="index.html">Trang chủ</a> / ${cat ? `<a href="category.html?cat=${cat.id}">${esc(cat.name)}</a>` : "Dịch vụ"}${sub ? ` / ${esc(sub)}` : ""}`;
  /* Mỗi danh mục là một trang riêng với Google: canonical theo danh mục đang xem */
  const can = $('link[rel="canonical"]');
  if (can) can.href = new URL(cat ? `category.html?cat=${cat.id}` : "category.html", can.href).href;
  $("#title").textContent = title;
  let subEl = $("#catDesc");
  if (!subEl) {
    subEl = document.createElement("p");
    subEl.id = "catDesc";
    subEl.className = "cat-lead";
    $("#title").after(subEl);
  }
  subEl.textContent = cat ? cat.desc : `Khám phá trọn bộ ${PRODUCTS.length} gói chế tác và nâng cấp nội thất ô tô thủ công chuẩn form tại ROMAN Bespoke Atelier.`;
  const qChip = rawQ ? `<a class="chip on" id="clearSearchChip" href="category.html" title="Xóa bộ lọc tìm kiếm">Từ khóa: "${esc(rawQ.length > 26 ? rawQ.slice(0, 26) + "…" : rawQ)}" ✕</a>` : "";
  if (cat) $("#chips").innerHTML = [`<a class="chip ${!sub ? "on" : ""}" href="category.html?cat=${cat.id}">Tất cả ${esc(cat.name)}</a>`, ...cat.sub.map(s => `<a class="chip ${norm(s) === subNorm ? "on" : ""}" href="category.html?cat=${cat.id}&sub=${encodeURIComponent(s)}">${esc(s)}</a>`)].join("");
  else $("#chips").innerHTML = [qChip, `<a class="chip ${!rawQ ? "on" : ""}" href="category.html">Tất cả (${PRODUCTS.length})</a>`, ...CATEGORIES.map(c => `<a class="chip" href="category.html?cat=${c.id}">${esc(c.name)}</a>`)].filter(Boolean).join("");

  const draw = () => {
    let list = PRODUCTS.filter(p => {
      if (cat && p.cat !== cat.id) return false;
      if (sub && norm(p.sub) !== subNorm) return false;
      if (!qTokens.length) return true;
      const hay = norm([p.name, p.nick, p.short, p.sub, catById(p.cat)?.name, ...p.colors.map(c => c[0]), ...p.highlights].join(" "));
      return qTokens.every(t => hay.includes(t));
    });
    if (sort === "asc") list.sort((a, b) => (a.price || 1e15) - (b.price || 1e15));
    if (sort === "desc") list.sort((a, b) => (b.price || -1) - (a.price || -1));
    $("#count").textContent = `${list.length} dịch vụ`;
    $("#list").innerHTML = list.length ? list.map(productCard).join("") : "";
    $("#empty").hidden = list.length > 0;
  };
  $("#sort").onchange = e => { sort = e.target.value; draw(); };
  draw();
}

/* ---------- Trang chi tiết ---------- */
function initProduct() {
  const p = PRODUCTS.find(x => x.id === pageId());
  /* Mở bằng địa chỉ cũ product.html?id=... thì chuyển sang địa chỉ chuẩn SEO */
  if (p && p.url && !document.body.dataset.id) { location.replace(p.url + location.hash); return; }
  if (!p) { $("#pd").innerHTML = `<div class="empty">Không tìm thấy dịch vụ. <a href="index.html" style="text-decoration:underline">Về trang chủ</a></div>`; $("#related").closest("section").hidden = true; return; }
  const cat = catById(p.cat);
  const subUrl = p.sub ? `category.html?cat=${cat.id}&sub=${encodeURIComponent(p.sub)}` : `category.html?cat=${cat.id}`;
  document.title = `${p.name} | ${SITE.name}`;
  $("#crumbs").innerHTML = `<a href="index.html">Trang chủ</a> / <a href="category.html?cat=${cat.id}">${esc(cat.name)}</a>${p.sub ? ` / <a href="${subUrl}">${esc(p.sub)}</a>` : ""} / ${esc(p.name)}`;
  let color = 0, option = 0, shot = 0;
  const colorShotMap = {
    "ghe-nappa-6d": { 0: 0, 1: 1, 2: 2, 3: 4 },
    "ghe-da-bo-y": { 0: 0, 1: 2, 2: 3, 3: 1 },
    "limo-hermes": { 0: 0, 1: 3, 2: 2, 3: 1 },
    "limo-maybach": { 0: 0, 1: 3, 2: 1, 3: 2 },
    "limo-crystal": { 0: 0, 1: 1, 2: 2, 3: 3 },
    "limo-bang-ba": { 0: 0, 1: 1, 2: 3, 3: 2 },
  };
  const render = focusSel => {
    const totalShots = p.photos ? p.photos.length : p.colors.length;
    const currentAlt = p.photos ? (PHOTO_ALT[p.photos[shot]] || p.name) : p.name;
    const selColor = p.colors[color] || p.colors[0];
    const selOpt = p.options[option] || p.options[0];
    const selPrice = p.prices ? (p.prices[option] || p.prices[0]) : p.price;
    const gallery = p.photos
      ? `<div class="gallery photo">
          <div class="main">
            <img id="mainImg" src="${ph(p.photos[shot], "lg")}" alt="${esc(currentAlt)}">
            <div class="gal-config-pill" id="galConfigPill"><span class="color-dot" style="background:${esc(selColor[1])}"></span><span id="galConfigText">Cấu hình: <b>${esc(selColor[0])}</b> · ${esc(selOpt)}</span></div>
            ${totalShots > 1 ? `<button class="gal-arrow gal-prev" data-step="-1" aria-label="Ảnh trước">‹</button><button class="gal-arrow gal-next" data-step="1" aria-label="Ảnh tiếp theo">›</button>` : ""}
            <div class="gal-caption"><span>${esc(currentAlt)}</span><b>${shot + 1} / ${totalShots}</b></div>
          </div>
          <div class="thumbs">${p.photos.map((n, i) => `<button class="${i === shot ? "on" : ""}" data-s="${i}" aria-pressed="${i === shot}" aria-label="Ảnh ${i + 1}: ${esc(PHOTO_ALT[n] || p.name)}"><img src="${ph(n)}" alt=""></button>`).join("")}</div>
        </div>`
      : `<div class="gallery"><div class="main"><img src="${imgOf(p, color)}" alt="${esc(p.name)}"></div>
        <div class="thumbs">${p.colors.map((c, i) => `<button class="${i === color ? "on" : ""}" data-c="${i}" aria-pressed="${i === color}" aria-label="${esc(c[0])}"><img src="${imgOf(p, i)}" alt=""></button>`).join("")}</div></div>`;
    $("#pd").innerHTML = `${gallery}
      <div class="pd-info">
        <div class="pd-badges">
          <a class="pd-cat-pill" href="${subUrl}">${esc(cat.name)} · ${esc(p.sub)}</a>
          ${p.tag ? `<span class="pd-tag-pill">${esc(p.tag)}</span>` : ""}
        </div>
        <h1>${esc(p.name)}</h1>
        <p class="lead">${esc(p.short)}</p>
        <div class="pd-price-box">
          <div class="pd-price">
            <span class="from">${selPrice > 0 ? (p.prices ? "Giá niêm yết · " + esc(selOpt) : "Giá niêm yết") : "Giá dịch vụ"}</span>
            <b>${selPrice > 0 ? money(selPrice) : "Liên hệ báo giá"}</b>${selPrice > 0 && p.unit ? `<span class="unit">/ ${esc(p.unit)}</span>` : ""}
            ${p.old ? `<s>${money(p.old)}</s><span class="pd-save">Tiết kiệm ${money(p.old - p.price)}</span>` : ""}
          </div>
          <p class="pd-price-note">${selPrice > 0 ? "Giá niêm yết theo bảng giá ROMAN. Liên hệ để được báo giá chính xác theo xe của bạn." : "Liên hệ ROMAN để được báo giá theo dòng xe và yêu cầu của bạn."}</p>
        </div>
        <div class="opt-label">Tùy chọn màu sắc &amp; bề mặt: <span>${esc(selColor[0])}</span></div>
        <div class="opt-row">${p.colors.map((c, i) => `<button class="color-chip ${i === color ? "on" : ""}" data-c="${i}" aria-pressed="${i === color}"><span class="color-dot" style="background:${esc(c[1])}"></span><span>${esc(c[0])}</span></button>`).join("")}</div>
        <div class="opt-label">${esc(p.optionLabel || "Tùy chọn cấu hình")}: <span>${esc(selOpt)}</span></div>
        <div class="opt-row">${p.options.map((o, i) => `<button class="opt ${i === option ? "on" : ""}" data-o="${i}" aria-pressed="${i === option}">${esc(o)}${p.prices && new Set(p.prices).size > 1 ? `<small>${money(p.prices[i])}</small>` : ""}</button>`).join("")}</div>
        <div class="pd-cta">
          <a class="btn btn-dark" href="support.html?dv=${p.id}&mau=${encodeURIComponent(selColor[0])}&opt=${encodeURIComponent(selOpt)}#lien-he">Đặt lịch thi công ngay</a>
          <a class="btn btn-outline" href="tel:${SITE.hotline.replace(/\s/g, "")}">Gọi tư vấn ${esc(SITE.hotline)}</a>
        </div>
        <div class="pd-assure">
          <div>${ICONS.shield}<span>Xem mẫu và chọn màu tại cửa hàng</span></div>
          <div>${ICONS.ruler}<span>Giá niêm yết theo từng dòng xe</span></div>
          <div>${ICONS.award}<span>${p.specs["Bảo hành"] ? "Bảo hành chính hãng " + esc(p.specs["Bảo hành"]) : "Bảo hành theo chính sách ROMAN"}</span></div>
        </div>
        <h2 class="pd-sec-h">Đặc điểm nổi bật</h2>
        <ul class="hl">${p.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>
        <h2 class="pd-sec-h">Thông số &amp; Quy chuẩn dịch vụ</h2>
        <table class="specs">${Object.entries(p.specs).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>
        ${p.cat === "ghe-da" && p.sub === "Ghế da ROMAN" && typeof MATERIALS !== "undefined" ? `<h2 class="pd-sec-h">Các loại da Nappa</h2>
        <div class="mat-grid">${MATERIALS.map(m => `<article class="mat-card"><h3>${esc(m.name)}</h3><ul>${m.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul></article>`).join("")}</div>` : ""}
      </div>`;
    $$("[data-c]").forEach(b => b.onclick = () => {
      color = +b.dataset.c;
      if (colorShotMap[p.id] && colorShotMap[p.id][color] !== undefined) shot = colorShotMap[p.id][color];
      render(`[data-c="${color}"]`);
    });
    $$("[data-o]").forEach(b => b.onclick = () => { option = +b.dataset.o; render(`[data-o="${option}"]`); });
    $$("[data-s]").forEach(b => b.onclick = () => { shot = +b.dataset.s; render(`[data-s="${shot}"]`); });
    $$("[data-step]").forEach(b => b.onclick = () => { shot = (shot + (+b.dataset.step) + totalShots) % totalShots; render(`[data-step="${b.dataset.step}"]`); });
    if (focusSel) $(focusSel, $("#pd"))?.focus();
  };
  render();
  const sameSub = PRODUCTS.filter(x => x.cat === p.cat && x.sub === p.sub && x.id !== p.id);
  const sameCat = PRODUCTS.filter(x => x.cat === p.cat && x.sub !== p.sub && x.id !== p.id);
  const others = PRODUCTS.filter(x => x.cat !== p.cat && x.tag);
  $("#related").innerHTML = [...sameSub, ...sameCat, ...others].slice(0, 4).map(productCard).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  const page = document.body.dataset.page;
  $("main")?.setAttribute("id", "main");
  const header = $(".site-header");
  /* Header: kính mờ sang trọng, ẩn khi cuộn xuống, hiện lại khi cuộn lên */
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("scrolled", y > 8);
    const busy = header.matches(":focus-within") || $("#searchDrop")?.classList.contains("open") || $("#nav").classList.contains("open") || header.classList.contains("mega-open");
    header.classList.toggle("hide", y > 240 && y > lastY && !busy);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (page === "home") initHome();
  if (page === "category") initCategory();
  if (page === "product") initProduct();
  if (page === "sitemap") initSitemap();
  if (page === "about") initAbout();
  if (page === "policy") initPolicy();
  if (page === "support") initSupport();
  initReveal();
  /* Thống kê truy cập ẩn danh (chỉ khi chạy trên máy chủ ROMAN có API; không cookie, tôn trọng "Do Not Track") */
  try {
    if (/^\/api\//.test(SITE.formEndpoint || "") && navigator.sendBeacon && navigator.doNotTrack !== "1" && /^https?:/.test(location.protocol)) {
      const cat = param("cat"), ref = document.referrer ? new URL(document.referrer).host : "";
      navigator.sendBeacon("/api/track", new Blob([JSON.stringify({ p: location.pathname + (cat ? `?cat=${cat}` : ""), r: ref !== location.host ? ref : "" })], { type: "application/json" }));
    }
  } catch (e) { /* thống kê không được làm hỏng trang */ }
});

/* Hiệu ứng chuyển động của website
   - Mỗi khối tự chạy hiệu ứng khi cuộn tới: thẻ trồi lên lần lượt, tiêu đề trồi từ mép, ảnh mở khung, chữ in hoa có vạch vàng vẽ ra
   - Số liệu đếm lên, ảnh banner trôi nhẹ, thanh tiến trình đọc trang
   - Hiệu ứng xuất hiện chạy cả khi máy bật "giảm chuyển động" (theo yêu cầu của ROMAN); riêng ảnh trôi theo cuộn thì tắt */
function initReveal() {
  if (!("IntersectionObserver" in window)) return;
  const lite = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-motion");
  const main = $("main");
  if (!main) return;
  const vh0 = innerHeight;
  const mark = (els, type, step = 0) => els.forEach((el, i) => {
    if (el.dataset.m || el.closest(".hero")) return;
    el.dataset.m = type;
    if (step) el.style.setProperty("--d", `${(i % 4) * step}ms`);
    if (el.getBoundingClientRect().top < vh0 * 0.9) el.style.setProperty("--d", `${Math.min(i, 6) * 60}ms`);
  });
  const q = s => $$(s, main);
  mark(q(".sec-eyebrow, .kv-eyebrow"), "line");
  mark(q(".section-title, .rail-title, .kv-copy h2, .page-head h1, .page-head #title, .about-hero-copy h2, .pd-sec-h, .policy h2"), "rise");
  mark(q(".kv-copy p, .kv-ctas, .section-sub, .cat-lead, .page-head .crumbs, .about-hero-copy p, .about-hero .hero-ctas, .limo-head .btn"), "fade");
  mark(q(".kv-photo, .about-hero-media, .gallery .main"), "curtain");
  [".fcards", ".grid", ".rail", ".limo-pillars", ".process-grid", ".stats-strip", ".support-grid", ".mat-grid", ".sitemap-grid", ".hl"]
    .forEach(g => q(g).forEach(box => mark([...box.children], "up", 120)));
  mark(q(".faq details, .booking-wrap > *, .policy section, .pd-info > *:not(.gallery), .toolbar, .specs"), "up", 60);
  mark($$(".foot-cta-in > *, .site-footer .foot-col, .foot-info"), "up", 80);

  /* Khối lọt vào màn hình thì chạy hiệu ứng (một lần) */
  const watch = new Map();
  /* Ảnh lớn: tải và giải mã trước khi cuộn tới, để lúc chạy hiệu ứng ảnh đã sẵn sàng (không bị giật, không nhảy giữa chừng) */
  const ready = el => {
    if (el._ready) return el._ready;
    const img = el.querySelector("img");
    if (!img) return (el._ready = Promise.resolve());
    img.loading = "eager";
    el._ready = (img.decode ? img.decode() : Promise.resolve()).catch(() => {});
    return el._ready;
  };
  const pre = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { ready(e.target); pre.unobserve(e.target); } }), { rootMargin: "120% 0px 120% 0px" });
  const show = el => { el.classList.add("m-in"); if (el.dataset.count) countUp(el); };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    (watch.get(e.target) || [e.target]).forEach(el => {
      if (el.dataset.m !== "curtain") return show(el);
      Promise.race([ready(el), new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(() => show(el)));
    });
  }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  const once = el => {
    const t = el.dataset.m === "rise" ? el.parentElement : el;
    if (!watch.has(t)) watch.set(t, []);
    watch.get(t).push(el);
    io.observe(t);
  };
  $$("[data-m]").forEach(once);
  $$('[data-m="curtain"]').forEach(el => pre.observe(el));

  /* Số liệu đếm lên */
  $$(".stat-card b, .limo-pillar .process-num").forEach(el => {
    const m = el.textContent.trim().match(/^(\d+)(.*)$/s);
    if (!m) return;
    el.dataset.count = m[1]; el.dataset.rest = m[2];
    el.textContent = "0".padStart(m[1].length, "0") + m[2];
    watch.set(el, [el]);
    io.observe(el);
  });
  function countUp(el) {
    const to = +el.dataset.count, len = el.dataset.count.length, t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = String(v).padStart(len, "0") + el.dataset.rest;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* Ảnh hiện dần khi tải xong */
  $$(".card .thumb img, .fcard-media img, .rimg img, .mega-grid img").forEach(img => {
    if (img.complete && img.naturalWidth) return;
    img.classList.add("m-img");
    const done = () => img.classList.add("loaded");
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });

  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  /* Hàng thẻ vuốt ngang: nếu bị lệch dọc (bấm Tab, cuộn tới phần tử...) thì đưa về ngay */
  $$(".fcards").forEach(row => row.addEventListener("scroll", () => { if (row.scrollTop) row.scrollTop = 0; }, { passive: true }));

  const bar = document.createElement("div");
  bar.className = "m-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.append(bar);
  const wide = matchMedia("(min-width: 901px)");
  const para = lite ? [] : $$(".kv-photo");
  para.forEach(el => el.classList.add("m-parallax"));

  function frame() {
    ticking = false;
    const vh = innerHeight, max = document.documentElement.scrollHeight - vh, y = scrollY;

    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    if (!wide.matches) return;
    para.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const k = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
      const img = el.querySelector("img");
      if (img) img.style.translate = `0 ${(k * -10).toFixed(2)}%`;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  requestAnimationFrame(frame);
  setTimeout(frame, 300);

  $$(".header-bar .logo, #nav > li, .header-icons > *").forEach((el, i) => el.style.setProperty("--hd", `${120 + i * 45}ms`));
}

/* ---------- Sơ đồ trang ---------- */
function initSitemap() {
  const host = $("#sitemap");
  if (!host) return;
  const main = [["index.html", "Trang chủ"], ["category.html", "Bảng giá niêm yết và danh mục dịch vụ"], ["support.html", "Hỗ trợ và đặt lịch"], ["about.html", "Giới thiệu, cửa hàng và tổng kho"],
    ["chinh-sach.html#bao-hanh", "Chính sách bảo hành"], ["chinh-sach.html#bao-mat", "Chính sách bảo mật"], ["chinh-sach.html#dieu-khoan", "Điều khoản sử dụng"]];
  host.innerHTML = `<div class="sm-col"><h2>Trang chính</h2><ul>${main.map(([u, t]) => `<li><a href="${u}">${esc(t)}</a></li>`).join("")}</ul></div>` +
    CATEGORIES.map(c => `<div class="sm-col"><h2><a href="category.html?cat=${c.id}">${esc(c.name)}</a></h2><ul>${PRODUCTS.filter(p => p.cat === c.id).map(p => `<li><a href="${pUrl(p)}">${esc(p.name)}</a>${hasPrice(p) ? `<span class="sm-price">${money(p.price)}${p.unit ? " / " + esc(p.unit) : ""}</span>` : ""}</li>`).join("")}</ul></div>`).join("");
}

/* ---------- Nội dung soạn trong trang quản trị ----------
   Văn bản có thể chèn {hotline}, {hotline2}, {email}, {store}, {warehouse}, {hours}; số gọi: {hotlineTel}, {hotline2Tel}.
   Định dạng: **in đậm**, [chữ](liên kết), dòng "- " là danh sách, "1. " là danh sách số, "### " là tiêu đề nhỏ, dòng trống tách đoạn. */
const telOf = s => String(s || "").replace(/[^\d+]/g, "");
const fill = s => String(s ?? "").replace(/\{(hotline2Tel|hotlineTel|hotline2|hotline|email|store|warehouse|hours|name)\}/g,
  (_, k) => (k === "hotlineTel" ? telOf(SITE.hotline) : k === "hotline2Tel" ? telOf(SITE.hotline2) : SITE[k] || ""));
const safeHref = u => (/^\s*(javascript|data|vbscript):/i.test(u) ? "#" : u);
const mdInline = s => esc(fill(s))
  .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${safeHref(u)}"${/^https?:/i.test(u) ? ' target="_blank" rel="noopener"' : ""} style="text-decoration:underline">${t}</a>`);
const md = src => String(src || "").replace(/\r/g, "").split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).map(b => {
  const lines = b.split("\n").map(l => l.trim());
  if (lines.every(l => /^[-*] /.test(l))) return `<ul>${lines.map(l => `<li>${mdInline(l.slice(2))}</li>`).join("")}</ul>`;
  if (lines.every(l => /^\d+[.)] /.test(l))) return `<ol>${lines.map(l => `<li>${mdInline(l.replace(/^\d+[.)] /, ""))}</li>`).join("")}</ol>`;
  if (/^#{2,4} /.test(b)) return `<h3>${mdInline(b.replace(/^#+ /, ""))}</h3>`;
  return `<p>${lines.map(mdInline).join("<br>")}</p>`;
}).join("");
const mapsUrl = a => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`;
const hotlineLinks = (style = "") => [SITE.hotline, SITE.hotline2].filter(Boolean).map(h => `<a href="tel:${telOf(h)}"${style ? ` style="${style}"` : ""}>${esc(h)}</a>`).join(" – ");
const pageHead = (crumb, P) => `<div class="page-head">
    <div class="crumbs"><a href="index.html">Trang chủ</a> / ${esc(crumb)}</div>
    ${P.eyebrow ? `<p class="sec-eyebrow">${esc(fill(P.eyebrow))}</p>` : ""}
    <h1>${esc(fill(P.title))}</h1>
    ${P.lead ? `<p class="cat-lead">${esc(fill(P.lead))}</p>` : ""}
  </div>`;
const secHead = S => `${S.eyebrow ? `<p class="sec-eyebrow">${esc(fill(S.eyebrow))}</p>` : ""}<h2 class="section-title">${esc(fill(S.title))}</h2>${S.sub ? `<p class="section-sub">${esc(fill(S.sub))}</p>` : ""}`;
/* Nội dung vẽ bằng JS nên trình duyệt chưa kịp cuộn tới #neo: cuộn lại sau khi vẽ xong */
const jumpToHash = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const t = id && document.getElementById(id);
  if (t) requestAnimationFrame(() => t.scrollIntoView());
};

function initAbout() {
  const A = PAGES.about, host = $("#pageAbout");
  if (!host || !A) return;
  const loc = (label, name, addr) => addr ? `<article class="support-card">
        <div>
          <span class="process-num">${esc(label)}</span>
          <h3 class="card-h">${esc(fill(name))}</h3>
          <p>${esc(addr)}</p>
          ${SITE.hours ? `<p>Giờ mở cửa: ${esc(SITE.hours)}</p>` : ""}
          <p><a href="${esc(mapsUrl(addr))}" target="_blank" rel="noopener" style="text-decoration:underline">Chỉ đường trên Google Maps</a></p>
        </div>
        <div class="support-meta"><span>Hotline: ${hotlineLinks("color:var(--accent)")}</span></div>
      </article>` : "";
  host.innerHTML = `${pageHead("Giới thiệu", A)}
  <section class="about-hero" aria-label="Câu chuyện thương hiệu ${esc(SITE.name)}">
    <div class="about-hero-copy">
      ${A.heroEyebrow ? `<p class="hero-eyebrow">${esc(fill(A.heroEyebrow))}</p>` : ""}
      <h2>${esc(fill(A.heroTitle))}</h2>
      ${md(A.heroBody)}
      <div class="hero-ctas" style="margin-top:24px">
        <a class="btn btn-dark" href="support.html#lien-he">Đặt lịch tư vấn tại xưởng</a>
        <a class="btn btn-outline" href="category.html">Xem bảng giá niêm yết</a>
      </div>
    </div>
    ${A.heroImage ? `<div class="about-hero-media"><img src="${ph(A.heroImage, "lg")}" alt="${esc(PHOTO_ALT[A.heroImage] || SITE.name)}"></div>` : ""}
  </section>
  ${A.stats.length ? `<section class="stats-strip" aria-label="${esc(SITE.name)} trong một cái nhìn">${A.stats.map(x => `<div class="stat-card"><b>${esc(fill(x.value))}</b><span>${esc(fill(x.label))}</span></div>`).join("")}</section>` : ""}
  ${A.process.steps.length ? `<section class="block" id="quy-trinh">${secHead(A.process)}
    <div class="process-grid">${A.process.steps.map((x, i) => `<article class="process-card"><span class="process-num">BƯỚC ${String(i + 1).padStart(2, "0")}</span><h3>${esc(fill(x.title))}</h3>${md(x.body)}</article>`).join("")}</div>
  </section>` : ""}
  <section class="block" id="cua-hang">${secHead(A.stores)}
    <div class="support-grid">${loc("CỬA HÀNG", A.stores.storeName, SITE.store)}${loc("TỔNG KHO", A.stores.warehouseName, SITE.warehouse)}</div>
  </section>
  ${A.jobs.items.length ? `<section class="block" id="tuyen-dung">${secHead(A.jobs)}
    <div class="support-grid">${A.jobs.items.map(j => `<article class="support-card">
        <div><h3 class="card-h">${esc(fill(j.title))}</h3>${md(j.body)}</div>
        <a class="btn btn-line btn-sm" href="mailto:${esc(SITE.email)}?subject=${encodeURIComponent("Ứng tuyển " + fill(j.title))}">Ứng tuyển qua Email</a>
      </article>`).join("")}</div>
  </section>` : ""}`;
  jumpToHash();
}

function initPolicy() {
  const P = PAGES.policy, host = $("#pagePolicy");
  if (!host || !P) return;
  host.innerHTML = `${pageHead("Chính sách", Object.assign({}, P, { lead: [P.lead, P.updated ? `Cập nhật ngày ${P.updated}.` : ""].filter(Boolean).join(" ") }))}
  <nav class="policy-toc" aria-label="Mục lục">${P.sections.map(x => `<a class="chip" href="#${esc(x.id)}">${esc(fill(x.title))}</a>`).join("")}</nav>
  <article class="policy">${P.sections.map((x, i) => `<section id="${esc(x.id)}"><h2>${i + 1}. ${esc(fill(x.title))}</h2>${md(x.body)}</section>`).join("")}</article>`;
  jumpToHash();
}

function initSupport() {
  const S = PAGES.support, host = $("#pageSupport");
  if (!host || !S) return;
  const B = S.booking;
  host.innerHTML = `${pageHead("Hỗ trợ & Đặt lịch", S)}
  <div class="support-grid">${S.cards.map(c => `<div class="support-card"${c.anchor ? ` id="${esc(c.anchor)}"` : ""}>
      <div>
        ${c.label ? `<span class="process-num">${esc(fill(c.label))}</span>` : ""}
        <h2 class="card-h">${esc(fill(c.title))}</h2>
        ${md(c.body)}
      </div>
      ${c.cta ? `<a class="btn ${c.style === "gold" ? "btn-gold" : "btn-line"} btn-sm" href="${esc(safeHref(fill(c.link || "#")))}">${esc(fill(c.cta))}</a>` : ""}
    </div>`).join("")}</div>

  ${S.faq.items.length ? `<section class="block faq" id="faq">${secHead(S.faq)}
    ${S.faq.items.map((f, i) => `<details${i ? "" : " open"}><summary>${esc(fill(f.q))}</summary>${md(f.a)}</details>`).join("")}
  </section>` : ""}

  <section class="block" id="lien-he">${secHead(B)}
    <div class="booking-wrap">
      <form class="form" id="contactForm">
        <div class="form-row">
          <label>Họ và tên quý khách *<input required name="name" maxlength="80" placeholder="Nguyễn Văn A" autocomplete="name"></label>
          <label>Số điện thoại liên hệ *<input required name="phone" type="tel" maxlength="20" pattern="[0-9 +().-]{8,20}" placeholder="090x xxx xxx" autocomplete="tel"></label>
        </div>
        <div class="form-row">
          <label>Hãng và dòng xe <span class="opt-note">(VD: Mercedes GLC 300 2024)</span><input name="car" maxlength="100" placeholder="Nhập dòng xe và năm sản xuất"></label>
          <label>Ngày dự kiến thi công<input name="date" type="date"></label>
        </div>
        <label>Hạng mục quan tâm
          <select name="topic">${B.topics.map(t => `<option>${esc(t)}</option>`).join("")}</select>
        </label>
        <label>Ghi chú phối màu hoặc yêu cầu riêng <span class="opt-note">(màu da, màu chỉ, xem mẫu tận nơi...)</span><textarea name="msg" maxlength="1500" placeholder="Ví dụ: Tôi muốn xem mẫu da Nappa màu nâu..."></textarea></label>
        <label class="hp" aria-hidden="true">Để trống ô này<input name="website" tabindex="-1" autocomplete="off"></label>
        <button class="btn btn-dark" type="submit" style="height:44px;font-size:14px">Xác nhận gửi đặt lịch</button>
        <p id="sent" role="status" style="color:#000000;font-weight:700;padding-top:4px"></p>
      </form>
      <aside class="booking-side">
        <div>
          ${B.sideEyebrow ? `<p class="sec-eyebrow">${esc(fill(B.sideEyebrow))}</p>` : ""}
          <h3>${esc(fill(B.sideTitle))}</h3>
          ${md(B.sideBody)}
          <ul class="booking-perks">
            ${SITE.store ? `<li><span>•</span> <b>Cửa hàng:</b> ${esc(SITE.store)} · <a href="${esc(mapsUrl(SITE.store))}" target="_blank" rel="noopener" style="text-decoration:underline">Chỉ đường</a></li>` : ""}
            ${SITE.warehouse ? `<li><span>•</span> <b>Tổng kho:</b> ${esc(SITE.warehouse)} · <a href="${esc(mapsUrl(SITE.warehouse))}" target="_blank" rel="noopener" style="text-decoration:underline">Chỉ đường</a></li>` : ""}
            ${SITE.hours ? `<li><span>•</span> <b>Giờ mở cửa:</b> ${esc(SITE.hours)}</li>` : ""}
            ${SITE.email ? `<li><span>•</span> <b>Email:</b> <a href="mailto:${esc(SITE.email)}" style="text-decoration:underline">${esc(SITE.email)}</a></li>` : ""}
          </ul>
        </div>
        <div style="border-top:1px solid #e5e5e5;padding-top:18px">
          <p style="font-size:13px;color:#555555">Cần tư vấn gấp? Gọi ngay hotline:</p>
          ${[SITE.hotline, SITE.hotline2].filter(Boolean).map((h, i) => `<a href="tel:${telOf(h)}" style="font-size:${i ? 20 : 26}px;font-weight:700;color:#000000;letter-spacing:0.02em">${esc(h)}</a>`).join("<br>")}
        </div>
      </aside>
    </div>
  </section>`;

  /* Đến từ nút "Đặt lịch" của một sản phẩm: chọn sẵn hạng mục và ghi chú */
  const dv = PRODUCTS.find(x => x.id === param("dv"));
  const mau = param("mau"), opt = param("opt");
  if (dv) {
    const topicSel = $("#contactForm [name=topic]");
    const catName = norm(catById(dv.cat)?.name);
    const want = dv.sub === "Ghế Limousine" ? B.topics.find(t => /limousine/i.test(t)) : B.topics.find(t => norm(t) === catName) || B.topics.find(t => norm(t).startsWith(catName));
    if (want) topicSel.value = want;
    const details = [dv.name, mau ? `Màu: ${mau}` : "", opt ? `Cấu hình: ${opt}` : ""].filter(Boolean).join(" · ");
    $("#contactForm [name=msg]").value = `Tôi muốn đặt lịch tư vấn & thi công: ${details}`;
  }
  /* Đến từ khối "Tìm sản phẩm cho xe của bạn": điền sẵn xe */
  const xe = param("xe");
  if (xe) $("#contactForm [name=car]").value = xe.slice(0, 80);
  $("#contactForm").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target, d = Object.fromEntries(new FormData(f)), out = $("#sent");
    const callUs = `Cần gấp, hãy gọi ${hotlineLinks()}.`;
    const lines = [`Họ tên: ${d.name}`, `Điện thoại: ${d.phone}`, d.car && `Xe: ${d.car}`, d.date && `Ngày dự kiến thi công: ${d.date}`, `Hạng mục: ${d.topic}`, d.msg && `Ghi chú: ${d.msg}`].filter(Boolean);
    const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent(`Đặt lịch tư vấn - ${d.name} - ${d.phone}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
    if (SITE.formEndpoint) {
      const btn = f.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        const r = await fetch(SITE.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) });
        if (!r.ok) throw new Error(r.status);
        f.reset();
        out.innerHTML = `✓ ROMAN đã nhận yêu cầu của bạn và sẽ liên hệ lại qua số điện thoại đã để lại. ${callUs}`;
      } catch (err) {
        /* Không có máy chủ nhận form (ví dụ đang chạy trên hosting tĩnh): cho khách gửi qua email */
        out.innerHTML = `Chưa gửi được qua website. Bạn có thể <a href="${esc(mailto)}" style="text-decoration:underline">gửi yêu cầu bằng email</a> với nội dung đã điền sẵn. ${callUs}`;
      }
      btn.disabled = false;
      return;
    }
    location.href = mailto;
    out.innerHTML = `Ứng dụng email của bạn đang mở với nội dung đã điền sẵn gửi tới ${esc(SITE.email)}, bạn chỉ cần bấm Gửi. ${callUs}`;
  });
  jumpToHash();
}
