"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRobotStore, selectRobotList, selectUnacknowledgedAlerts } from "@/store/robotStore";
import RobotList from "@/components/sidebar/RobotList";
import AlertPanel from "@/components/sidebar/AlertPanel";
import RobotDetailPanel from "@/components/sidebar/RobotDetailPanel";

const FleetMap = dynamic(() => import("@/components/map/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-slate-500">
      Loading map...
    </div>
  ),
});

type SideTab = "robots" | "alerts" | "detail";

export default function DashboardShell() {
  const [activeTab, setActiveTab] = useState<SideTab>("robots");
  const robots = useRobotStore(selectRobotList);
  const alerts = useRobotStore(selectUnacknowledgedAlerts);
  const selectedRobotId = useRobotStore((s) => s.selectedRobotId);

  const onlineCount = robots.filter((r) => r.status !== "offline").length;
  const errorCount = robots.filter((r) => r.status === "error").length;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚙️</span>
          <span className="font-bold text-lg tracking-tight text-white">RoboOps</span>
          <span className="text-xs text-slate-500 hidden sm:block">Fleet Control Center</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <StatChip label="Total" value={robots.length} />
          <StatChip label="Online" value={onlineCount} color="text-green-400" />
          {errorCount > 0 && (
            <StatChip label="Error" value={errorCount} color="text-red-400" />
          )}
          {alerts.length > 0 && (
            <StatChip label="Alerts" value={alerts.length} color="text-yellow-400" pulse />
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map area */}
        <main className="flex-1 relative">
          <FleetMap />
        </main>

        {/* Sidebar */}
        <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          {/* Sidebar tabs */}
          <div className="flex border-b border-slate-800 shrink-0">
            <TabButton
              active={activeTab === "robots"}
              onClick={() => setActiveTab("robots")}
              label="Robots"
              badge={robots.length}
            />
            <TabButton
              active={activeTab === "alerts"}
              onClick={() => setActiveTab("alerts")}
              label="Alerts"
              badge={alerts.length}
              badgeColor="bg-yellow-500"
            />
            {selectedRobotId && (
              <TabButton
                active={activeTab === "detail"}
                onClick={() => setActiveTab("detail")}
                label="Detail"
              />
            )}
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "robots" && <RobotList />}
            {activeTab === "alerts" && <AlertPanel />}
            {activeTab === "detail" && <RobotDetailPanel />}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color = "text-slate-300",
  pulse = false,
}: {
  label: string;
  value: number;
  color?: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {pulse && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
      )}
      <span className={`font-semibold ${color}`}>{value}</span>
      <span className="text-slate-500 text-xs">{label}</span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  badge,
  badgeColor = "bg-slate-600",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
  badgeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 ${
        active
          ? "border-blue-500 text-blue-400 bg-blue-500/5"
          : "border-transparent text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full text-white font-bold ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
