import { Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/core';

export default function HistoryEmptyState() {
  return (
    <div className="p-12 rounded-3xl glass-card text-center border border-white/10 space-y-4">
      <Ticket className="w-12 h-12 text-cinema-text-dim mx-auto" />
      <h3 className="text-lg font-bold text-white">Chưa có lịch sử mua vé tại GzaCinema</h3>
      <p className="text-sm text-cinema-text-muted max-w-md mx-auto">
        Khám phá ngay các bộ phim bom tấn đang chiếu tại rạp và đặt vé trải nghiệm!
      </p>
      <Link to="/" className="inline-block pt-2">
        <Button variant="primary" size="md">
          Khám phá phim ngay
        </Button>
      </Link>
    </div>
  );
}
