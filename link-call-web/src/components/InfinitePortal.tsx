'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    Sphere,
    MeshDistortMaterial,
    Float,
    Environment,
    Text,
    ScrollControls,
    useScroll,
    Html
} from '@react-three/drei';
import { gsap } from 'gsap';
import * as THREE from 'three';
import OrbitingIcons, { PortalRing, HyperspaceStars, EnergyOrb } from './PortalElements';

interface InfinitePortalProps {
    username: string;
    userAvatar?: string;
    isOnline?: boolean;
    onAudioCall: () => void;
    onVideoCall: () => void;
    socialLinks?: {
        whatsapp?: string;
        facebook?: string;
        linkedin?: string;
        telegram?: string;
    };
}

// App icons for orbiting
const APP_ICONS = [
    { name: 'WhatsApp', color: '#25D366', emoji: '💬' },
    { name: 'Messenger', color: '#0084FF', emoji: '📱' },
    { name: 'Telegram', color: '#0088CC', emoji: '✈️' },
    { name: 'LinkedIn', color: '#0A66C2', emoji: '💼' },
];

// Scene 1: Event Horizon - Profile with orbiting icons
function EventHorizon({ isOnline, scrollProgress }: { isOnline: boolean; scrollProgress: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const orbRef = useRef<THREE.Mesh>(null);

    // Fade out as we scroll
    const opacity = Math.max(0, 1 - scrollProgress * 3);
    const scale = 1 + scrollProgress * 2;

    useFrame((state) => {
        if (orbRef.current) {
            orbRef.current.rotation.y += 0.005;
        }
    });

    if (opacity <= 0) return null;

    return (
        <group ref={groupRef} position={[0, 0, 0]} scale={scale}>
            {/* Central Profile Orb */}
            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
                <Sphere ref={orbRef} args={[1.5, 64, 64]}>
                    <MeshDistortMaterial
                        color={isOnline ? '#10b981' : '#6b7280'}
                        attach="material"
                        distort={0.3}
                        speed={3}
                        roughness={0.2}
                        metalness={0.8}
                        transparent
                        opacity={opacity * 0.8}
                    />
                </Sphere>

                {/* Inner glowing core */}
                <Sphere args={[1, 32, 32]}>
                    <meshStandardMaterial
                        color="#06b6d4"
                        emissive="#06b6d4"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={opacity}
                    />
                </Sphere>
            </Float>

            {/* Portal Ring */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <PortalRing color={isOnline ? '#10b981' : '#6b7280'} radius={3.5} />
            </group>

            {/* Orbiting App Icons */}
            <OrbitingIcons icons={APP_ICONS} radius={4} />

            {/* Welcome Text */}
            <Text
                position={[0, -3.5, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
            >
                Scroll to Enter
            </Text>
        </group>
    );
}

// Scene 2: Command Center - Call Orbs
function CommandCenter({
    scrollProgress,
    onAudioCall,
    onVideoCall
}: {
    scrollProgress: number;
    onAudioCall: () => void;
    onVideoCall: () => void;
}) {
    const [hoveredOrb, setHoveredOrb] = useState<'audio' | 'video' | null>(null);

    // Only visible between 30% and 70% scroll
    const visible = scrollProgress > 0.25 && scrollProgress < 0.7;
    const opacity = visible ? Math.min(1, (scrollProgress - 0.25) * 4) * Math.min(1, (0.7 - scrollProgress) * 4) : 0;

    if (!visible) return null;

    return (
        <group position={[0, 0, -15]}>
            {/* Audio Call Orb - Left */}
            <EnergyOrb
                color="#10b981"
                position={[-3, 0, 0]}
                label="Voice Call"
                onClick={onAudioCall}
                isHovered={hoveredOrb === 'audio'}
                onHover={(h) => setHoveredOrb(h ? 'audio' : null)}
            />

            {/* Video Call Orb - Right */}
            <EnergyOrb
                color="#0ea5e9"
                position={[3, 0, 0]}
                label="Video Call"
                onClick={onVideoCall}
                isHovered={hoveredOrb === 'video'}
                onHover={(h) => setHoveredOrb(h ? 'video' : null)}
            />

            {/* Center divider */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>

            {/* Title */}
            <Text
                position={[0, 3, 0]}
                fontSize={0.5}
                color="white"
                anchorX="center"
            >
                Choose Connection
            </Text>
        </group>
    );
}

// Scene 3: Identity Archive - Social Links
function IdentityArchive({ scrollProgress, socialLinks }: { scrollProgress: number; socialLinks?: any }) {
    // Only visible after 60% scroll
    const visible = scrollProgress > 0.6;
    const localProgress = visible ? (scrollProgress - 0.6) / 0.4 : 0;

    if (!visible) return null;

    const cards = [
        { name: 'LinkedIn', color: '#0A66C2', emoji: '💼', y: 0 },
        { name: 'WhatsApp', color: '#25D366', emoji: '💬', y: -4 },
        { name: 'Facebook', color: '#1877F2', emoji: '📘', y: -8 },
    ];

    return (
        <group position={[0, 0, -35]}>
            {cards.map((card, i) => {
                const cardVisible = localProgress > i * 0.2;
                const cardOpacity = cardVisible ? Math.min(1, (localProgress - i * 0.2) * 3) : 0;

                return (
                    <Float key={card.name} speed={2}>
                        <group position={[0, card.y + localProgress * 5, -i * 5]}>
                            {/* Card background */}
                            <mesh>
                                <planeGeometry args={[6, 2]} />
                                <meshStandardMaterial
                                    color={card.color}
                                    transparent
                                    opacity={cardOpacity * 0.3}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>

                            {/* Card border */}
                            <mesh>
                                <planeGeometry args={[6.1, 2.1]} />
                                <meshBasicMaterial
                                    color={card.color}
                                    transparent
                                    opacity={cardOpacity * 0.8}
                                    wireframe
                                />
                            </mesh>

                            {/* Icon and text */}
                            <Text
                                position={[-2, 0, 0.1]}
                                fontSize={0.6}
                                color="white"
                            >
                                {card.emoji}
                            </Text>
                            <Text
                                position={[0.5, 0, 0.1]}
                                fontSize={0.4}
                                color="white"
                                anchorX="left"
                            >
                                {card.name}
                            </Text>
                        </group>
                    </Float>
                );
            })}

            {/* Infinity mirror effect - fading rings */}
            {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[0, 0, -10 - i * 10]} rotation={[0, 0, 0]}>
                    <ringGeometry args={[4 + i, 4.2 + i, 64]} />
                    <meshBasicMaterial
                        color="#06b6d4"
                        transparent
                        opacity={0.1 / (i + 1)}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Camera Controller - Z-axis movement based on scroll
function CameraController() {
    const { camera } = useThree();
    const scroll = useScroll();

    useFrame(() => {
        // Move camera forward (into the screen) based on scroll
        const targetZ = 10 - scroll.offset * 50;
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);

        // Slight camera shake during warp
        const warpSpeed = Math.abs(scroll.delta) * 100;
        if (warpSpeed > 0.1) {
            camera.position.x = (Math.random() - 0.5) * warpSpeed * 0.1;
            camera.position.y = (Math.random() - 0.5) * warpSpeed * 0.1;
        } else {
            camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.1);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.1);
        }
    });

    return null;
}

// Main Portal Scene
function PortalScene({
    isOnline,
    onAudioCall,
    onVideoCall,
    socialLinks
}: {
    isOnline: boolean;
    onAudioCall: () => void;
    onVideoCall: () => void;
    socialLinks?: any;
}) {
    const scroll = useScroll();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [warpSpeed, setWarpSpeed] = useState(0);

    useFrame(() => {
        setScrollProgress(scroll.offset);
        setWarpSpeed(Math.abs(scroll.delta) * 50);
    });

    return (
        <>
            <CameraController />

            {/* Ambient lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

            {/* Hyperspace stars - speed up during scroll */}
            <HyperspaceStars count={800} speed={warpSpeed} />

            {/* Scene 1: Event Horizon */}
            <EventHorizon isOnline={isOnline} scrollProgress={scrollProgress} />

            {/* Scene 2: Command Center */}
            <CommandCenter
                scrollProgress={scrollProgress}
                onAudioCall={onAudioCall}
                onVideoCall={onVideoCall}
            />

            {/* Scene 3: Identity Archive */}
            <IdentityArchive scrollProgress={scrollProgress} socialLinks={socialLinks} />

            {/* Environment for reflections */}
            <Environment preset="night" />
        </>
    );
}

// Main Component
export default function InfinitePortal({
    username,
    isOnline = true,
    onAudioCall,
    onVideoCall,
    socialLinks
}: InfinitePortalProps) {
    return (
        <div className="fixed inset-0 bg-black">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 60 }}
                gl={{ antialias: true, alpha: false }}
            >
                <Suspense fallback={null}>
                    <ScrollControls pages={3} damping={0.25}>
                        <PortalScene
                            isOnline={isOnline}
                            onAudioCall={onAudioCall}
                            onVideoCall={onVideoCall}
                            socialLinks={socialLinks}
                        />
                    </ScrollControls>
                </Suspense>
            </Canvas>

            {/* Overlay UI */}
            <div className="fixed bottom-8 left-0 right-0 text-center pointer-events-none z-10">
                <p className="text-white/40 text-sm animate-bounce">
                    ↕️ Scroll to Navigate
                </p>
            </div>

            {/* Powered by */}
            <div className="fixed bottom-4 right-4 z-10">
                <p className="text-white/30 text-xs">
                    Powered by <span className="text-emerald-500">Rizik</span>
                </p>
            </div>
        </div>
    );
}
