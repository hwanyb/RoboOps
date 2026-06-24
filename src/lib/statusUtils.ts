import type { RobotStatus } from "@/types/robot";
import type { AlertSeverity } from "@/types/alert";

export type StatusColor = "green" | "yellow" | "red" | "blue" | "gray";

export function getStatusColor(status: RobotStatus): StatusColor {
  switch (status) {
    case "idle":
      return "green";
    case "moving":
    case "working":
      return "blue";
    case "charging":
      return "yellow";
    case "error":
      return "red";
    case "offline":
      return "gray";
  }
}

export function getBatteryColor(battery: number): StatusColor {
  if (battery > 50) return "green";
  if (battery > 20) return "yellow";
  return "red";
}

export function getSeverityColor(severity: AlertSeverity): StatusColor {
  switch (severity) {
    case "info":
      return "blue";
    case "warning":
      return "yellow";
    case "error":
      return "red";
    case "critical":
      return "red";
  }
}

export function formatUptime(lastUpdatedMs: number): string {
  const seconds = Math.floor((Date.now() - lastUpdatedMs) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function isRobotStale(lastUpdatedMs: number, thresholdMs = 5000): boolean {
  return Date.now() - lastUpdatedMs > thresholdMs;
}
