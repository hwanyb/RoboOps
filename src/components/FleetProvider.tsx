"use client";

import { useFleetSocket } from "@/hooks/useFleetSocket";

export default function FleetProvider({ children }: { children: React.ReactNode }) {
  useFleetSocket();
  return <>{children}</>;
}
