"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";

function Orb() {
  const ref = useRef<Group | null>(null);

  useFrame((state) => {
    if (!ref.current) {
      return;
    }

    ref.current.rotation.y = state.clock.elapsedTime * 0.08;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.12;
  });

  const points = useMemo(() => {
    const positions = new Float32Array(1800);
    for (let i = 0; i < 600; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 7;
      positions[i3 + 1] = (Math.random() - 0.5) * 7;
      positions[i3 + 2] = (Math.random() - 0.5) * 7;
    }

    return positions;
  }, []);

  return (
    <group ref={ref}>
      <Float speed={1.2} rotationIntensity={0.24} floatIntensity={0.42}>
        <mesh>
          <icosahedronGeometry args={[1.25, 2]} />
          <meshStandardMaterial color="#6e8cff" metalness={0.78} roughness={0.34} emissive="#151b34" emissiveIntensity={0.42} wireframe />
        </mesh>
      </Float>
      <Points positions={points} stride={3} frustumCulled>
        <PointMaterial transparent color="#e8e4da" size={0.012} sizeAttenuation depthWrite={false} opacity={0.7} />
      </Points>
    </group>
  );
}

export default function AmbientIntelligenceScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[2] opacity-45">
      <Canvas camera={{ position: [0, 0, 5], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.32} />
        <pointLight position={[2, 2, 2]} intensity={0.82} color="#6e8cff" />
        <pointLight position={[-2, -2, -1]} intensity={0.42} color="#9b9ca3" />
        <Orb />
      </Canvas>
    </div>
  );
}
