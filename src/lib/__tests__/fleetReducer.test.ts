import { describe, it, expect } from "vitest";
import { fleetReducer, type FleetState } from "../fleetReducer";
import type { Robot } from "@/types/robot";
import type { Task } from "@/types/task";
import type { Alert } from "@/types/alert";

const baseRobot: Robot = {
  id: "r1",
  name: "TestBot",
  type: "AMR",
  status: "idle",
  battery: 80,
  position: { x: 100, y: 200, heading: 0 },
  taskId: null,
  lastUpdated: 1000,
};

const emptyState: FleetState = { robots: {}, tasks: {}, alerts: [] };

describe("fleetReducer", () => {
  describe("fleet:snapshot", () => {
    it("replaces all robots, tasks, and alerts from snapshot", () => {
      const task: Task = {
        id: "t1",
        type: "transport",
        status: "in_progress",
        robotId: "r1",
        progress: 50,
        startedAt: 0,
        completedAt: null,
        description: "test",
        priority: 1,
      };
      const alert: Alert = {
        id: "a1",
        robotId: "r1",
        code: "BATTERY_LOW",
        severity: "warning",
        message: "low battery",
        timestamp: 0,
        acknowledged: false,
      };
      const next = fleetReducer(emptyState, {
        type: "fleet:snapshot",
        payload: { robots: [baseRobot], tasks: [task], alerts: [alert] },
      });
      expect(next.robots["r1"]).toEqual(baseRobot);
      expect(next.tasks["t1"]).toEqual(task);
      expect(next.alerts).toHaveLength(1);
    });
  });

  describe("robot:position", () => {
    it("updates position and lastUpdated for a known robot", () => {
      const state: FleetState = { ...emptyState, robots: { r1: baseRobot } };
      const newPos = { x: 300, y: 400, heading: 90 };
      const next = fleetReducer(state, {
        type: "robot:position",
        robotId: "r1",
        payload: { position: newPos, lastUpdated: 9999 },
      });
      expect(next.robots["r1"].position).toEqual(newPos);
      expect(next.robots["r1"].lastUpdated).toBe(9999);
    });

    it("returns unchanged state for unknown robot id", () => {
      const next = fleetReducer(emptyState, {
        type: "robot:position",
        robotId: "unknown",
        payload: { position: { x: 0, y: 0, heading: 0 }, lastUpdated: 0 },
      });
      expect(next).toBe(emptyState);
    });
  });

  describe("robot:status", () => {
    it("updates status", () => {
      const state: FleetState = { ...emptyState, robots: { r1: baseRobot } };
      const next = fleetReducer(state, {
        type: "robot:status",
        robotId: "r1",
        payload: { status: "moving", lastUpdated: 2000 },
      });
      expect(next.robots["r1"].status).toBe("moving");
    });
  });

  describe("robot:battery", () => {
    it("updates battery level", () => {
      const state: FleetState = { ...emptyState, robots: { r1: baseRobot } };
      const next = fleetReducer(state, {
        type: "robot:battery",
        robotId: "r1",
        payload: { battery: 42, lastUpdated: 3000 },
      });
      expect(next.robots["r1"].battery).toBe(42);
    });
  });

  describe("alert:new", () => {
    it("prepends alert and caps at 200", () => {
      const existingAlerts: Alert[] = Array.from({ length: 200 }, (_, i) => ({
        id: `a${i}`,
        robotId: "r1",
        code: "BATTERY_LOW" as const,
        severity: "warning" as const,
        message: `alert ${i}`,
        timestamp: i,
        acknowledged: false,
      }));
      const state: FleetState = { ...emptyState, alerts: existingAlerts };
      const newAlert: Alert = {
        id: "new",
        robotId: "r1",
        code: "BATTERY_CRITICAL",
        severity: "critical",
        message: "critical!",
        timestamp: 9999,
        acknowledged: false,
      };
      const next = fleetReducer(state, { type: "alert:new", payload: newAlert });
      expect(next.alerts).toHaveLength(200);
      expect(next.alerts[0].id).toBe("new");
    });
  });

  describe("task:update", () => {
    it("upserts a task into tasks map", () => {
      const task: Task = {
        id: "t1",
        type: "transport",
        status: "completed",
        robotId: "r1",
        progress: 100,
        startedAt: 0,
        completedAt: 5000,
        description: "done",
        priority: 2,
      };
      const next = fleetReducer(emptyState, { type: "task:update", payload: task });
      expect(next.tasks["t1"]).toEqual(task);
    });
  });
});
