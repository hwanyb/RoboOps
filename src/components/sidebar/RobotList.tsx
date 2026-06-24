"use client";

import { useShallow } from "zustand/react/shallow";
import { useRobotStore, selectRobotList } from "@/store/robotStore";
import StatusBadge from "@/components/ui/StatusBadge";
import BatteryBar from "@/components/ui/BatteryBar";
import type { Robot } from "@/types/robot";

const TYPE_ICON: Record<Robot["type"], string> = {
  AMR: "🤖",
  AGV: "🚜",
  ARM: "🦾",
  DRONE: "🚁",
};

export default function RobotList() {
  const robots = useRobotStore(useShallow(selectRobotList));
  const selectedRobotId = useRobotStore((s) => s.selectedRobotId);
  const selectRobot = useRobotStore((s) => s.selectRobot);

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {robots.map((robot) => (
        <button
          key={robot.id}
          onClick={() =>
            selectRobot(selectedRobotId === robot.id ? null : robot.id)
          }
          className={`w-full text-left p-3 rounded-lg border transition-all ${
            selectedRobotId === robot.id
              ? "border-blue-500 bg-blue-500/10"
              : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
              <span>{TYPE_ICON[robot.type]}</span>
              {robot.name}
            </span>
            <StatusBadge status={robot.status} />
          </div>
          <BatteryBar value={robot.battery} />
        </button>
      ))}
    </div>
  );
}
