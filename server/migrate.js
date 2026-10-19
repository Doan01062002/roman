/* Chạy một lần: chuyển js/data.js (bản viết tay) sang content/site.json.
   node server/migrate.js            -> ghi content/site.json, sinh lại js/data.js và kiểm tra kết quả giống bản cũ
   node server/migrate.js --check    -> chỉ kiểm tra, không ghi gì */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const { buildDataJs, patchHtml, PAGE_FILES } = require("./build");

const ROOT = path.join(__dirname, "..");
const NAMES = ["SITE", "CATEGORIES", "PRODUCTS", "HERO_SLIDES", "FEATURES", "STORIES", "LIMOUSINE", "NOTES", "SOCIAL", "PHOTO_ALT", "MATERIALS"];
const load = code => vm.runInNewContext(code + `\n;({${NAMES.join(",")}, PAGES: typeof PAGES === "undefined" ? null : PAGES})`, {}, { timeout: 2000 });
const clone = v => JSON.parse(JSON.stringify(v));

const oldCode = fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8");
if (oldCode.startsWith("/* TỆP TỰ SINH")) { console.log("js/data.js đã là tệp tự sinh, không cần chuyển."); process.exit(0); }
const old = clone(load(oldCode));

/* ---- Sản phẩm: bỏ phần tự tính (giá thấp nhất, dòng giá) để bộ sinh tạo lại ---- */
const products = old.PRODUCTS.map(p => {
  const s = clone(p);
  delete s.price; delete s.old;
  if (s.nick === s.name) delete s.nick;
  if (s.prices) {
    s.autoPrice = true;
    s.highlights = s.highlights.filter((h, i) => !(i === 0 && /^Giá niêm yết/.test(h)));
    ["Đơn vị tính", "Giá niêm yết", "Liên hệ"].forEach(k => delete s.specs[k]);
  }
  return s;
});

const site = Object.assign({}, old.SITE, { formEndpoint: "/api/bookings", hours: "", legalName: "", taxCode: "" });
delete site.address;

/* ---- Nội dung các trang (trước đây viết cứng trong HTML) ----
   Có thể chèn {hotline}, {hotline2}, {email}, {store}, {warehouse}, {hours}; liên kết gọi: tel:{hotlineTel} */
const pages = {
  about: {
    eyebrow: "VỀ ROMAN",
    title: "Nghệ Thuật Chế Tác Nội Thất Ô Tô Thủ Công",
    lead: "Ghế da ROMAN (Sumi Fiber, Nappa Fiber, Nappa Fiber Pro, Nappa Clear), ghế điện, sàn ROMAN 360, thảm ROMAN và trần da lộn, niêm yết giá theo từng dòng xe.",
    heroEyebrow: "CỬA HÀNG & TỔNG KHO TẠI HÀ NỘI",
    heroTitle: "Mỗi Khoang Lái Là Một Tác Phẩm Độc Bản",
    heroBody: "**ROMAN** chuyên bọc ghế da, ghế điện, sàn, thảm và trần da lộn cho ô tô, với bảng giá niêm yết rõ ràng theo từng dòng xe: VF2/VF3, xe 5 chỗ và xe 7 chỗ.\n\nCửa hàng ở {store} và tổng kho ở {warehouse}. Bạn có thể đến xem mẫu da, chọn màu trực tiếp hoặc gọi hotline để được tư vấn trước.",
    heroImage: "xuong-01",
    stats: [
      { value: "4 dòng", label: "Ghế da ROMAN: Sumi Fiber, Nappa Fiber, Nappa Fiber Pro, Nappa Clear" },
      { value: "3 dòng", label: "Sàn ROMAN 360: Premium, Nappa Clear, Luxury" },
      { value: "3 dòng", label: "Thảm ROMAN: Signature, Premium, Luxury" },
      { value: "2 địa điểm", label: "Cửa hàng và tổng kho tại Long Biên, Hà Nội" },
    ],
    process: {
      eyebrow: "QUY CHUẨN KỸ THUẬT", title: "Quy Trình Chế Tác 4 Bước Chuẩn Hãng",
      sub: "Kiểm soát chất lượng nghiêm ngặt từ khâu chọn phôi da đến khi bàn giao xe cho khách hàng.",
      steps: [
        { title: "Tư Vấn & Phối Màu Cá Nhân Hóa", body: "Xem mẫu da, bảng màu và kiểu may trực tiếp tại cửa hàng, hoặc gọi hotline để được tư vấn theo dòng xe của bạn." },
        { title: "Quét Khuôn & Cắt Rập CNC", body: "Đo đạc và chuẩn bị chi tiết theo từng dòng xe để sản phẩm ôm khít khoang nội thất." },
        { title: "Khâu Thủ Công & Lắp Đặt An Toàn", body: "Kỹ thuật viên ROMAN thi công theo đúng hạng mục và dòng xe đã chọn, lưu ý các vị trí đặc biệt như túi khí và hệ thống điện của xe." },
        { title: "Kiểm Tra & Bảo Hành", body: "Vệ sinh và kiểm tra bề mặt, hệ thống điện trước khi bàn giao. Bảo hành theo chính sách ROMAN, xem tại trang [Chính sách bảo hành](chinh-sach.html#bao-hanh)." },
      ],
    },
    stores: {
      eyebrow: "CỬA HÀNG & TỔNG KHO", title: "Địa Chỉ ROMAN",
      sub: "Ghé cửa hàng để xem mẫu da và chọn màu trực tiếp; liên hệ hotline để được tư vấn trước khi đến.",
      storeName: "ROMAN Long Biên, Hà Nội", warehouseName: "Tổng kho ROMAN",
    },
    jobs: {
      eyebrow: "CƠ HỘI NGHỀ NGHIỆP", title: "Tuyển Dụng Nghệ Nhân & Kỹ Thuật Viên", sub: "Gia nhập đội ngũ chế tác nội thất ô tô ROMAN tại Hà Nội.",
      items: [
        { title: "Nghệ nhân may & bọc ghế da ô tô", body: "Có kinh nghiệm may, bọc ghế da ô tô. Liên hệ để trao đổi chi tiết về công việc và thu nhập." },
        { title: "Kỹ thuật viên khâu vô lăng & trần sao", body: "Có kinh nghiệm khâu vô lăng, bọc trần da lộn và các hạng mục nội thất. Liên hệ để trao đổi chi tiết." },
        { title: "Chuyên viên tư vấn cá nhân hóa nội thất", body: "Am hiểu ô tô, tư vấn phối màu da và chăm sóc khách hàng tại cửa hàng. Liên hệ để trao đổi chi tiết." },
      ],
    },
  },
  support: {
    eyebrow: "DỊCH VỤ CHĂM SÓC KHÁCH HÀNG",
    title: "Chúng Tôi Có Thể Giúp Gì Cho Bạn?",
    lead: "Tư vấn chọn chất liệu, báo giá theo dòng xe và đặt lịch thi công tại cửa hàng ROMAN.",
    cards: [
      { label: "CẨM NANG BẢO DƯỠNG", title: "Chăm Sóc Nội Thất Da & Alcantara", body: "Hướng dẫn vệ sinh định kỳ và dưỡng ẩm đúng chuẩn cho da Nappa, da lộn và film nội thất.", cta: "Xem hướng dẫn chi tiết", link: "#faq", style: "line" },
      { label: "CHÍNH SÁCH BẢO HÀNH", title: "Chính Sách Bảo Hành & Bảo Dưỡng", body: "Thời hạn và phạm vi bảo hành theo từng hạng mục và chất liệu. Xem chính sách hoặc liên hệ hotline để được hướng dẫn.", cta: "Xem chính sách bảo hành", link: "chinh-sach.html#bao-hanh", style: "line", anchor: "bao-hanh" },
      { label: "TƯ VẤN TRỰC TIẾP", title: "Hotline Tư Vấn", body: "Giải đáp về chất liệu, báo giá theo dòng xe và hẹn xem mẫu da tại cửa hàng.", cta: "Gọi {hotline}", link: "tel:{hotlineTel}", style: "gold" },
    ],
    faq: {
      eyebrow: "GIẢI ĐÁP THẮC MẮC", title: "Câu Hỏi Thường Gặp", sub: "Những thông tin quan trọng trước và sau khi nâng cấp nội thất ô tô tại ROMAN.",
      items: [
        { q: "Thời gian bọc ghế da và nâng cấp nội thất mất bao lâu?", a: "Thời gian thi công tùy hạng mục, dòng xe và số lượng chi tiết. ROMAN sẽ báo thời gian dự kiến khi bạn đặt lịch, vui lòng liên hệ hotline để được tư vấn cụ thể." },
        { q: "Bọc ghế da có ảnh hưởng đến túi khí bên hông ghế không?", a: "Vị trí túi khí hông cần được lưu ý khi thi công. Bạn hãy báo hãng xe và đời xe khi đặt lịch để ROMAN tư vấn cách thi công phù hợp." },
        { q: "Chính sách bảo hành của ROMAN như thế nào?", a: "Thời hạn và phạm vi bảo hành phụ thuộc từng hạng mục và chất liệu, được xác nhận khi đặt lịch hoặc bàn giao xe. Xem chi tiết tại [Chính sách bảo hành](chinh-sach.html#bao-hanh) hoặc gọi hotline." },
        { q: "Tôi có thể xem và chạm thử mẫu da trước khi quyết định không?", a: "Có. Bạn có thể đến cửa hàng ROMAN tại {store} để xem mẫu da và chọn màu trực tiếp. Nên gọi hotline trước để được chuẩn bị mẫu phù hợp với xe của bạn." },
        { q: "Hướng dẫn vệ sinh và dưỡng ghế da Nappa bền đẹp lâu dài?", a: "Lau bụi hàng tuần bằng khăn Microfiber ẩm mềm. Định kỳ mỗi 4 – 6 tháng, sử dụng dung dịch vệ sinh da pH trung tính kết hợp kem dưỡng chuyên dụng (Leather Conditioner). Tránh các chất tẩy rửa có cồn, xăng thơm hoặc phơi trực tiếp dưới nắng gắt nhiều giờ liên tục." },
      ],
    },
    booking: {
      eyebrow: "ĐẶT LỊCH HẸN ƯU TIÊN", title: "Đặt Lịch Tư Vấn & Thi Công",
      sub: "Để lại thông tin dòng xe và nhu cầu của bạn — ROMAN sẽ liên hệ lại với bạn. Cần gấp, hãy gọi hotline.",
      topics: ["Bọc ghế da", "Thiết kế & sản xuất ghế chủ tịch Limousine", "Bọc sàn", "Khâu vô lăng", "Dán chi tiết nhựa", "Trần da lộn", "Thảm taplo", "Bảo hành", "Khác"],
      sideEyebrow: "GẶP TRỰC TIẾP TẠI ROMAN", sideTitle: "Cửa Hàng & Tổng Kho",
      sideBody: "Ghé cửa hàng để xem mẫu da và chọn màu trực tiếp. Nên gọi hotline trước khi đến.",
    },
  },
  policy: {
    eyebrow: "CHÍNH SÁCH & ĐIỀU KHOẢN",
    title: "Chính Sách Bảo Hành, Bảo Mật & Điều Khoản",
    lead: "Thông tin áp dụng khi bạn sử dụng website và dịch vụ của ROMAN.",
    updated: "19/10/2026",
    sections: [
      { id: "bao-hanh", title: "Chính sách bảo hành", body: "Thời hạn và phạm vi bảo hành phụ thuộc vào từng hạng mục (ghế da, ghế điện, sàn, thảm, trần da lộn...) và chất liệu đã chọn. ROMAN xác nhận cụ thể với khách hàng khi đặt lịch hoặc bàn giao xe.\n\n### Quy trình bảo hành\n\n1. Liên hệ hotline [{hotline}](tel:{hotlineTel}) hoặc [{hotline2}](tel:{hotline2Tel}) và cho biết họ tên, số điện thoại, dòng xe, hạng mục đã thực hiện.\n2. Mang xe đến cửa hàng ROMAN tại {store} để nhân viên kiểm tra tình trạng thực tế.\n3. ROMAN thông báo kết quả kiểm tra và hướng xử lý (sửa chữa, thay thế hoặc tư vấn bảo dưỡng) tùy từng trường hợp.\n\n### Các trường hợp thường không thuộc phạm vi bảo hành\n\n- Hư hỏng do va chạm, tai nạn, cháy nổ hoặc thiên tai.\n- Sử dụng sai cách, vệ sinh bằng hóa chất không phù hợp với chất liệu.\n- Tự ý tháo, sửa hoặc can thiệp vào sản phẩm bởi đơn vị khác.\n- Hao mòn tự nhiên theo thời gian và cường độ sử dụng.\n\nĐể biết thời hạn bảo hành chính xác của hạng mục bạn quan tâm, vui lòng liên hệ hotline." },
      { id: "bao-mat", title: "Chính sách bảo mật thông tin", body: "### Thông tin chúng tôi thu thập\n\nKhi bạn gửi biểu mẫu đặt lịch, ROMAN nhận các thông tin do chính bạn cung cấp: họ tên, số điện thoại, hãng và dòng xe, ngày dự kiến thi công, hạng mục quan tâm và ghi chú.\n\n### Mục đích sử dụng\n\n- Liên hệ tư vấn, báo giá và xác nhận lịch hẹn.\n- Thực hiện và bảo hành dịch vụ bạn đã đặt.\n\n### Chia sẻ và lưu trữ\n\nROMAN không bán hoặc cho thuê thông tin cá nhân của khách hàng. Thông tin chỉ được chia sẻ khi có yêu cầu của cơ quan nhà nước có thẩm quyền theo quy định của pháp luật.\n\n### Quyền của bạn\n\nBạn có thể yêu cầu xem, chỉnh sửa hoặc xóa thông tin đã cung cấp bằng cách liên hệ [{email}](mailto:{email}) hoặc gọi hotline.\n\n### Dịch vụ bên thứ ba\n\nWebsite tải phông chữ từ Google Fonts, vì vậy trình duyệt của bạn có thể gửi địa chỉ IP tới Google khi mở trang. Khi bạn bấm vào liên kết dẫn tới trang khác (ví dụ Google Maps), chính sách của trang đó sẽ được áp dụng." },
      { id: "dieu-khoan", title: "Điều khoản sử dụng website", body: "- **Mục đích:** website giới thiệu sản phẩm, dịch vụ và bảng giá của ROMAN. Website không phải kênh thanh toán trực tuyến.\n- **Giá niêm yết:** giá hiển thị là giá niêm yết theo bảng giá của ROMAN, có thể thay đổi theo dòng xe, cấu hình và thời điểm. Giá chính xác được xác nhận khi liên hệ.\n- **Hình ảnh và mô tả:** mang tính minh họa, màu sắc thực tế có thể chênh lệch tùy màn hình và chất liệu.\n- **Quyền sở hữu nội dung:** nội dung, hình ảnh và thương hiệu trên website thuộc ROMAN hoặc bên cấp phép. Không sao chép, sử dụng cho mục đích thương mại khi chưa được đồng ý bằng văn bản.\n- **Thay đổi:** ROMAN có thể cập nhật nội dung website và các điều khoản này mà không cần báo trước.\n\nMọi thắc mắc xin liên hệ hotline [{hotline}](tel:{hotlineTel}) – [{hotline2}](tel:{hotline2Tel}) hoặc email [{email}](mailto:{email})." },
    ],
  },
};

/* ---- SEO: lấy từ các trang hiện tại, sửa các mô tả còn nhắc dịch vụ chưa có căn cứ ---- */
const seo = {};
PAGE_FILES.forEach(f => {
  const h = fs.readFileSync(path.join(ROOT, f), "utf8");
  seo[f] = {
    title: (h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "",
    description: (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "",
  };
  seo[f].title = seo[f].title.replace(/&amp;/g, "&");
});
seo["support.html"].description = "Trung tâm hỗ trợ khách hàng ROMAN: câu hỏi thường gặp, chính sách bảo hành và đặt lịch tư vấn, thi công nội thất ô tô.";
seo["about.html"].description = "Giới thiệu ROMAN: ghế da, ghế điện, sàn, thảm và trần da lộn cho ô tô. Cửa hàng và tổng kho tại Long Biên, Hà Nội.";
seo["category.html"].description = "Bảng giá niêm yết ghế da ROMAN, ghế điện, sàn ROMAN 360, thảm ROMAN, trần da lộn và các dịch vụ nội thất ô tô tại ROMAN.";

const content = {
  rev: 1, updatedAt: new Date().toISOString(),
  site, social: old.SOCIAL, categories: old.CATEGORIES, products,
  hero: old.HERO_SLIDES, features: old.FEATURES, stories: old.STORIES, limousine: old.LIMOUSINE,
  notes: old.NOTES, materials: old.MATERIALS, photoAlt: old.PHOTO_ALT, pages, seo,
};

/* ---- Kiểm tra: data.js sinh ra phải cho dữ liệu giống bản cũ ---- */
const canon = v => Array.isArray(v) ? v.map(canon) : (v && typeof v === "object") ? Object.keys(v).sort().reduce((o, k) => (o[k] = canon(v[k]), o), {}) : v;
const gen = clone(load(buildDataJs(content)));
const diffs = [];
NAMES.forEach(n => {
  let a = old[n], b = gen[n];
  if (n === "SITE") { a = Object.assign({}, a); b = Object.assign({}, b); ["formEndpoint", "hours", "legalName", "taxCode"].forEach(k => { delete a[k]; delete b[k]; }); }
  if (n === "PRODUCTS") {
    a.forEach((p, i) => { if (JSON.stringify(canon(p)) !== JSON.stringify(canon(b[i]))) diffs.push(`PRODUCTS[${i}] ${p.id}\n  cũ: ${JSON.stringify(canon(p))}\n  mới: ${JSON.stringify(canon(b[i]))}`); });
    if (a.length !== b.length) diffs.push("PRODUCTS: số lượng khác");
  } else if (JSON.stringify(canon(a)) !== JSON.stringify(canon(b))) diffs.push(n);
});
if (diffs.length) { console.error("KHÁC BIỆT:\n" + diffs.join("\n")); process.exit(1); }
console.log(`Kiểm tra: dữ liệu sinh ra giống bản cũ (${gen.PRODUCTS.length} sản phẩm, ${gen.CATEGORIES.length} danh mục).`);
if (process.argv.includes("--check")) process.exit(0);

const dir = path.join(ROOT, "content");
fs.mkdirSync(path.join(dir, "backups"), { recursive: true });
fs.writeFileSync(path.join(dir, "backups", "data-js-ban-viet-tay.js"), oldCode);
fs.writeFileSync(path.join(dir, "site.json"), JSON.stringify(content, null, 2));
fs.writeFileSync(path.join(ROOT, "js/data.js"), buildDataJs(content));
PAGE_FILES.forEach(f => {
  const p = path.join(ROOT, f);
  fs.writeFileSync(p, patchHtml(fs.readFileSync(p, "utf8"), seo[f], content.rev));
});
console.log("Đã ghi content/site.json và sinh lại js/data.js.");
