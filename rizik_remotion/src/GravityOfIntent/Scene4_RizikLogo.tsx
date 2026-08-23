import { interpolate } from 'remotion';
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { Text } from '@react-three/drei';

const GRID_SIZE = 20;
const TILE_SIZE = 1.2;

export const Scene4_RizikLogo: React.FC<{ sceneFrame: number }> = ({ sceneFrame }) => {
  useFrame((state) => {
    const camZ = interpolate(sceneFrame, [0, 200], [20, 80], { extrapolateRight: 'clamp' });
    const camY = interpolate(sceneFrame, [0, 200], [25, 70], { extrapolateRight: 'clamp' });
    state.camera.position.set(0, camY, camZ);
    state.camera.lookAt(0, 0, 0);
  });

  const tiles = useMemo(() => {
    const arr = [];
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x++) {
      for (let z = -GRID_SIZE; z <= GRID_SIZE; z++) {
        arr.push({ x, z });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {/* The Great Decoupling Topography */}
      {tiles.map((tile, i) => {
        const height = Math.sin(tile.x * 0.3 + sceneFrame * 0.05) * Math.cos(tile.z * 0.3) * 6 + 6;
        const color = tile.x < 0 ? '#00B16A' : '#031E49';

        return (
          <mesh key={i} position={[tile.x * TILE_SIZE, height / 2, tile.z * TILE_SIZE]}>
            <boxGeometry args={[1, height, 1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}

      {/* RIZIK GLOBAL */}
      <Text
        position={[0, 30, 0]}
        color="#031E49"
        fontSize={6}
        anchorX="center"
        anchorY="middle"
        fillOpacity={interpolate(sceneFrame, [100, 150], [0, 1])}
      >
        RIZIK GLOBAL
      </Text>

      {/* Tagline */}
      <Text
        position={[0, 24, 0]}
        color="#00B16A"
        fontSize={2}
        anchorX="center"
        anchorY="middle"
        fillOpacity={interpolate(sceneFrame, [150, 200], [0, 1])}
      >
        We engineered the physics of business.
      </Text>
    </group>
  );
};
