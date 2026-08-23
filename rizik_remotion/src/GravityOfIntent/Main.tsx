import { AbsoluteFill, useVideoConfig, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Scene1_Void } from './Scene1_Void';
import { Scene2_Mosaic } from './Scene2_Mosaic';
import { Scene3_SpaceMeaning } from './Scene3_SpaceMeaning';
import { Scene4_RizikLogo } from './Scene4_RizikLogo';
import { Suspense } from 'react';

// Scene boundaries in frames (30fps)
// Scene 1: 0 - 299 (10s) - The Void & Chaos
// Scene 2: 300 - 749 (15s) - Green Pulse & Living Mosaic
// Scene 3: 750 - 1199 (15s) - Space = Meaning
// Scene 4: 1200 - 1499 (10s) - Rizik Topography & Logo

const SceneRouter: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame < 300) {
    return <Scene1_Void />;
  }
  if (frame < 750) {
    return <Scene2_Mosaic sceneFrame={frame - 300} />;
  }
  if (frame < 1200) {
    return <Scene3_SpaceMeaning sceneFrame={frame - 750} />;
  }
  return <Scene4_RizikLogo sceneFrame={frame - 1200} />;
};

export const GravityOfIntent: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [0, 15, 30], fov: 60 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} />
        <directionalLight position={[-5, 10, -5]} intensity={0.4} color="#00B16A" />
        <Suspense fallback={null}>
          <SceneRouter />
        </Suspense>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
