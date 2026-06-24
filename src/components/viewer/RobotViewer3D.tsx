"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Robot, RobotType } from "@/types/robot";
import { getStatusColor } from "@/lib/statusUtils";

const STATUS_HEX: Record<ReturnType<typeof getStatusColor>, number> = {
  green: 0x22c55e,
  blue: 0x3b82f6,
  yellow: 0xeab308,
  red: 0xef4444,
  gray: 0x6b7280,
};

function buildRobotMesh(type: RobotType, statusColor: number): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: statusColor, roughness: 0.4, metalness: 0.6 });

  switch (type) {
    case "AMR": {
      // Box body + rounded wheel cylinders
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.8), mat);
      body.position.y = 0.4;
      const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const offsets = [[-0.5, 0, 0.45], [0.5, 0, 0.45], [-0.5, 0, -0.45], [0.5, 0, -0.45]];
      offsets.forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y + 0.18, z);
        group.add(wheel);
      });
      group.add(body);
      break;
    }
    case "AGV": {
      // Flat platform
      const platform = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 1.0), mat);
      platform.position.y = 0.3;
      const mast = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), mat);
      mast.position.set(-0.7, 0.9, 0);
      group.add(platform, mast);
      break;
    }
    case "ARM": {
      // Base + arm segments
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.3, 24), mat);
      base.position.y = 0.15;
      const seg1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.18), mat);
      seg1.position.set(0, 0.75, 0);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), mat);
      joint.position.set(0, 1.2, 0);
      const seg2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.14), mat);
      seg2.position.set(0.25, 1.45, 0);
      seg2.rotation.z = -Math.PI / 4;
      group.add(base, seg1, joint, seg2);
      break;
    }
    case "DRONE": {
      // Central body + 4 arms + rotors
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.4), mat);
      body.position.y = 1.0;
      const armGeo = new THREE.BoxGeometry(0.8, 0.06, 0.06);
      const rotorGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16);
      const armOffsets = [[0.4, 0.4], [-0.4, 0.4], [0.4, -0.4], [-0.4, -0.4]];
      armOffsets.forEach(([x, z]) => {
        const arm = new THREE.Mesh(armGeo, mat);
        arm.position.set(x / 2, 1.0, z / 2);
        arm.rotation.y = Math.atan2(x, z);
        const rotor = new THREE.Mesh(rotorGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        rotor.position.set(x, 1.04, z);
        group.add(arm, rotor);
      });
      group.add(body);
      break;
    }
  }
  return group;
}

function buildSensorCone(): THREE.Mesh {
  const geo = new THREE.ConeGeometry(1.2, 2.0, 32, 1, true);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const cone = new THREE.Mesh(geo, mat);
  cone.rotation.x = Math.PI;
  cone.position.y = 0.5;
  return cone;
}

interface Props {
  robot: Robot;
}

export default function RobotViewer3D({ robot }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    animId: number;
    robotGroup: THREE.Group;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 240;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 8, 20);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 8, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Floor grid
    const grid = new THREE.GridHelper(6, 12, 0x1e3a5f, 0x1e293b);
    scene.add(grid);

    // Robot mesh
    const statusColor = STATUS_HEX[getStatusColor(robot.status)];
    const robotGroup = buildRobotMesh(robot.type, statusColor);
    robotGroup.add(buildSensorCone());
    scene.add(robotGroup);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3, 3, 4);
    camera.lookAt(0, 0.8, 0);

    // Orbit-like auto-rotation
    let angle = 0;
    function animate() {
      const id = requestAnimationFrame(animate);
      angle += 0.008;
      robotGroup.rotation.y = angle;
      renderer.render(scene, camera);
      sceneRef.current!.animId = id;
    }
    const firstId = requestAnimationFrame(animate);

    sceneRef.current = { renderer, scene, camera, animId: firstId, robotGroup };

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(sceneRef.current?.animId ?? firstId);
      ro.disconnect();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robot.id, robot.type]);

  // Update color when status changes without re-initializing the scene
  useEffect(() => {
    const ref = sceneRef.current;
    if (!ref) return;
    const statusColor = STATUS_HEX[getStatusColor(robot.status)];
    ref.robotGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.color.getHex() !== 0x1e293b && mat.color.getHex() !== 0x94a3b8) {
          mat.color.setHex(statusColor);
        }
      }
    });
  }, [robot.status]);

  return <div ref={mountRef} className="w-full h-full" />;
}
