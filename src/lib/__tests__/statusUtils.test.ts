import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getStatusColor,
  getBatteryColor,
  getSeverityColor,
  formatUptime,
  isRobotStale,
} from "../statusUtils";

describe("getStatusColor", () => {
  it.each([
    ["idle", "green"],
    ["moving", "blue"],
    ["working", "blue"],
    ["charging", "yellow"],
    ["error", "red"],
    ["offline", "gray"],
  ] as const)("returns %s for status %s", (status, expected) => {
    expect(getStatusColor(status)).toBe(expected);
  });
});

describe("getBatteryColor", () => {
  it("returns green when battery > 50", () => {
    expect(getBatteryColor(51)).toBe("green");
    expect(getBatteryColor(100)).toBe("green");
  });

  it("returns yellow when battery is 21-50", () => {
    expect(getBatteryColor(50)).toBe("yellow");
    expect(getBatteryColor(21)).toBe("yellow");
  });

  it("returns red when battery <= 20", () => {
    expect(getBatteryColor(20)).toBe("red");
    expect(getBatteryColor(0)).toBe("red");
  });
});

describe("getSeverityColor", () => {
  it.each([
    ["info", "blue"],
    ["warning", "yellow"],
    ["error", "red"],
    ["critical", "red"],
  ] as const)("returns correct color for severity %s", (severity, expected) => {
    expect(getSeverityColor(severity)).toBe(expected);
  });
});

describe("formatUptime", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows seconds when < 60s ago", () => {
    vi.setSystemTime(30_000);
    expect(formatUptime(0)).toBe("30s ago");
  });

  it("shows minutes when >= 60s ago", () => {
    vi.setSystemTime(120_000);
    expect(formatUptime(0)).toBe("2m ago");
  });

  it("shows hours when >= 60min ago", () => {
    vi.setSystemTime(7_200_000);
    expect(formatUptime(0)).toBe("2h ago");
  });
});

describe("isRobotStale", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns false when robot updated within threshold", () => {
    vi.setSystemTime(4000);
    expect(isRobotStale(0, 5000)).toBe(false);
  });

  it("returns true when robot has not updated past threshold", () => {
    vi.setSystemTime(6000);
    expect(isRobotStale(0, 5000)).toBe(true);
  });
});
