# Kế hoạch trang quản trị ROMAN

Cập nhật: 19/10/2026

## 1. Hiện trạng

- Website tĩnh (HTML/CSS/JS thuần), không có máy chủ riêng. Hiện chạy bằng `python -m http.server`.
- Toàn bộ nội dung sản phẩm nằm trong `js/data.js`, viết dạng mã JavaScript có hàm tính toán (`setPrice`, `addProduct`, sắp xếp, làm sạch thông số). Người không biết lập trình không sửa được.
- Nội dung trang Giới thiệu, Hỗ trợ (FAQ), Chính sách viết cứng trong file HTML.
- Form đặt lịch không có nơi nhận: chỉ mở email có sẵn nội dung.
- Ảnh có 3 cỡ cho mỗi tên: `assets/photos/<tên>-sm.jpg` (960px), `-lg.jpg`, `-xl.jpg` (1920px).

## 2. Mục tiêu

Một trang quản trị tiếng Việt, đăng nhập bằng mật khẩu, cho phép chủ cửa hàng tự sửa **mọi thông tin hiển thị trên website** mà không đụng vào mã:

| Nhóm | Nội dung quản lý |
|---|---|
| Thông tin chung | Tên, khẩu hiệu, 2 hotline, email, cửa hàng, tổng kho, giờ mở cửa, tên công ty, mã số thuế, mạng xã hội, địa chỉ nhận form |
| Sản phẩm & bảng giá | Thêm, sửa, nhân bản, ẩn, xóa, sắp xếp; giá theo từng lựa chọn (xe 5/7 chỗ, VF2/VF3...), đơn vị tính, màu, đặc điểm, thông số, ảnh |
| Danh mục | Tên, mô tả, ảnh, nhóm con, thứ tự |
| Trang chủ | Slide đầu trang (video/ảnh), 3 banner lớn + thẻ sản phẩm, "Câu chuyện", khối Limousine, ghi chú cuối trang |
| Trang nội dung | Giới thiệu (giới thiệu, số liệu, quy trình, địa chỉ, tuyển dụng), Hỗ trợ (thẻ, FAQ, khối đặt lịch), Chính sách (bảo hành, bảo mật, điều khoản) |
| Chất liệu | Các loại da Nappa hiển thị trên trang ghế da |
| Thư viện ảnh | Tải ảnh lên (tự tạo 3 cỡ, tự xóa EXIF/GPS), sửa mô tả ảnh, xem ảnh đang dùng ở đâu, xóa ảnh không dùng |
| Lịch hẹn | Danh sách khách đặt lịch từ website, trạng thái (mới / đã liên hệ / hoàn thành / hủy), ghi chú nội bộ, xuất Excel (CSV) |
| SEO | Tiêu đề và mô tả từng trang (hiển thị trên Google, Facebook, Zalo) |
| Sao lưu | Mỗi lần lưu tự giữ bản cũ (30 bản gần nhất), khôi phục 1 chạm, tải về / nhập file |
| Tài khoản | Đổi mật khẩu |

## 3. Phương án kiến trúc

Đã cân nhắc 3 hướng:

1. **Chỉ trình duyệt, xuất file `data.js` thủ công**: không cần máy chủ nhưng mỗi lần sửa phải tải file và chép đè, không nhận được lịch hẹn. Loại.
2. **Dịch vụ ngoài (Firebase, Supabase, CMS có phí)**: phụ thuộc tài khoản bên thứ ba, phải viết lại toàn bộ cách website đọc dữ liệu. Loại ở giai đoạn này.
3. **Máy chủ Node.js nhỏ, không cần cài thư viện** (chọn): vừa phục vụ website vừa có API cho trang quản trị.

Cách hoạt động của phương án 3:

```
content/site.json  ← nguồn dữ liệu duy nhất (trang quản trị đọc và ghi)
        │  mỗi lần bấm "Lưu"
        ▼
js/data.js          ← tự sinh lại, website đọc như cũ (không đổi giao diện)
*.html              ← tự cập nhật tiêu đề/mô tả SEO và số phiên bản để trình duyệt tải bản mới
content/backups/    ← bản sao lưu trước mỗi lần lưu
content/bookings.json ← lịch hẹn khách gửi từ form
```

Ưu điểm:

- Website vẫn là trang tĩnh: chạy được trên máy chủ Node (VPS) hoặc chép thư mục lên hosting tĩnh bất kỳ (khi đó trang quản trị dùng trên máy, rồi tải lên).
- Không cần cài thêm gói nào (`node server/index.js` là chạy). Máy đã có Node 24.
- Giao diện website giữ nguyên 100%; chỉ thay nguồn dữ liệu.

## 4. Bảo mật

- Mật khẩu băm bằng `scrypt` có muối, không lưu mật khẩu gốc.
- Tài khoản đầu tiên chỉ tạo được từ chính máy chạy máy chủ (localhost).
- Phiên đăng nhập bằng cookie `HttpOnly`, `SameSite=Strict`, hết hạn sau 12 giờ.
- Chặn đoán mật khẩu: khóa 15 phút sau 8 lần sai.
- Mọi thao tác ghi yêu cầu đăng nhập, kiểm tra nguồn gửi (Origin) và header riêng, chống CSRF.
- Máy chủ chỉ cho tải các thư mục công khai (`assets`, `css`, `js`, `admin`, các trang `.html`). Thư mục `content/` (mật khẩu, lịch hẹn của khách) và mã máy chủ không thể truy cập qua web.
- Form đặt lịch công khai: giới hạn số lần gửi, kiểm tra độ dài, có bẫy chống bot.
- Ảnh tải lên được vẽ lại qua canvas nên mất EXIF/GPS; tên file được làm sạch, chống ghi ra ngoài thư mục.
- Lưu có kiểm tra phiên bản: nếu hai người cùng sửa, người lưu sau được báo để tải lại, không ghi đè mất dữ liệu.

## 5. Các bước triển khai

1. Chuyển `js/data.js` hiện tại sang `content/site.json` (giữ nguyên toàn bộ dữ liệu, bỏ các hàm tính toán) và viết bộ sinh `data.js`. Kiểm tra: `data.js` sinh ra cho kết quả **giống hệt** bản cũ.
2. Đưa nội dung trang Giới thiệu, Hỗ trợ, Chính sách vào dữ liệu; website hiển thị các trang này từ dữ liệu (định dạng đơn giản: in đậm, liên kết, danh sách).
3. Máy chủ `server/`: phục vụ trang, đăng nhập, API nội dung, ảnh, lịch hẹn, sao lưu.
4. Trang quản trị `admin/`: giao diện tiếng Việt, menu bên trái, nút Lưu luôn hiển thị, cảnh báo khi rời trang chưa lưu, dùng được trên điện thoại.
5. Form đặt lịch gửi về máy chủ; nếu máy chủ không có (hosting tĩnh) thì tự chuyển sang mở email.
6. Kiểm thử: sửa giá, thêm sản phẩm, tải ảnh, đặt lịch, khôi phục sao lưu, đăng nhập sai nhiều lần, truy cập trái phép `content/`.

## 6. Giới hạn của giai đoạn này

- Video slide đầu trang chỉ chọn trong các video có sẵn; tải video mới cần nén bằng ffmpeg nên chưa đưa vào trang quản trị.
- Một tài khoản quản trị (chưa phân quyền nhiều người).
- Khi đưa lên hosting tĩnh (không chạy Node), lịch hẹn quay về cách gửi qua email.

## 7. Cách chạy

```bash
npm start
```

- Website: http://localhost:5173
- Trang quản trị: http://localhost:5173/admin/
- Quên mật khẩu: nhờ một Quản trị viên khác đặt lại ở mục Tài khoản & phân quyền. Nếu không còn ai đăng nhập được: xóa `content/users.json` (và `content/admin.json` nếu còn) rồi mở lại trang quản trị trên chính máy chạy máy chủ để tạo tài khoản mới.

## 8. Cấu trúc tệp

| Tệp / thư mục | Vai trò |
|---|---|
| `content/site.json` | Toàn bộ nội dung website (trang quản trị ghi vào đây) |
| `content/bookings.json` | Lịch hẹn khách gửi (có số điện thoại khách, không công khai) |
| `content/users.json` | Các tài khoản quản trị và vai trò (mật khẩu đã băm). Bản cũ `admin.json` tự chuyển sang khi đăng nhập |
| `content/activity.json` | Nhật ký hoạt động (3.000 dòng gần nhất) |
| `content/stats.json` | Thống kê truy cập ẩn danh theo ngày (400 ngày) |
| `content/backups/` | 30 bản sao lưu gần nhất + bản `data.js` viết tay trước khi chuyển đổi |
| `js/data.js` | **Tự sinh**, không sửa tay |
| `server/index.js` | Máy chủ: website + API |
| `server/build.js` | Sinh `data.js`, cập nhật SEO, kiểm tra dữ liệu |
| `server/migrate.js` | Chuyển đổi một lần từ `data.js` cũ (đã chạy) |
| `admin/` | Giao diện trang quản trị |

## 9. Đưa lên mạng

**Cách 1: VPS có Node (đã chọn: dữ liệu lưu ngay trên VPS)**

Toàn bộ dữ liệu (nội dung, lịch hẹn, tài khoản, cài đặt Telegram, sao lưu) là các tệp JSON trong `content/` trên VPS, không dùng dịch vụ bên ngoài. Với lượng lịch hẹn của một cửa hàng (tối đa 5.000 lịch hẹn gần nhất được giữ), cách này đủ nhanh và dễ sao lưu, không cần cài thêm cơ sở dữ liệu.

1. Cài Node 18 trở lên, chép cả thư mục lên VPS (ví dụ `/var/www/roman`).
2. Chạy nền và tự khởi động lại bằng systemd, tệp `/etc/systemd/system/roman.service`:

   ```ini
   [Unit]
   Description=ROMAN website
   After=network.target

   [Service]
   WorkingDirectory=/var/www/roman
   ExecStart=/usr/bin/node server/index.js
   Environment=PORT=5173 HOST=127.0.0.1 TRUST_PROXY=1
   Restart=always
   User=www-data

   [Install]
   WantedBy=multi-user.target
   ```

   Rồi chạy `systemctl enable --now roman`. Thư mục `content/`, `js/`, các tệp `.html` và `assets/photos/` cần quyền ghi cho `www-data`.
3. Nginx phía trước (HTTPS bằng Let's Encrypt / certbot):

   ```nginx
   server {
     server_name romanauto.vn;
     client_max_body_size 40m;            # tải ảnh từ trang quản trị
     location / {
       proxy_pass http://127.0.0.1:5173;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

   `TRUST_PROXY=1` chỉ bật khi có Nginx đứng trước, để máy chủ lấy đúng IP khách cho chức năng chặn spam và đoán mật khẩu.
4. Tạo tài khoản lần đầu qua đường hầm SSH: `ssh -L 5173:localhost:5173 <vps>` rồi mở http://localhost:5173/admin/ trên máy mình. Tài khoản không tạo được qua địa chỉ công khai.
5. Sao lưu định kỳ thư mục `content/` và `assets/photos/` (ví dụ cron nén hằng đêm rồi đẩy lên Google Drive).

**SEO (tự động mỗi lần bấm Lưu)**

- `server/seo.js` ghi sẵn nội dung chữ vào HTML (Google đọc được không cần JavaScript), tạo trang riêng cho từng sản phẩm tại `/san-pham/<ten-san-pham>/`, thẻ canonical, ảnh chia sẻ và dữ liệu có cấu trúc (AutoRepair, Product, BreadcrumbList, FAQPage, WebSite).
- Địa chỉ cũ `product.html?id=...` được máy chủ chuyển hẳn (301) sang địa chỉ mới.
- `/sitemap.xml` và `/robots.txt` do máy chủ tạo theo nội dung mới nhất.
- Sau khi có tên miền: điền **Địa chỉ website** trong trang quản trị → Thông tin cửa hàng, bấm Lưu, rồi khai báo `https://ten-mien/sitemap.xml` trong Google Search Console.
- Website cần chạy ở gốc tên miền (không đặt trong thư mục con), vì trang sản phẩm dùng `<base href="/">`.

**Thông báo Telegram**

- Cài trong trang quản trị → **Thông báo Telegram** (hướng dẫn từng bước có sẵn trên màn hình).
- Mã bot lưu ở `content/telegram.json` trên VPS, không xuất ra website và không hiện lại trong trang quản trị.
- Máy chủ tự hỏi Telegram liên tục để nhận lệnh (long polling), nên VPS chỉ cần kết nối ra internet tới `api.telegram.org`, không cần mở cổng hay cấu hình webhook.
- Một bot chỉ chạy được trên **một** máy chủ cùng lúc. Nếu vừa chạy trên máy cá nhân vừa chạy trên VPS với cùng mã bot, Telegram sẽ báo xung đột; hãy tắt thông báo ở máy cá nhân.

**Cách 2: hosting tĩnh (Vercel, Netlify, hosting thường)**

- Sửa nội dung bằng trang quản trị trên máy, rồi tải lên mọi thứ **trừ** `content/`, `server/`, `docs/`, `admin/`, `.claude/`, `package.json`.
- Form đặt lịch sẽ tự chuyển sang gửi qua email vì không có máy chủ nhận.

## 10. Tính năng vận hành (bổ sung)

| Màn hình | Dùng để |
|---|---|
| Lịch theo tháng | Xem lịch hẹn theo ngày thi công; bấm ô ngày để thêm lịch hẹn; danh sách khách chưa chốt ngày |
| Khách hàng | Gộp lịch hẹn theo số điện thoại: lịch sử từng khách, gọi / Zalo, thêm lịch hẹn cho khách cũ, xuất Excel |
| Thêm lịch hẹn | Nhập tay lịch hẹn nhận qua điện thoại, Zalo, Facebook, khách đến cửa hàng; có thể báo luôn qua Telegram |
| Thống kê truy cập | Lượt xem, người truy cập, lịch hẹn từ website, tỷ lệ đặt lịch, sản phẩm / trang xem nhiều, khách đến từ đâu. Ẩn danh: không cookie, không lưu IP, bỏ qua máy tìm kiếm |
| Sửa giá nhanh | Sửa giá mọi sản phẩm trên một màn; tăng / giảm hàng loạt theo % có làm tròn |
| Tài khoản & phân quyền | Nhiều tài khoản. Quản trị viên: toàn quyền. Nhân viên: Lịch hẹn, Lịch, Khách hàng, Thống kê; không sửa website, không xóa lịch hẹn |
| Nhật ký hoạt động | Ai đăng nhập, lưu gì (kèm giá cũ → giá mới), xử lý lịch hẹn nào, tải / xóa ảnh, đổi cài đặt |

