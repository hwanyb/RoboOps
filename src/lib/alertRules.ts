import type { Robot } from "@/types/robot";
import type { Alert, AlertCode, AlertSeverity } from "@/types/alert";

export const BATTERY_LOW_THRESHOLD = 25;
export const BATTERY_CRITICAL_THRESHOLD = 10;

function makeAlert(
  robotId: string,
  code: AlertCode,
  severity: AlertSeverity,
  message: string
): Alert {
  return {
    id: `${robotId}-${code}-${Date.now()}`,
    robotId,
    code,
    severity,
    message,
    timestamp: Date.now(),
    acknowledged: false,
  };
}

export function evaluateBatteryAlert(robot: Robot): Alert | null {
  if (robot.battery <= BATTERY_CRITICAL_THRESHOLD) {
    return makeAlert(
      robot.id,
      "BATTERY_CRITICAL",
      "critical",
      `${robot.name} battery critically low (${robot.battery}%)`
    );
  }
  if (robot.battery <= BATTERY_LOW_THRESHOLD) {
    return makeAlert(
      robot.id,
      "BATTERY_LOW",
      "warning",
      `${robot.name} battery low (${robot.battery}%)`
    );
  }
  return null;
}

export function evaluateOfflineAlert(
  robot: Robot,
  staleThresholdMs = 10_000
): Alert | null {
  const staleDuration = Date.now() - robot.lastUpdated;
  if (staleDuration >= staleThresholdMs && robot.status !== "offline") {
    return makeAlert(
      robot.id,
      "ROBOT_OFFLINE",
      "error",
      `${robot.name} has not reported for ${Math.round(staleDuration / 1000)}s`
    );
  }
  return null;
}

export function evaluateErrorStatusAlert(robot: Robot): Alert | null {
  if (robot.status === "error") {
    return makeAlert(
      robot.id,
      "SENSOR_ERROR",
      "error",
      `${robot.name} reported error status`
    );
  }
  return null;
}
