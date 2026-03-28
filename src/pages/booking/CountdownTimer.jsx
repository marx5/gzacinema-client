import { useState, useEffect, useRef } from 'react';
import { formatTimeLeft } from '../../utils/formatters';

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
    useEffect(() => { savedOnExpire.current = onExpire; }, [onExpire]);

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

    return (
        <div className={`px-[10px] py-[6px] font-bold text-white ${timeLeft <= 60 ? 'bg-brand-error' : 'bg-[#1f8d52]'}`}>
            ⏱ {formatTimeLeft(timeLeft)}
        </div>
    );
}