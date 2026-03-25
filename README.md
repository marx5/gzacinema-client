# Gzacinema Client

Frontend của hệ thống đặt vé phim Gzacinema, xây dựng bằng React + Vite.

## Công nghệ sử dụng

- React 18
- Vite 5
- React Router DOM 6
- TanStack Query
- Axios
- Zustand
- Tailwind CSS
- react-hot-toast
- QR tools: `@yudiel/react-qr-scanner`, `qrcode.react`

## Tính năng chính

- Xem danh sách phim đang chiếu và sắp chiếu
- Xem chi tiết phim và lịch chiếu theo ngày
- Đăng ký, đăng nhập, làm mới token tự động
- Đặt vé theo suất chiếu
- Xem lịch sử đặt vé
- Khu vực quản trị: quản lý phim, rạp, phòng, suất chiếu
- Khu vực staff: check-in vé bằng QR

## Yêu cầu môi trường

- Node.js >= 18
- npm >= 9

## Cài đặt

```bash
npm install
```

## Cấu hình biến môi trường

Tạo file `.env` trong thư mục `client` với nội dung:

```env
VITE_API_URL=http://localhost:5000/api
```

`VITE_API_URL` là base URL cho toàn bộ API request từ frontend.

## Chạy dự án

```bash
npm run dev
```

Mặc định Vite chạy ở: `http://localhost:5173`

## Scripts

- `npm run dev`: chạy môi trường development
- `npm run build`: build production
- `npm run preview`: preview bản build
- `npm run lint`: chạy ESLint

## Cấu trúc thư mục chính

```text
client/
	src/
		api/            # Khai báo API và axios client
		app/            # App shell và router
		components/     # Components dùng chung
		pages/          # Các trang (user/admin/staff)
		store/          # Zustand store
		styles/         # CSS chung
		utils/          # Helper functions
```

## Luồng xác thực

- Access token lưu trong `localStorage` với key `token`
- Mỗi request tự động gắn header `Authorization: Bearer <token>`
- Khi gặp `401`, client tự gọi `/auth/refresh` để lấy token mới
- Nếu refresh thất bại, token bị xóa và điều hướng về trang đăng nhập

## Một số route frontend tiêu biểu

- `/`: Trang chủ phim
- `/movie/:id`: Chi tiết phim + lịch chiếu
- `/booking/:showtimeId`: Đặt vé (đăng nhập)
- `/history`: Lịch sử đặt vé (đăng nhập)
- `/admin`: Dashboard admin
- `/staff/checkin`: Check-in vé cho nhân viên

## Gợi ý chạy cùng backend

Để client hoạt động đầy đủ, cần chạy server API ở địa chỉ trùng với `VITE_API_URL`.
