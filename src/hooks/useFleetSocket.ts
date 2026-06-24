"use client";

import { useEffect } from "react";
import { mockWsService } from "@/services/mockWsService";
import { useRobotStore } from "@/store/robotStore";
import type { WsEvent } from "@/types/ws";

export function useFleetSocket(): void {
  const store = useRobotStore();

  useEffect(() => {
    function handleEvent(event: WsEvent): void {
      switch (event.type) {
        case "fleet:snapshot":
          store.setFleetSnapshot(
            event.payload.robots,
            event.payload.tasks,
            event.payload.alerts
          );
          break;
        case "robot:position":
          store.updateRobotPosition(
            event.robotId,
            event.payload.position,
            event.payload.lastUpdated
          );
          break;
        case "robot:status":
          store.updateRobotStatus(
            event.robotId,
            event.payload.status,
            event.payload.lastUpdated
          );
          break;
        case "robot:battery":
          store.updateRobotBattery(
            event.robotId,
            event.payload.battery,
            event.payload.lastUpdated
          );
          break;
        case "alert:new":
          store.addAlert(event.payload);
          break;
        case "task:update":
          store.upsertTask(event.payload);
          break;
      }
    }

    const unsubscribe = mockWsService.onEvent(handleEvent);
    mockWsService.connect();

    return () => {
      unsubscribe();
      mockWsService.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
