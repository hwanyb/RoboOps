export type RobotType = "AMR" | "AGV" | "ARM" | "DRONE";

export type RobotStatus =
  | "idle"
  | "moving"
  | "working"
  | "charging"
  | "error"
  | "offline";

export interface Position {
  x: number;
  y: number;
  heading: number; // degrees 0-359
}

export interface Robot {
  id: string;
  name: string;
  type: RobotType;
  status: RobotStatus;
  battery: number; // 0-100
  position: Position;
  taskId: string | null;
  lastUpdated: number; // unix ms
}
