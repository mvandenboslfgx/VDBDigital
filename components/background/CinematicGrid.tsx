"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GOLD = new THREE.Color("#C6A95D");
const GRID_SIZE = 20;
const GRID_DIVISIONS = 40;

function FloatingGrid() {
  const meshRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(timeRef.current * 0.3) * 0.05;
    }
  });

  const gridGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 30, GRID_DIVISIONS, GRID_DIVISIONS);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      pos.setZ(i, (Math.sin(x * 0.5) + Math.cos(y * 0.5)) * 0.15);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group ref={meshRef} position={[0, 0, -8]} rotation={[-Math.PI / 2.2, 0, 0]}>
      <mesh geometry={gridGeometry}>
        <meshBasicMaterial
          color={GOLD}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

function Particles() {
  const count = 80;
  const ref = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (ref.current) {
      ref.current.rotation.y = timeRef.current * 0.02;
    }
  });

  return (
    <points ref={ref} position={[0, 0, -5]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={GOLD}
        size={0.12}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.08) * 0.4;
    state.camera.position.y = Math.cos(t * 0.06) * 0.2;
    state.camera.lookAt(0, 0, -6);
    state.camera.updateProjectionMatrix();
  });
  return null;
}

export default function CinematicGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <CameraRig />
        <FloatingGrid />
        <Particles />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,169,93,0.06),transparent_60%)]" />
    </div>
  );
}
