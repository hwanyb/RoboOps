import type { Robot } from "@/types/robot";
import type { Task } from "@/types/task";
import type { Alert } from "@/types/alert";

export const MOCK_ROBOTS: Robot[] = [
  {
    id: "robot-001",
    name: "AMR-Alpha",
    type: "AMR",
    status: "moving",
    battery: 82,
    position: { x: 120, y: 200, heading: 45 },
    taskId: "task-001",
    lastUpdated: Date.now(),
  },
  {
    id: "robot-002",
    name: "AGV-Bravo",
    type: "AGV",
    status: "working",
    battery: 64,
    position: { x: 350, y: 180, heading: 0 },
    taskId: "task-002",
    lastUpdated: Date.now(),
  },
  {
    id: "robot-003",
    name: "ARM-Charlie",
    type: "ARM",
    status: "idle",
    battery: 95,
    position: { x: 500, y: 300, heading: 270 },
    taskId: null,
    lastUpdated: Date.now(),
  },
  {
    id: "robot-004",
    name: "DRONE-Delta",
    type: "DRONE",
    status: "charging",
    battery: 23,
    position: { x: 680, y: 400, heading: 180 },
    taskId: null,
    lastUpdated: Date.now(),
  },
  {
    id: "robot-005",
    name: "AMR-Echo",
    type: "AMR",
    status: "error",
    battery: 51,
    position: { x: 240, y: 380, heading: 90 },
    taskId: "task-003",
    lastUpdated: Date.now(),
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "task-001",
    type: "transport",
    status: "in_progress",
    robotId: "robot-001",
    progress: 42,
    startedAt: Date.now() - 120_000,
    completedAt: null,
    description: "Transport pallet A to zone C",
    priority: 1,
  },
  {
    id: "task-002",
    type: "pick_place",
    status: "in_progress",
    robotId: "robot-002",
    progress: 75,
    startedAt: Date.now() - 300_000,
    completedAt: null,
    description: "Pick items from shelf 12",
    priority: 2,
  },
  {
    id: "task-003",
    type: "inspection",
    status: "failed",
    robotId: "robot-005",
    progress: 30,
    startedAt: Date.now() - 600_000,
    completedAt: null,
    description: "Inspect conveyor belt section B",
    priority: 1,
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: "alert-001",
    robotId: "robot-005",
    code: "OBSTACLE_DETECTED",
    severity: "error",
    message: "AMR-Echo encountered an obstacle at position (240, 380)",
    timestamp: Date.now() - 30_000,
    acknowledged: false,
  },
  {
    id: "alert-002",
    robotId: "robot-004",
    code: "BATTERY_LOW",
    severity: "warning",
    message: "DRONE-Delta battery at 23% - returning to charge",
    timestamp: Date.now() - 90_000,
    acknowledged: false,
  },
];
