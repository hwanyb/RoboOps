export type AlertSeverity = "info" | "warning" | "error" | "critical";

export type AlertCode =
  | "BATTERY_LOW"
  | "BATTERY_CRITICAL"
  | "ROBOT_OFFLINE"
  | "TASK_FAILED"
  | "OBSTACLE_DETECTED"
  | "SENSOR_ERROR"
  | "ESTOP_TRIGGERED";

export interface Alert {
  id: string;
  robotId: string;
  code: AlertCode;
  severity: AlertSeverity;
  message: string;
  timestamp: number; // unix ms
  acknowledged: boolean;
}
