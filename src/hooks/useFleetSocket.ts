"use client";

import { useEffect } from "react";
import { mockWsService } from "@/services/mockWsService";
import { useRobotStore } from "@/store/robotStore"; // getState() only — no subscription
import type { WsEvent } from "@/types/ws";

export function useFleetSocket(): void {
  useEffect(() => {
    function handleEvent(event: WsEvent): void {
      // Use getState() so actions are read at call-time, not subscribed as state
      const s = useRobotStore.getState();
      switch (event.type) {
        case "fleet:snapshot":
          s.setFleetSnapshot(
            event.payload.robots,
            event.payload.tasks,
            event.payload.alerts
          );
          break;
        case "robot:position":
          s.updateRobotPosition(
            event.robotId,
            event.payload.position,
            event.payload.lastUpdated
          );
          break;
        case "robot:status":
          s.updateRobotStatus(
            event.robotId,
            event.payload.status,
            event.payload.lastUpdated
          );
          break;
        case "robot:battery":
          s.updateRobotBattery(
            event.robotId,
            event.payload.battery,
            event.payload.lastUpdated
          );
          break;
        case "alert:new":
          s.addAlert(event.payload);
          break;
        case "task:update":
          s.upsertTask(event.payload);
          break;
      }
    }

    const unsubscribe = mockWsService.onEvent(handleEvent);
    mockWsService.connect();

    return () => {
      unsubscribe();
      mockWsService.disconnect();
    };
  }, []);
}
