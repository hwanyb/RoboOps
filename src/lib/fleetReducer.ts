import type { Robot } from "@/types/robot";
import type { Task } from "@/types/task";
import type { Alert } from "@/types/alert";
import type { WsEvent } from "@/types/ws";

export interface FleetState {
  robots: Record<string, Robot>;
  tasks: Record<string, Task>;
  alerts: Alert[];
}

export function fleetReducer(state: FleetState, event: WsEvent): FleetState {
  switch (event.type) {
    case "fleet:snapshot":
      return {
        robots: Object.fromEntries(event.payload.robots.map((r) => [r.id, r])),
        tasks: Object.fromEntries(event.payload.tasks.map((t) => [t.id, t])),
        alerts: event.payload.alerts,
      };

    case "robot:position": {
      const robot = state.robots[event.robotId];
      if (!robot) return state;
      return {
        ...state,
        robots: {
          ...state.robots,
          [event.robotId]: {
            ...robot,
            position: event.payload.position,
            lastUpdated: event.payload.lastUpdated,
          },
        },
      };
    }

    case "robot:status": {
      const robot = state.robots[event.robotId];
      if (!robot) return state;
      return {
        ...state,
        robots: {
          ...state.robots,
          [event.robotId]: {
            ...robot,
            status: event.payload.status,
            lastUpdated: event.payload.lastUpdated,
          },
        },
      };
    }

    case "robot:battery": {
      const robot = state.robots[event.robotId];
      if (!robot) return state;
      return {
        ...state,
        robots: {
          ...state.robots,
          [event.robotId]: {
            ...robot,
            battery: event.payload.battery,
            lastUpdated: event.payload.lastUpdated,
          },
        },
      };
    }

    case "alert:new":
      return {
        ...state,
        alerts: [event.payload, ...state.alerts].slice(0, 200),
      };

    case "task:update":
      return {
        ...state,
        tasks: { ...state.tasks, [event.payload.id]: event.payload },
      };

    default:
      return state;
  }
}
