interface ProgressBarProps {
  packed: number;
  total: number;
}

export function ProgressBar({ packed, total }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {packed}/{total} packed
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#2D5016] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
