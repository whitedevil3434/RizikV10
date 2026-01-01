'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitingIconsProps {
    icons: { name: string; color: string; emoji: string }[];
    radius?: number;
}

export default function OrbitingIcons({ icons, radius = 3 }: OrbitingIconsProps) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
        }
    });

    return (
        <group ref={groupRef}>
            {icons.map((icon, index) => {
                const angle = (index / icons.length) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(angle * 2) * 0.5;

                return (
                    <Float
                        key={icon.name}
                        speed={2}
                        rotationIntensity={0.3}
                        floatIntensity={0.3}
                    >
                        <group position={[x, y, z]}>
                            {/* Glass card background */}
                            <mesh rotation={[0, -angle, 0]}>
                                <planeGeometry args={[1.2, 1.2]} />
                                <meshStandardMaterial
                                    color={icon.color}
                                    transparent
                                    opacity={0.3}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>

                            {/* Card border glow */}
                            <mesh rotation={[0, -angle, 0]} position={[0, 0, -0.01]}>
                                <planeGeometry args={[1.3, 1.3]} />
                                <meshBasicMaterial
                                    color={icon.color}
                                    transparent
                                    opacity={0.5}
                                    wireframe
                                />
                            </mesh>
                        </group>
                    </Float>
                );
            })}
        </group>
    );
}

// Neon Portal Ring
export function PortalRing({ color = '#10b981', radius = 4 }: { color?: string; radius?: number }) {
    const ringRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z = state.clock.elapsedTime * 0.3;
            // Pulsing effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
            ringRef.current.scale.setScalar(scale);
        }
        if (glowRef.current) {
            glowRef.current.rotation.z = -state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <group>
            {/* Main ring */}
            <mesh ref={ringRef}>
                <torusGeometry args={[radius, 0.1, 16, 100]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={3}
                    toneMapped={false}
                />
            </mesh>

            {/* Outer glow ring */}
            <mesh ref={glowRef}>
                <torusGeometry args={[radius, 0.25, 16, 100]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.2}
                />
            </mesh>

            {/* Inner energy disc */}
            <mesh>
                <ringGeometry args={[radius - 0.8, radius + 0.3, 64]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.05}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

// Hyperspace Stars Effect
export function HyperspaceStars({ count = 500, speed = 0 }: { count?: number; speed?: number }) {
    const pointsRef = useRef<THREE.Points>(null);

    const [positions, velocities] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * 25;

            pos[i * 3] = Math.cos(theta) * r;
            pos[i * 3 + 1] = Math.sin(theta) * r;
            pos[i * 3 + 2] = -Math.random() * 100 - 10;

            vel[i] = Math.random() * 0.5 + 0.5;
        }

        return [pos, vel];
    }, [count]);

    useFrame(() => {
        if (!pointsRef.current || speed === 0) return;

        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 2] += velocities[i] * speed;

            if (positions[i * 3 + 2] > 10) {
                positions[i * 3 + 2] = -100;
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#ffffff"
                transparent
                opacity={0.9}
                sizeAttenuation
            />
        </points>
    );
}

// Energy Orb for Call Buttons
export function EnergyOrb({
    color,
    position,
    label,
    onClick,
    isHovered,
    onHover
}: {
    color: string;
    position: [number, number, number];
    label: string;
    onClick: () => void;
    isHovered: boolean;
    onHover: (hovered: boolean) => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
            meshRef.current.scale.setScalar(isHovered ? 1.4 : pulse);
        }
        if (innerRef.current) {
            innerRef.current.rotation.y += 0.03;
            innerRef.current.rotation.x += 0.02;
        }
    });

    return (
        <group position={position}>
            <Float speed={3} floatIntensity={0.5}>
                {/* Outer glow sphere */}
                <mesh
                    ref={meshRef}
                    onClick={onClick}
                    onPointerEnter={() => onHover(true)}
                    onPointerLeave={() => onHover(false)}
                >
                    <sphereGeometry args={[1.2, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={isHovered ? 4 : 2}
                        transparent
                        opacity={0.5}
                        toneMapped={false}
                    />
                </mesh>

                {/* Inner wireframe core */}
                <mesh ref={innerRef}>
                    <icosahedronGeometry args={[0.7, 1]} />
                    <meshStandardMaterial
                        color="white"
                        emissive={color}
                        emissiveIntensity={3}
                        wireframe
                        toneMapped={false}
                    />
                </mesh>

                {/* Center bright point */}
                <mesh>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            </Float>
        </group>
    );
}
