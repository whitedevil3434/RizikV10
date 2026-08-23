import { useVideoConfig, spring, interpolate } from 'remotion';
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { Text } from '@react-three/drei';

const GRID_SIZE = 12;
const TILE_SIZE = 1.2;

export const Scene3_SpaceMeaning: React.FC<{ sceneFrame: number }> = ({ sceneFrame }) => {
  const { fps } = useVideoConfig();

  useFrame((state) => {
    state.camera.position.set(
      interpolate(sceneFrame, [0, 450], [0, 15]),
      interpolate(sceneFrame, [0, 450], [20, 25]),
      interpolate(sceneFrame, [0, 450], [25, 20])
    );
    state.camera.lookAt(0, 5, 0);
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

  const coreHeight = spring({
    frame: sceneFrame,
    fps,
    config: { damping: 14, mass: 2 },
    from: 1,
    to: 15,
  });

  return (
    <group>
      {tiles.map((tile, i) => {
        const pull = tile.dist < 6 ? spring({
          frame: sceneFrame - tile.dist * 10,
          fps,
          config: { damping: 12 },
          from: 0,
          to: Math.max(0, 8 - tile.dist),
        }) : 0;

        const isCore = tile.x === 0 && tile.z === 0;

        return (
          <group key={i}>
            <mesh
              position={[
                tile.x * TILE_SIZE * (1 - pull * 0.05),
                isCore ? coreHeight / 2 - 0.5 : pull / 2,
                tile.z * TILE_SIZE * (1 - pull * 0.05),
              ]}
            >
              <boxGeometry args={[1, isCore ? coreHeight : 1 + pull, 1]} />
              <meshStandardMaterial color={isCore ? '#031E49' : pull > 3 ? '#00B16A' : '#ffffff'} />
            </mesh>

            {/* Intent Label on top of the core skyscraper */}
            {isCore && (
              <Text
                position={[0, coreHeight + 1, 0]}
                color="#031E49"
                fontSize={1.2}
                anchorX="center"
                anchorY="middle"
              >
                PRODUCE 100K YARDS
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};
