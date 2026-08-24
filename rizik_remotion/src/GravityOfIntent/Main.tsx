import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile } from 'remotion';

export const GravityOfIntent: React.FC<{ showText?: boolean }> = ({ showText = true }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Helper for spring animations
  const getSpring = (startFrame: number, duration: number = 30) => {
    return spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 15, mass: 1, stiffness: 100 },
    });
  };

  // Interpolate opacity for crossfades between scenes
  // Scene 1: 0 - 300
  // Scene 2: 300 - 750
  // Scene 3: 750 - 1200
  // Scene 4: 1200 - 1500

  const opacity1 = interpolate(frame, [0, 285, 300], [1, 1, 0], { extrapolateRight: 'clamp' });
  const opacity2 = interpolate(frame, [285, 300, 735, 750], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity3 = interpolate(frame, [735, 750, 1185, 1200], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity4 = interpolate(frame, [1185, 1200], [0, 1], { extrapolateLeft: 'clamp' });

  // Ken Burns (Zoom/Pan) effects for each background
  const scale1 = interpolate(frame, [0, 300], [1.0, 1.08]);
  const scale2 = interpolate(frame, [300, 750], [1.08, 1.0]);
  const scale3 = interpolate(frame, [750, 1200], [1.0, 1.08]);
  const scale4 = interpolate(frame, [1200, 1500], [1.08, 1.0]);

  // Scene 1 Typography Animations (DEMAND)
  const demandTranslateY = interpolate(getSpring(30), [0, 1], [50, 0]);
  const demandOpacity = getSpring(30);

  // Scene 2 Typography Animations (CHAOS TO ORDER)
  const s2Text1Opacity = getSpring(340);
  const s2Text1TranslateY = interpolate(getSpring(340), [0, 1], [30, 0]);
  const s2Text2Opacity = getSpring(370);
  const s2Text2TranslateY = interpolate(getSpring(370), [0, 1], [30, 0]);

  // Scene 3 Typography Animations (SPACE = MEANING)
  const s3Text1Opacity = getSpring(780);
  const s3Text1Translate = interpolate(getSpring(780), [0, 1], [40, 0]);

  // Scene 4 Typography Animations (RIZIK GLOBAL)
  const s4Text1Opacity = getSpring(1230);
  const s4Text1Scale = interpolate(getSpring(1230), [0, 1], [0.95, 1]);
  const s4Text2Opacity = getSpring(1260);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* SCENE 1: The Chaos Void */}
      <div style={{ opacity: opacity1, position: 'absolute', width, height }}>
        <img
          src={staticFile('assets/scene1.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale1})`,
          }}
        />
        {showText && (
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '10%',
            opacity: demandOpacity,
            transform: `translateY(${demandTranslateY}px)`,
          }}>
            <h1 style={{ color: '#031E49', fontSize: '90px', fontWeight: 800, margin: 0, letterSpacing: '-2px' }}>
              DEMAND
            </h1>
            <p style={{ color: '#031E49', fontSize: '32px', fontWeight: 400, marginTop: '10px', opacity: 0.8 }}>
              Unpredictable. Volatile. Fragmented.
            </p>
          </div>
        )}
      </div>

      {/* SCENE 2: The Living Mosaic */}
      <div style={{ opacity: opacity2, position: 'absolute', width, height }}>
        <img
          src={staticFile('assets/scene2.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale2})`,
          }}
        />
        {showText && (
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            right: '10%',
            textAlign: 'left',
          }}>
            <h2 style={{
              color: '#00B16A',
              fontSize: '60px',
              fontWeight: 800,
              opacity: s2Text1Opacity,
              transform: `translateY(${s2Text1TranslateY}px)`,
              margin: 0
            }}>
              INTRODUCING C-LINK
            </h2>
            <p style={{
              color: '#031E49',
              fontSize: '32px',
              fontWeight: 500,
              opacity: s2Text2Opacity,
              transform: `translateY(${s2Text2TranslateY}px)`,
              marginTop: '15px'
            }}>
              We replace complex dashboards with a living mosaic.
            </p>
          </div>
        )}
      </div>

      {/* SCENE 3: Space = Meaning */}
      <div style={{ opacity: opacity3, position: 'absolute', width, height }}>
        <img
          src={staticFile('assets/scene3.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale3})`,
          }}
        />
        {showText && (
          <div style={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            textAlign: 'right',
            maxWidth: '800px',
            opacity: s3Text1Opacity,
            transform: `translateY(${s3Text1Translate}px)`,
          }}>
            <h2 style={{ color: '#031E49', fontSize: '70px', fontWeight: 800, margin: 0 }}>
              SPACE = MEANING
            </h2>
            <p style={{ color: '#00B16A', fontSize: '30px', fontWeight: 600, marginTop: '10px' }}>
              The Gravity of Intent
            </p>
            <p style={{ color: '#031E49', fontSize: '22px', fontWeight: 400, marginTop: '20px', lineHeight: 1.5, opacity: 0.9 }}>
              Decisions pull resources automatically. No forms to fill, no workflows to configure. The interface self-organizes around your objectives.
            </p>
          </div>
        )}
      </div>

      {/* SCENE 4: The Rizik Topography */}
      <div style={{ opacity: opacity4, position: 'absolute', width, height }}>
        <img
          src={staticFile('assets/scene4.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale4})`,
          }}
        />
        {showText && (
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(3, 30, 73, 0.4)', // Dark overlay for readability
          }}>
            <h1 style={{
              color: '#ffffff',
              fontSize: '110px',
              fontWeight: 900,
              letterSpacing: '4px',
              opacity: s4Text1Opacity,
              transform: `scale(${s4Text1Scale})`,
              margin: 0,
              textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              RIZIK GLOBAL
            </h1>
            <p style={{
              color: '#00B16A',
              fontSize: '36px',
              fontWeight: 500,
              opacity: s4Text2Opacity,
              marginTop: '20px',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              We engineered the physics of business.
            </p>
          </div>
        )}
      </div>

    </AbsoluteFill>
  );
};
