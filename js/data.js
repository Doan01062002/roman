/* TỆP TỰ SINH từ content/site.json bởi trang quản trị (/admin). Đừng sửa tay: mọi thay đổi sẽ bị ghi đè khi lưu.
   Phiên bản nội dung: 11 */
const SITE = {
 "name": "ROMAN",
 "tagline": "Xưởng Chế Tác & Cá Nhân Hóa Nội Thất Ô Tô Cao Cấp",
 "logo": "assets/logo.svg",
 "badge": "assets/logo-badge.svg",
 "hotline": "0927 098 098",
 "hotline2": "0926 098 098",
 "email": "Vinaleather102@gmail.com",
 "store": "763 Nguyễn Văn Linh, Long Biên, Hà Nội",
 "warehouse": "Số 40 Vũ Xuân Thiều, Long Biên, Hà Nội",
 "formEndpoint": "/api/bookings",
 "hours": "",
 "legalName": "",
 "taxCode": "",
 "address": "763 Nguyễn Văn Linh, Long Biên, Hà Nội"
};
const CATEGORIES = [
 {
  "id": "ghe-da",
  "name": "Bọc ghế da",
  "shape": "seat",
  "color": "#6e4127",
  "hue": 25,
  "photo": "ghe-01",
  "desc": "Ghế da ROMAN Sumi Fiber, Nappa Fiber, Nappa Fiber Pro, Nappa Clear, ghế điện & ghế chủ tịch Limousine",
  "sub": [
   "Ghế da ROMAN",
   "Ghế điện",
   "Ghế Limousine"
  ]
 },
 {
  "id": "san",
  "name": "Bọc sàn",
  "shape": "floor",
  "color": "#1f1f22",
  "hue": 30,
  "photo": "san-13",
  "desc": "Sàn ROMAN 360 (Premium, Nappa Clear, Luxury) & thảm ROMAN (Signature, Premium, Luxury)",
  "sub": [
   "Sàn ROMAN 360",
   "Thảm ROMAN"
  ]
 },
 {
  "id": "vo-lang",
  "name": "Khâu vô lăng",
  "shape": "wheel",
  "color": "#1f1f22",
  "hue": 0,
  "photo": "volang-04",
  "desc": "Khâu tay thủ công da bò thật, da lộn Alcantara & Carbon D-Cut",
  "sub": [
   "Da bò",
   "Da lộn",
   "Phối carbon"
  ]
 },
 {
  "id": "nhua",
  "name": "Dán chi tiết nhựa",
  "shape": "trim",
  "color": "#1a1a1a",
  "tex": "carbon",
  "hue": 220,
  "photo": "nhua-01",
  "desc": "Ốp nội thất vân Carbon 3D, gỗ Óc chó & đen bóng Piano",
  "sub": [
   "Vân carbon",
   "Vân gỗ",
   "Đen bóng"
  ]
 },
 {
  "id": "tran",
  "name": "Trần da lộn",
  "shape": "headliner",
  "color": "#18181c",
  "tex": "star",
  "hue": 240,
  "photo": "tran-02",
  "desc": "Bọc trần da lộn Alcantara & trần sao rơi Starlight sợi quang",
  "sub": [
   "Trần da lộn",
   "Trần sao"
  ]
 },
 {
  "id": "taplo",
  "name": "Thảm taplo",
  "shape": "dash",
  "color": "#2a2a2e",
  "tex": "suede",
  "hue": 200,
  "photo": "taplo-01",
  "desc": "Thảm chống chói kính lái cắt CNC chuẩn khe gió & HUD",
  "sub": [
   "Da lộn",
   "Nhung",
   "Silicon"
  ]
 }
];
const PRODUCTS = [
 {
  "id": "ghe-cong-nghiep",
  "cat": "ghe-da",
  "sub": "Ghế da ROMAN",
  "name": "Ghế da ROMAN Sumi Fiber",
  "tag": "Giá tốt",
  "short": "Dòng ghế da Sumi Fiber, may đo cho xe 5 chỗ và xe 7 chỗ.",
  "colors": [
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Xám Titan",
    "#5d6066"
   ],
   [
    "Nâu Cognac",
    "#7b482b"
   ]
  ],
  "optionLabel": "Loại xe",
  "options": [
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết: xe 5 chỗ 5.500.000₫, xe 7 chỗ 7.500.000₫",
   "May đo theo từng dòng xe",
   "Xem mẫu da và chọn màu tại cửa hàng ROMAN"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe 5 chỗ: 5.500.000₫ · Xe 7 chỗ: 7.500.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 5500000,
  "old": 0,
  "nick": "Sumi Fiber",
  "photos": [
   "ghe-07",
   "ghe-01",
   "ghe-05",
   "vid-rear"
  ],
  "prices": [
   5500000,
   7500000
  ],
  "unit": "bộ",
  "url": "san-pham/ghe-da-roman-sumi-fiber/"
 },
 {
  "id": "ghe-nappa-6d",
  "cat": "ghe-da",
  "sub": "Ghế da ROMAN",
  "name": "Ghế da ROMAN Nappa Fiber",
  "tag": "Bán chạy",
  "short": "Dòng ghế da Nappa Fiber mềm mại, bền bỉ cho xe 5 chỗ và xe 7 chỗ.",
  "colors": [
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Kem Champagne",
    "#d6c3a0"
   ],
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ]
  ],
  "optionLabel": "Loại xe",
  "options": [
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết: xe 5 chỗ 7.500.000₫, xe 7 chỗ 9.500.000₫",
   "Da Nappa giữ nguyên vân tự nhiên, thoáng khí, chống nước",
   "Độ dày chuẩn 1.2mm, phù hợp thi công chi tiết tinh xảo, chống trầy xước",
   "Chất liệu microfiber cao cấp, mềm mại, bền bỉ, thân thiện môi trường",
   "Bảng màu đa dạng, thời thượng; xem mẫu da và chọn màu tại cửa hàng"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe 5 chỗ: 7.500.000₫ · Xe 7 chỗ: 9.500.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 7500000,
  "old": 0,
  "nick": "Nappa Fiber",
  "photos": [
   "ghe-02",
   "ghe-07",
   "ghe-01",
   "ghe-06",
   "ghe-05",
   "vid-seat"
  ],
  "prices": [
   7500000,
   9500000
  ],
  "unit": "bộ",
  "url": "san-pham/ghe-da-roman-nappa-fiber/"
 },
 {
  "id": "ghe-da-bo-y",
  "cat": "ghe-da",
  "sub": "Ghế da ROMAN",
  "name": "Ghế da ROMAN Nappa Fiber Pro",
  "tag": "Thượng lưu",
  "short": "Dòng Nappa Fiber Pro cao cấp nhất trong nhóm ghế da ROMAN.",
  "colors": [
   [
    "Cam Hermès / Bò Ý",
    "#c26933"
   ],
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Kem Champagne",
    "#d6c3a0"
   ]
  ],
  "optionLabel": "Loại xe",
  "options": [
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết: xe 5 chỗ 9.500.000₫, xe 7 chỗ 11.500.000₫",
   "Da Nappa giữ nguyên vân tự nhiên, thoáng khí, chống nước",
   "Độ dày chuẩn 1.2mm, phù hợp thi công chi tiết tinh xảo, chống trầy xước",
   "Chất liệu microfiber cao cấp, mềm mại, bền bỉ, thân thiện môi trường",
   "Bảng màu đa dạng, thời thượng; xem mẫu da và chọn màu tại cửa hàng"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe 5 chỗ: 9.500.000₫ · Xe 7 chỗ: 11.500.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 9500000,
  "old": 0,
  "nick": "Nappa Fiber Pro",
  "photos": [
   "ghe-03",
   "ghe-04",
   "ghe-02",
   "ghe-01",
   "vid-rear"
  ],
  "prices": [
   9500000,
   11500000
  ],
  "unit": "bộ",
  "url": "san-pham/ghe-da-roman-nappa-fiber-pro/"
 },
 {
  "id": "ghe-nappa-clear",
  "cat": "ghe-da",
  "sub": "Ghế da ROMAN",
  "name": "Ghế da ROMAN Nappa Clear",
  "tag": "",
  "short": "Dòng ghế da Nappa Clear, giá niêm yết dễ tiếp cận cho xe 5 và 7 chỗ.",
  "colors": [
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Kem Champagne",
    "#d6c3a0"
   ],
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ]
  ],
  "optionLabel": "Loại xe",
  "options": [
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết: xe 5 chỗ 5.500.000₫, xe 7 chỗ 7.500.000₫",
   "Da Nappa giữ nguyên vân tự nhiên, thoáng khí, chống nước",
   "Độ dày chuẩn 1.2mm, phù hợp thi công chi tiết tinh xảo, chống trầy xước",
   "Chất liệu microfiber cao cấp, mềm mại, bền bỉ, thân thiện môi trường",
   "Bảng màu đa dạng, thời thượng; xem mẫu da và chọn màu tại cửa hàng"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe 5 chỗ: 5.500.000₫ · Xe 7 chỗ: 7.500.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 5500000,
  "old": 0,
  "nick": "Nappa Clear",
  "photos": [
   "ghe-05",
   "ghe-06",
   "vid-rear"
  ],
  "prices": [
   5500000,
   7500000
  ],
  "unit": "bộ",
  "url": "san-pham/ghe-da-roman-nappa-clear/"
 },
 {
  "id": "ghe-dien",
  "cat": "ghe-da",
  "sub": "Ghế điện",
  "name": "Ghế điện",
  "tag": "",
  "short": "Ghế điện cho ghế phụ và ghế lái xe VF3, VF2 và Minio Green.",
  "colors": [
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Xám Titan",
    "#5d6066"
   ]
  ],
  "optionLabel": "Vị trí ghế · Dòng xe",
  "options": [
   "Ghế phụ · VF3",
   "Ghế phụ · VF2 / Minio Green",
   "Ghế lái · VF3",
   "Ghế lái · VF2 / Minio Green"
  ],
  "highlights": [
   "Giá niêm yết 6.500.000₫ mỗi bộ",
   "Có phiên bản ghế phụ và ghế lái",
   "Dành cho xe VF3, VF2 và Minio Green"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Ghế phụ · VF3: 6.500.000₫ · Ghế phụ · VF2 / Minio Green: 6.500.000₫ · Ghế lái · VF3: 6.500.000₫ · Ghế lái · VF2 / Minio Green: 6.500.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 6500000,
  "old": 0,
  "nick": "Ghế điện",
  "photos": [
   "ghe-04",
   "vid-seat",
   "ghe-03"
  ],
  "prices": [
   6500000,
   6500000,
   6500000,
   6500000
  ],
  "unit": "bộ",
  "url": "san-pham/ghe-dien/"
 },
 {
  "id": "limo-hermes",
  "cat": "ghe-da",
  "sub": "Ghế Limousine",
  "name": "Ghế Chủ Tịch Limousine Hermès Royal",
  "tag": "Thượng lưu",
  "short": "Da Bò Ý Cam Hermès, chỉnh điện 10 hướng, nâng chân.",
  "colors": [
   [
    "Cam Hermès / Bò Ý",
    "#c26933"
   ],
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Kem Champagne",
    "#d6c3a0"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ]
  ],
  "optionLabel": "Dòng xe MPV / SUV",
  "options": [
   "Kia Carnival / Sedona",
   "Mercedes V-Class / Vito",
   "Toyota Alphard / Land Cruiser",
   "Ford Explorer / Tourneo / VF9"
  ],
  "highlights": [
   "Thiết kế 3D & sản xuất khung sườn hợp kim thép chịu lực trực tiếp tại xưởng ROMAN",
   "Mút đúc lạnh nguyên khối công thái học, bọc da Bò Ý nguyên tấm đục lỗ CNC",
   "Tích hợp chỉnh điện 10 hướng, bệ nâng chân Ottoman, massage khí nén 10 điểm & làm mát / sưởi ấm",
   "Tay vịn ốp Carbon / Piano tích hợp màn hình cảm ứng, sạc không dây Magsafe & hộc giữ ly"
  ],
  "specs": {
   "Hạng mục": "Thiết kế & Sản xuất Ghế Chủ Tịch Limousine",
   "Chất liệu": "Khung thép hợp kim + Mút đúc lạnh + Da Bò Ý / Nappa",
   "Tính năng điện": "Chỉnh điện 10 hướng, Massage khí nén, Quạt làm mát & Sưởi",
   "Áp dụng": "Kia Carnival, Sedona, V-Class, Alphard, Land Cruiser, VF9, Custin..."
  },
  "price": 0,
  "old": 0,
  "nick": "Ghế Limousine Hermès Royal",
  "photos": [
   "limo-01",
   "limo-05",
   "limo-02",
   "limo-04",
   "vid-limo"
  ],
  "url": "san-pham/ghe-chu-tich-limousine-hermes-royal/"
 },
 {
  "id": "limo-maybach",
  "cat": "ghe-da",
  "sub": "Ghế Limousine",
  "name": "Ghế Chủ Tịch Limousine Maybach Aviation",
  "tag": "Bán chạy",
  "short": "Form Maybach hàng không, gối lông vũ, bàn xếp gọn.",
  "colors": [
   [
    "Kem Champagne",
    "#d6c3a0"
   ],
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Cam Hermès / Bò Ý",
    "#c26933"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ]
  ],
  "optionLabel": "Dòng xe MPV / SUV",
  "options": [
   "Kia Carnival / Sedona",
   "Toyota Land Cruiser / Prado",
   "Mercedes V-Class / GLC / GLS",
   "Hyundai SantaFe / Custin"
  ],
  "highlights": [
   "Thiết kế tựa đầu Maybach Aviation cánh bướm nâng đỡ đốt sống cổ tối ưu",
   "Cụm công tắc chỉnh điện mạ Chrome kiểu Mercedes đặt ngay tầm tay trên bệ tỳ",
   "Tích hợp hệ thống quạt gió làm mát lưng ghế, sưởi ấm và massage rung / khí nén",
   "Tùy chọn tích hợp bàn làm việc hợp kim nhôm bọc da gấp gọn tiện lợi"
  ],
  "specs": {
   "Hạng mục": "Thiết kế & Sản xuất Ghế Thương Gia Maybach",
   "Chất liệu": "Da Nappa / Da Bò Ý + Khung sườn hợp kim chuẩn Âu",
   "Tính năng điện": "Chỉnh điện 8–10 hướng, Nhớ 3 vị trí, Làm mát & Massage",
   "Áp dụng": "MPV 7 chỗ & SUV Full-size"
  },
  "price": 0,
  "old": 0,
  "nick": "Ghế Limousine Maybach",
  "photos": [
   "limo-02",
   "limo-01",
   "limo-03",
   "limo-04",
   "vid-limo"
  ],
  "url": "san-pham/ghe-chu-tich-limousine-maybach-aviation/"
 },
 {
  "id": "limo-crystal",
  "cat": "ghe-da",
  "sub": "Ghế Limousine",
  "name": "Ghế Thương Gia Limousine Royal Crystal",
  "tag": "Mới",
  "short": "Ốp lưng Carbon viền LED, da Nappa kèm bàn gỗ Óc Chó.",
  "colors": [
   [
    "Xám Titan",
    "#5d6066"
   ],
   [
    "Kem Champagne",
    "#d6c3a0"
   ],
   [
    "Cam Hermès / Bò Ý",
    "#c26933"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ]
  ],
  "optionLabel": "Dòng xe MPV / SUV",
  "options": [
   "Kia Carnival / Sedona",
   "Mercedes V250 / V-Class",
   "Toyota Alphard / Siena",
   "VinFast VF9 / Ford Explorer"
  ],
  "highlights": [
   "Vỏ ốp lưng và tay vịn đúc nguyên khối phủ sợi Carbon 3K & Đen Piano chống trầy",
   "Dải đèn viền LED Ambient ấm áp dọc thân ghế kết hợp phím điều khiển pha lê",
   "Bàn làm việc cá nhân ốp gỗ Óc Chó (Walnut) viền hợp kim nhôm chịu tải 15kg",
   "Chế độ Zero Gravity (Không trọng lực) ngả sâu 165° giúp thư giãn tuyệt đối"
  ],
  "specs": {
   "Hạng mục": "Thiết kế & Sản xuất Ghế Chủ Tịch Royal Crystal",
   "Chất liệu": "Da Nappa Thượng Hạng + Ốp Carbon 3K / Gỗ Walnut",
   "Tính năng điện": "Chỉnh điện 12 hướng, Zero Gravity, Massage & Điều khiển giọng nói",
   "Áp dụng": "Các dòng MPV & SUV cao cấp"
  },
  "price": 0,
  "old": 0,
  "nick": "Ghế Limousine Royal Crystal",
  "photos": [
   "limo-03",
   "limo-02",
   "limo-01",
   "limo-05",
   "vid-limo"
  ],
  "url": "san-pham/ghe-thuong-gia-limousine-royal-crystal/"
 },
 {
  "id": "limo-bang-ba",
  "cat": "ghe-da",
  "sub": "Ghế Limousine",
  "name": "Băng Ba Limousine Sofa Giường Ngả 180°",
  "tag": "Đồng bộ",
  "short": "Băng ghế hàng 3 ngả phẳng 180°, bệ tỳ tay cảm ứng.",
  "colors": [
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Cam Hermès / Bò Ý",
    "#c26933"
   ],
   [
    "Kem Champagne",
    "#d6c3a0"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ]
  ],
  "optionLabel": "Dòng xe MPV / SUV",
  "options": [
   "Kia Carnival / Sedona",
   "Mercedes V-Class / Vito",
   "Ford Tourneo / Transit Limo",
   "Toyota Alphard / Granvia"
  ],
  "highlights": [
   "Sản xuất đồng bộ màu da và họa tiết chần quả trám với cặp ghế Chủ tịch hàng giữa",
   "Cơ cấu trượt điện tiến/lùi trên ray hợp kim và ngả lưng phẳng 180° thành giường đôi",
   "Bệ tỳ tay trung tâm gấp mở linh hoạt, tích hợp màn hình cảm ứng & khay để cốc",
   "Đệm mút đúc nguyên khối dày êm, nâng đỡ hoàn hảo cho hành trình đường dài"
  ],
  "specs": {
   "Hạng mục": "Thiết kế & Sản xuất Băng Ba Sofa Limousine",
   "Chất liệu": "Khung thép chịu lực + Mút lạnh + Da Bò Ý / Nappa",
   "Tính năng điện": "Trượt điện, Ngả phẳng 180°, Bệ tỳ tay màn hình LCD",
   "Áp dụng": "MPV & SUV 7–9 chỗ"
  },
  "price": 0,
  "old": 0,
  "nick": "Băng Ba Limousine Ngả 180°",
  "photos": [
   "limo-04",
   "limo-01",
   "limo-05",
   "limo-02",
   "vid-limo"
  ],
  "url": "san-pham/bang-ba-limousine-sofa-giuong-nga-180/"
 },
 {
  "id": "san-360-luxury",
  "cat": "san",
  "sub": "Sàn ROMAN 360",
  "name": "Sàn ROMAN 360 Luxury",
  "tag": "",
  "short": "Sàn ROMAN 360 Luxury, mức giá niêm yết thấp nhất trong nhóm sàn 360.",
  "colors": [
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Kem Champagne",
    "#d6c3a0"
   ]
  ],
  "optionLabel": "Dòng xe",
  "options": [
   "Xe VF2 / VF3",
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết từ 1.980.000₫ mỗi bộ",
   "Có bản cho VF2/VF3, xe 5 chỗ và xe 7 chỗ",
   "Xem mẫu và chọn màu tại cửa hàng ROMAN"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe VF2 / VF3: 1.980.000₫ · Xe 5 chỗ: 2.000.000₫ · Xe 7 chỗ: 2.500.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 1980000,
  "old": 0,
  "nick": "Sàn 360 Luxury",
  "photos": [
   "san-08",
   "san-03",
   "san-14"
  ],
  "prices": [
   1980000,
   2000000,
   2500000
  ],
  "unit": "bộ",
  "url": "san-pham/san-roman-360-luxury/"
 },
 {
  "id": "san-6d",
  "cat": "san",
  "sub": "Sàn ROMAN 360",
  "name": "Sàn ROMAN 360 Premium",
  "tag": "Bán chạy",
  "short": "Sàn ROMAN 360 Premium cho xe VF2/VF3, xe 5 chỗ và xe 7 chỗ.",
  "colors": [
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Kem Champagne",
    "#d6c3a0"
   ]
  ],
  "optionLabel": "Dòng xe",
  "options": [
   "Xe VF2 / VF3",
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết từ 2.950.000₫ mỗi bộ",
   "Có bản cho VF2/VF3, xe 5 chỗ và xe 7 chỗ",
   "Xem mẫu và chọn màu tại cửa hàng ROMAN"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe VF2 / VF3: 2.950.000₫ · Xe 5 chỗ: 3.000.000₫ · Xe 7 chỗ: 4.000.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 2950000,
  "old": 0,
  "nick": "Sàn 360 Premium",
  "photos": [
   "san-09",
   "san-04",
   "san-06",
   "san-13",
   "san-11",
   "san-08",
   "cop-01",
   "vid-floor"
  ],
  "prices": [
   2950000,
   3000000,
   4000000
  ],
  "unit": "bộ",
  "url": "san-pham/san-roman-360-premium/"
 },
 {
  "id": "san-da-lien-khoi",
  "cat": "san",
  "sub": "Sàn ROMAN 360",
  "name": "Sàn ROMAN 360 Nappa Clear",
  "tag": "Mới",
  "short": "Sàn ROMAN 360 Nappa Clear cho xe VF2/VF3, xe 5 chỗ và xe 7 chỗ.",
  "colors": [
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ],
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ]
  ],
  "optionLabel": "Dòng xe",
  "options": [
   "Xe VF2 / VF3",
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết từ 3.450.000₫ mỗi bộ",
   "Có bản cho VF2/VF3, xe 5 chỗ và xe 7 chỗ",
   "Xem mẫu và chọn màu tại cửa hàng ROMAN"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe VF2 / VF3: 3.450.000₫ · Xe 5 chỗ: 3.500.000₫ · Xe 7 chỗ: 4.500.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 3450000,
  "old": 0,
  "nick": "Sàn 360 Nappa Clear",
  "photos": [
   "san-01",
   "san-03",
   "san-02",
   "san-14",
   "cop-02",
   "vid-trunk"
  ],
  "prices": [
   3450000,
   3500000,
   4500000
  ],
  "unit": "bộ",
  "url": "san-pham/san-roman-360-nappa-clear/"
 },
 {
  "id": "tham-luxury",
  "cat": "san",
  "sub": "Thảm ROMAN",
  "name": "Thảm ROMAN Luxury",
  "tag": "",
  "short": "Thảm ROMAN Luxury, mức giá niêm yết thấp nhất trong nhóm thảm.",
  "colors": [
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Xám Titan",
    "#5d6066"
   ]
  ],
  "optionLabel": "Dòng xe",
  "options": [
   "Xe VF2 / VF3",
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết từ 1.000.000₫ mỗi bộ",
   "Có bản cho VF2/VF3, xe 5 chỗ và xe 7 chỗ",
   "Xem mẫu và chọn màu tại cửa hàng ROMAN"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe VF2 / VF3: 1.000.000₫ · Xe 5 chỗ: 1.000.000₫ · Xe 7 chỗ: 1.500.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 1000000,
  "old": 0,
  "nick": "Thảm Luxury",
  "photos": [
   "san-10",
   "san-11",
   "san-12"
  ],
  "prices": [
   1000000,
   1000000,
   1500000
  ],
  "unit": "bộ",
  "url": "san-pham/tham-roman-luxury/"
 },
 {
  "id": "tham-premium",
  "cat": "san",
  "sub": "Thảm ROMAN",
  "name": "Thảm ROMAN Premium",
  "tag": "",
  "short": "Thảm ROMAN Premium cho xe VF2/VF3, xe 5 chỗ và xe 7 chỗ.",
  "colors": [
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Xám Titan",
    "#5d6066"
   ]
  ],
  "optionLabel": "Dòng xe",
  "options": [
   "Xe VF2 / VF3",
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết từ 1.800.000₫ mỗi bộ",
   "Có bản cho VF2/VF3, xe 5 chỗ và xe 7 chỗ",
   "Xem mẫu và chọn màu tại cửa hàng ROMAN"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe VF2 / VF3: 1.800.000₫ · Xe 5 chỗ: 1.800.000₫ · Xe 7 chỗ: 2.400.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 1800000,
  "old": 0,
  "nick": "Thảm Premium",
  "photos": [
   "san-07",
   "san-05",
   "san-12"
  ],
  "prices": [
   1800000,
   1800000,
   2400000
  ],
  "unit": "bộ",
  "url": "san-pham/tham-roman-premium/"
 },
 {
  "id": "tham-san-duc",
  "cat": "san",
  "sub": "Thảm ROMAN",
  "name": "Thảm ROMAN Signature",
  "tag": "",
  "short": "Thảm ROMAN Signature, dòng thảm cao nhất trong nhóm thảm ROMAN.",
  "colors": [
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Xám Titan",
    "#5d6066"
   ]
  ],
  "optionLabel": "Dòng xe",
  "options": [
   "Xe VF2 / VF3",
   "Xe 5 chỗ",
   "Xe 7 chỗ"
  ],
  "highlights": [
   "Giá niêm yết từ 2.500.000₫ mỗi bộ",
   "Có bản cho VF2/VF3, xe 5 chỗ và xe 7 chỗ",
   "Xem mẫu và chọn màu tại cửa hàng ROMAN"
  ],
  "specs": {
   "Đơn vị tính": "Bộ",
   "Giá niêm yết": "Xe VF2 / VF3: 2.500.000₫ · Xe 5 chỗ: 2.500.000₫ · Xe 7 chỗ: 3.000.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 2500000,
  "old": 0,
  "nick": "Thảm Signature",
  "photos": [
   "san-12",
   "san-05",
   "san-07",
   "san-10",
   "san-11"
  ],
  "prices": [
   2500000,
   2500000,
   3000000
  ],
  "unit": "bộ",
  "url": "san-pham/tham-roman-signature/"
 },
 {
  "id": "vo-lang-da-bo",
  "cat": "vo-lang",
  "sub": "Da bò",
  "name": "Khâu vô lăng da bò thủ công",
  "tag": "Bán chạy",
  "short": "Khâu tay thủ công, phối da đục lỗ êm đầm tay lái.",
  "colors": [
   [
    "Nâu Cognac",
    "#7b482b"
   ],
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Cam Hermès / Bò Ý",
    "#c26933"
   ],
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ]
  ],
  "optionLabel": "Kiểu khâu",
  "options": [
   "Khâu chéo thể thao",
   "Khâu đơn zin hãng",
   "Khâu kép Bespoke"
  ],
  "highlights": [
   "Da bò thật lạng mỏng chuẩn 1.2mm ôm sát vành vô lăng",
   "Khâu tay tỉ mỉ từng mũi chỉ vào tận chấu vô lăng",
   "Phối da đục lỗ thoáng khí ở vị trí cầm lái 3h – 9h",
   "Hoàn thiện chuẩn xác trong 60 phút"
  ],
  "specs": {
   "Chất liệu": "Da bò thật Nappa / Đục lỗ",
   "Kiểu khâu": "Khâu tay thủ công (Đơn / Chéo / Kép)",
   "Áp dụng": "Mọi dòng xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Vô lăng da bò",
  "photos": [
   "volang-04",
   "volang-01",
   "vid-wheel"
  ],
  "url": "san-pham/khau-vo-lang-da-bo-thu-cong/"
 },
 {
  "id": "vo-lang-da-lon",
  "cat": "vo-lang",
  "sub": "Da lộn",
  "name": "Khâu vô lăng da lộn Alcantara",
  "tag": "Thể thao",
  "short": "Da lộn Alcantara bám tay, điểm nhấn vạch 12 giờ.",
  "colors": [
   [
    "Xám Alcantara",
    "#3b3d42",
    "suede"
   ],
   [
    "Đen Alcantara",
    "#1f1f22",
    "suede"
   ]
  ],
  "optionLabel": "Kiểu khâu",
  "options": [
   "Khâu chéo chỉ đỏ",
   "Khâu đơn tiêu chuẩn"
  ],
  "highlights": [
   "Da lộn Alcantara cao cấp cho độ bám tay tối đa khi đánh lái",
   "Điểm nhấn vạch định tâm 12 giờ màu đỏ thể thao",
   "Phối da bò đục lỗ ở vị trí 3h – 9h chống mồ hôi tay",
   "Không bị bóng trơn sau thời gian dài sử dụng"
  ],
  "specs": {
   "Chất liệu": "Da lộn Alcantara + Da bò đục lỗ",
   "Áp dụng": "Mọi dòng xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Vô lăng Alcantara",
  "photos": [
   "volang-02",
   "volang-01",
   "volang-03"
  ],
  "url": "san-pham/khau-vo-lang-da-lon-alcantara/"
 },
 {
  "id": "vo-lang-carbon",
  "cat": "vo-lang",
  "sub": "Phối carbon",
  "name": "Vô lăng độ Carbon Fiber D-Cut",
  "tag": "Cao cấp",
  "short": "Tạo hình D-Cut thể thao, ốp sợi Carbon 3K thật.",
  "colors": [
   [
    "Đen Obsidian",
    "#1c1c1f"
   ],
   [
    "Đỏ Bordeaux",
    "#7d1e2b"
   ]
  ],
  "optionLabel": "Phiên bản",
  "options": [
   "Carbon 3K bóng gương",
   "Carbon Forged nhám"
  ],
  "highlights": [
   "Sợi Carbon 3K thật đắp thủ công, phủ 8 lớp bóng chống tia UV",
   "Tạo gù tỳ ngón cái công thái học và đáy vát phẳng D-Cut",
   "Hai bên bọc da Nappa đục lỗ khâu chỉ đỏ thể thao",
   "Giữ nguyên cốt vô lăng zin, cụm nút bấm và túi khí an toàn"
  ],
  "specs": {
   "Chất liệu": "Sợi Carbon 3K thật + Da Nappa đục lỗ",
   "Áp dụng": "Theo từng dòng xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Vô lăng Carbon D-Cut",
  "photos": [
   "volang-03",
   "volang-02",
   "nhua-01",
   "vid-wheel"
  ],
  "url": "san-pham/vo-lang-do-carbon-fiber-d-cut/"
 },
 {
  "id": "dan-carbon",
  "cat": "nhua",
  "sub": "Vân carbon",
  "name": "Ốp & dán nội thất vân Carbon 3D",
  "tag": "Bán chạy",
  "short": "Ốp bệ cần số, taplo vân Carbon 3D chống trầy.",
  "colors": [
   [
    "Carbon đen 3K",
    "#1a1a1a",
    "carbon"
   ],
   [
    "Carbon xám",
    "#4a4d52",
    "carbon"
   ]
  ],
  "optionLabel": "Phạm vi",
  "options": [
   "Cụm bệ cần số",
   "Ốp cửa + bệ cần số",
   "Full chi tiết nội thất"
  ],
  "highlights": [
   "Vân sợi Carbon 3D chiều sâu chân thực, bề mặt chống xước",
   "Hạn chế tối đa bám vân tay và vết xước dăm ở bệ yên ngựa",
   "Cắt CNC chuẩn xác theo khuôn từng đời xe, không dùng dao trên xe",
   "Lớp keo từ tính cao cấp, tháo bỏ không để lại keo"
  ],
  "specs": {
   "Chất liệu": "Film Carbon 3D / 5D cao cấp nhập khẩu",
   "Áp dụng": "Mọi dòng xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Nội thất Carbon 3D",
  "photos": [
   "nhua-01",
   "volang-03",
   "nhua-03",
   "vid-wheel",
   "vid-wheel2",
   "vid-gear"
  ],
  "url": "san-pham/op-dan-noi-that-van-carbon-3d/"
 },
 {
  "id": "dan-van-go",
  "cat": "nhua",
  "sub": "Vân gỗ",
  "name": "Dán nội thất vân gỗ Óc Chó (Walnut)",
  "tag": "Sang trọng",
  "short": "Vân gỗ Óc Chó mờ tinh tế chuẩn xe sang châu Âu.",
  "colors": [
   [
    "Gỗ Óc Chó",
    "#5b3a24",
    "wood"
   ],
   [
    "Gỗ Sồi Nâu",
    "#a9784a",
    "wood"
   ]
  ],
  "optionLabel": "Phạm vi",
  "options": [
   "Cụm bệ cần số",
   "Ốp cửa + bệ cần số",
   "Full chi tiết nội thất"
  ],
  "highlights": [
   "Họa tiết vân gỗ tự nhiên sắc nét với hiệu ứng sần mờ (Open-Pore)",
   "Không bong mép, không phai màu dưới ánh nắng gắt",
   "Phối màu tuyệt đẹp với khoang ghế da nâu Cognac hoặc kem",
   "Thi công gấp mép kín đáo như ốp gỗ nguyên bản từ hãng"
  ],
  "specs": {
   "Chất liệu": "Film vân gỗ Open-Pore cao cấp",
   "Áp dụng": "Mọi dòng xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Nội thất vân gỗ Óc Chó",
  "photos": [
   "nhua-02",
   "vid-gear",
   "nhua-03",
   "vid-taplo"
  ],
  "url": "san-pham/dan-noi-that-van-go-oc-cho-walnut/"
 },
 {
  "id": "dan-piano",
  "cat": "nhua",
  "sub": "Đen bóng",
  "name": "Dán PPF & Đen bóng Piano nội thất",
  "tag": "Mới",
  "short": "Đen bóng Piano phủ TPU tự phục hồi vết xước.",
  "colors": [
   [
    "Đen Piano",
    "#121214",
    "gloss"
   ],
   [
    "Đen Khói",
    "#28282c",
    "gloss"
   ]
  ],
  "optionLabel": "Phạm vi",
  "options": [
   "Cụm bệ cần số + Màn hình",
   "Ốp cửa + bệ cần số",
   "Full nội thất"
  ],
  "highlights": [
   "Độ bóng sâu như gương, làm mới hoàn toàn nhựa trầy xước",
   "Lớp phủ TPU có khả năng tự phục hồi các vết xước xoáy nhẹ dưới nhiệt",
   "Chống bám ố, lau sạch dễ dàng bằng khăn microfiber",
   "Cắt máy CNC chuẩn 100% chi tiết nút bấm"
  ],
  "specs": {
   "Chất liệu": "Film Piano Black TPU tự phục hồi",
   "Áp dụng": "Mọi dòng xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Đen bóng Piano TPU",
  "photos": [
   "nhua-03",
   "nhua-01",
   "vid-gear",
   "vid-gear2",
   "vid-wheel"
  ],
  "url": "san-pham/dan-ppf-den-bong-piano-noi-that/"
 },
 {
  "id": "tran-da-lon",
  "cat": "tran",
  "sub": "Trần da lộn",
  "name": "Trần da lộn",
  "tag": "Bán chạy",
  "short": "Bọc trần da lộn, giá niêm yết tính theo mét.",
  "colors": [
   [
    "Đen Anthracite",
    "#26262a",
    "suede"
   ],
   [
    "Nâu Espresso",
    "#4a3528",
    "suede"
   ],
   [
    "Kem Alcantara",
    "#cdbfa4",
    "suede"
   ]
  ],
  "optionLabel": "Cách tính giá",
  "options": [
   "Tính theo mét"
  ],
  "highlights": [
   "Giá niêm yết 1.800.000₫ mỗi mét",
   "Báo giá chính xác theo diện tích trần của từng xe",
   "Liên hệ để được tư vấn mẫu và màu"
  ],
  "specs": {
   "Đơn vị tính": "Mét",
   "Giá niêm yết": "Tính theo mét: 1.800.000₫",
   "Đặt hàng": "Xem mẫu, chọn màu và đặt lịch tại cửa hàng ROMAN hoặc qua hotline",
   "Liên hệ": "0927 098 098 · 0926 098 098"
  },
  "price": 1800000,
  "old": 0,
  "nick": "Trần da lộn",
  "photos": [
   "tran-01",
   "tran-02",
   "vid-star",
   "vid-star2",
   "vid-star3",
   "vid-limo2"
  ],
  "prices": [
   1800000
  ],
  "unit": "mét",
  "url": "san-pham/tran-da-lon/"
 },
 {
  "id": "tran-sao",
  "cat": "tran",
  "sub": "Trần sao",
  "name": "Trần sao rơi Starlight Bespoke",
  "tag": "Thượng lưu",
  "short": "Sợi quang đa sắc kết hợp sao băng điều khiển qua App.",
  "colors": [
   [
    "Đen Sao Đêm",
    "#16161a",
    "star"
   ],
   [
    "Xanh Midnight",
    "#1a2340",
    "star"
   ]
  ],
  "optionLabel": "Cấu hình",
  "options": [
   "600 điểm sao",
   "900 điểm + Sao băng",
   "1.200 điểm + Ngân hà"
  ],
  "highlights": [
   "Sợi quang học dẫn sáng tĩnh lặng, không sinh nhiệt, an toàn tuyệt đối",
   "Tùy chỉnh 64 triệu màu, độ sáng và nhịp nhạc qua ứng dụng điện thoại",
   "Hiệu ứng sao băng xẹt ngang bầu trời đêm sống động như Rolls-Royce",
   "Đi dây giấu kín qua cầu chì riêng, giữ nguyên bảo hành điện của xe"
  ],
  "specs": {
   "Chất liệu": "Trần da lộn Alcantara + Sợi quang học LED",
   "Áp dụng": "Mọi dòng xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Trần sao Starlight",
  "photos": [
   "tran-02",
   "vid-star",
   "vid-star2",
   "vid-star3",
   "tran-01",
   "vid-limo2"
  ],
  "url": "san-pham/tran-sao-roi-starlight-bespoke/"
 },
 {
  "id": "taplo-da-lon",
  "cat": "taplo",
  "sub": "Da lộn",
  "name": "Thảm taplo da lộn Alcantara chống chói",
  "tag": "Bán chạy",
  "short": "Chống chói kính lái, cách nhiệt bảo vệ mặt taplo.",
  "colors": [
   [
    "Đen Alcantara",
    "#2a2a2e",
    "suede"
   ],
   [
    "Nâu Cognac",
    "#5a3b28",
    "suede"
   ],
   [
    "Xám khói",
    "#5d6066",
    "suede"
   ]
  ],
  "optionLabel": "Dòng xe",
  "options": [
   "Sedan",
   "SUV / CUV",
   "Bán tải / MPV"
  ],
  "highlights": [
   "Hấp thụ ánh sáng, xóa bỏ hoàn toàn bóng taplo phản chiếu lên kính lái",
   "Cấu trúc 3 lớp cách nhiệt, bảo vệ nhựa taplo không bạc màu, nứt nẻ",
   "Đế hạt Silicon tự bám chặt vào mặt taplo không cần băng keo",
   "Cắt CNC chuẩn xác từng khe gió điều hòa, cảm biến ánh sáng và HUD"
  ],
  "specs": {
   "Chất liệu": "Da lộn Alcantara 3 lớp + Đế Silicon",
   "Áp dụng": "Đầy đủ form cho hơn 150 mẫu xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Taplo da lộn Alcantara",
  "photos": [
   "taplo-01",
   "taplo-02",
   "vid-taplo"
  ],
  "url": "san-pham/tham-taplo-da-lon-alcantara-chong-choi/"
 },
 {
  "id": "taplo-nhung",
  "cat": "taplo",
  "sub": "Nhung",
  "name": "Thảm taplo nhung lông cừu cao cấp",
  "tag": "",
  "short": "Nhung lông cừu mềm mịn, giảm nhiệt taplo nhanh.",
  "colors": [
   [
    "Đen tuyền",
    "#232326",
    "suede"
   ],
   [
    "Nâu Cafe",
    "#523a2c",
    "suede"
   ]
  ],
  "optionLabel": "Dòng xe",
  "options": [
   "Sedan",
   "SUV / CUV"
  ],
  "highlights": [
   "Sợi nhung lông cừu tổng hợp dày dặn, mềm mại và sang trọng",
   "Đường viền may bo kép chắc chắn, ôm sát đường cong taplo",
   "Không rụng lông, không mùi hôi khi đỗ xe dưới trời nắng",
   "Dễ dàng giũ bụi hoặc giặt nhẹ bằng nước"
  ],
  "specs": {
   "Chất liệu": "Nhung lông cừu 3 lớp + Đế chống trượt",
   "Áp dụng": "Theo danh sách dòng xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Taplo nhung lông cừu",
  "photos": [
   "taplo-02",
   "taplo-01",
   "vid-taplo"
  ],
  "url": "san-pham/tham-taplo-nhung-long-cuu-cao-cap/"
 },
 {
  "id": "taplo-silicon",
  "cat": "taplo",
  "sub": "Silicon",
  "name": "Thảm taplo vân Carbon / Silicon chống trượt",
  "tag": "Giá tốt",
  "short": "Chống nước, chịu nhiệt cao và chống trượt đồ dùng.",
  "colors": [
   [
    "Đen Matte",
    "#1c1c1f"
   ]
  ],
  "optionLabel": "Dòng xe",
  "options": [
   "Sedan",
   "SUV / CUV"
  ],
  "highlights": [
   "Bề mặt vi vân chống trượt và chống chói hiệu quả",
   "Chịu nhiệt độ cao tới 200°C, không biến dạng hay tiết dầu",
   "Không thấm nước, lau sạch ngay bằng khăn ẩm",
   "Độ bền cao, ôm khít bề mặt taplo"
  ],
  "specs": {
   "Chất liệu": "Polymer / Silicon chịu nhiệt cao cấp",
   "Áp dụng": "Theo danh sách dòng xe"
  },
  "price": 0,
  "old": 0,
  "nick": "Taplo Silicon chống trượt",
  "photos": [
   "taplo-03",
   "taplo-01",
   "vid-taplo"
  ],
  "url": "san-pham/tham-taplo-van-carbon-silicon-chong-truot/"
 }
];
const HERO_SLIDES = [
 {
  "eyebrow": "ROMAN BESPOKE",
  "title": "Ghế Da ROMAN",
  "sub": "Sumi Fiber, Nappa Fiber, Nappa Fiber Pro, Nappa Clear cho xe 5 và 7 chỗ.",
  "cta": "Khám phá",
  "link": "category.html?cat=ghe-da",
  "hue": 28,
  "bg": "#f7f5f2",
  "dark": false,
  "video": "hero-01",
  "photo": "ghe-04",
  "alt": "Khoang lái bọc da bò Ý màu Cognac, vô lăng khâu tay và hàng ghế sau chần kim cương"
 },
 {
  "eyebrow": "TRẦN DA LỘN",
  "title": "Trần Da Lộn & Trần Sao",
  "sub": "Trần da lộn và trần sao, may đo theo từng dòng xe.",
  "cta": "Khám phá",
  "link": "category.html?cat=tran",
  "hue": 215,
  "bg": "#f4f6f9",
  "dark": false,
  "video": "hero-02",
  "photo": "san-01",
  "alt": "Cần số, thảm taplo da lộn và trần sao Starlight trong khoang nội thất ROMAN"
 },
 {
  "eyebrow": "BESPOKE LIMOUSINE",
  "title": "Ghế Chủ Tịch Limousine",
  "sub": "Khoang thương gia trần sao, sàn da 6D đồng bộ.",
  "cta": "Khám phá",
  "link": "index.html#limousine",
  "hue": 25,
  "bg": "#f7f4f1",
  "dark": false,
  "video": "hero-03",
  "photo": "volang-04",
  "alt": "Khoang Limousine ghế chủ tịch, trần sao Starlight và sàn da đỏ 6D"
 }
];
const FEATURES = [
 {
  "eyebrow": "BỌC GHẾ DA",
  "title": "Ghế Da ROMAN",
  "sub": "Bốn dòng da, may đo cho xe 5 chỗ và 7 chỗ.",
  "cta": "Khám phá",
  "photo": "ghe-02",
  "alt": "Cận cảnh ghế da nâu Nappa chần chéo kim cương sắc nét",
  "link": "product.html?id=ghe-nappa-6d",
  "book": "ghe-nappa-6d",
  "side": "left",
  "bg": "#f7f5f2",
  "dark": false,
  "hue": 28,
  "art": [
   [
    "seat",
    "#6e4127"
   ],
   [
    "seat",
    "#d6c3a0"
   ],
   [
    "floor",
    "#6e4127"
   ]
  ],
  "cards": [
   "ghe-cong-nghiep",
   "ghe-nappa-6d",
   "ghe-da-bo-y",
   "ghe-nappa-clear"
  ]
 },
 {
  "eyebrow": "BỌC SÀN Ô TÔ",
  "title": "Sàn & Thảm ROMAN",
  "sub": "Sàn ROMAN 360 và thảm Signature, Premium, Luxury.",
  "cta": "Khám phá",
  "link": "category.html?cat=san",
  "book": "san-6d",
  "photo": "san-13",
  "alt": "Sàn ghế phụ bọc da đỏ có thảm lót dệt và huy hiệu đồng ROMAN",
  "side": "right",
  "bg": "#f7f4f5",
  "dark": false,
  "hue": 350,
  "art": [
   [
    "headliner",
    "#1a2340",
    "star"
   ],
   [
    "headliner",
    "#16161a",
    "star"
   ]
  ],
  "cards": [
   "san-6d",
   "san-da-lien-khoi",
   "san-360-luxury",
   "tham-san-duc"
  ]
 },
 {
  "eyebrow": "TRẦN SAO RƠI",
  "title": "Trần Sao Rơi",
  "sub": "Hàng trăm điểm sáng sợi quang trên nền da lộn, may đo theo từng dòng xe.",
  "cta": "Khám phá",
  "link": "product.html?id=tran-sao",
  "book": "tran-sao",
  "photo": "tran-02",
  "alt": "Trần sao rơi Starlight sợi quang trên nền da lộn Alcantara",
  "side": "left",
  "bg": "#f4f6f9",
  "dark": false,
  "hue": 215,
  "art": [
   [
    "headliner",
    "#1a2340",
    "star"
   ],
   [
    "trim",
    "#1a1a1a",
    "carbon"
   ],
   [
    "trim",
    "#5b3a24",
    "wood"
   ]
  ],
  "cards": [
   "tran-da-lon",
   "tran-sao",
   "ghe-dien",
   "tham-premium"
  ]
 }
];
const STORIES = [
 {
  "title": "Bí quyết chăm sóc & dưỡng ghế da Nappa luôn căng mịn",
  "tag": "Cẩm nang bảo dưỡng",
  "desc": "Quy trình vệ sinh và dưỡng ẩm định kỳ giúp bề mặt da luôn mềm mát như mới.",
  "link": "support.html#faq",
  "art": [
   "seat",
   "#d6c3a0"
  ],
  "bg": "#efe9e1",
  "photo": "ghe-01",
  "pool": [
   "ghe-01",
   "ghe-06",
   "ghe-05",
   "vid-seat",
   "ghe-04"
  ]
 },
 {
  "title": "Sumi Fiber, Nappa Fiber, Fiber Pro hay Nappa Clear: chọn dòng nào?",
  "tag": "Tư vấn chất liệu",
  "desc": "So sánh bốn dòng ghế da ROMAN theo giá niêm yết cho xe 5 chỗ và 7 chỗ.",
  "link": "category.html?cat=ghe-da",
  "art": [
   "seat",
   "#7a1f2b"
  ],
  "bg": "#f1e4e5",
  "photo": "ghe-06",
  "pool": [
   "ghe-06",
   "ghe-03",
   "ghe-04",
   "vid-rear",
   "ghe-05"
  ]
 },
 {
  "title": "Lắp trần sao Starlight sợi quang có ảnh hưởng điện xe?",
  "tag": "Kỹ thuật thi công",
  "desc": "Giải mã công nghệ dẫn sáng sợi quang không sinh nhiệt, an toàn tuyệt đối cho hệ thống điện.",
  "link": "product.html?id=tran-sao",
  "art": [
   "headliner",
   "#1a2340",
   "star"
  ],
  "bg": "#e5e8f2",
  "photo": "tran-02",
  "pool": [
   "tran-02",
   "vid-star3",
   "vid-star2",
   "tran-01",
   "vid-star",
   "vid-limo2"
  ]
 },
 {
  "title": "Nên chọn sàn da 6D liền khối hay thảm lót sàn đúc?",
  "tag": "Kinh nghiệm nâng cấp",
  "desc": "Đặt lên bàn cân khả năng cách âm, chống nước và tính thẩm mỹ của hai dòng sàn.",
  "link": "category.html?cat=san",
  "art": [
   "floor",
   "#6e4127"
  ],
  "bg": "#f0e8df",
  "photo": "san-11",
  "pool": [
   "san-11",
   "san-12",
   "san-14",
   "san-02",
   "vid-floor",
   "cop-01"
  ]
 },
 {
  "title": "Ốp Carbon Fiber hay Vân Gỗ Óc Chó: Phong cách nào cho bạn?",
  "tag": "Xu hướng nội thất",
  "desc": "Sự khác biệt giữa chất thể thao hiện đại của Carbon 3K và nét cổ điển lịch lãm của gỗ Walnut.",
  "link": "product.html?id=dan-carbon",
  "art": [
   "trim",
   "#1a1a1a",
   "carbon"
  ],
  "bg": "#e8eaed",
  "photo": "nhua-01",
  "pool": [
   "nhua-01",
   "nhua-02",
   "nhua-03",
   "vid-gear2",
   "vid-wheel2",
   "vid-gear",
   "vid-wheel"
  ]
 },
 {
  "title": "Vì sao thảm taplo da lộn giúp chống chói kính lái hiệu quả?",
  "tag": "An toàn lái xe",
  "desc": "Loại bỏ hoàn toàn hiện tượng bóng gương taplo dưới nắng gắt, giúp tầm nhìn luôn trong trẻo.",
  "link": "category.html?cat=taplo",
  "art": [
   "dash",
   "#5a3b28",
   "suede"
  ],
  "bg": "#efe7e0",
  "photo": "taplo-01",
  "pool": [
   "taplo-01",
   "taplo-02",
   "taplo-03",
   "vid-taplo"
  ]
 }
];
const LIMOUSINE = {
 "eyebrow": "BESPOKE LIMOUSINE",
 "title": "Ghế Chủ Tịch Limousine",
 "sub": "Chế tác khoang thương gia cho MPV & SUV.",
 "photo": "limo-01",
 "alt": "Khoang ghế Chủ Tịch Limousine bọc da bò Ý màu cam Hermès kèm màn hình điều khiển cảm ứng và trần sao tại xưởng ROMAN",
 "bg": "#f7f4f0",
 "pillars": [
  {
   "num": "01",
   "title": "Khung Sườn Hợp Kim",
   "desc": "Khung thép chịu lực, lắp đặt giắc zin."
  },
  {
   "num": "02",
   "title": "Mút Đúc & Da Bò Ý",
   "desc": "Mút lạnh công thái học, bọc da Bò Ý."
  },
  {
   "num": "03",
   "title": "Chỉnh Điện & Massage",
   "desc": "Chỉnh điện đa hướng, làm mát & massage."
  },
  {
   "num": "04",
   "title": "Tiện Ích Hạng Nhất",
   "desc": "Màn hình cảm ứng, bàn xếp & sạc không dây."
  }
 ],
 "cards": [
  "limo-hermes",
  "limo-maybach",
  "limo-crystal",
  "limo-bang-ba"
 ]
};
const NOTES = [
 "Giá hiển thị áp dụng tiêu chuẩn cho xe 5 chỗ; chi phí thực tế tùy dòng xe và cấu hình cá nhân hóa.",
 "Hình ảnh mang tính minh họa; màu sắc thực tế có thể chênh lệch tùy màn hình và chất liệu. Thời hạn bảo hành theo từng hạng mục, vui lòng xem chính sách bảo hành hoặc liên hệ hotline."
];
const SOCIAL = [
 {
  "name": "Facebook",
  "url": ""
 },
 {
  "name": "YouTube",
  "url": ""
 },
 {
  "name": "Instagram",
  "url": ""
 },
 {
  "name": "Zalo",
  "url": ""
 }
];
const PHOTO_ALT = {
 "ghe-01": "Ghế trước bọc da Nappa nâu Cognac chần chéo kim cương tại studio ROMAN",
 "ghe-02": "Cận cảnh bề mặt da Nappa nâu chần chỉ quả trám 6D sắc nét",
 "ghe-03": "Ghế lái và khoang cabin bọc da bò Ý màu cam Cognac cao cấp",
 "ghe-04": "Hàng ghế sau bọc da bò Ý màu cam Cognac chần kim cương tại showroom",
 "ghe-05": "Hàng ghế sau bọc da Nappa nâu Cognac đồng bộ tapi cửa",
 "ghe-06": "Khoang lái bọc ghế da Nappa nâu kèm vô lăng khâu tay hai tông màu",
 "ghe-07": "Ghế trước bọc da công nghiệp PU cao cấp màu đen Obsidian đục lỗ thoáng khí",
 "limo-01": "Khoang ghế Chủ Tịch Limousine bọc da bò Ý màu cam Hermès kèm màn hình điều khiển cảm ứng và trần sao",
 "limo-02": "Cặp ghế Chủ Tịch Limousine Maybach Aviation màu kem Champagne phối nâu Cognac chỉnh điện đa hướng",
 "limo-03": "Cặp ghế Thương Gia Limousine Royal Crystal da Nappa xám băng kèm bàn làm việc vân gỗ Óc Chó và viền LED",
 "limo-04": "Băng ba Limousine Sofa giường chỉnh điện ngả 180 độ tích hợp bệ tỳ tay cảm ứng trung tâm",
 "limo-05": "Trải nghiệm khoang thương gia Limousine hạng Nhất với bệ nâng chân Ottoman và cụm điều khiển trung tâm",
 "san-01": "Sàn hàng ghế sau bọc da đỏ liền khối kèm thảm sợi dệt ROMAN",
 "san-02": "Sàn hàng ghế sau bọc da đỏ nhìn từ cửa xe",
 "san-03": "Sàn sau bọc da đỏ liền khối ôm khít gờ ghế",
 "san-04": "Sàn ghế lái bọc da đỏ kèm thảm sợi đính huy hiệu ROMAN",
 "san-05": "Cận cảnh thảm sàn ghế lái chuẩn form có chốt khóa an toàn",
 "san-06": "Lớp thảm dệt tháo rời lộ mặt sàn da 6D thêu logo bên dưới",
 "san-07": "Cấu tạo 2 lớp của bộ sàn da 6D và thảm sợi chống bẩn",
 "san-08": "Cận cảnh đường chỉ may đôi và logo thêu sắc nét trên sàn da 6D",
 "san-09": "Sàn ghế phụ bọc da 6D màu đỏ Bordeaux ôm khít thành vách",
 "san-10": "Sàn ghế phụ lắp thảm sợi dệt cao cấp đính huy hiệu đồng ROMAN",
 "san-11": "Cận cảnh huy hiệu đồng vương miện ROMAN trên bề mặt thảm dệt",
 "san-12": "Chi tiết viền may và tem kim loại thương hiệu ROMAN trên thảm lót sàn",
 "san-13": "Tổng thể sàn ghế phụ bọc da đỏ 6D kèm thảm lót sợi cao cấp",
 "san-14": "Cận cảnh đường bo viền thảm lót sàn và lớp da nền liền khối",
 "cop-01": "Khoang cốp sau bọc da đỏ đồng bộ, sạch sẽ và chống trầy xước",
 "cop-02": "Cận cảnh thảm lót cốp may đo chuẩn form tại showroom ROMAN",
 "volang-01": "Vô lăng khâu tay thủ công phối da bò Nappa nâu và da đục lỗ trong studio",
 "volang-02": "Vô lăng khâu da lộn Alcantara xám đen kèm vạch đỏ 12 giờ thể thao",
 "volang-03": "Vô lăng độ D-Cut ốp sợi Carbon 3K thật phối da Nappa đục lỗ khâu chỉ đỏ",
 "volang-04": "Cận cảnh đường chỉ khâu tay thủ công trên vô lăng da bò hai tông màu",
 "nhua-01": "Cụm bệ cần số và taplo ốp vân sợi Carbon 3D bóng sâu",
 "nhua-02": "Cụm điều khiển trung tâm và tapi cửa dán vân gỗ Óc Chó sang trọng",
 "nhua-03": "Bệ cần số dán đen bóng gương Piano Black tích hợp PPF chống xước",
 "tran-01": "Trần xe và cột A, B, C bọc da lộn Alcantara màu đen Anthracite",
 "tran-02": "Trần sao rơi Starlight hàng trăm điểm sáng sợi quang trên nền da lộn Alcantara",
 "taplo-01": "Thảm taplo da lộn Alcantara cắt CNC chuẩn khe gió và màn hình",
 "taplo-02": "Thảm taplo nhung lông cừu đen mịn ôm sát mặt taplo",
 "taplo-03": "Thảm taplo Silicon vi vân chống trượt và chịu nhiệt cao",
 "xuong-01": "Không gian xưởng chế tác và phòng trưng bày mẫu da ROMAN Bespoke Car Interiors",
 "vid-wheel": "Vô lăng khâu tay và taplo trong khoang lái ROMAN",
 "vid-seat": "Cận cảnh lưng ghế da chần kim cương",
 "vid-rear": "Hàng ghế sau da cam bò chần kim cương",
 "vid-gear": "Cần số và bệ trung tâm đèn viền xanh tím",
 "vid-taplo": "Taplo phủ thảm da lộn và vô lăng khâu tay",
 "vid-star": "Trần sao Starlight với sao băng",
 "vid-star2": "Trần sao Starlight sợi quang trên nền da lộn",
 "vid-limo": "Khoang Limousine hai ghế chủ tịch dưới trần sao",
 "vid-floor": "Sàn da đỏ 6D kèm thảm lót ghế lái",
 "vid-trunk": "Cốp sau bọc da đỏ liền khối",
 "vid-star3": "Trần sao Starlight nhìn từ hàng ghế trước",
 "vid-limo2": "Khoang Limousine nhìn từ phía sau, ghế chủ tịch và trần sao",
 "vid-gear2": "Cần số da và bệ trung tâm viền sáng",
 "vid-wheel2": "Vô lăng da bò khâu tay, góc nghiêng"
};
const MATERIALS = [
 {
  "name": "Da Nappa vân mịn",
  "lines": [
   "Mượt mà, đẳng cấp",
   "Độ dày chuẩn 1.2mm, phù hợp thi công các chi tiết tinh xảo",
   "Chống trầy xước, giữ vẻ đẹp bền lâu theo thời gian",
   "Giữ nguyên vân tự nhiên, thoáng khí, chống nước"
  ]
 },
 {
  "name": "Da Nappa vân kim",
  "lines": [
   "Cá tính, hiện đại",
   "100% microfiber cao cấp, mềm mại, bền bỉ, thân thiện môi trường",
   "Bảng màu đa dạng, thời thượng"
  ]
 },
 {
  "name": "Da Nappa ION cao cấp",
  "lines": [
   "Nhập khẩu chính ngạch, xử lý bằng công nghệ nano kết hợp kỹ thuật hút chân không",
   "Cảm giác nhẹ nhàng, tự nhiên như da thật",
   "Bền màu, chống nấm mốc, kháng khuẩn, thoáng khí",
   "Độ đàn hồi tốt và chống mài mòn theo thời gian"
  ]
 }
];
const PAGES = {
 "about": {
  "eyebrow": "VỀ ROMAN",
  "title": "Nghệ Thuật Chế Tác Nội Thất Ô Tô Thủ Công",
  "lead": "Ghế da ROMAN (Sumi Fiber, Nappa Fiber, Nappa Fiber Pro, Nappa Clear), ghế điện, sàn ROMAN 360, thảm ROMAN và trần da lộn, niêm yết giá theo từng dòng xe.",
  "heroEyebrow": "CỬA HÀNG & TỔNG KHO TẠI HÀ NỘI",
  "heroTitle": "Mỗi Khoang Lái Là Một Tác Phẩm Độc Bản",
  "heroBody": "**ROMAN** chuyên bọc ghế da, ghế điện, sàn, thảm và trần da lộn cho ô tô, với bảng giá niêm yết rõ ràng theo từng dòng xe: VF2/VF3, xe 5 chỗ và xe 7 chỗ.\n\nCửa hàng ở {store} và tổng kho ở {warehouse}. Bạn có thể đến xem mẫu da, chọn màu trực tiếp hoặc gọi hotline để được tư vấn trước.",
  "heroImage": "xuong-01",
  "stats": [
   {
    "value": "4 dòng",
    "label": "Ghế da ROMAN: Sumi Fiber, Nappa Fiber, Nappa Fiber Pro, Nappa Clear"
   },
   {
    "value": "3 dòng",
    "label": "Sàn ROMAN 360: Premium, Nappa Clear, Luxury"
   },
   {
    "value": "3 dòng",
    "label": "Thảm ROMAN: Signature, Premium, Luxury"
   },
   {
    "value": "2 địa điểm",
    "label": "Cửa hàng và tổng kho tại Long Biên, Hà Nội"
   }
  ],
  "process": {
   "eyebrow": "QUY CHUẨN KỸ THUẬT",
   "title": "Quy Trình Chế Tác 4 Bước Chuẩn Hãng",
   "sub": "Kiểm soát chất lượng nghiêm ngặt từ khâu chọn phôi da đến khi bàn giao xe cho khách hàng.",
   "steps": [
    {
     "title": "Tư Vấn & Phối Màu Cá Nhân Hóa",
     "body": "Xem mẫu da, bảng màu và kiểu may trực tiếp tại cửa hàng, hoặc gọi hotline để được tư vấn theo dòng xe của bạn."
    },
    {
     "title": "Quét Khuôn & Cắt Rập CNC",
     "body": "Đo đạc và chuẩn bị chi tiết theo từng dòng xe để sản phẩm ôm khít khoang nội thất."
    },
    {
     "title": "Khâu Thủ Công & Lắp Đặt An Toàn",
     "body": "Kỹ thuật viên ROMAN thi công theo đúng hạng mục và dòng xe đã chọn, lưu ý các vị trí đặc biệt như túi khí và hệ thống điện của xe."
    },
    {
     "title": "Kiểm Tra & Bảo Hành",
     "body": "Vệ sinh và kiểm tra bề mặt, hệ thống điện trước khi bàn giao. Bảo hành theo chính sách ROMAN, xem tại trang [Chính sách bảo hành](chinh-sach.html#bao-hanh)."
    }
   ]
  },
  "stores": {
   "eyebrow": "CỬA HÀNG & TỔNG KHO",
   "title": "Địa Chỉ ROMAN",
   "sub": "Ghé cửa hàng để xem mẫu da và chọn màu trực tiếp; liên hệ hotline để được tư vấn trước khi đến.",
   "storeName": "ROMAN Long Biên, Hà Nội",
   "warehouseName": "Tổng kho ROMAN"
  },
  "jobs": {
   "eyebrow": "CƠ HỘI NGHỀ NGHIỆP",
   "title": "Tuyển Dụng Nghệ Nhân & Kỹ Thuật Viên",
   "sub": "Gia nhập đội ngũ chế tác nội thất ô tô ROMAN tại Hà Nội.",
   "items": [
    {
     "title": "Nghệ nhân may & bọc ghế da ô tô",
     "body": "Có kinh nghiệm may, bọc ghế da ô tô. Liên hệ để trao đổi chi tiết về công việc và thu nhập."
    },
    {
     "title": "Kỹ thuật viên khâu vô lăng & trần sao",
     "body": "Có kinh nghiệm khâu vô lăng, bọc trần da lộn và các hạng mục nội thất. Liên hệ để trao đổi chi tiết."
    },
    {
     "title": "Chuyên viên tư vấn cá nhân hóa nội thất",
     "body": "Am hiểu ô tô, tư vấn phối màu da và chăm sóc khách hàng tại cửa hàng. Liên hệ để trao đổi chi tiết."
    }
   ]
  }
 },
 "support": {
  "eyebrow": "DỊCH VỤ CHĂM SÓC KHÁCH HÀNG",
  "title": "Chúng Tôi Có Thể Giúp Gì Cho Bạn?",
  "lead": "Tư vấn chọn chất liệu, báo giá theo dòng xe và đặt lịch thi công tại cửa hàng ROMAN.",
  "cards": [
   {
    "label": "CẨM NANG BẢO DƯỠNG",
    "title": "Chăm Sóc Nội Thất Da & Alcantara",
    "body": "Hướng dẫn vệ sinh định kỳ và dưỡng ẩm đúng chuẩn cho da Nappa, da lộn và film nội thất.",
    "cta": "Xem hướng dẫn chi tiết",
    "link": "#faq",
    "style": "line"
   },
   {
    "label": "CHÍNH SÁCH BẢO HÀNH",
    "title": "Chính Sách Bảo Hành & Bảo Dưỡng",
    "body": "Thời hạn và phạm vi bảo hành theo từng hạng mục và chất liệu. Xem chính sách hoặc liên hệ hotline để được hướng dẫn.",
    "cta": "Xem chính sách bảo hành",
    "link": "chinh-sach.html#bao-hanh",
    "style": "line",
    "anchor": "bao-hanh"
   },
   {
    "label": "TƯ VẤN TRỰC TIẾP",
    "title": "Hotline Tư Vấn",
    "body": "Giải đáp về chất liệu, báo giá theo dòng xe và hẹn xem mẫu da tại cửa hàng.",
    "cta": "Gọi {hotline}",
    "link": "tel:{hotlineTel}",
    "style": "gold"
   }
  ],
  "faq": {
   "eyebrow": "GIẢI ĐÁP THẮC MẮC",
   "title": "Câu Hỏi Thường Gặp",
   "sub": "Những thông tin quan trọng trước và sau khi nâng cấp nội thất ô tô tại ROMAN.",
   "items": [
    {
     "q": "Thời gian bọc ghế da và nâng cấp nội thất mất bao lâu?",
     "a": "Thời gian thi công tùy hạng mục, dòng xe và số lượng chi tiết. ROMAN sẽ báo thời gian dự kiến khi bạn đặt lịch, vui lòng liên hệ hotline để được tư vấn cụ thể."
    },
    {
     "q": "Bọc ghế da có ảnh hưởng đến túi khí bên hông ghế không?",
     "a": "Vị trí túi khí hông cần được lưu ý khi thi công. Bạn hãy báo hãng xe và đời xe khi đặt lịch để ROMAN tư vấn cách thi công phù hợp."
    },
    {
     "q": "Chính sách bảo hành của ROMAN như thế nào?",
     "a": "Thời hạn và phạm vi bảo hành phụ thuộc từng hạng mục và chất liệu, được xác nhận khi đặt lịch hoặc bàn giao xe. Xem chi tiết tại [Chính sách bảo hành](chinh-sach.html#bao-hanh) hoặc gọi hotline."
    },
    {
     "q": "Tôi có thể xem và chạm thử mẫu da trước khi quyết định không?",
     "a": "Có. Bạn có thể đến cửa hàng ROMAN tại {store} để xem mẫu da và chọn màu trực tiếp. Nên gọi hotline trước để được chuẩn bị mẫu phù hợp với xe của bạn."
    },
    {
     "q": "Hướng dẫn vệ sinh và dưỡng ghế da Nappa bền đẹp lâu dài?",
     "a": "Lau bụi hàng tuần bằng khăn Microfiber ẩm mềm. Định kỳ mỗi 4 – 6 tháng, sử dụng dung dịch vệ sinh da pH trung tính kết hợp kem dưỡng chuyên dụng (Leather Conditioner). Tránh các chất tẩy rửa có cồn, xăng thơm hoặc phơi trực tiếp dưới nắng gắt nhiều giờ liên tục."
    }
   ]
  },
  "booking": {
   "eyebrow": "ĐẶT LỊCH HẸN ƯU TIÊN",
   "title": "Đặt Lịch Tư Vấn & Thi Công",
   "sub": "Để lại thông tin dòng xe và nhu cầu của bạn — ROMAN sẽ liên hệ lại với bạn. Cần gấp, hãy gọi hotline.",
   "topics": [
    "Bọc ghế da",
    "Thiết kế & sản xuất ghế chủ tịch Limousine",
    "Bọc sàn",
    "Khâu vô lăng",
    "Dán chi tiết nhựa",
    "Trần da lộn",
    "Thảm taplo",
    "Bảo hành",
    "Khác"
   ],
   "sideEyebrow": "GẶP TRỰC TIẾP TẠI ROMAN",
   "sideTitle": "Cửa Hàng & Tổng Kho",
   "sideBody": "Ghé cửa hàng để xem mẫu da và chọn màu trực tiếp. Nên gọi hotline trước khi đến."
  }
 },
 "policy": {
  "eyebrow": "CHÍNH SÁCH & ĐIỀU KHOẢN",
  "title": "Chính Sách Bảo Hành, Bảo Mật & Điều Khoản",
  "lead": "Thông tin áp dụng khi bạn sử dụng website và dịch vụ của ROMAN.",
  "updated": "19/10/2026",
  "sections": [
   {
    "id": "bao-hanh",
    "title": "Chính sách bảo hành",
    "body": "Thời hạn và phạm vi bảo hành phụ thuộc vào từng hạng mục (ghế da, ghế điện, sàn, thảm, trần da lộn...) và chất liệu đã chọn. ROMAN xác nhận cụ thể với khách hàng khi đặt lịch hoặc bàn giao xe.\n\n### Quy trình bảo hành\n\n1. Liên hệ hotline [{hotline}](tel:{hotlineTel}) hoặc [{hotline2}](tel:{hotline2Tel}) và cho biết họ tên, số điện thoại, dòng xe, hạng mục đã thực hiện.\n2. Mang xe đến cửa hàng ROMAN tại {store} để nhân viên kiểm tra tình trạng thực tế.\n3. ROMAN thông báo kết quả kiểm tra và hướng xử lý (sửa chữa, thay thế hoặc tư vấn bảo dưỡng) tùy từng trường hợp.\n\n### Các trường hợp thường không thuộc phạm vi bảo hành\n\n- Hư hỏng do va chạm, tai nạn, cháy nổ hoặc thiên tai.\n- Sử dụng sai cách, vệ sinh bằng hóa chất không phù hợp với chất liệu.\n- Tự ý tháo, sửa hoặc can thiệp vào sản phẩm bởi đơn vị khác.\n- Hao mòn tự nhiên theo thời gian và cường độ sử dụng.\n\nĐể biết thời hạn bảo hành chính xác của hạng mục bạn quan tâm, vui lòng liên hệ hotline."
   },
   {
    "id": "bao-mat",
    "title": "Chính sách bảo mật thông tin",
    "body": "### Thông tin chúng tôi thu thập\n\nKhi bạn gửi biểu mẫu đặt lịch, ROMAN nhận các thông tin do chính bạn cung cấp: họ tên, số điện thoại, hãng và dòng xe, ngày dự kiến thi công, hạng mục quan tâm và ghi chú.\n\n### Mục đích sử dụng\n\n- Liên hệ tư vấn, báo giá và xác nhận lịch hẹn.\n- Thực hiện và bảo hành dịch vụ bạn đã đặt.\n\n### Chia sẻ và lưu trữ\n\nROMAN không bán hoặc cho thuê thông tin cá nhân của khách hàng. Thông tin chỉ được chia sẻ khi có yêu cầu của cơ quan nhà nước có thẩm quyền theo quy định của pháp luật.\n\n### Quyền của bạn\n\nBạn có thể yêu cầu xem, chỉnh sửa hoặc xóa thông tin đã cung cấp bằng cách liên hệ [{email}](mailto:{email}) hoặc gọi hotline.\n\n### Dịch vụ bên thứ ba\n\nWebsite tải phông chữ từ Google Fonts, vì vậy trình duyệt của bạn có thể gửi địa chỉ IP tới Google khi mở trang. Khi bạn bấm vào liên kết dẫn tới trang khác (ví dụ Google Maps), chính sách của trang đó sẽ được áp dụng."
   },
   {
    "id": "dieu-khoan",
    "title": "Điều khoản sử dụng website",
    "body": "- **Mục đích:** website giới thiệu sản phẩm, dịch vụ và bảng giá của ROMAN. Website không phải kênh thanh toán trực tuyến.\n- **Giá niêm yết:** giá hiển thị là giá niêm yết theo bảng giá của ROMAN, có thể thay đổi theo dòng xe, cấu hình và thời điểm. Giá chính xác được xác nhận khi liên hệ.\n- **Hình ảnh và mô tả:** mang tính minh họa, màu sắc thực tế có thể chênh lệch tùy màn hình và chất liệu.\n- **Quyền sở hữu nội dung:** nội dung, hình ảnh và thương hiệu trên website thuộc ROMAN hoặc bên cấp phép. Không sao chép, sử dụng cho mục đích thương mại khi chưa được đồng ý bằng văn bản.\n- **Thay đổi:** ROMAN có thể cập nhật nội dung website và các điều khoản này mà không cần báo trước.\n\nMọi thắc mắc xin liên hệ hotline [{hotline}](tel:{hotlineTel}) – [{hotline2}](tel:{hotline2Tel}) hoặc email [{email}](mailto:{email})."
   }
  ]
 }
};
