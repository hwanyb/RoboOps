import { getBatteryColor } from "@/lib/statusUtils";

const BAR_CLASSES: Record<ReturnType<typeof getBatteryColor>, string> = {
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
  blue: "bg-blue-400",
  gray: "bg-slate-500",
};

interface Props {
  value: number;
  showLabel?: boolean;
}

export default function BatteryBar({ value, showLabel = true }: Props) {
  const color = getBatteryColor(value);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${BAR_CLASSES[color]}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400 w-8 text-right">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}
