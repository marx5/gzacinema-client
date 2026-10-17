import { useState, useEffect, useRef } from 'react';
import { formatTimeLeft } from '@/utils/formatters';
import { Clock, AlertCircle } from 'lucide-react';

export default function CountdownTimer({ showtimeId, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedExpiry = localStorage.getItem(`timer_${showtimeId}`);
    if (savedExpiry) {
      return Math.max(0, Math.ceil((Number(savedExpiry) - Date.now()) / 1000));
    }
    return 300;
  });

  const savedOnExpire = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    savedOnExpire.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    hasExpiredRef.current = false;

    const tick = () => {
      const savedExpiry = localStorage.getItem(`timer_${showtimeId}`);
      if (!savedExpiry) return;
      const remaining = Math.max(0, Math.ceil((Number(savedExpiry) - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        savedOnExpire.current?.();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [showtimeId]);

  const isUrgent = timeLeft <= 60;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
        isUrgent
          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse shadow-glow-purple'
          : 'bg-cinema-gold/15 text-cinema-gold-light border border-cinema-gold/30'
      }`}
    >
      {isUrgent ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
      <span>{formatTimeLeft(timeLeft)}</span>
    </div>
  );
}