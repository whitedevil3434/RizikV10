import { useVideoConfig, spring, interpolate } from 'remotion';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const GRID_SIZE = 12;
const TILE_SIZE = 1.2;

export const Scene2_Mosaic: React.FC<{ sceneFrame: number }> = ({ sceneFrame }) => {
  const { fps } = useVideoConfig();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const camX = interpolate(sceneFrame, [0, 450], [10, 0]);
    const camY = interpolate(sceneFrame, [0, 450], [10, 20]);
    const camZ = interpolate(sceneFrame, [0, 450], [20, 25]);
    state.camera.position.set(camX, camY, camZ);
    state.camera.lookAt(0, 0, 0);
  });

  const tiles = useMemo(() => {
    const arr = [];
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x++) {
      for (let z = -GRID_SIZE; z <= GRID_SIZE; z++) {
        arr.push({ x, z, dist: Math.sqrt(x * x + z * z) });
      }
    }
    return arr;
  }, []);

  // Deterministic color assignment
  const tileColors = useMemo(() => {
    const rng = (seed: number) => {
      const x = Math.sin(seed * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };
    return tiles.map((_, i) => rng(i) > 0.93 ? '#00B16A' : '#ffffff');
  }, [tiles]);

  return (
    <group ref={groupRef}>
      {/* Zero Gravity Suspended Words */}
      <group position={[0, interpolate(sceneFrame, [0, 150], [2, 15]), 0]}>
        <Text
          color="#031E49"
          fontSize={3}
          anchorX="center"
          anchorY="middle"
          fillOpacity={interpolate(sceneFrame, [50, 150], [1, 0])}
        >
          CHAOS
        </Text>
      </group>

      {/* Green Pulse Wave */}
      {sceneFrame > 50 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <ringGeometry
            args={[
              interpolate(sceneFrame, [50, 150], [0, 50]),
              interpolate(sceneFrame, [50, 150], [0.5, 51]),
              64,
            ]}
          />
          <meshBasicMaterial
            color="#00B16A"
            transparent
            opacity={interpolate(sceneFrame, [50, 150], [0.8, 0])}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* The Living Mosaic Grid */}
      {tiles.map((tile, i) => {
        const pulseStart = tile.dist * 3 + 50;
        const tileY = spring({
          frame: sceneFrame - pulseStart,
          fps,
          config: { damping: 12 },
          from: -10,
          to: 0,
        });

        return (
          <mesh key={i} position={[tile.x * TILE_SIZE, tileY, tile.z * TILE_SIZE]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={tileColors[i]} />
          </mesh>
        );
      })}
    </group>
  );
};
