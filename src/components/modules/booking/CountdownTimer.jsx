import { useState, useEffect, useRef } from 'react';
import { formatTimeLeft } from '@/utils/formatters';
import { Clock, AlertCircle } from 'lucide-react';

export default function CountdownTimer({ showtimeId, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedExpiry = localStorage.getItem(`timer_${showtimeId}`);
    if (savedExpiry) {
      const remaining = Math.floor((parseInt(savedExpiry, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 300;
  });

  const savedOnExpire = useRef(onExpire);
  useEffect(() => {
    savedOnExpire.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (timeLeft <= 0) {
      savedOnExpire.current();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          savedOnExpire.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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