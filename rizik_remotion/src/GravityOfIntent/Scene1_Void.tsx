import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const FallingWord: React.FC<{ word: string; delay: number; x: number; z: number }> = ({ word, delay, x, z }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const group = useRef<THREE.Group>(null);

  const drop = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 2, stiffness: 100 },
    from: 50,
    to: Math.abs(x * 0.3) + Math.abs(z * 0.3),
  });

  return (
    <group ref={group} position={[x, drop, z]}>
      <Text
        color="#031E49"
        fontSize={0.8}
        anchorX="center"
        anchorY="middle"
      >
        {word}
      </Text>
    </group>
  );
};

export const Scene1_Void: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  useFrame((state) => {
    state.camera.position.set(0, interpolate(frame, [0, 300], [20, 10]), interpolate(frame, [0, 300], [40, 20]));
    state.camera.lookAt(0, 5, 0);
  });

  const chaoticWords = useMemo(() => {
    const words = ["Production", "Shipment", "Delay", "Invoice", "Textile", "Food", "Error", "Crisis", "Budget", "Supply"];
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 80 }).map((_, i) => ({
      word: words[Math.floor(rng(i + 1) * words.length)],
      delay: 30 + rng(i + 100) * 200,
      x: (rng(i + 200) - 0.5) * 30,
      z: (rng(i + 300) - 0.5) * 30,
    }));
  }, []);

  const demandDrop = spring({
    frame,
    fps,
    config: { damping: 10 },
    from: 50,
    to: 3,
  });

  return (
    <group>
      {/* Infinite White Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Initial big word - DEMAND */}
      <group position={[0, demandDrop, 0]}>
        <Text
          color="#00B16A"
          fontSize={4}
          anchorX="center"
          anchorY="middle"
        >
          DEMAND
        </Text>
      </group>

      {/* Chaotic falling words */}
      {frame > 30 && chaoticWords.map((item, i) => (
        <FallingWord key={i} {...item} />
      ))}
    </group>
  );
};
