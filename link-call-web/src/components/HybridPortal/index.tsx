'use client';

import { useRef, useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { motion, useScroll, useSpring } from 'framer-motion';
import dynamic from 'next/dynamic';
import CallRoom from '@/components/CallRoom';

// Dynamic imports for heavy 3D components
const HybridScene = dynamic(() => import('@/components/HybridPortal/Scene'), { ssr: false });
const MaskOverlay = dynamic(() => import('@/components/HybridPortal/MaskOverlay'), { ssr: false });

interface HybridPortalPageProps {
    username: string;
    userAvatar?: string;
}

// Loading screen
function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-[#020202] z-50 flex flex-col items-center justify-center">
            <motion.div
                className="w-20 h-20 rounded-full border-3 border-amber-500/30"
                animate={{
                    rotate: 360,
                    borderColor: ['rgba(245, 158, 11, 0.3)', 'rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.p
                className="text-amber-500/60 mt-6 text-xs tracking-[0.3em] uppercase"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                Entering Portal
            </motion.p>
        </div>
    );
}

// Slim Navigation Indicators - Up & Down arrows
function NavigationIndicators({
    scrollProgress,
    onNavigate
}: {
    scrollProgress: number;
    onNavigate: (direction: 'up' | 'down') => void;
}) {
    const showUp = scrollProgress > 0.05;
    const showDown = scrollProgress < 0.95;

    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-4">
            {/* Up Arrow - Go to previous station */}
            <motion.button
                onClick={() => onNavigate('up')}
                className="group relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                    opacity: showUp ? 1 : 0.2,
                    x: 0,
                    pointerEvents: showUp ? 'auto' : 'none'
                }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="w-10 h-14 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300">
                    <svg
                        width="16"
                        height="20"
                        viewBox="0 0 16 20"
                        fill="none"
                        className="text-white/60 group-hover:text-amber-400 transition-colors"
                    >
                        <path
                            d="M8 2L2 10H6V18H10V10H14L8 2Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                {/* Tooltip */}
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white/70 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Previous
                </span>
            </motion.button>

            {/* Progress Dots */}
            <div className="flex flex-col gap-2 py-4">
                {[0, 0.33, 0.66, 1].map((station, i) => (
                    <motion.div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${Math.abs(scrollProgress - station) < 0.15
                                ? 'bg-amber-400 w-2 h-2'
                                : 'bg-white/20'
                            }`}
                    />
                ))}
            </div>

            {/* Down Arrow - Go to next station */}
            <motion.button
                onClick={() => onNavigate('down')}
                className="group relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                    opacity: showDown ? 1 : 0.2,
                    x: 0,
                    pointerEvents: showDown ? 'auto' : 'none'
                }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="w-10 h-14 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300">
                    <svg
                        width="16"
                        height="20"
                        viewBox="0 0 16 20"
                        fill="none"
                        className="text-white/60 group-hover:text-cyan-400 transition-colors"
                    >
                        <path
                            d="M8 18L14 10H10V2H6V10H2L8 18Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                {/* Tooltip */}
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-white/70 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Next
                </span>
            </motion.button>
        </div>
    );
}

// Call UI that appears at destination
function DestinationCallUI({
    scrollProgress,
    onAudioCall,
    onVideoCall
}: {
    scrollProgress: number;
    onAudioCall: () => void;
    onVideoCall: () => void;
}) {
    const visible = scrollProgress > 0.9;

    if (!visible) return null;

    return (
        <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
        >
            <div className="text-center pointer-events-auto">
                <motion.h2
                    className="text-4xl font-bold text-white mb-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Welcome to the Core
                </motion.h2>
                <motion.p
                    className="text-cyan-400/60 mb-10 text-lg"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Choose your connection
                </motion.p>

                <motion.div
                    className="flex gap-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <button
                        onClick={onAudioCall}
                        className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-2xl shadow-emerald-500/30 flex items-center gap-4 text-lg"
                    >
                        <span className="text-2xl">🎙️</span>
                        Voice Call
                    </button>
                    <button
                        onClick={onVideoCall}
                        className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl text-white font-semibold hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-2xl shadow-cyan-500/30 flex items-center gap-4 text-lg"
                    >
                        <span className="text-2xl">📹</span>
                        Video Call
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default function HybridPortalPage({ username, userAvatar }: HybridPortalPageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
    const [callerName] = useState(`guest-${Math.random().toString(36).slice(2, 8)}`);

    // Scroll tracking
    const { scrollYProgress } = useScroll({ container: containerRef });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
    const [currentProgress, setCurrentProgress] = useState(0);

    // Update current progress
    smoothProgress.on('change', (v) => setCurrentProgress(v));

    // Handle navigation button clicks
    const handleNavigate = useCallback((direction: 'up' | 'down') => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const totalHeight = container.scrollHeight - container.clientHeight;
        const stationPositions = [0, 0.33, 0.66, 1]; // 4 stations

        // Find current station
        let currentStation = 0;
        for (let i = stationPositions.length - 1; i >= 0; i--) {
            if (currentProgress >= stationPositions[i] - 0.1) {
                currentStation = i;
                break;
            }
        }

        // Navigate to next/previous station
        const targetStation = direction === 'down'
            ? Math.min(currentStation + 1, stationPositions.length - 1)
            : Math.max(currentStation - 1, 0);

        container.scrollTo({
            top: totalHeight * stationPositions[targetStation],
            behavior: 'smooth'
        });
    }, [currentProgress]);

    // Handle loading complete
    const handleLoaded = useCallback(() => {
        setTimeout(() => setIsLoading(false), 1500);
    }, []);

    const startCall = (type: 'audio' | 'video') => {
        setCallType(type);
    };

    // In call state
    if (callType) {
        return (
            <CallRoom
                roomName={`hybrid-call-${username}-${callType}`}
                participantName={callerName}
                onDisconnect={() => setCallType(null)}
            />
        );
    }

    return (
        <>
            {isLoading && <LoadingScreen />}

            {/* Scroll Container - 3 pages worth of scroll */}
            <div
                ref={containerRef}
                className="h-screen overflow-y-auto overflow-x-hidden scroll-smooth"
            >
                {/* Scroll spacer - creates 3 pages of scroll content */}
                <div className="h-[300vh] relative">

                    {/* Fixed 3D Canvas Layer (z-index: 10) */}
                    <div className="fixed inset-0 z-10">
                        <Canvas
                            camera={{ position: [0, 0, 5], fov: 60 }}
                            gl={{ antialias: true, alpha: false }}
                            onCreated={handleLoaded}
                        >
                            <Suspense fallback={null}>
                                <HybridScene scrollProgress={currentProgress} />
                                <Preload all />
                            </Suspense>
                        </Canvas>
                    </div>

                    {/* 2D Mask Overlay Layer (z-index: 20) */}
                    <MaskOverlay
                        scrollProgress={smoothProgress}
                        username={username}
                        userAvatar={userAvatar}
                    />

                    {/* Slim Navigation Indicators */}
                    <NavigationIndicators
                        scrollProgress={currentProgress}
                        onNavigate={handleNavigate}
                    />

                    {/* Destination Call UI */}
                    <DestinationCallUI
                        scrollProgress={currentProgress}
                        onAudioCall={() => startCall('audio')}
                        onVideoCall={() => startCall('video')}
                    />

                    {/* Progress bar - top */}
                    <motion.div
                        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-cyan-500 z-50 origin-left"
                        style={{ scaleX: smoothProgress }}
                    />
                </div>
            </div>
        </>
    );
}
