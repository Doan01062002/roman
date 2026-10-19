/* ===== Sinh js/data.js và cập nhật thẻ SEO từ content/site.json =====
   Website vẫn đọc các biến toàn cục như cũ (SITE, PRODUCTS...), nên giao diện không phải sửa.
   Phần tính toán (giá thấp nhất, dòng giá trong đặc điểm & thông số) chạy ở đây thay vì trong trình duyệt. */
"use strict";

const fmt = n => Number(n).toLocaleString("vi-VN");
const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
const lowerFirst = s => (s ? s[0].toLowerCase() + s.slice(1) : s);

/* Đường dẫn sản phẩm dạng chữ không dấu: "Sàn ROMAN 360 Premium" -> "san-roman-360-premium" */
const slugify = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
/* Mỗi sản phẩm (đang hiển thị) một đường dẫn riêng, không trùng; có thể đặt tay bằng p.slug */
function productSlugs(c) {
  const out = {}, used = new Set();
  c.products.filter(p => !p.hidden).forEach(p => {
    const base = slugify(p.slug || p.name) || p.id;
    let s = base, i = 2;
    while (used.has(s)) s = `${base}-${i++}`;
    used.add(s); out[p.id] = s;
  });
  return out;
}
const productPath = slug => `san-pham/${slug}/`;

/* Các trang có thẻ tiêu đề/mô tả do trang quản trị điều khiển */
const PAGE_FILES = ["index.html", "category.html", "product.html", "support.html", "about.html", "chinh-sach.html", "so-do-trang.html", "404.html"];

/* Dòng giá tự thêm vào đầu "Đặc điểm nổi bật" */
function priceLine(p, prices) {
  const unit = p.unit || "bộ";
  if (new Set(prices).size === 1) return `Giá niêm yết ${fmt(prices[0])}₫ mỗi ${unit}`;
  if (p.options.length <= 2) return `Giá niêm yết: ${p.options.map((o, i) => `${lowerFirst(o)} ${fmt(prices[i])}₫`).join(", ")}`;
  return `Giá niêm yết từ ${fmt(Math.min(...prices))}₫ mỗi ${unit}`;
}

function outProduct(p, site) {
  const options = (p.options && p.options.length) ? p.options : ["Tiêu chuẩn"];
  const prices = (p.prices || []).slice(0, options.length).map(n => Math.max(0, Math.round(Number(n) || 0)));
  const priced = prices.length === options.length && prices.every(n => n > 0);
  const o = {
    id: p.id, cat: p.cat, sub: p.sub || "", name: p.name, tag: p.tag || "",
    short: p.short || "", colors: (p.colors && p.colors.length) ? p.colors : [["Theo yêu cầu", "#1c1c1f"]],
    optionLabel: p.optionLabel || "Tùy chọn", options,
    highlights: (p.highlights || []).filter(Boolean),
    specs: Object.assign({}, p.specs || {}),
    price: priced ? Math.min(...prices) : 0, old: 0,
    nick: p.nick || p.name,
  };
  if (p.image) o.image = p.image;
  if (p.photos && p.photos.length) o.photos = p.photos.slice();
  if (priced) {
    o.prices = prices;
    o.unit = p.unit || "bộ";
    if (p.autoPrice !== false) {
      o.highlights.unshift(priceLine(o, prices));
      o.specs = Object.assign({
        "Đơn vị tính": cap(o.unit),
        "Giá niêm yết": options.map((x, i) => `${x}: ${fmt(prices[i])}₫`).join(" · "),
      }, o.specs, { "Liên hệ": [site.hotline, site.hotline2].filter(Boolean).join(" · ") });
    }
  }
  return o;
}

function buildDataJs(c) {
  const site = Object.assign({}, c.site);
  site.address = site.store || site.address || "";
  const slugs = productSlugs(c);
  const products = c.products.filter(p => !p.hidden).map(p => Object.assign(outProduct(p, site), { url: productPath(slugs[p.id]) }));
  const J = v => JSON.stringify(v, null, 1);
  const parts = [
    ["SITE", site], ["CATEGORIES", c.categories], ["PRODUCTS", products], ["HERO_SLIDES", c.hero],
    ["FEATURES", c.features], ["STORIES", c.stories], ["LIMOUSINE", c.limousine], ["NOTES", c.notes],
    ["SOCIAL", c.social], ["PHOTO_ALT", c.photoAlt], ["MATERIALS", c.materials], ["PAGES", c.pages],
  ];
  return `/* TỆP TỰ SINH từ content/site.json bởi trang quản trị (/admin). Đừng sửa tay: mọi thay đổi sẽ bị ghi đè khi lưu.
   Phiên bản nội dung: ${c.rev || 0} */\n` + parts.map(([k, v]) => `const ${k} = ${J(v)};`).join("\n") + "\n";
}

const attr = s => String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const text = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* Thay tiêu đề, mô tả, thẻ chia sẻ và số phiên bản data.js trong một trang HTML */
function patchHtml(html, seo, rev) {
  let s = html;
  if (seo && seo.title) {
    s = s.replace(/<title>[\s\S]*?<\/title>/, `<title>${text(seo.title)}</title>`);
    s = s.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${attr(seo.title)}$2`);
  }
  if (seo && seo.description) {
    s = s.replace(/(<meta name="description" content=")[^"]*(")/, `$1${attr(seo.description)}$2`);
    s = s.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${attr(seo.description)}$2`);
  }
  s = s.replace(/js\/data\.js\?v=[^"]*/, `js/data.js?v=d${rev}`);
  return s;
}

/* Kiểm tra dữ liệu trước khi lưu; trả về danh sách lỗi (rỗng = hợp lệ) */
function validate(c) {
  const err = [];
  const need = ["site", "social", "categories", "products", "hero", "features", "stories", "limousine", "notes", "materials", "photoAlt", "pages", "seo"];
  need.forEach(k => { if (c[k] === undefined || c[k] === null) err.push(`Thiếu mục "${k}"`); });
  if (err.length) return err;
  const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const catIds = new Set();
  c.categories.forEach((x, i) => {
    if (!x.id || !slug.test(x.id)) err.push(`Danh mục #${i + 1}: mã "${x.id}" chỉ được dùng chữ thường không dấu, số và dấu gạch ngang`);
    if (catIds.has(x.id)) err.push(`Danh mục: mã "${x.id}" bị trùng`);
    catIds.add(x.id);
    if (!String(x.name || "").trim()) err.push(`Danh mục "${x.id}": chưa có tên`);
  });
  const ids = new Set();
  c.products.forEach((p, i) => {
    const label = p.name || p.id || `#${i + 1}`;
    if (!p.id || !slug.test(p.id)) err.push(`Sản phẩm "${label}": mã "${p.id}" chỉ được dùng chữ thường không dấu, số và dấu gạch ngang`);
    if (ids.has(p.id)) err.push(`Sản phẩm: mã "${p.id}" bị trùng`);
    ids.add(p.id);
    if (!String(p.name || "").trim()) err.push(`Sản phẩm "${p.id}": chưa có tên`);
    if (!catIds.has(p.cat)) err.push(`Sản phẩm "${label}": danh mục "${p.cat}" không tồn tại`);
    if (p.prices && p.prices.length && p.prices.some(n => !(Number(n) >= 0))) err.push(`Sản phẩm "${label}": giá phải là số`);
    (p.colors || []).forEach(col => { if (!/^#[0-9a-fA-F]{6}$/.test(col[1] || "")) err.push(`Sản phẩm "${label}": mã màu "${col[1]}" không hợp lệ`); });
  });
  if (!c.hero.length) err.push("Trang chủ cần ít nhất 1 slide đầu trang");
  if (c.site.siteUrl && !/^https?:\/\/[^\s/]+\.[^\s/]+/.test(String(c.site.siteUrl).trim())) err.push("Địa chỉ website phải có dạng https://ten-mien.vn");
  return err;
}

module.exports = { buildDataJs, patchHtml, validate, outProduct, PAGE_FILES, slugify, productSlugs, productPath };
