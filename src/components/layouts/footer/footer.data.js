import { Ticket, ShieldCheck, Phone, Mail, Clock } from 'lucide-react';

export const DEFAULT_BRAND_INFO = {
  name: 'GZACINEMA',
  description: 'Hệ thống rạp chiếu phim chuẩn quốc tế với phòng chiếu IMAX, Laser 4K và hệ thống âm thanh vòm Dolby Atmos đỉnh cao.',
  homeUrl: '/',
};

export const DEFAULT_FOOTER_NAV_SECTIONS = [
  {
    title: 'Khám phá',
    icon: Ticket,
    links: [
      { label: 'Phim Đang Chiếu', to: '/?tab=showing' },
      { label: 'Phim Sắp Chiếu', to: '/?tab=coming_soon' },
      { label: 'Tra Cứu Vé Đã Đặt', to: '/history' },
      { label: 'Chương Trình Hội Viên VIP', to: '/profile' },
    ],
  },
  {
    title: 'Chính sách',
    icon: ShieldCheck,
    links: [
      { label: 'Điều khoản sử dụng', onClick: () => {} },
      { label: 'Chính sách bảo mật & thanh toán', onClick: () => {} },
      { label: 'Câu hỏi thường gặp (FAQ)', onClick: () => {} },
    ],
  },
];

export const DEFAULT_CONTACT_INFO = {
  title: 'Tổng đài hỗ trợ',
  items: [
    {
      icon: Phone,
      label: 'Hotline 24/7',
      value: '1900 1234',
    },
    {
      icon: Mail,
      label: 'Email liên hệ',
      value: 'support@gzacinema.com',
    },
    {
      icon: Clock,
      label: 'Thời gian hoạt động',
      value: '08:00 - 24:00 mỗi ngày',
    },
  ],
};

export const DEFAULT_SOCIAL_LINKS = [
  { label: 'Facebook', url: '#' },
  { label: 'Instagram', url: '#' },
  { label: 'YouTube', url: '#' },
  { label: 'TikTok', url: '#' },
];
