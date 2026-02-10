import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function BrakeDiscMesh({ mousePosition }) {
  const groupRef = useRef();
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    targetRotation.current.x = mousePosition.current.y * 0.3;
    targetRotation.current.y = mousePosition.current.x * 0.3;

    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 2 * delta;
    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 2 * delta;
    groupRef.current.rotation.z += delta * 0.5;
  });

  const ventSlots = useMemo(() => {
    const slots = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.15;
      slots.push({
        position: [Math.cos(angle) * r, Math.sin(angle) * r, 0],
        rotation: [0, 0, angle],
      });
    }
    return slots;
  }, []);

  const boltHoles = useMemo(() => {
    const holes = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 0.5;
      holes.push([Math.cos(angle) * r, Math.sin(angle) * r, 0]);
    }
    return holes;
  }, []);

  return (
    <group ref={groupRef}>
      <mesh>
        <torusGeometry args={[1.2, 0.35, 12, 48]} />
        <meshPhongMaterial color="#8a8a8a" shininess={100} specular="#ffffff" />
      </mesh>

      <mesh>
        <cylinderGeometry args={[0.75, 0.75, 0.15, 24]} />
        <meshPhongMaterial color="#555555" shininess={80} />
      </mesh>

      <mesh>
        <cylinderGeometry args={[0.35, 0.35, 0.2, 24]} />
        <meshPhongMaterial color="#444444" shininess={90} />
      </mesh>

      {boltHoles.map((pos, i) => (
        <mesh key={`bolt-${i}`} position={pos}>
          <cylinderGeometry args={[0.06, 0.06, 0.25, 12]} />
          <meshPhongMaterial color="#333333" shininess={100} />
        </mesh>
      ))}

      {ventSlots.map((slot, i) => (
        <mesh key={`vent-${i}`} position={slot.position} rotation={slot.rotation}>
          <boxGeometry args={[0.03, 0.12, 0.18]} />
          <meshPhongMaterial color="#222222" />
        </mesh>
      ))}

      <mesh position={[1.55, 0, 0.1]}>
        <boxGeometry args={[0.4, 0.6, 0.25]} />
        <meshPhongMaterial color="#e55500" shininess={60} specular="#ffaa66" />
      </mesh>
    </group>
  );
}

function FallbackDisc() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-40 h-40 md:w-56 md:h-56">
        <div className="absolute inset-0 rounded-full border-[12px] border-surface-300/40 border-t-brand-500/70 animate-spin" style={{ animationDuration: '4s' }}>
          <div className="absolute inset-3 rounded-full border-4 border-surface-400/20" />
          <div className="absolute inset-8 rounded-full border-2 border-surface-500/15" />
        </div>
        <div className="absolute inset-[30%] rounded-full bg-surface-400/10 border border-surface-300/20" />
      </div>
    </div>
  );
}

export default function BrakeDisc3D({ mousePosition, className = '' }) {
  const [webglFailed, setWebglFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebglFailed(true);
      }
      canvas.remove();
    } catch {
      setWebglFailed(true);
    }
  }, []);

  if (webglFailed) {
    return (
      <div className={`relative ${className}`}>
        <FallbackDisc />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <React.Suspense fallback={<FallbackDisc />}>
        <Canvas
          key={retryCount}
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'low-power',
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
          frameloop="always"
          onCreated={(state) => {
            const canvas = state.gl.domElement;
            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              setTimeout(() => {
                if (retryCount < 2) {
                  setRetryCount(prev => prev + 1);
                } else {
                  setWebglFailed(true);
                }
              }, 1000);
            });
          }}
          onError={() => setWebglFailed(true)}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-3, -2, 4]} intensity={0.4} color="#ff8844" />
          <BrakeDiscMesh mousePosition={mousePosition} />
        </Canvas>
      </React.Suspense>
    </div>
  );
}
