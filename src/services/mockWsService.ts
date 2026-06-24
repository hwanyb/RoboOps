"use client";

import type { WsEvent, WsFleetSnapshotEvent } from "@/types/ws";
import { MOCK_ROBOTS, MOCK_TASKS, MOCK_ALERTS } from "@/lib/mockData";
import type { Robot } from "@/types/robot";

type EventHandler = (event: WsEvent) => void;

const TICK_INTERVAL_MS = 1500;

export class MockWsService {
  private handlers: EventHandler[] = [];
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private robots: Robot[];

  constructor() {
    this.robots = structuredClone(MOCK_ROBOTS);
  }

  connect(): void {
    const snapshot: WsFleetSnapshotEvent = {
      type: "fleet:snapshot",
      payload: {
        robots: structuredClone(this.robots),
        tasks: structuredClone(MOCK_TASKS),
        alerts: structuredClone(MOCK_ALERTS),
      },
    };
    // Emit snapshot on next tick so callers can register handlers first
    setTimeout(() => this.emit(snapshot), 0);

    this.tickTimer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  disconnect(): void {
    if (this.tickTimer !== null) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    this.handlers = [];
  }

  onEvent(handler: EventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  private emit(event: WsEvent): void {
    this.handlers.forEach((h) => h(event));
  }

  private tick(): void {
    const now = Date.now();

    this.robots = this.robots.map((robot) => {
      if (robot.status === "charging" || robot.status === "offline") {
        return robot;
      }

      // Random position drift for moving/working robots
      const dx = (Math.random() - 0.5) * 8;
      const dy = (Math.random() - 0.5) * 8;
      const dHeading = (Math.random() - 0.5) * 20;
      const updated: Robot = {
        ...robot,
        position: {
          x: clamp(robot.position.x + dx, 0, 800),
          y: clamp(robot.position.y + dy, 0, 600),
          heading: ((robot.position.heading + dHeading + 360) % 360),
        },
        // Battery drains slightly
        battery: Math.max(0, robot.battery - Math.random() * 0.3),
        lastUpdated: now,
      };

      this.emit({
        type: "robot:position",
        robotId: updated.id,
        payload: { position: updated.position, lastUpdated: now },
      });

      this.emit({
        type: "robot:battery",
        robotId: updated.id,
        payload: { battery: updated.battery, lastUpdated: now },
      });

      return updated;
    });

    // Occasionally emit a task progress update
    if (Math.random() < 0.3) {
      const activeTasks = MOCK_TASKS.filter((t) => t.status === "in_progress");
      if (activeTasks.length > 0) {
        const task = activeTasks[Math.floor(Math.random() * activeTasks.length)];
        const newProgress = Math.min(100, task.progress + Math.random() * 5);
        this.emit({
          type: "task:update",
          payload: { ...task, progress: Math.round(newProgress) },
        });
      }
    }
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Singleton for the app
export const mockWsService = new MockWsService();
