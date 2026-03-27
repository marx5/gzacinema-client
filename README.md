# Gzacinema Client

Frontend cho hệ thống đặt vé phim Gzacinema, xây dựng với React + Vite.

English: Frontend for the Gzacinema movie ticket booking system, built with React + Vite.

## 1) Tổng quan

## 1) Overview

Ứng dụng hỗ trợ 3 nhóm chức năng chính:

English: The application supports 3 main feature groups:

- Người dùng: xem phim, xem lịch chiếu, chọn ghế, thanh toán, quản lý vé đã mua.
- Quản trị: quản lý phim, rạp, phòng chiếu, suất chiếu, hóa đơn và dashboard thống kê.
- Nhân viên: quét QR để check-in vé tại cửa phòng chiếu.
- Users: browse movies, view showtimes, select seats, pay, and manage purchased tickets.
- Admins: manage movies, cinemas, rooms, showtimes, invoices, and analytics dashboards.
- Staff: scan QR codes to check in tickets at theater entrances.

## 2) Công nghệ sử dụng

## 2) Tech Stack

- React 18
- Vite 5
- React Router DOM 6
- TanStack Query (fetch/cache dữ liệu)
- Axios (HTTP client + interceptor refresh token)
- Zustand (auth store)
- Tailwind CSS
- react-hot-toast
- @yudiel/react-qr-scanner
- qrcode.react

## 3) Tính năng hiện có

## 3) Current Features

### Người dùng

### Users

- Đăng ký, đăng nhập, đăng xuất.
- Tự động kiểm tra phiên đăng nhập khi mở app.
- Xem danh sách phim theo tab: Đang chiếu / Sắp chiếu.
- Xem chi tiết phim, trailer YouTube và lịch chiếu theo ngày/rạp.
- Đặt vé theo suất chiếu:
	- Hiển thị sơ đồ ghế.
	- Giữ ghế / bỏ giữ ghế theo thời gian thực tương đối.
	- Hỗ trợ ghế thường, VIP, sweetbox.
	- Đồng hồ giữ ghế 5 phút (lưu trạng thái theo showtime trên localStorage).
- Tạo link thanh toán qua cổng thanh toán (VNPay flow).
- Nhận kết quả thanh toán tại trang callback.
- Xem lịch sử mua vé, hiển thị QR code cho từng vé.
- Cập nhật hồ sơ cá nhân, đổi mật khẩu.
- Sign up, sign in, and sign out.
- Auto session check when app starts.
- Browse movies by tabs: Now Showing / Coming Soon.
- View movie details, YouTube trailer, and showtimes by date/cinema.
- Book seats for a showtime:
	- Interactive seat map.
	- Hold and unhold seats.
	- Supports regular, VIP, and sweetbox seats.
	- 5-minute seat hold timer (saved per showtime in localStorage).
- Create payment URL through the payment gateway (VNPay flow).
- Handle payment callback result.
- View purchase history with QR code per ticket.
- Update profile and change password.

### Admin

### Admins

- Dashboard thống kê doanh thu, vé bán, user mới.
- Lọc thống kê theo rạp và theo thời gian (all-time, hôm nay, tuần, tháng, tùy chỉnh).
- CRUD phim (bao gồm upload poster, trailer URL).
- CRUD rạp.
- Quản lý phòng theo từng rạp (tạo/xóa phòng).
- Tạo/xóa suất chiếu.
- Danh sách hóa đơn, lọc trạng thái, phân trang.
- Dashboard for revenue, tickets sold, and new users.
- Filter analytics by cinema and time range (all-time, today, week, month, custom).
- Movie CRUD (including poster upload and trailer URL).
- Cinema CRUD.
- Room management per cinema (create/delete rooms).
- Create/delete showtimes.
- Invoice list with status filter and pagination.

### Staff

### Staff

- Quét QR vé.
- Check-in vé qua API.
- Hiển thị phản hồi thành công/thất bại theo kết quả xác thực vé.
- Scan ticket QR codes.
- Check in tickets via API.
- Show success/failure feedback based on ticket validation result.

## 4) Yêu cầu môi trường

## 4) Environment Requirements

- Node.js >= 18
- npm >= 9

## 5) Cài đặt và chạy nhanh

## 5) Quick Start

```bash
npm install
npm run dev
```

Trước khi chạy `npm run dev`, hãy tạo file `.env` theo mẫu ở mục 6.

English: Before running `npm run dev`, create a `.env` file based on section 6.

Mặc định Vite chạy tại: `http://localhost:5173`

English: By default, Vite runs at: `http://localhost:5173`

## 6) Biến môi trường

## 6) Environment Variables

Tạo file `.env` ở thư mục gốc dự án:

English: Create a `.env` file at the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Giải thích:

English:

- `VITE_API_URL`: base URL cho toàn bộ request từ frontend.
- `VITE_API_URL`: base URL for all frontend API requests.

## 7) Scripts

## 7) Scripts

- `npm run dev`: chạy môi trường development.
- `npm run build`: build production.
- `npm run preview`: chạy thử bản build.
- `npm run lint`: kiểm tra lint.
- `npm run dev`: start development server.
- `npm run build`: build for production.
- `npm run preview`: preview the production build.
- `npm run lint`: run ESLint.

## 8) Cấu trúc thư mục

## 8) Folder Structure

```text
src/
	api/            # Khai báo API modules + axios client
	app/            # App shell và router
	components/     # Components dùng chung
	pages/          # Các trang user/admin/staff
	store/          # Zustand store (auth)
	styles/         # CSS dùng chung
	index.css       # Tailwind + style tổng
	main.jsx        # Entry point + QueryClientProvider
```

## 9) Luồng xác thực trên frontend

## 9) Frontend Authentication Flow

- Access token lưu trong localStorage với key `token`.
- Mỗi request tự động gắn header `Authorization: Bearer <token>`.
- Nếu API trả `401`, client thử gọi `/auth/refresh` (1 lần) để lấy access token mới.
- Refresh thất bại: xóa token và điều hướng về trang `/login`.
- Access token is stored in localStorage with key `token`.
- Each request automatically includes `Authorization: Bearer <token>`.
- When API returns `401`, client retries once via `/auth/refresh` to get a new access token.
- If refresh fails, token is removed and user is redirected to `/login`.

## 10) Luồng đặt vé và thanh toán (rút gọn)

## 10) Booking and Payment Flow (Summary)

1. Người dùng vào trang chi tiết phim và chọn suất chiếu.
2. Frontend tải sơ đồ ghế theo showtime.
3. Người dùng giữ ghế (`/bookings/hold`) hoặc bỏ giữ (`/bookings/unhold`).
4. Frontend tạo URL thanh toán (`/payments/create-payment-url`).
5. Trình duyệt chuyển sang cổng thanh toán.
6. Sau khi thanh toán, user được redirect về `/payment/success`.
7. Trang kết quả đọc `vnp_ResponseCode` để hiển thị thành công/thất bại.
1. User opens movie details and selects a showtime.
2. Frontend loads seat map for that showtime.
3. User holds seats (`/bookings/hold`) or releases seats (`/bookings/unhold`).
4. Frontend requests payment URL (`/payments/create-payment-url`).
5. Browser is redirected to payment gateway.
6. After payment, user is redirected to `/payment/success`.
7. Result page reads `vnp_ResponseCode` to show success or failure.

## 11) Danh sách route chính

## 11) Main Routes

### Public routes

### Public Routes

- `/`: Trang chủ.
- `/login`: Đăng nhập.
- `/register`: Đăng ký.
- `/movie/:id`: Chi tiết phim + lịch chiếu.

### Protected routes (yêu cầu đăng nhập)

### Protected Routes (Authentication Required)

- `/booking/:showtimeId`: Đặt vé.
- `/payment/success`: Kết quả thanh toán.
- `/history`: Vé của tôi.
- `/profile`: Hồ sơ người dùng.
- `/admin`: Dashboard admin.
- `/admin/movies`: Quản lý phim.
- `/admin/showtimes`: Quản lý suất chiếu.
- `/admin/cinemas`: Quản lý rạp.
- `/admin/cinemas/:cinemaId/rooms`: Quản lý phòng.
- `/admin/bookings`: Quản lý hóa đơn.
- `/staff/checkin`: Soát vé QR.

Lưu ý: frontend hiện chỉ chặn theo trạng thái đăng nhập (authenticated), không chặn theo role ngay tại router. Việc phân quyền chi tiết cần được đảm bảo ở backend.

Note: frontend currently enforces authentication only, not role-based route guards at router level. Fine-grained authorization must be enforced by backend.

## 12) Tích hợp backend

## 12) Backend Integration

Dự án frontend này cần backend API hoạt động đúng và cùng chuẩn endpoint như các module trong `src/api/`.

English: This frontend requires a backend API that follows the same endpoint contracts used by modules in `src/api/`.

Hãy đảm bảo:

Make sure:

- Backend bật CORS cho origin frontend.
- Cookie refresh token hoạt động đúng với `withCredentials: true`.
- URL backend khớp với `VITE_API_URL`.
- Backend enables CORS for the frontend origin.
- Refresh token cookie works correctly with `withCredentials: true`.
- Backend URL matches `VITE_API_URL`.

## 13) Gợi ý cải thiện tiếp

## 13) Suggested Next Improvements

- Bổ sung route guard theo role (`admin`, `staff`) ở frontend.
- Thêm `.env.example` chính thức vào repo.
- Thêm hướng dẫn deploy (Nginx/Vercel) và quy trình CI lint/build.
- Bổ sung ảnh chụp màn hình cho các luồng chính.
- Add role-based route guards (`admin`, `staff`) on frontend.
- Add an official `.env.example` file to the repository.
- Add deployment guide (Nginx/Vercel) and CI steps for lint/build.
- Add screenshots for key user flows.
