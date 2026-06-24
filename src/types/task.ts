export type TaskStatus = "queued" | "in_progress" | "completed" | "failed";

export type TaskType =
  | "transport"
  | "inspection"
  | "pick_place"
  | "charging"
  | "patrol";

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  robotId: string;
  progress: number; // 0-100
  startedAt: number | null; // unix ms
  completedAt: number | null;
  description: string;
  priority: 1 | 2 | 3; // 1 = high
}
