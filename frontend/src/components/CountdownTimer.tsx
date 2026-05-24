import { useEffect, useState } from 'react';

export default function CountdownTimer({ endDate }: { endDate: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const tick = () => {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Expired');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      setRemaining(`${days}d ${hours}h ${mins}m left`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
      {remaining}
    </span>
  );
}
