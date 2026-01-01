'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DProps {
    avatarUrl?: string;
    isOnline?: boolean;
    size?: number;
}

function GlowingOrb({ isOnline = true }: { isOnline?: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    // Animate the orb
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
            meshRef.current.rotation.y += 0.005;
        }
        if (innerRef.current) {
            innerRef.current.rotation.y -= 0.01;
        }
    });

    const primaryColor = isOnline ? '#10b981' : '#6b7280';
    const secondaryColor = isOnline ? '#06b6d4' : '#4b5563';

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <group>
                {/* Outer glow sphere */}
                <Sphere ref={meshRef} args={[1.5, 64, 64]}>
                    <MeshDistortMaterial
                        color={primaryColor}
                        attach="material"
                        distort={0.4}
                        speed={3}
                        roughness={0.2}
                        metalness={0.8}
                        transparent
                        opacity={0.6}
                    />
                </Sphere>

                {/* Inner core */}
                <Sphere ref={innerRef} args={[1.1, 32, 32]}>
                    <meshStandardMaterial
                        color={secondaryColor}
                        roughness={0.1}
                        metalness={0.9}
                        envMapIntensity={1}
                    />
                </Sphere>

                {/* Center bright core */}
                <Sphere args={[0.5, 16, 16]}>
                    <meshBasicMaterial color="#ffffff" />
                </Sphere>

                {/* Orbiting particles */}
                <OrbitingParticles color={primaryColor} />
            </group>
        </Float>
    );
}

function OrbitingParticles({ color }: { color: string }) {
    const particlesRef = useRef<THREE.Points>(null);

    const [positions, colors] = useMemo(() => {
        const count = 100;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const baseColor = new THREE.Color(color);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 2 + Math.random() * 0.5;

            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);

            col[i * 3] = baseColor.r;
            col[i * 3 + 1] = baseColor.g;
            col[i * 3 + 2] = baseColor.b;
        }
        return [pos, col];
    }, [color]);

    useFrame(() => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.002;
            particlesRef.current.rotation.x += 0.001;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
}

export default function Avatar3D({ isOnline = true, size = 200 }: Avatar3DProps) {
    return (
        <div style={{ width: size, height: size }} className="relative">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
                <GlowingOrb isOnline={isOnline} />
                <Environment preset="city" />
            </Canvas>

            {/* Glow effect behind canvas */}
            <div
                className={`absolute inset-0 rounded-full blur-3xl -z-10 ${isOnline ? 'bg-emerald-500/30' : 'bg-gray-500/20'
                    }`}
            />
        </div>
    );
}
