/* ===== Tối ưu SEO: sinh sẵn nội dung vào HTML, trang riêng từng sản phẩm, sitemap, dữ liệu có cấu trúc =====
   Chạy mỗi lần lưu nội dung (server/index.js gọi generateSite) hoặc chạy tay: node server/seo.js
   - Nội dung chữ được ghi sẵn vào các khối mà JavaScript sẽ vẽ lại (#hero, #list, #pd...), giữa <!--seo--> và <!--/seo-->,
     để Google đọc được ngay cả khi chưa chạy JavaScript. Giao diện khi trang chạy xong không đổi.
   - Thẻ SEO đầu trang (canonical, chia sẻ, JSON-LD) nằm giữa <!--seo-head--> và <!--/seo-head-->. */
"use strict";
const fs = require("fs"), path = require("path");
const { outProduct, productSlugs, productPath } = require("./build");

const ROOT = path.join(__dirname, "..");
const GEN = '<meta name="generator" content="roman-seo">';

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = n => Number(n).toLocaleString("vi-VN");
const money = n => `${fmt(n)} VND`;
const clip = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…"; };
const photo = (name, size = "lg") => `assets/photos/${name}-${size}.jpg`;
const telOf = s => String(s || "").replace(/[^\d+]/g, "");

function ctx(c) {
  const site = c.site, slugs = productSlugs(c);
  const base = String(site.siteUrl || "").trim().replace(/\/+$/, "");
  const abs = p => (base ? `${base}/${p}` : `/${p}`);
  const products = c.products.filter(p => !p.hidden).map(p => Object.assign(outProduct(p, site), { url: productPath(slugs[p.id]) }));
  const byId = Object.fromEntries(products.map(p => [p.id, p]));
  /* Liên kết cũ product.html?id=... trong nội dung -> đường dẫn mới */
  const link = u => { const m = /^product\.html\?id=([\w-]+)(.*)$/.exec(u || ""); return m && byId[m[1]] ? byId[m[1]].url + (m[2].startsWith("#") ? m[2] : "") : (u || "#"); };
  const fill = s => String(s == null ? "" : s).replace(/\{(hotline2Tel|hotlineTel|hotline2|hotline|email|store|warehouse|hours|name)\}/g,
    (_, k) => (k === "hotlineTel" ? telOf(site.hotline) : k === "hotline2Tel" ? telOf(site.hotline2) : site[k] || ""));
  const inline = s => esc(fill(s)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${/^\s*(javascript|data):/i.test(u) ? "#" : u}">${t}</a>`);
  const md = src => String(src || "").replace(/\r/g, "").split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).map(b => {
    const lines = b.split("\n").map(l => l.trim());
    if (lines.every(l => /^[-*] /.test(l))) return `<ul>${lines.map(l => `<li>${inline(l.slice(2))}</li>`).join("")}</ul>`;
    if (lines.every(l => /^\d+[.)] /.test(l))) return `<ol>${lines.map(l => `<li>${inline(l.replace(/^\d+[.)] /, ""))}</li>`).join("")}</ol>`;
    if (/^#{2,4} /.test(b)) return `<h3>${inline(b.replace(/^#+ /, ""))}</h3>`;
    return `<p>${lines.map(inline).join("<br>")}</p>`;
  }).join("");
  const plain = s => fill(s).replace(/\*\*|#{2,4} /g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const cat = id => c.categories.find(x => x.id === id) || { name: "", id };
  return { c, site, base, abs, products, byId, link, fill, md, plain, cat };
}

const priceText = p => (p.price > 0 ? `${new Set(p.prices).size > 1 ? "Từ " : ""}${money(p.price)}${p.unit ? " / " + p.unit : ""}` : "Liên hệ báo giá");
const cardHtml = (X, p) => `<article class="card"><div class="card-body"><span class="card-cat">${esc(X.cat(p.cat).name)}</span><h3><a href="${p.url}">${esc(p.name)}</a></h3><p>${esc(p.short)}</p><div class="price"><span class="from">${p.price > 0 ? "Giá niêm yết" : "Giá dịch vụ"}</span> <b>${esc(priceText(p))}</b></div></div></article>`;

/* ---------- Nội dung sinh sẵn cho từng khối ---------- */
function slotsFor(X, file) {
  const { c, site, md, fill, link } = X;
  if (file === "index.html") return {
    hero: c.hero.map((s, i) => `<div class="hero-slide${i ? "" : " is-active"}"><div class="hero-inner"><div class="hero-copy">${s.eyebrow ? `<p class="hero-eyebrow">${esc(s.eyebrow)}</p>` : ""}<${i ? "h2" : "h1"} class="hero-title">${esc(s.title)}</${i ? "h2" : "h1"}><p class="hero-sub">${esc(s.sub)}</p><div class="hero-ctas"><a class="btn btn-outline" href="${esc(link(s.link))}">${esc(s.cta || "Khám phá")}</a> <a class="btn btn-link" href="support.html#lien-he">Đặt lịch</a></div></div></div></div>`).join(""),
    features: c.features.map(f => `<section class="kv"><div class="kv-inner"><div class="kv-copy">${f.eyebrow ? `<p class="kv-eyebrow">${esc(f.eyebrow)}</p>` : ""}<h2>${esc(f.title)}</h2><p>${esc(f.sub)}</p><div class="kv-ctas"><a class="btn btn-outline" href="${esc(link(f.link))}">${esc(f.cta || "Khám phá")}</a></div></div></div></section><section class="fcards">${f.cards.map(id => X.byId[id]).filter(Boolean).map(p => `<a class="fcard" href="${p.url}"><div class="fcard-head"><h3>${esc(p.nick)}</h3></div></a>`).join("")}</section>`).join(""),
    rec: `<h2 class="rail-title">Được đề xuất cho bạn</h2><div class="rail">${X.products.filter(p => p.tag && !p.id.startsWith("limo-")).map(p => `<a class="rcard" href="${p.url}"><div class="rbody"><h3>${esc(p.name)}</h3><p class="rprice"><b>${esc(priceText(p))}</b></p></div></a>`).join("")}</div>`,
    stories: `<h2 class="rail-title">Khám phá những câu chuyện</h2><div class="rail">${c.stories.map(s => `<a class="rcard scard" href="${esc(link(s.link))}"><div class="rbody"><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div></a>`).join("")}</div>`,
    limousine: `<div class="kv"><div class="kv-inner"><div class="kv-copy"><p class="kv-eyebrow">${esc(c.limousine.eyebrow)}</p><h2>${esc(c.limousine.title)}</h2><p>${esc(c.limousine.sub)}</p></div></div></div><div class="wrap limo-body"><div class="grid">${c.limousine.cards.map(id => X.byId[id]).filter(Boolean).map(p => cardHtml(X, p)).join("")}</div><div class="limo-pillars">${c.limousine.pillars.map(x => `<article class="limo-pillar"><h4>${esc(x.title)}</h4><p>${esc(x.desc)}</p></article>`).join("")}</div></div>`,
    notes: `<div class="notes-in">${c.notes.map(n => `<p>*${esc(n)}</p>`).join("")}</div>`,
  };
  if (file === "category.html") return {
    crumbs: `<a href="./">Trang chủ</a> / Dịch vụ`,
    title: "Bảng giá niêm yết và dịch vụ nội thất ô tô",
    chips: c.categories.map(x => `<a class="chip" href="category.html?cat=${x.id}">${esc(x.name)}</a>`).join(" "),
    count: `${X.products.length} dịch vụ`,
    list: X.products.map(p => cardHtml(X, p)).join(""),
  };
  if (file === "support.html") {
    const S = c.pages.support, B = S.booking;
    return { pageSupport: `<div class="page-head"><p class="sec-eyebrow">${esc(fill(S.eyebrow))}</p><h1>${esc(fill(S.title))}</h1><p class="cat-lead">${esc(fill(S.lead))}</p></div>
<div class="support-grid">${S.cards.map(x => `<div class="support-card"><h2 class="card-h">${esc(fill(x.title))}</h2>${md(x.body)}</div>`).join("")}</div>
<section class="block faq" id="faq"><h2 class="section-title">${esc(fill(S.faq.title))}</h2>${S.faq.items.map(f => `<details><summary>${esc(fill(f.q))}</summary>${md(f.a)}</details>`).join("")}</section>
<section class="block" id="lien-he"><h2 class="section-title">${esc(fill(B.title))}</h2><p class="section-sub">${esc(fill(B.sub))}</p><ul class="booking-perks"><li>Cửa hàng: ${esc(site.store)}</li><li>Tổng kho: ${esc(site.warehouse)}</li>${site.hours ? `<li>Giờ mở cửa: ${esc(site.hours)}</li>` : ""}<li>Hotline: <a href="tel:${telOf(site.hotline)}">${esc(site.hotline)}</a> – <a href="tel:${telOf(site.hotline2)}">${esc(site.hotline2)}</a></li><li>Email: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li></ul></section>` };
  }
  if (file === "about.html") {
    const A = c.pages.about;
    return { pageAbout: `<div class="page-head"><p class="sec-eyebrow">${esc(fill(A.eyebrow))}</p><h1>${esc(fill(A.title))}</h1><p class="cat-lead">${esc(fill(A.lead))}</p></div>
<section class="about-hero"><div class="about-hero-copy"><h2>${esc(fill(A.heroTitle))}</h2>${md(A.heroBody)}</div></section>
<section class="stats-strip">${A.stats.map(x => `<div class="stat-card"><b>${esc(fill(x.value))}</b> <span>${esc(fill(x.label))}</span></div>`).join("")}</section>
<section class="block" id="quy-trinh"><h2 class="section-title">${esc(fill(A.process.title))}</h2>${A.process.steps.map((x, i) => `<article class="process-card"><h3>Bước ${i + 1}: ${esc(fill(x.title))}</h3>${md(x.body)}</article>`).join("")}</section>
<section class="block" id="cua-hang"><h2 class="section-title">${esc(fill(A.stores.title))}</h2><p>${esc(A.stores.storeName)}: ${esc(site.store)}</p><p>${esc(A.stores.warehouseName)}: ${esc(site.warehouse)}</p><p>Hotline: ${esc(site.hotline)} – ${esc(site.hotline2)}</p></section>
${A.jobs.items.length ? `<section class="block" id="tuyen-dung"><h2 class="section-title">${esc(fill(A.jobs.title))}</h2>${A.jobs.items.map(j => `<article class="support-card"><h3 class="card-h">${esc(fill(j.title))}</h3>${md(j.body)}</article>`).join("")}</section>` : ""}` };
  }
  if (file === "chinh-sach.html") {
    const P = c.pages.policy;
    return { pagePolicy: `<div class="page-head"><h1>${esc(fill(P.title))}</h1><p class="cat-lead">${esc(fill(P.lead))}${P.updated ? ` Cập nhật ngày ${esc(P.updated)}.` : ""}</p></div><article class="policy">${P.sections.map((x, i) => `<section id="${esc(x.id)}"><h2>${i + 1}. ${esc(fill(x.title))}</h2>${md(x.body)}</section>`).join("")}</article>` };
  }
  if (file === "so-do-trang.html") return {
    sitemap: c.categories.map(cc => `<div class="sm-col"><h2><a href="category.html?cat=${cc.id}">${esc(cc.name)}</a></h2><ul>${X.products.filter(p => p.cat === cc.id).map(p => `<li><a href="${p.url}">${esc(p.name)}</a> <span class="sm-price">${esc(priceText(p))}</span></li>`).join("")}</ul></div>`).join(""),
  };
  return {};
}

function productSlots(X, p) {
  const cc = X.cat(p.cat), alt = (X.c.photoAlt || {})[p.photos && p.photos[0]] || p.name;
  const related = X.products.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  return {
    crumbs: `<a href="./">Trang chủ</a> / <a href="category.html?cat=${cc.id}">${esc(cc.name)}</a>${p.sub ? ` / ${esc(p.sub)}` : ""} / ${esc(p.name)}`,
    pd: `${p.photos && p.photos.length ? `<div class="gallery photo"><div class="main"><img src="${photo(p.photos[0])}" alt="${esc(alt)}" width="1200" height="900"></div></div>` : ""}<div class="pd-info"><p class="pd-cat-pill">${esc(cc.name)}${p.sub ? " · " + esc(p.sub) : ""}</p><h1>${esc(p.name)}</h1><p class="lead">${esc(p.short)}</p>
<div class="pd-price-box"><div class="pd-price"><span class="from">${p.price > 0 ? "Giá niêm yết" : "Giá dịch vụ"}</span> <b>${esc(priceText(p))}</b></div></div>
${p.prices ? `<h2 class="pd-sec-h">${esc(p.optionLabel)}</h2><ul class="hl">${p.options.map((o, i) => `<li>${esc(o)}: ${money(p.prices[i])}</li>`).join("")}</ul>` : ""}
<h2 class="pd-sec-h">Đặc điểm nổi bật</h2><ul class="hl">${p.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>
<h2 class="pd-sec-h">Thông số &amp; quy chuẩn dịch vụ</h2><table class="specs">${Object.entries(p.specs).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>
<p><a class="btn btn-dark" href="support.html?dv=${p.id}#lien-he">Đặt lịch thi công</a> <a class="btn btn-outline" href="tel:${telOf(X.site.hotline)}">Gọi ${esc(X.site.hotline)}</a></p></div>`,
    related: related.map(x => cardHtml(X, x)).join(""),
  };
}

/* ---------- Thẻ đầu trang ---------- */
function addressLd(site) {
  const parts = String(site.store || "").split(",").map(s => s.trim()).filter(Boolean);
  return { "@type": "PostalAddress", streetAddress: parts.slice(0, Math.max(1, parts.length - 2)).join(", "), addressLocality: parts.length > 2 ? parts[parts.length - 2] : "", addressRegion: parts[parts.length - 1] || "", addressCountry: "VN" };
}
function businessLd(X) {
  const { site, c } = X;
  const o = {
    "@context": "https://schema.org", "@type": "AutoRepair", "@id": X.abs("#cua-hang"),
    name: site.name, description: site.tagline, url: X.abs(""), image: X.abs(photo("xuong-01", "xl")), logo: X.abs("assets/logo-emblem.png"),
    telephone: site.hotline, email: site.email, address: addressLd(site), priceRange: "₫₫",
    areaServed: { "@type": "City", name: "Hà Nội" },
    contactPoint: [site.hotline, site.hotline2].filter(Boolean).map(t => ({ "@type": "ContactPoint", telephone: t, contactType: "customer service", availableLanguage: "vi" })),
  };
  if (site.legalName) o.legalName = site.legalName;
  if (site.taxCode) o.taxID = site.taxCode;
  const same = (c.social || []).map(s => s.url).filter(Boolean);
  if (same.length) o.sameAs = same;
  return o;
}
function productLd(X, p) {
  const cc = X.cat(p.cat);
  const o = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.short, sku: p.id, category: cc.name,
    brand: { "@type": "Brand", name: X.site.name }, url: X.abs(p.url),
  };
  if (p.photos && p.photos.length) o.image = p.photos.slice(0, 4).map(n => X.abs(photo(n)));
  if (p.price > 0) {
    const lo = Math.min(...p.prices), hi = Math.max(...p.prices);
    o.offers = lo === hi
      ? { "@type": "Offer", price: lo, priceCurrency: "VND", availability: "https://schema.org/InStock", url: X.abs(p.url), seller: { "@id": X.abs("#cua-hang") } }
      : { "@type": "AggregateOffer", lowPrice: lo, highPrice: hi, offerCount: p.prices.length, priceCurrency: "VND", availability: "https://schema.org/InStock", url: X.abs(p.url), seller: { "@id": X.abs("#cua-hang") } };
  }
  return o;
}
const crumbLd = (X, items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: X.abs(url) })) });
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;

function headBlock(X, { path: p, image, robots, lds = [], og = "website" }) {
  const lines = [GEN];
  if (robots) lines.push(`<meta name="robots" content="${robots}">`);
  if (p !== null) { lines.push(`<link rel="canonical" href="${esc(X.abs(p))}">`); lines.push(`<meta property="og:url" content="${esc(X.abs(p))}">`); }
  if (image) { lines.push(`<meta property="og:image" content="${esc(X.abs(image))}">`); lines.push(`<meta name="twitter:card" content="summary_large_image">`); }
  lines.push(`<meta property="og:type" content="${og}">`);
  lds.forEach(o => lines.push(ld(o)));
  return `<!--seo-head-->\n${lines.join("\n")}\n<!--/seo-head-->`;
}

/* ---------- Ghép vào HTML ---------- */
function setHead(html, block) {
  html = html.replace(/<meta property="og:type" content="[^"]*">\n?/, "");
  if (/<!--seo-head-->[\s\S]*?<!--\/seo-head-->/.test(html)) return html.replace(/<!--seo-head-->[\s\S]*?<!--\/seo-head-->/, block);
  return html.replace("</head>", `${block}\n</head>`);
}
function setSlot(html, id, inner) {
  const re = new RegExp(`(<[a-z0-9]+[^>]*\\sid="${id}"[^>]*>)(<!--seo-->[\\s\\S]*?<!--\\/seo-->)?`);
  if (!re.test(html)) return html;
  return html.replace(re, (_, open) => `${open}<!--seo-->${inner}<!--/seo-->`);
}
const setMeta = (html, title, desc) => html
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
  .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
  .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`);

const PAGES = {
  "index.html": { path: "", image: X => photo(X.c.hero[0].photo, "xl"), lds: X => [businessLd(X), { "@context": "https://schema.org", "@type": "WebSite", name: X.site.name, url: X.abs("") }] },
  "category.html": { path: "category.html", image: X => photo("ghe-02", "xl") },
  "support.html": { path: "support.html", image: X => photo("xuong-01", "xl"), lds: X => [businessLd(X), { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: X.c.pages.support.faq.items.map(f => ({ "@type": "Question", name: X.plain(f.q), acceptedAnswer: { "@type": "Answer", text: X.plain(f.a) } })) }] },
  "about.html": { path: "about.html", image: X => photo("xuong-01", "xl"), lds: X => [businessLd(X)] },
  "chinh-sach.html": { path: "chinh-sach.html" },
  "so-do-trang.html": { path: "so-do-trang.html" },
  "404.html": { path: null, robots: "noindex" },
  "product.html": { path: null, robots: "noindex, follow" },
};

/* Sinh lại toàn bộ: các trang chính, trang từng sản phẩm, sitemap/robots tĩnh. Trả về số trang sản phẩm. */
function generateSite(c) {
  const X = ctx(c);
  for (const [file, cfg] of Object.entries(PAGES)) {
    const f = path.join(ROOT, file);
    if (!fs.existsSync(f)) continue;
    let html = fs.readFileSync(f, "utf8");
    html = setHead(html, headBlock(X, { path: cfg.path, image: cfg.image && cfg.image(X), robots: cfg.robots, lds: cfg.lds ? cfg.lds(X) : [] }));
    for (const [id, inner] of Object.entries(slotsFor(X, file))) html = setSlot(html, id, inner);
    fs.writeFileSync(f, html);
  }
  /* Trang riêng từng sản phẩm, dựng từ khuôn product.html */
  const tpl = fs.readFileSync(path.join(ROOT, "product.html"), "utf8");
  const dir = path.join(ROOT, "san-pham");
  fs.mkdirSync(dir, { recursive: true });
  const keep = new Set();
  for (const p of X.products) {
    const slug = p.url.split("/")[1];
    keep.add(slug);
    const cc = X.cat(p.cat);
    const title = `${p.name} | ${X.site.name}`;
    const desc = clip(`${p.short} ${p.price > 0 ? `Giá niêm yết ${new Set(p.prices).size > 1 ? "từ " : ""}${fmt(p.price)}₫/${p.unit || "bộ"}.` : "Liên hệ để được báo giá."} ${cc.name} tại ${X.site.name}, ${X.site.store}.`, 158);
    let html = setMeta(tpl, title, desc);
    html = html.replace("<head>", '<head>\n<base href="/">');
    html = html.replace('<body data-page="product">', `<body data-page="product" data-id="${p.id}">`);
    html = setHead(html, headBlock(X, { path: p.url, image: p.photos && p.photos[0] ? photo(p.photos[0]) : null, og: "product",
      lds: [productLd(X, p), crumbLd(X, [["Trang chủ", ""], [cc.name, `category.html?cat=${cc.id}`], [p.name, p.url]])] }));
    for (const [id, inner] of Object.entries(productSlots(X, p))) html = setSlot(html, id, inner);
    fs.mkdirSync(path.join(dir, slug), { recursive: true });
    fs.writeFileSync(path.join(dir, slug, "index.html"), html);
  }
  /* Xóa trang của sản phẩm đã ẩn/xóa/đổi tên (chỉ xóa thư mục do bộ sinh này tạo) */
  for (const d of fs.readdirSync(dir)) {
    const f = path.join(dir, d, "index.html");
    if (!keep.has(d) && fs.existsSync(f) && fs.readFileSync(f, "utf8").includes(GEN)) fs.rmSync(path.join(dir, d), { recursive: true, force: true });
  }
  /* Bản tĩnh của sitemap/robots (dùng khi đưa lên hosting tĩnh; máy chủ Node tự sinh theo tên miền đang truy cập) */
  if (X.base) fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemapXml(c, X.base));
  fs.writeFileSync(path.join(ROOT, "robots.txt"), robotsTxt(X.base));
  return X.products.length;
}

function sitemapXml(c, base) {
  const X = ctx(Object.assign({}, c, { site: Object.assign({}, c.site, { siteUrl: base }) }));
  const day = String(c.updatedAt || new Date().toISOString()).slice(0, 10);
  const urls = [["", "1.0"], ["category.html", "0.9"], ...c.categories.map(x => [`category.html?cat=${x.id}`, "0.8"]),
    ...X.products.map(p => [p.url, "0.8"]), ["support.html", "0.6"], ["about.html", "0.6"], ["chinh-sach.html", "0.3"], ["so-do-trang.html", "0.3"]];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, pr]) => `  <url><loc>${esc(X.abs(u))}</loc><lastmod>${day}</lastmod><priority>${pr}</priority></url>`).join("\n")}\n</urlset>\n`;
}
const robotsTxt = base => `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n${base ? `\nSitemap: ${base}/sitemap.xml\n` : ""}`;

module.exports = { generateSite, sitemapXml, robotsTxt };

if (require.main === module) {
  const c = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "site.json"), "utf8"));
  console.log(`Đã sinh ${generateSite(c)} trang sản phẩm.`);
}
