"use client";

import { useEffect, useRef, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Circle, Fill, Stroke, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";

import { useShallow } from "zustand/react/shallow";
import { useRobotStore, selectRobotList } from "@/store/robotStore";
import { getStatusColor } from "@/lib/statusUtils";
import type { Robot, RobotStatus } from "@/types/robot";

const STATUS_HEX: Record<ReturnType<typeof getStatusColor>, string> = {
  green: "#22c55e",
  blue: "#3b82f6",
  yellow: "#eab308",
  red: "#ef4444",
  gray: "#6b7280",
};

function robotStyle(robot: Robot, selected: boolean): Style {
  const color = STATUS_HEX[getStatusColor(robot.status as RobotStatus)];
  return new Style({
    image: new Circle({
      radius: selected ? 14 : 10,
      fill: new Fill({ color }),
      stroke: new Stroke({
        color: selected ? "#ffffff" : "#1e293b",
        width: selected ? 3 : 1.5,
      }),
    }),
    text: new Text({
      text: robot.name.slice(0, 6),
      offsetY: -22,
      font: "bold 11px sans-serif",
      fill: new Fill({ color: "#f8fafc" }),
      stroke: new Stroke({ color: "#0f172a", width: 3 }),
    }),
  });
}

// Factory coordinate (lon/lat center of a fictional factory area)
const FACTORY_CENTER = fromLonLat([127.0276, 37.4979]);

// Scale: map a 0–800 pixel canvas to ±0.005 degrees around center
function robotToLonLat(x: number, y: number): number[] {
  const lon = 127.0276 + (x - 400) * 0.0000125;
  const lat = 37.4979 - (y - 300) * 0.0000125;
  return fromLonLat([lon, lat]);
}

export default function FleetMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const olMapRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);

  const robots = useRobotStore(useShallow(selectRobotList));
  const selectedRobotId = useRobotStore((s) => s.selectedRobotId);
  const selectRobot = useRobotStore((s) => s.selectRobot);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return;

    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({ source: vectorSource });

    const tileLayer = new TileLayer({
      source: new XYZ({
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        attributions: "© OpenStreetMap contributors",
      }),
      opacity: 0.6,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer, vectorLayer],
      view: new View({
        center: FACTORY_CENTER,
        zoom: 17,
        maxZoom: 20,
        minZoom: 14,
      }),
    });

    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        selectRobot(feature.getId() as string);
      } else {
        selectRobot(null);
      }
    });

    map.on("pointermove", (evt) => {
      const hit = map.hasFeatureAtPixel(evt.pixel);
      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    olMapRef.current = map;

    return () => {
      map.setTarget(undefined);
      olMapRef.current = null;
    };
  }, [selectRobot]);

  // Sync robot features whenever robots or selection changes
  const syncFeatures = useCallback(() => {
    const source = vectorSourceRef.current;
    if (!source) return;

    source.clear();
    robots.forEach((robot) => {
      const coord = robotToLonLat(robot.position.x, robot.position.y);
      const feature = new Feature({ geometry: new Point(coord) });
      feature.setId(robot.id);
      feature.setStyle(robotStyle(robot, robot.id === selectedRobotId));
      source.addFeature(feature);
    });
  }, [robots, selectedRobotId]);

  useEffect(() => {
    syncFeatures();
  }, [syncFeatures]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      <MapLegend />
    </div>
  );
}

function MapLegend() {
  const items: Array<{ label: string; color: string }> = [
    { label: "Idle", color: "#22c55e" },
    { label: "Moving / Working", color: "#3b82f6" },
    { label: "Charging", color: "#eab308" },
    { label: "Error", color: "#ef4444" },
    { label: "Offline", color: "#6b7280" },
  ];
  return (
    <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur rounded-lg p-3 text-xs text-slate-200 space-y-1.5">
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full border border-slate-600"
            style={{ background: color }}
          />
          {label}
        </div>
      ))}
    </div>
  );
}
