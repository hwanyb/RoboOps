import type { RobotStatus } from "@/types/robot";
import { getStatusColor } from "@/lib/statusUtils";

const COLOR_CLASSES: Record<ReturnType<typeof getStatusColor>, string> = {
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  gray: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

interface Props {
  status: RobotStatus;
}

export default function StatusBadge({ status }: Props) {
  const color = getStatusColor(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${COLOR_CLASSES[color]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
}
