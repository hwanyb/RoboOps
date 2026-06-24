import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  evaluateBatteryAlert,
  evaluateOfflineAlert,
  evaluateErrorStatusAlert,
  BATTERY_LOW_THRESHOLD,
  BATTERY_CRITICAL_THRESHOLD,
} from "../alertRules";
import type { Robot } from "@/types/robot";

const baseRobot: Robot = {
  id: "r1",
  name: "TestBot",
  type: "AMR",
  status: "idle",
  battery: 80,
  position: { x: 0, y: 0, heading: 0 },
  taskId: null,
  lastUpdated: Date.now(),
};

describe("evaluateBatteryAlert", () => {
  it("returns null when battery is above low threshold", () => {
    const result = evaluateBatteryAlert({ ...baseRobot, battery: 50 });
    expect(result).toBeNull();
  });

  it("returns BATTERY_LOW warning at exactly low threshold", () => {
    const result = evaluateBatteryAlert({
      ...baseRobot,
      battery: BATTERY_LOW_THRESHOLD,
    });
    expect(result?.code).toBe("BATTERY_LOW");
    expect(result?.severity).toBe("warning");
  });

  it("returns BATTERY_LOW warning below low threshold", () => {
    const result = evaluateBatteryAlert({ ...baseRobot, battery: 20 });
    expect(result?.code).toBe("BATTERY_LOW");
  });

  it("returns BATTERY_CRITICAL at exactly critical threshold", () => {
    const result = evaluateBatteryAlert({
      ...baseRobot,
      battery: BATTERY_CRITICAL_THRESHOLD,
    });
    expect(result?.code).toBe("BATTERY_CRITICAL");
    expect(result?.severity).toBe("critical");
  });

  it("returns BATTERY_CRITICAL below critical threshold", () => {
    const result = evaluateBatteryAlert({ ...baseRobot, battery: 5 });
    expect(result?.code).toBe("BATTERY_CRITICAL");
  });

  it("includes robot name in the alert message", () => {
    const result = evaluateBatteryAlert({ ...baseRobot, battery: 5 });
    expect(result?.message).toContain("TestBot");
  });
});

describe("evaluateOfflineAlert", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when robot was updated recently", () => {
    vi.setSystemTime(1000);
    const robot: Robot = { ...baseRobot, lastUpdated: 500 };
    const result = evaluateOfflineAlert(robot, 10_000);
    expect(result).toBeNull();
  });

  it("returns ROBOT_OFFLINE when staleness exceeds threshold", () => {
    vi.setSystemTime(20_000);
    const robot: Robot = { ...baseRobot, lastUpdated: 5_000 };
    const result = evaluateOfflineAlert(robot, 10_000);
    expect(result?.code).toBe("ROBOT_OFFLINE");
    expect(result?.severity).toBe("error");
  });

  it("returns null when robot status is already offline", () => {
    vi.setSystemTime(20_000);
    const robot: Robot = { ...baseRobot, status: "offline", lastUpdated: 0 };
    const result = evaluateOfflineAlert(robot, 10_000);
    expect(result).toBeNull();
  });
});

describe("evaluateErrorStatusAlert", () => {
  it("returns null for non-error statuses", () => {
    expect(evaluateErrorStatusAlert({ ...baseRobot, status: "idle" })).toBeNull();
    expect(evaluateErrorStatusAlert({ ...baseRobot, status: "moving" })).toBeNull();
  });

  it("returns SENSOR_ERROR alert when status is error", () => {
    const result = evaluateErrorStatusAlert({ ...baseRobot, status: "error" });
    expect(result?.code).toBe("SENSOR_ERROR");
    expect(result?.severity).toBe("error");
    expect(result?.robotId).toBe("r1");
  });
});
