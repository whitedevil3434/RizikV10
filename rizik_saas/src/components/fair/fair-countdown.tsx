"use client";

import { useEffect, useMemo, useState } from "react";

interface FairCountdownProps {
  targetIso: string;
}

function computeRemaining(targetIso: string) {
  const diff = new Date(targetIso).getTime() - Date.now();
  const total = Math.max(0, diff);

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { days, hours, minutes, seconds, isFinished: total === 0 };
}

export default function FairCountdown({ targetIso }: FairCountdownProps) {
  const [remaining, setRemaining] = useState(() => computeRemaining(targetIso));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(computeRemaining(targetIso));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetIso]);

  const cards = useMemo(
    () => [
      { label: "Days", value: remaining.days },
      { label: "Hours", value: remaining.hours },
      { label: "Minutes", value: remaining.minutes },
      { label: "Seconds", value: remaining.seconds },
    ],
    [remaining.days, remaining.hours, remaining.minutes, remaining.seconds]
  );

  if (remaining.isFinished) {
    return (
      <div className="rounded-2xl border border-[#00B16A]/25 bg-[#00B16A]/10 px-5 py-4 text-center">
        <p className="text-sm font-bold text-[#00B16A] uppercase tracking-[0.12em]">Live Now</p>
        <p className="mt-1 text-lg font-semibold text-[#031E49]">Rizik Fair countdown completed</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((item) => (
        <div key={item.label} className="rounded-2xl border border-[#031E49]/15 bg-white px-4 py-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#031E49] tabular-nums">{String(item.value).padStart(2, "0")}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#031E49]/70 font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
  );
}
