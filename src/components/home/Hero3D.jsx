import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleNetwork() {
  const count = 150;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  const pointsRef = useRef();

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.2;
    }
  });

  return (
    <group ref={pointsRef}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#4F46E5"
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
      {/* Add subtle orbital lines connecting the abstract nodes */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Line
          key={i}
          points={[
            new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8),
            new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)
          ]}
          color="#0EA5E9"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4F46E5" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0EA5E9" />
        
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
          <ParticleNetwork />
        </Float>
      </Canvas>
    </div>
  );
}
