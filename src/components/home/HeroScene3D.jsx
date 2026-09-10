import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Edges } from '@react-three/drei';
import * as THREE from 'three';

// 3D Bulb / Spark Object
function SparkBulb() {
  const groupRef = useRef(null);
  const sparkRef = useRef(null);

  // Subtle pointer interaction using spring-like interpolation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate the group slowly over time
      groupRef.current.rotation.y += delta * 0.1;
      
      // Parallax effect based on pointer
      const targetX = (state.pointer.x * Math.PI) / 8;
      const targetY = (state.pointer.y * Math.PI) / 8;
      
      // Interpolate rotation for smooth spring-like feel
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.05);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -targetX, 0.05);
    }

    if (sparkRef.current) {
      // Pulse the inner spark scale slightly
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      sparkRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* INNER AMBER ENERGY */}
        <Sphere ref={sparkRef} args={[1.2, 32, 32]}>
          <MeshDistortMaterial 
            color="#F2A70B" 
            emissive="#FBE4AE"
            emissiveIntensity={0.5}
            distort={0.4} 
            speed={3} 
            transparent 
            opacity={0.8}
            wireframe={false}
          />
        </Sphere>

        {/* OUTER TRANSLUCENT FACETED SHELL */}
        <Sphere args={[1.6, 16, 16]}>
          <meshPhysicalMaterial 
            color="#ffffff"
            transmission={0.9}
            opacity={1}
            metalness={0.1}
            roughness={0.2}
            ior={1.5}
            thickness={0.5}
            transparent
          />
          {/* COBALT NETWORK WIREFRAME */}
          <Edges 
            scale={1.0} 
            color="#2E4BB0" 
            threshold={15} 
            transparent 
            opacity={0.15} 
          />
        </Sphere>
        
        {/* GRAPHITE BASE */}
        <mesh position={[0, -1.8, 0]}>
          <cylinderGeometry args={[0.6, 0.4, 0.4, 16]} />
          <meshStandardMaterial color="#191A1F" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* SMALL ORBITING PARTICLES */}
        <group>
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[
              Math.sin((i / 6) * Math.PI * 2) * 2.5, 
              Math.cos((i * 2)) * 0.5, 
              Math.cos((i / 6) * Math.PI * 2) * 2.5
            ]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#2E4BB0" />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
}

export default function HeroScene3D() {
  return (
    <div className="w-full h-full absolute inset-0 z-10 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]} // Limit DPR for performance
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#FBE4AE" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#2E4BB0" />
        
        <SparkBulb />
      </Canvas>
    </div>
  );
}
