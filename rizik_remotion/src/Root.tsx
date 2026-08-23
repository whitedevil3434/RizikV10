import { Composition } from 'remotion';
import { GravityOfIntent } from './GravityOfIntent/Main';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GravityOfIntent"
        component={GravityOfIntent}
        durationInFrames={1500} // 50 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
