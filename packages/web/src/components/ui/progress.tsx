import { cn } from "../../lib/utils";

export function ProgressBar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", color, pct > 0 && "animate-progress-fill")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProgressRing({ pct, size = 40 }: { pct: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 animate-ring-fill" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-muted" strokeWidth="3" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor"
        className={cn("text-primary transition-all duration-700 ease-out", pct === 100 && "text-emerald-500")}
        strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dy="0.35em" textAnchor="middle" className="fill-text-primary text-[10px] font-semibold tabular-nums">{pct}</text>
    </svg>
  );
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
