# ROMAN – Website & trang quản trị

Website giới thiệu dịch vụ nội thất ô tô ROMAN (ghế da, sàn, thảm, trần da lộn, ghế Limousine) kèm trang quản trị nội dung, lịch hẹn và thông báo Telegram.

## Chạy trên máy

Cần Node.js 18 trở lên, không cần cài thêm thư viện.

```bash
npm start
```

- Website: http://localhost:5173
- Trang quản trị: http://localhost:5173/admin/ (lần đầu mở trên chính máy chạy máy chủ để tạo tài khoản Quản trị viên)

## Cấu trúc

| Thư mục / tệp | Vai trò |
|---|---|
| `content/site.json` | Toàn bộ nội dung website (trang quản trị ghi vào đây) |
| `server/` | Máy chủ Node: website, API quản trị, SEO, thông báo Telegram |
| `admin/` | Giao diện trang quản trị |
| `js/`, `css/`, `*.html` | Website (`js/data.js` và `san-pham/` được sinh tự động khi lưu) |
| `assets/` | Ảnh, video, logo |
| `docs/` | Kế hoạch, hướng dẫn triển khai VPS, SEO, Telegram |

Dữ liệu riêng (tài khoản, lịch hẹn, cài đặt Telegram, nhật ký, thống kê, sao lưu) nằm trong `content/` trên máy chủ và **không** được đưa lên Git (xem `.gitignore`).

## Xem thử qua Internet

Bấm đúp `chia-se-website.cmd` (Windows, cần cloudflared) để tạo đường link `https://…trycloudflare.com` tạm thời.

## Triển khai VPS

Xem `docs/ke-hoach-trang-quan-tri.md`, mục "Đưa lên mạng".
