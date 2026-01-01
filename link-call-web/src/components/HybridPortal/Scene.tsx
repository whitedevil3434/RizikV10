'use client';

import { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { getProject } from '@theatre/core';
import { editable as e, SheetProvider } from '@theatre/r3f';
import * as THREE from 'three';

// Initialize Theatre.js Studio only in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    import('@theatre/studio').then((studio) => {
        import('@theatre/r3f/dist/extension').then((extension) => {
            studio.default.initialize();
            studio.default.extend(extension.default);
        });
    });
}

// Create Theatre.js project and sheet
const project = getProject('Rizik_Tunnel');
const tunnelSheet = project.sheet('Tunnel_Level');

// === CONFIGURATION ===
const CONFIG = {
    segmentCount: 5,
    overlapCorrection: 0.02,
    cameraSpeed: 80,
};

interface SceneProps {
    scrollProgress: number;
}

// === SINGLE TUNNEL SEGMENT (Editable) ===
function TunnelSegment({
    id,
    initialZ,
    tunnelModel,
    scale
}: {
    id: number;
    initialZ: number;
    tunnelModel: THREE.Object3D;
    scale: number;
}) {
    const clone = useMemo(() => tunnelModel.clone(), [tunnelModel]);

    return (
        <e.group
            theatreKey={`Tunnel_Segment_${id}`}
            position={[0, 0, initialZ]}
        >
            <primitive object={clone} scale={scale} />
        </e.group>
    );
}

// === SEAMLESS TUNNEL ===
function SeamlessTunnel({ scrollProgress }: { scrollProgress: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const { scene: tunnelModel } = useGLTF('/models/tunnel_ring.glb');
    const [segmentLength, setSegmentLength] = useState(3);

    // Calculate bounding box on load
    useEffect(() => {
        if (tunnelModel) {
            const box = new THREE.Box3().setFromObject(tunnelModel);
            const size = box.getSize(new THREE.Vector3());
            const calculatedLength = Math.max(size.x, size.y, size.z) * 3; // scale=3
            console.log('📏 Segment Length:', calculatedLength);
            setSegmentLength(calculatedLength);
        }
    }, [tunnelModel]);

    // Create segment positions
    const segments = useMemo(() =>
        Array.from({ length: CONFIG.segmentCount }, (_, i) => ({
            id: i,
            z: -(i * (segmentLength - CONFIG.overlapCorrection)),
        })), [segmentLength]);

    // Object pooling - teleport segments
    useFrame((state) => {
        if (!groupRef.current) return;
        const cameraZ = state.camera.position.z;
        const totalLength = CONFIG.segmentCount * (segmentLength - CONFIG.overlapCorrection);

        groupRef.current.children.forEach((segment) => {
            if (segment.position.z > cameraZ + segmentLength) {
                segment.position.z -= totalLength;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {segments.map((seg) => (
                <TunnelSegment
                    key={seg.id}
                    id={seg.id}
                    initialZ={seg.z}
                    tunnelModel={tunnelModel}
                    scale={3}
                />
            ))}
        </group>
    );
}

// === CAMERA ===
function CameraController({ scrollProgress }: { scrollProgress: number }) {
    const { camera } = useThree();

    useFrame((state) => {
        const targetZ = 5 - scrollProgress * CONFIG.cameraSpeed;
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
        camera.position.x = state.pointer.x * 0.3;
        camera.position.y = state.pointer.y * 0.2;
    });

    return null;
}

// === LIGHTING ===
function TunnelLighting({ scrollProgress }: { scrollProgress: number }) {
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        if (lightRef.current) {
            lightRef.current.position.set(0, 0, state.camera.position.z);
        }
    });

    const color = scrollProgress < 0.5 ? '#FFD700' : '#00FFFF';

    return (
        <>
            <ambientLight intensity={1.5} />
            <hemisphereLight intensity={1} color="#ffffff" groundColor="#333333" />
            <directionalLight position={[0, 5, 5]} intensity={2} />
            <pointLight ref={lightRef} color={color} intensity={80} distance={50} />
        </>
    );
}

// === MAIN SCENE ===
export default function HybridScene({ scrollProgress }: SceneProps) {
    return (
        <SheetProvider sheet={tunnelSheet}>
            {/* Background */}
            <color attach="background" args={['#1a1a25']} />

            {/* Fog for infinite illusion */}
            <fog attach="fog" args={['#1a1a25', 5, 40]} />

            {/* Environment */}
            <Environment preset="night" />

            {/* Camera */}
            <CameraController scrollProgress={scrollProgress} />

            {/* Lighting */}
            <TunnelLighting scrollProgress={scrollProgress} />

            {/* Debug Axes (visible in Theatre.js) */}
            <axesHelper args={[5]} />

            {/* Tunnel */}
            <Suspense fallback={null}>
                <SeamlessTunnel scrollProgress={scrollProgress} />
            </Suspense>
        </SheetProvider>
    );
}

useGLTF.preload('/models/tunnel_ring.glb');
