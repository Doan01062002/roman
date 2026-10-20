/* =====================================================================
   Trang chủ: Tìm sản phẩm cho xe của bạn + Tư vấn chọn sàn/thảm (6 câu)
   - Chọn hãng, dòng, đời xe (hoặc chọn theo loại xe) -> hiện sản phẩm và giá đúng loại xe
   - Bộ 6 câu hỏi -> gợi ý một sản phẩm sàn/thảm, kèm lý do và phương án khác
   Giá luôn lấy từ PRODUCTS (sửa giá trong trang quản trị là tự cập nhật ở đây).
   Chạy sau app.js (dùng $, $$, esc, ph, pUrl, norm, PRODUCTS, CATEGORIES).
   ===================================================================== */

/* ---------- Loại xe ---------- */
/* cls: bảng giá áp dụng (mini = VF2/VF3, 5 = xe 5 chỗ, 7 = xe 7 chỗ, null = báo giá theo xe); body: dùng cho thảm taplo */
const FD_TYPES = [
  { id: "sedan", name: "Sedan", cls: "5", body: "sedan" },
  { id: "hatch", name: "Hatchback & xe đô thị", cls: "5", body: "sedan" },
  { id: "suv5", name: "SUV / CUV 5 chỗ", cls: "5", body: "suv" },
  { id: "suv7", name: "SUV 7 chỗ", cls: "7", body: "suv" },
  { id: "mpv", name: "MPV", cls: "7", body: "mpv" },
  { id: "pickup", name: "Bán tải", cls: "5", body: "mpv" },
  { id: "van16", name: "Xe 16 chỗ", cls: null, body: null },
];
const fdType = id => FD_TYPES.find(t => t.id === id);
const FD_CLS_LABEL = { mini: "xe VF2 / VF3", 5: "xe 5 chỗ", 7: "xe 7 chỗ" };
const fdClsNote = cls => (cls ? `Giá ${FD_CLS_LABEL[cls]}` : "Báo giá theo xe");

/* Hình xe nét mảnh (vẽ tay, cùng một khung 124 x 44) */
const FD_ICON_PATHS = {
  sedan: ["M8 33V27c0-3 2-4 5-4.6l17-2.2 11-7.6c2-1.4 4-2 7-2h22c4 0 6 1 8.5 3.4l8.5 6.6 16 2.2c4 .6 6 2.4 6 5.6V33z", "M44 20l6-6h12v6z", "M65 14h7c3 0 4.5.8 6 2.4l3.5 3.6H65z"],
  hatch: ["M10 33v-7c0-3 2-4 5-4.4l13-1.8 11-8c2-1.4 4-2 7-2h38c3 0 4.5 1.6 5 4l3 8.6c1.4 1.4 2 3 2 5V33z", "M41 19l6-6h14v6z", "M64 13h20l2 6H64z"],
  suv5: ["M8 33v-9c0-3 2-4 5-4.4l11-1.2 9-9c1.6-1.6 3.6-2.4 6.4-2.4H94c4 0 5.6 1.8 6.4 4.6l3 9.4c1.8 1.4 2.6 3 2.6 5.4V33z", "M36 17l6-7h24v7z", "M69 10h25l2.4 7H69z"],
  suv7: ["M6 33v-9c0-3 2-4 5-4.4l9-1.2 9-9.4c1.6-1.6 3.6-2.4 6.4-2.4H106c4 0 5.6 1.8 6.2 4.6l2.2 9.6c1.8 1.4 2.6 3 2.6 5.4V33z", "M33 16l6-7h19v7z", "M61 9h21v7H61z", "M85 9h21.4l1.8 7H85z"],
  mpv: ["M8 33V20.5c0-2 .8-3.6 2.2-5L18 8.6c1.4-1.2 3-1.8 5-1.8H108c3 0 5 2 5 5V33z", "M22 16l7-6h19v6z", "M51 10h22v6H51z", "M76 10h22v6H76z", "M101 10h7v6h-7z"],
  pickup: ["M8 33v-9c0-3 2-4 5-4.4l9-1.2 9-9c1.6-1.6 3.6-2.4 6.4-2.4H62c1.6 0 2.6 1 2.6 2.6V20H112c1.4 0 2 .8 2 2V33z", "M35 16l6-6h8v6z", "M52 10h10v6H52z"],
  van16: ["M6 33V11.5C6 8.8 8 7 10.6 7H112c2.8 0 4.6 2 4.6 4.6V33z", "M12 12h13v7H12z", "M29 12h20v7H29z", "M53 12h20v7H53z", "M77 12h20v7H77z", "M101 12h11v7h-11z"],
};
const FD_WHEELS = { sedan: [30, 92], hatch: [28, 82], suv5: [28, 90], suv7: [26, 98], mpv: [26, 96], pickup: [26, 96], van16: [24, 100] };
const fdIcon = id => `<svg class="fd-car" viewBox="0 0 124 44" aria-hidden="true" focusable="false">
  <path class="fd-ground" d="M2 39.5h120"/>
  ${FD_ICON_PATHS[id].map((d, i) => `<path class="${i ? "fd-win" : "fd-body"}" d="${d}"/>`).join("")}
  ${FD_WHEELS[id].map(x => `<circle class="fd-wheel" cx="${x}" cy="34" r="5.2"/><circle class="fd-hub" cx="${x}" cy="34" r="1.7"/>`).join("")}
</svg>`;

/* ---------- Hãng, dòng, đời xe: sửa trong trang quản trị (Nội dung website > Danh sách xe), lưu ở CARS (data.js) ----------
   mini = bảng giá xe VF2 / VF3; keys = từ khoá khớp với tuỳ chọn giá của sản phẩm làm riêng (ghế Limousine cho Carnival...) */
const FD_CARS = typeof CARS !== "undefined" && CARS && Array.isArray(CARS.brands) ? CARS : { brands: [], quick: [] };
const FD_BRANDS = FD_CARS.brands.filter(b => b && b.name).map(b => ({
  name: b.name,
  models: (b.models || []).filter(m => m && m.name && fdType(m.type))
    .map(m => ({ name: m.name, type: m.type, from: +m.from || 2000, to: m.to ? +m.to : null, cls: m.mini ? "mini" : undefined, k: m.keys || [] })),
})).filter(b => b.models.length);
const FD_QUICK = (FD_CARS.quick || []).filter(q => FD_BRANDS.some(b => b.name === q.brand && b.models.some(m => m.name === q.model)));
const fdQuickLabel = m => m.replace(/^([A-Za-z]{1,3}) (\d)$/, "$1$2");

/* Ghi thống kê ẩn danh (xe được tìm, lượt tư vấn, sản phẩm được gợi ý) về trang quản trị, cùng điều kiện với thống kê lượt xem */
const fdTrack = (e, v) => {
  try {
    if (/^\/api\//.test(SITE.formEndpoint || "") && navigator.sendBeacon && navigator.doNotTrack !== "1" && /^https?:/.test(location.protocol))
      navigator.sendBeacon("/api/track", new Blob([JSON.stringify({ e, v })], { type: "application/json" }));
  } catch (err) { /* thống kê không được làm hỏng trang */ }
};

/* ---------- Giá theo xe ---------- */
const fdVnd = n => n.toLocaleString("vi-VN") + "đ";
const FD_CLS_RE = { mini: /\bvf ?[23]\b|minio/, 5: /5 cho/, 7: /7 cho/ };
const FD_BODY_RE = { sedan: /sedan/, suv: /suv|cuv/, mpv: /ban tai|mpv/ };
/* car = { cls, body, k[] } -> { price, opt, from } hoặc null nếu sản phẩm không có giá riêng cho xe này */
function fdPrice(p, car) {
  if (!p.prices || !p.options) return null;
  const opts = p.options.map(norm);
  const pick = test => opts.map((o, i) => (test(o) ? i : -1)).filter(i => i >= 0);
  let idx = car.k && car.k.length ? pick(o => car.k.some(k => o.includes(norm(k)))) : [];
  if (!idx.length && car.cls) idx = pick(o => FD_CLS_RE[car.cls].test(o));
  if (!idx.length && car.body) idx = pick(o => FD_BODY_RE[car.body].test(o));
  if (!idx.length) return null;
  const best = idx.reduce((a, b) => (p.prices[b] < p.prices[a] ? b : a));
  return { price: p.prices[best], opt: p.options[best], from: idx.length > 1 };
}
/* Trên điện thoại mỗi nhóm kết quả chỉ hiện trước 3 sản phẩm, còn lại bấm "Xem thêm" */
const FD_PHONE_LIMIT = 3;
const FD_GROUPS = [["san", "Sàn & thảm lót chân"], ["ghe-da", "Ghế da"], ["taplo", "Thảm taplo"]];

/* Hai dòng sàn/thảm, mỗi dòng ba cấp (xếp theo giá xe 5 chỗ) */
const fdLines = () => {
  const by = re => PRODUCTS.filter(p => p.cat === "san" && re.test(norm(p.sub || p.name)) && p.prices)
    .sort((a, b) => (a.prices[1] ?? a.price) - (b.prices[1] ?? b.price));
  return { full: by(/360/), mat: by(/tham/) };
};

/* ---------- Câu hỏi tư vấn ---------- */
/* s: điểm cho dòng (f = Sàn 360 phủ kín, m = thảm lót chân); why: lý do theo dòng được gợi ý */
const FD_Q = [
  { id: "type", label: "Xe", title: "Xe của bạn thuộc loại nào?", sub: "Loại xe quyết định form thảm và bảng giá 5 chỗ hay 7 chỗ." },
  { id: "who", label: "Đi cùng", multi: true, title: "Ai thường đi cùng xe?", sub: "Chọn tất cả những gì phù hợp.", options: [
    { id: "kids", t: "Trẻ nhỏ", d: "Bánh kẹo, nước uống, giày dép bẩn", s: { f: 2 }, why: { f: "Đi cùng trẻ nhỏ: vụn bánh, nước đổ thường rơi cả ra ngoài vị trí để chân.", m: "Đi cùng trẻ nhỏ: nhấc thảm ra giũ là sạch vụn bánh, nước đổ." } },
    { id: "pets", t: "Thú cưng", d: "Lông, đất cát theo chân", s: { f: 2 }, why: { f: "Có thú cưng: lông và đất cát bám khắp sàn, không chỉ ở chỗ để chân." } },
    { id: "family", t: "Người lớn trong gia đình", d: "Đi chơi, về quê cuối tuần", s: { f: 1 }, why: { f: "Cả nhà hay đi chơi, về quê: hàng ghế sau cũng được phủ kín như ghế lái." } },
    { id: "guests", t: "Khách, đối tác", d: "Cần khoang xe chỉn chu", s: { f: 1 }, why: { f: "Hay đón khách, đối tác: sàn phủ kín cho khoang xe gọn gàng, chỉn chu.", m: "Hay đón khách, đối tác: thảm cùng tông nội thất cho khoang xe chỉn chu." } },
    { id: "solo", t: "Chủ yếu đi một mình", d: "Đi làm, công việc", s: { m: 2 }, why: { m: "Chủ yếu đi một mình: thảm lót bảo vệ đúng những vị trí để chân hay dùng." } },
  ] },
  { id: "road", label: "Điều kiện", title: "Xe thường đi trong điều kiện nào?", options: [
    { id: "city", t: "Đi phố, đi làm hằng ngày", d: "Đường đô thị, ít bùn nước", s: { m: 1 }, why: { m: "Đi phố hằng ngày, ít bùn nước: thảm lót chân là đủ dùng." } },
    { id: "rain", t: "Hay đi mưa, đường ngập", d: "Nước theo giày vào xe", s: { f: 2 }, why: { f: "Hay đi mưa, đường ngập: sàn phủ kín che chắn cả phần sàn quanh chỗ để chân." } },
    { id: "rough", t: "Đường tỉnh, công trình, đường đất", d: "Bùn đất bám giày", s: { f: 2 }, why: { f: "Hay đi đường đất, công trình: bùn bám giày rơi khắp sàn, nên phủ kín cả sàn." } },
    { id: "service", t: "Chạy dịch vụ, nhiều lượt khách", d: "Xe hoạt động cả ngày", s: { f: 2 }, why: { f: "Nhiều lượt khách lên xuống mỗi ngày, sàn xe chịu bẩn nhiều." } },
  ] },
  { id: "care", label: "Ưu tiên", title: "Bạn quan tâm điều gì nhất?", options: [
    { id: "clean", t: "Dễ vệ sinh, nhanh gọn", d: "Ít thời gian dọn xe", s: { f: 1 }, why: { f: "Ưu tiên dễ vệ sinh: một lớp phủ kín sàn, lau một lượt là sạch.", m: "Ưu tiên dễ vệ sinh: thảm nhấc ra giũ, rửa nhanh gọn." } },
    { id: "stock", t: "Giữ sàn zin của xe", d: "Bảo vệ sàn nguyên bản", s: { f: 2 }, why: { f: "Muốn giữ sàn zin: sàn 360 che kín sàn nguyên bản, hạn chế trầy bẩn." } },
    { id: "look", t: "Đẹp, đồng bộ nội thất", d: "Cùng tông ghế và táp-lô", s: { f: 1 }, why: { f: "Ưu tiên thẩm mỹ: sàn may theo form xe, chọn màu cùng tông ghế và táp-lô.", m: "Ưu tiên thẩm mỹ: chọn màu thảm cùng tông ghế và táp-lô." } },
    { id: "comfort", t: "Êm chân khi đi xa", d: "Cảm giác dưới chân", s: { m: 2 }, why: { m: "Ưu tiên êm chân: thử trực tiếp cảm giác từng dòng thảm khi xem mẫu tại xưởng.", f: "Ưu tiên êm chân: thử trực tiếp cảm giác từng cấp sàn khi xem mẫu tại xưởng." } },
  ] },
  { id: "tier", label: "Mức đầu tư", title: "Mức đầu tư bạn hướng tới?", sub: "Mỗi dòng thảm có ba cấp hoàn thiện." },
  { id: "trunk", label: "Chở đồ trong cốp", title: "Bạn có hay chở đồ trong cốp?", options: [
    { id: "often", t: "Thường xuyên", d: "Vali, xe đẩy, đồ thể thao, hàng hoá", s: { f: 1 }, why: { f: "Hay chở đồ trong cốp: khi xem mẫu, hỏi thêm ROMAN phần lót cốp cùng chất liệu.", m: "Hay chở đồ trong cốp: khi xem mẫu, hỏi thêm ROMAN phần lót cốp cùng chất liệu." } },
    { id: "some", t: "Thỉnh thoảng", d: "Đi chợ, đi chơi xa" },
    { id: "rare", t: "Hầu như không", d: "Cốp gần như để trống", s: { m: 1 } },
  ] },
];
const FD_TIERS = [["Hợp lý", "Cấp cơ bản"], ["Cân bằng", "Cấp giữa"], ["Hoàn thiện cao", "Cấp cao nhất của mỗi dòng"]];

function initFinder() {
  const root = $("#chon-tham");
  if (!root || typeof PRODUCTS === "undefined") return;
  const lines = fdLines();
  const st = { brand: null, model: null, year: null, open: null, stage: "types", step: 0, ans: { who: [] }, lastCar: null };
  const thisYear = new Date().getFullYear();
  const yearsOf = m => { const out = []; for (let y = m.to || thisYear; y >= m.from; y--) out.push(y); return out; };

  root.innerHTML = `<div class="wrap fd">
    <header class="fd-head">
      <p class="sec-eyebrow">Bắt đầu từ chiếc xe</p>
      <h2 class="section-title">Tìm sản phẩm cho xe của bạn</h2>
      <p class="section-sub">Chọn hãng, dòng và đời xe. ROMAN hiển thị sản phẩm và giá theo đúng chiếc xe đó.</p>
    </header>
    <div class="fd-card"${FD_BRANDS.length ? "" : " hidden"}>
      <div class="fd-bar">
        ${[["brand", "01", "Hãng xe"], ["model", "02", "Dòng xe"], ["year", "03", "Đời xe"]].map(([k, n, t]) => `
        <button type="button" class="fd-step" data-step="${k}" aria-expanded="false" aria-controls="fdPanel">
          <span class="fd-step-k">${n}&nbsp; ${t}</span>
          <span class="fd-step-v" data-v="${k}">Chọn</span>
          <svg class="fd-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5"/></svg>
        </button>`).join("")}
        <button type="button" class="btn fd-go" id="fdGo" disabled>Xem sản phẩm <span aria-hidden="true">→</span></button>
      </div>
      <div class="fd-panel" id="fdPanel" role="group" hidden></div>
      <div class="fd-quick"${FD_QUICK.length ? "" : " hidden"}>
        <span class="fd-quick-k">Chọn nhanh</span>
        ${FD_QUICK.map((q, i) => `<button type="button" class="fd-chip" data-quick="${i}" title="${esc(q.brand + " " + q.model)}">${esc(fdQuickLabel(q.model))}</button>`).join("")}
        <button type="button" class="fd-miss" id="fdMiss">Không thấy xe của bạn?</button>
      </div>
    </div>
    <div class="fd-results" id="fdResults" hidden aria-live="polite"></div>
    <div class="fd-stage" id="fdStage"></div>
  </div>`;

  const panel = $("#fdPanel", root), go = $("#fdGo", root), results = $("#fdResults", root), stage = $("#fdStage", root);
  const brandObj = () => FD_BRANDS.find(b => b.name === st.brand);
  const modelObj = () => brandObj()?.models.find(m => m.name === st.model);

  /* ----- Thanh chọn xe ----- */
  const syncBar = () => {
    $$(".fd-step", root).forEach(b => {
      const k = b.dataset.step, val = st[k];
      const enabled = k === "brand" || (k === "model" && st.brand) || (k === "year" && st.model);
      b.disabled = !enabled;
      b.classList.toggle("is-open", st.open === k);
      b.classList.toggle("has-v", !!val);
      b.setAttribute("aria-expanded", String(st.open === k));
      $(`[data-v=${k}]`, b).textContent = val || "Chọn";
    });
    go.disabled = !(st.brand && st.model);
    if (!st.open) { panel.hidden = true; panel.innerHTML = ""; return; }
    const items = st.open === "brand" ? FD_BRANDS.map(b => b.name) : st.open === "model" ? brandObj().models.map(m => m.name) : yearsOf(modelObj()).map(String);
    panel.hidden = false;
    panel.className = `fd-panel fd-panel--${st.open}`;
    panel.setAttribute("aria-label", st.open === "brand" ? "Chọn hãng xe" : st.open === "model" ? "Chọn dòng xe" : "Chọn đời xe");
    panel.innerHTML = items.map(v => `<button type="button" class="fd-opt${String(st[st.open]) === v ? " on" : ""}" data-val="${esc(v)}" aria-pressed="${String(st[st.open]) === v}">${esc(v)}</button>`).join("");
  };
  $$(".fd-step", root).forEach(b => b.addEventListener("click", () => { st.open = st.open === b.dataset.step ? null : b.dataset.step; syncBar(); panel.querySelector(".on, .fd-opt")?.focus({ preventScroll: true }); }));
  panel.addEventListener("click", e => {
    const b = e.target.closest(".fd-opt"); if (!b) return;
    const v = b.dataset.val;
    if (st.open === "brand") { if (st.brand !== v) { st.model = null; st.year = null; } st.brand = v; st.open = "model"; }
    else if (st.open === "model") { if (st.model !== v) st.year = null; st.model = v; st.open = "year"; }
    else { st.year = v; st.open = null; }
    syncBar();
    if (st.open) panel.querySelector(".fd-opt")?.focus({ preventScroll: true });
    else go.focus({ preventScroll: true });
  });
  /* bấm ra ngoài khung chọn xe thì đóng danh sách (dùng composedPath vì nút vừa bấm có thể đã được vẽ lại) */
  document.addEventListener("click", e => { if (st.open && !e.composedPath().includes($(".fd-card", root))) { st.open = null; syncBar(); } });
  root.addEventListener("keydown", e => { if (e.key === "Escape" && st.open) { const k = st.open; st.open = null; syncBar(); $(`.fd-step[data-step=${k}]`, root).focus(); } });

  const carFromModel = () => {
    const m = modelObj(), t = fdType(m.type);
    return { src: "car", model: `${st.brand} ${m.name}`, label: `${st.brand} ${m.name}${st.year ? ` · đời ${st.year}` : ""}`, xe: `${st.brand} ${m.name}${st.year ? ` ${st.year}` : ""}`, type: t.id, cls: m.cls || t.cls, body: t.body, k: m.k };
  };
  go.addEventListener("click", () => { st.open = null; syncBar(); showResults(carFromModel()); });
  $$(".fd-chip", root).forEach(b => b.addEventListener("click", () => {
    const q = FD_QUICK[+b.dataset.quick]; st.brand = q.brand; st.model = q.model; st.year = null; st.open = null; syncBar(); showResults(carFromModel());
  }));
  $("#fdMiss", root).addEventListener("click", () => {
    if (st.stage !== "types") { st.stage = "types"; renderStage(); }
    const grid = $(".fd-types", root);
    grid.scrollIntoView({ behavior: "smooth", block: "center" });
    grid.classList.remove("is-flash"); void grid.offsetWidth; grid.classList.add("is-flash");
  });

  /* ----- Kết quả theo xe ----- */
  const resultCard = (p, pr, extra) => {
    const pid = p.photos && p.photos[0];
    return `<a class="fd-prod${extra ? " is-extra" : ""}" href="${pUrl(p)}">
      <div class="fd-prod-img">${pid ? `<img src="${ph(pid, "sm")}" alt="${esc(PHOTO_ALT[pid] || p.name)}" loading="lazy">` : ""}${p.tag ? `<span class="fd-tag">${esc(p.tag)}</span>` : ""}</div>
      <div class="fd-prod-body">
        <h4>${esc(p.nick || p.name)}</h4>
        <p class="fd-prod-sub">${esc(p.sub || "")}</p>
        <p class="fd-prod-price"><b>${pr.price ? `${pr.from ? "Từ " : ""}${fdVnd(pr.price)}` : "Liên hệ báo giá"}</b><span>${esc(pr.opt)}</span></p>
      </div>
    </a>`;
  };
  function showResults(car) {
    st.lastCar = car;
    if (car.src === "car") fdTrack("car", car.model); else if (car.src === "type") fdTrack("type", car.type);
    const groups = FD_GROUPS.map(([cat, title]) => [title, PRODUCTS.filter(p => p.cat === cat).map(p => [p, fdPrice(p, car)]).filter(([, pr]) => pr)])
      .filter(([, list]) => list.length);
    /* sản phẩm làm riêng cho đúng dòng xe (ghế Limousine cho Carnival, Alphard, V-Class...) */
    const generic = p => p.options.some(o => Object.values(FD_CLS_RE).some(re => re.test(norm(o))));
    const kMatch = p => p.options.find(o => car.k.some(k => norm(o).includes(norm(k))));
    const special = car.k && car.k.length ? PRODUCTS.filter(p => p.options && !generic(p) && kMatch(p))
      .map(p => [p, p.prices ? fdPrice(p, { k: car.k }) : { price: 0, opt: kMatch(p) }]).filter(([, pr]) => pr) : [];
    if (special.length) groups.unshift(["Dành riêng cho dòng xe này", special]);
    const seen = new Set();
    groups.forEach(g => { g[1] = g[1].filter(([p]) => (seen.has(p.id) ? false : seen.add(p.id))); });
    const shown = groups.filter(([, list]) => list.length);
    const t = fdType(car.type);
    results.hidden = false;
    results.innerHTML = `<div class="fd-res-head">
        <div>
          <p class="fd-res-k">Sản phẩm cho</p>
          <h3 class="fd-res-title">${esc(car.label)}</h3>
          <p class="fd-res-meta">${esc(t.name)} · ${esc(fdClsNote(car.cls))}</p>
        </div>
        <div class="fd-res-acts">
          <button type="button" class="btn btn-outline btn-sm" data-act="quiz">Tư vấn chọn thảm</button>
          <a class="btn btn-dark btn-sm" href="support.html?xe=${encodeURIComponent(car.xe)}#lien-he">Đặt lịch xem mẫu</a>
        </div>
      </div>
      ${shown.length ? shown.map(([title, list]) => `<div class="fd-res-group"><p class="fd-res-gt">${esc(title)} <span>${list.length}</span></p>
        <div class="fd-res-grid">${list.map(([p, pr], i) => resultCard(p, pr, i >= FD_PHONE_LIMIT)).join("")}</div>
        ${list.length > FD_PHONE_LIMIT ? `<button type="button" class="fd-more" aria-expanded="false" data-more="${list.length - FD_PHONE_LIMIT}">Xem thêm ${list.length - FD_PHONE_LIMIT} sản phẩm</button>` : ""}</div>`).join("")
        : `<p class="fd-res-empty">${esc(t.name)} được báo giá theo từng xe. Gọi <a href="tel:${telOf(SITE.hotline)}">${esc(SITE.hotline)}</a> hoặc đặt lịch để ROMAN đo và báo giá chính xác.</p>`}
      <p class="fd-res-note">Vô lăng, trần, dán nội thất được báo giá theo hạng mục: <a href="category.html?cat=vo-lang">vô lăng</a> · <a href="category.html?cat=tran">trần</a> · <a href="category.html?cat=nhua">dán nội thất</a>.</p>`;
    $("[data-act=quiz]", results).addEventListener("click", () => startQuiz(car.type));
    $$(".fd-more", results).forEach(b => b.addEventListener("click", () => {
      const g = b.closest(".fd-res-group"), open = !g.classList.contains("is-open");
      g.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", String(open));
      b.textContent = open ? "Thu gọn" : `Xem thêm ${b.dataset.more} sản phẩm`;
      if (!open) g.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    results.classList.remove("is-in"); void results.offsetWidth; results.classList.add("is-in");
    requestAnimationFrame(() => results.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  /* ----- Khối dưới: chọn theo loại xe / tư vấn / gợi ý ----- */
  const typeBtn = (t, withNote) => `<button type="button" class="fd-type${st.ans.type === t.id && st.stage === "quiz" ? " on" : ""}" data-type="${t.id}" aria-pressed="${st.ans.type === t.id && st.stage === "quiz"}">
      ${fdIcon(t.id)}<span class="fd-type-n">${esc(t.name)}</span>${withNote ? `<span class="fd-type-d">${esc(fdClsNote(t.cls))}</span>` : ""}</button>`;
  const optBtn = (o, on) => `<button type="button" class="fd-q-opt${on ? " on" : ""}" data-opt="${esc(String(o.id))}" aria-pressed="${on}">
      <span class="fd-q-t">${esc(o.t)}</span><span class="fd-q-d">${esc(o.d)}</span>${o.multi ? `<span class="fd-q-box" aria-hidden="true"></span>` : ""}</button>`;
  const clsForQuiz = () => fdType(st.ans.type)?.cls || "5";
  const tierOptions = () => {
    const cls = clsForQuiz(), i = cls === "mini" ? 0 : cls === "7" ? 2 : 1;
    return FD_TIERS.map(([t, d], k) => { const p = lines.mat[k]; const pr = p && p.prices[i]; return { id: k, t, d: pr ? `${d} · thảm lót chân từ ${fdVnd(pr)}` : d }; });
  };

  function renderStage() {
    if (st.stage === "types") {
      stage.innerHTML = `<div class="fd-alt">
        <div class="fd-alt-head"><p class="fd-alt-k">Hoặc chọn theo loại xe</p><button type="button" class="fd-alt-link" data-act="quiz">Chưa biết chọn thảm nào? Tư vấn 1 phút <span aria-hidden="true">→</span></button></div>
        <div class="fd-types">${FD_TYPES.map(t => typeBtn(t, false)).join("")}</div>
      </div>`;
      $$(".fd-type", stage).forEach(b => b.addEventListener("click", () => { const t = fdType(b.dataset.type); showResults({ src: "type", label: t.name, xe: t.name, type: t.id, cls: t.cls, body: t.body, k: [] }); }));
      $("[data-act=quiz]", stage).addEventListener("click", () => startQuiz(st.lastCar?.type));
      return;
    }
    if (st.stage === "quiz") return renderQuestion();
    renderResult();
  }

  function startQuiz(type) {
    st.stage = "quiz"; st.step = 0; st.ans = { who: [] }; st.quizDone = false;
    fdTrack("quiz", "start");
    if (type) st.ans.type = type;
    renderStage();
    stage.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderQuestion(back) {
    const q = FD_Q[st.step], n = st.step + 1;
    const opts = q.id === "type" ? null : q.id === "tier" ? tierOptions() : q.options;
    const cur = st.ans[q.id];
    stage.innerHTML = `<div class="fd-quiz${back ? " is-back" : ""}">
      <div class="fd-q-top">
        <p class="fd-q-n">Câu ${n}/${FD_Q.length}</p>
        ${st.step ? `<button type="button" class="fd-q-back" data-act="back"><span aria-hidden="true">←</span> Quay lại</button>` : `<button type="button" class="fd-q-back" data-act="exit">Đóng</button>`}
        <span class="fd-q-bar" style="--p:${n / FD_Q.length}" aria-hidden="true"></span>
      </div>
      <h3 class="fd-q-title" tabindex="-1">${esc(q.title)}</h3>
      ${q.sub ? `<p class="fd-q-sub">${esc(q.sub)}</p>` : ""}
      ${q.id === "type"
        ? `<div class="fd-types fd-types--q">${FD_TYPES.map(t => typeBtn(t, true)).join("")}</div>`
        : `<div class="fd-q-grid fd-q-grid--${opts.length === 3 ? 3 : 2}">${opts.map(o => optBtn({ ...o, multi: q.multi }, q.multi ? cur.includes(o.id) : String(cur) === String(o.id))).join("")}</div>`}
      ${q.multi ? `<button type="button" class="btn fd-next" data-act="next"${cur.length ? "" : " disabled"}>Tiếp tục</button>` : ""}
    </div>`;
    const title = $(".fd-q-title", stage);
    title.focus({ preventScroll: true });
    if (stage.getBoundingClientRect().top < 0) stage.scrollIntoView({ behavior: "smooth", block: "start" });
    $("[data-act=back]", stage)?.addEventListener("click", () => { st.step--; renderQuestion(true); });
    $("[data-act=exit]", stage)?.addEventListener("click", () => { st.stage = "types"; renderStage(); });
    $("[data-act=next]", stage)?.addEventListener("click", () => advance());
    if (q.id === "type") $$(".fd-type", stage).forEach(b => b.addEventListener("click", () => { st.ans.type = b.dataset.type; advance(); }));
    else $$(".fd-q-opt", stage).forEach(b => b.addEventListener("click", () => {
      const v = q.id === "tier" ? +b.dataset.opt : b.dataset.opt;
      if (q.multi) {
        /* "Chủ yếu đi một mình" không đi chung với các lựa chọn khác */
        let list = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v];
        if (v === "solo" && list.includes("solo")) list = ["solo"]; else if (v !== "solo") list = list.filter(x => x !== "solo");
        st.ans[q.id] = list;
        renderQuestion();
        return;
      }
      st.ans[q.id] = v;
      b.classList.add("on");
      setTimeout(advance, 180);
    }));
  }
  function advance() {
    if (st.step < FD_Q.length - 1) { st.step++; renderQuestion(); }
    else { st.stage = "result"; renderResult(); }
  }

  /* ----- Tính gợi ý ----- */
  function recommend() {
    const a = st.ans, picked = [];
    FD_Q.forEach(q => { if (!q.options) return; const v = a[q.id]; (Array.isArray(v) ? v : [v]).forEach(id => { const o = q.options.find(x => x.id === id); if (o) picked.push(o); }); });
    const score = { f: 0, m: 0 };
    picked.forEach(o => { if (o.s) { score.f += o.s.f || 0; score.m += o.s.m || 0; } });
    const line = score.f >= score.m && lines.full.length ? "full" : "mat";
    const tier = Math.max(0, Math.min(2, a.tier ?? 1));
    const list = lines[line], main = list[Math.min(tier, list.length - 1)];
    const other = lines[line === "full" ? "mat" : "full"];
    const alts = [other[Math.min(tier, other.length - 1)], list[tier < list.length - 1 ? tier + 1 : tier - 1]].filter(p => p && p !== main);
    const key = line === "full" ? "f" : "m";
    const why = [line === "full" ? "Sàn 360 phủ kín toàn bộ sàn xe, không chỉ vị trí để chân." : "Thảm lót chân gọn nhẹ, nhấc ra vệ sinh nhanh, giữ chỗ để chân luôn sạch."];
    picked.forEach(o => { const w = o.why && o.why[key]; if (w && !why.includes(w) && why.length < 4) why.push(w); });
    why.push(`${FD_TIERS[tier][0]}: ${tier === 2 ? "cấp hoàn thiện cao nhất" : tier === 1 ? "cấp giữa" : "cấp cơ bản"} của dòng ${line === "full" ? "Sàn 360" : "thảm ROMAN"}.`);
    return { main, alts, why };
  }

  function renderResult() {
    const a = st.ans, t = fdType(a.type) || FD_TYPES[0];
    const car = { cls: t.cls, body: t.body, k: [] };
    const { main, alts, why } = recommend();
    if (!st.quizDone) { st.quizDone = true; fdTrack("quiz", "done"); fdTrack("pick", main.id); }
    const optName = (qid, id) => FD_Q.find(q => q.id === qid).options.find(o => o.id === id)?.t;
    const chips = [
      ["Xe", t.name],
      ["Đi cùng", a.who.map(id => optName("who", id)).join(", ")],
      ["Điều kiện", optName("road", a.road)],
      ["Ưu tiên", optName("care", a.care)],
      ["Mức đầu tư", FD_TIERS[a.tier ?? 1][0]],
      ["Chở đồ trong cốp", optName("trunk", a.trunk)],
    ].filter(([, v]) => v);
    const priceLine = p => { const pr = fdPrice(p, car); return pr ? `<b>${pr.from ? "Từ " : ""}${fdVnd(pr.price)}</b><span>${esc(pr.opt.replace(/^Xe /, "xe "))}</span>` : `<b>Báo giá theo xe</b><span>${esc(t.name)}</span>`; };
    const pid = main.photos && main.photos[0];
    const xe = st.lastCar && st.lastCar.type === t.id ? st.lastCar.xe : t.name;
    stage.innerHTML = `<div class="fd-result">
      <p class="sec-eyebrow">Gợi ý cho bạn</p>
      <h3 class="fd-r-title" tabindex="-1">Cho ${esc(t.name)}</h3>
      <ul class="fd-r-chips">${chips.map(([k, v]) => `<li>${esc(k)}: ${esc(v)}</li>`).join("")}</ul>
      <div class="fd-r-acts">
        <button type="button" class="btn btn-outline btn-sm" data-act="edit">Sửa câu trả lời</button>
        <button type="button" class="btn btn-link btn-sm" data-act="redo">Làm lại</button>
      </div>
      <article class="fd-pick">
        <a class="fd-pick-img" href="${pUrl(main)}" tabindex="-1" aria-hidden="true">${pid ? `<img src="${ph(pid, "lg")}" alt="" loading="lazy">` : ""}</a>
        <div class="fd-pick-body">
          <p class="fd-pick-k">Gợi ý chính</p>
          <h4><a href="${pUrl(main)}">${esc(main.nick || main.name)}</a></h4>
          <p class="fd-pick-sub">${esc(main.sub || "")}${main.tag ? ` · ${esc(main.tag)}` : ""}</p>
          <p class="fd-pick-price">${priceLine(main)}</p>
          <p class="fd-pick-wk">Vì sao phù hợp</p>
          <ul class="fd-why">${why.map(w => `<li>${esc(w)}</li>`).join("")}</ul>
          <div class="fd-pick-acts">
            <a class="btn btn-dark" href="support.html?dv=${main.id}&xe=${encodeURIComponent(xe)}#lien-he">Đặt lịch xem mẫu</a>
            <a class="btn btn-outline" href="${pUrl(main)}">Xem chi tiết</a>
          </div>
        </div>
      </article>
      ${alts.length ? `<div class="fd-alts"><p class="fd-res-gt">Phương án khác</p><div class="fd-res-grid fd-res-grid--2">${alts.map(p => { const pr = fdPrice(p, car); return pr ? resultCard(p, pr) : ""; }).join("")}</div></div>` : ""}
    </div>`;
    $(".fd-r-title", stage).focus({ preventScroll: true });
    stage.scrollIntoView({ behavior: "smooth", block: "start" });
    $("[data-act=edit]", stage).addEventListener("click", () => { st.stage = "quiz"; st.step = 0; renderQuestion(); });
    $("[data-act=redo]", stage).addEventListener("click", () => startQuiz());
  }

  syncBar();
  renderStage();
}
