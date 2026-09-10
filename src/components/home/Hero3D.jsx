import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Torus, Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// ─── 1. Core Innovation Object (z = 0) ─────────────────────────────────────────
function InnovationCore() {
  const coreRef = useRef();
  const shellRef = useRef();
  const groupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.1;
      coreRef.current.rotation.x = time * 0.05;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y = -time * 0.15;
      shellRef.current.rotation.z = time * 0.08;
    }
    
    // Parallax (very small)
    if (groupRef.current) {
      const targetX = state.pointer.x * 0.15;
      const targetY = state.pointer.y * 0.15;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner Emissive Core */}
      <Icosahedron ref={coreRef} args={[1, 1]}>
        <meshStandardMaterial color="#0f172a" emissive="#2563eb" emissiveIntensity={0.6} roughness={0.2} metalness={0.9} />
      </Icosahedron>
      
      {/* Outer Wireframe Shell */}
      <Icosahedron ref={shellRef} args={[1.4, 2]}>
        <meshBasicMaterial color="#60a5fa" wireframe transparent opacity={0.2} />
      </Icosahedron>
    </group>
  );
}

// ─── 2. Orbital Rings (z = -1) ───────────────────────────────────────────────
function Orbits() {
  const orbitsRef = useRef();
  const orbit1 = useRef();
  const orbit2 = useRef();
  const orbit3 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (orbit1.current) orbit1.current.rotation.x = time * 0.1;
    if (orbit2.current) orbit2.current.rotation.y = time * 0.15;
    if (orbit3.current) orbit3.current.rotation.z = time * 0.05;

    // Parallax (medium)
    if (orbitsRef.current) {
      const targetX = state.pointer.x * 0.3;
      const targetY = state.pointer.y * 0.3;
      orbitsRef.current.position.x = THREE.MathUtils.lerp(orbitsRef.current.position.x, targetX, 0.05);
      orbitsRef.current.position.y = THREE.MathUtils.lerp(orbitsRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={orbitsRef} position={[0, 0, -1]}>
      <Torus ref={orbit1} args={[2.5, 0.005, 16, 100]} rotation={[Math.PI/3, 0, 0]}>
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.3} />
      </Torus>
      <Torus ref={orbit2} args={[3.2, 0.005, 16, 100]} rotation={[0, Math.PI/4, 0]}>
        <meshBasicMaterial color="#64748b" transparent opacity={0.2} />
      </Torus>
      <Torus ref={orbit3} args={[4, 0.002, 16, 100]} rotation={[Math.PI/6, Math.PI/6, 0]}>
        <meshBasicMaterial color="#cbd5e1" transparent opacity={0.4} />
      </Torus>
    </group>
  );
}

// ─── 3. Floating Nodes (z = 0.5) ─────────────────────────────────────────────
function Nodes() {
  const nodesRef = useRef();
  
  const nodePositions = useMemo(() => [
    [1.8, 1.2, 0.5],
    [-2, 0.5, 0.8],
    [0.5, -2, 1],
    [-1.5, -1.5, 0.2]
  ], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (nodesRef.current) {
      // Subtle float
      nodesRef.current.position.y = Math.sin(time * 0.5) * 0.1;
      
      // Parallax (strong foreground)
      const targetX = state.pointer.x * 0.6;
      const targetY = state.pointer.y * 0.6;
      nodesRef.current.position.x = THREE.MathUtils.lerp(nodesRef.current.position.x, targetX, 0.05);
      nodesRef.current.position.y = THREE.MathUtils.lerp(nodesRef.current.position.y, targetY, 0.05);
    }
  });

  return (
    <group ref={nodesRef}>
      {nodePositions.map((pos, idx) => (
        <Sphere key={idx} args={[0.04, 16, 16]} position={pos}>
          <meshBasicMaterial color="#3b82f6" />
        </Sphere>
      ))}
    </group>
  );
}

// ─── 4. Particle Field (z = -2) ──────────────────────────────────────────────
function Particles({ count = 800 }) {
  const pointsRef = useRef();
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 2; // offset z backwards
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.02;
    pointsRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;

    // Parallax (very slow background)
    const targetX = state.pointer.x * 0.1;
    const targetY = state.pointer.y * 0.1;
    pointsRef.current.position.x = THREE.MathUtils.lerp(pointsRef.current.position.x, targetX, 0.02);
    pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, targetY, 0.02);
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#94a3b8" size={0.03} sizeAttenuation={true} depthWrite={false} opacity={0.6} />
    </Points>
  );
}

// ─── Master 3D Scene ─────────────────────────────────────────────────────────
export default function Hero3D() {
  // We constrain the view slightly to the right for desktop, centered for mobile
  // But the canvas covers the full screen so particles can float everywhere.
  return (
    <div className="w-full h-full absolute inset-0 pointer-events-auto">
      <Canvas 
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#818cf8" />
        
        {/* We wrap the main object group and offset it to the right on desktop via responsive logic */}
        <group position={[window.innerWidth > 1024 ? 3 : 0, 0, 0]}>
          <InnovationCore />
          <Orbits />
          <Nodes />
        </group>
        
        {/* Particles exist globally */}
        <Particles />
      </Canvas>
    </div>
  );
}
