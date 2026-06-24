import type { Robot } from "./robot";
import type { Alert } from "./alert";
import type { Task } from "./task";

export type WsEventType =
  | "robot:position"
  | "robot:status"
  | "robot:battery"
  | "alert:new"
  | "task:update"
  | "fleet:snapshot";

export interface WsRobotPositionEvent {
  type: "robot:position";
  robotId: string;
  payload: Pick<Robot, "position" | "lastUpdated">;
}

export interface WsRobotStatusEvent {
  type: "robot:status";
  robotId: string;
  payload: Pick<Robot, "status" | "lastUpdated">;
}

export interface WsRobotBatteryEvent {
  type: "robot:battery";
  robotId: string;
  payload: Pick<Robot, "battery" | "lastUpdated">;
}

export interface WsAlertEvent {
  type: "alert:new";
  payload: Alert;
}

export interface WsTaskUpdateEvent {
  type: "task:update";
  payload: Task;
}

export interface WsFleetSnapshotEvent {
  type: "fleet:snapshot";
  payload: {
    robots: Robot[];
    tasks: Task[];
    alerts: Alert[];
  };
}

export type WsEvent =
  | WsRobotPositionEvent
  | WsRobotStatusEvent
  | WsRobotBatteryEvent
  | WsAlertEvent
  | WsTaskUpdateEvent
  | WsFleetSnapshotEvent;
