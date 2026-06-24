"use client";

import dynamic from "next/dynamic";
import { useRobotStore, selectSelectedRobot, selectRobotTask } from "@/store/robotStore";
import StatusBadge from "@/components/ui/StatusBadge";
import BatteryBar from "@/components/ui/BatteryBar";

const RobotViewer3D = dynamic(() => import("@/components/viewer/RobotViewer3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 flex items-center justify-center text-slate-500 text-sm">
      Loading 3D view...
    </div>
  ),
});

const TYPE_LABEL: Record<string, string> = {
  AMR: "Autonomous Mobile Robot",
  AGV: "Automated Guided Vehicle",
  ARM: "Robotic Arm",
  DRONE: "Autonomous Drone",
};

export default function RobotDetailPanel() {
  const robot = useRobotStore(selectSelectedRobot);
  const getTask = useRobotStore((s) =>
    robot ? selectRobotTask(robot.id)(s) : null
  );

  if (!robot) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-sm gap-2">
        <span className="text-3xl">🎯</span>
        Select a robot on the map or list
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 3D Viewer */}
      <div className="h-48 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
        <RobotViewer3D robot={robot} />
      </div>

      {/* Robot info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">{robot.name}</h3>
            <p className="text-xs text-slate-400">{TYPE_LABEL[robot.type] ?? robot.type}</p>
          </div>
          <StatusBadge status={robot.status} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Battery</span>
            <span>{Math.round(robot.battery)}%</span>
          </div>
          <BatteryBar value={robot.battery} showLabel={false} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoCell label="X" value={robot.position.x.toFixed(1)} />
          <InfoCell label="Y" value={robot.position.y.toFixed(1)} />
          <InfoCell label="Heading" value={`${robot.position.heading.toFixed(0)}°`} />
          <InfoCell label="ID" value={robot.id} mono />
        </div>
      </div>

      {/* Current task */}
      {getTask && (
        <div className="border border-slate-700 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Current Task
          </p>
          <p className="text-sm text-slate-200">{getTask.description}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progress</span>
              <span>{getTask.progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${getTask.progress}%` }}
              />
            </div>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              getTask.status === "in_progress"
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                : getTask.status === "failed"
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-green-500/20 text-green-400 border-green-500/30"
            }`}
          >
            {getTask.status.replace("_", " ")}
          </span>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-slate-800 rounded-md p-2">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className={`text-slate-200 text-xs mt-0.5 truncate ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
