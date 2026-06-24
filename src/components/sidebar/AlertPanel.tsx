"use client";

import { useRobotStore, selectUnacknowledgedAlerts } from "@/store/robotStore";
import type { AlertSeverity } from "@/types/alert";

const SEVERITY_CLASSES: Record<AlertSeverity, string> = {
  info: "border-l-blue-400 bg-blue-500/5",
  warning: "border-l-yellow-400 bg-yellow-500/5",
  error: "border-l-red-400 bg-red-500/5",
  critical: "border-l-red-500 bg-red-500/10 animate-pulse",
};

const SEVERITY_TEXT: Record<AlertSeverity, string> = {
  info: "text-blue-400",
  warning: "text-yellow-400",
  error: "text-red-400",
  critical: "text-red-400",
};

export default function AlertPanel() {
  const alerts = useRobotStore(selectUnacknowledgedAlerts);
  const acknowledgeAlert = useRobotStore((s) => s.acknowledgeAlert);
  const clearAcknowledgedAlerts = useRobotStore((s) => s.clearAcknowledgedAlerts);

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
        <span className="text-2xl mb-2">✓</span>
        No active alerts
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-end mb-1">
        <button
          onClick={clearAcknowledgedAlerts}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Clear all
        </button>
      </div>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-r-lg border-l-4 border border-slate-700/50 ${SEVERITY_CLASSES[alert.severity]}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-xs font-semibold ${SEVERITY_TEXT[alert.severity]}`}>
                {alert.code.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {alert.message}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => acknowledgeAlert(alert.id)}
              className="flex-shrink-0 text-slate-500 hover:text-slate-300 text-xs transition-colors"
              title="Acknowledge"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
