"use client";

import { create } from "zustand";
import type { Robot, RobotStatus } from "@/types/robot";
import type { Task } from "@/types/task";
import type { Alert } from "@/types/alert";
import type { Position } from "@/types/robot";

interface RobotStore {
  robots: Record<string, Robot>;
  tasks: Record<string, Task>;
  alerts: Alert[];
  selectedRobotId: string | null;

  // fleet snapshot (initial load)
  setFleetSnapshot: (robots: Robot[], tasks: Task[], alerts: Alert[]) => void;

  // per-field robot updates
  updateRobotPosition: (robotId: string, position: Position, ts: number) => void;
  updateRobotStatus: (robotId: string, status: RobotStatus, ts: number) => void;
  updateRobotBattery: (robotId: string, battery: number, ts: number) => void;

  // task
  upsertTask: (task: Task) => void;

  // alerts
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAcknowledgedAlerts: () => void;

  // selection
  selectRobot: (robotId: string | null) => void;
}

export const useRobotStore = create<RobotStore>((set) => ({
  robots: {},
  tasks: {},
  alerts: [],
  selectedRobotId: null,

  setFleetSnapshot: (robots, tasks, alerts) =>
    set({
      robots: Object.fromEntries(robots.map((r) => [r.id, r])),
      tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
      alerts,
    }),

  updateRobotPosition: (robotId, position, ts) =>
    set((state) => {
      const robot = state.robots[robotId];
      if (!robot) return state;
      return {
        robots: {
          ...state.robots,
          [robotId]: { ...robot, position, lastUpdated: ts },
        },
      };
    }),

  updateRobotStatus: (robotId, status, ts) =>
    set((state) => {
      const robot = state.robots[robotId];
      if (!robot) return state;
      return {
        robots: {
          ...state.robots,
          [robotId]: { ...robot, status, lastUpdated: ts },
        },
      };
    }),

  updateRobotBattery: (robotId, battery, ts) =>
    set((state) => {
      const robot = state.robots[robotId];
      if (!robot) return state;
      return {
        robots: {
          ...state.robots,
          [robotId]: { ...robot, battery, lastUpdated: ts },
        },
      };
    }),

  upsertTask: (task) =>
    set((state) => ({
      tasks: { ...state.tasks, [task.id]: task },
    })),

  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 200) })),

  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
    })),

  clearAcknowledgedAlerts: () =>
    set((state) => ({
      alerts: state.alerts.filter((a) => !a.acknowledged),
    })),

  selectRobot: (robotId) => set({ selectedRobotId: robotId }),
}));

// Derived selectors (stable references, call inside component)
export const selectRobotList = (state: RobotStore) =>
  Object.values(state.robots);

export const selectSelectedRobot = (state: RobotStore) =>
  state.selectedRobotId ? state.robots[state.selectedRobotId] ?? null : null;

export const selectUnacknowledgedAlerts = (state: RobotStore) =>
  state.alerts.filter((a) => !a.acknowledged);

export const selectRobotTask = (robotId: string) => (state: RobotStore) => {
  const robot = state.robots[robotId];
  if (!robot?.taskId) return null;
  return state.tasks[robot.taskId] ?? null;
};
