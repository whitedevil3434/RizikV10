'use client';

import { motion, useTransform, MotionValue } from 'framer-motion';

interface MaskOverlayProps {
    scrollProgress: MotionValue<number>;
    username: string;
    userAvatar?: string;
    onProfileClick?: () => void;
}

export default function MaskOverlay({
    scrollProgress,
    username,
    userAvatar,
    onProfileClick
}: MaskOverlayProps) {
    // Transform scroll to scale the circle (1 → 50)
    const circleScale = useTransform(scrollProgress, [0, 0.2], [1, 60]);
    const overlayOpacity = useTransform(scrollProgress, [0, 0.15], [1, 0]);
    const textOpacity = useTransform(scrollProgress, [0, 0.1], [1, 0]);
    const ringRotation = useTransform(scrollProgress, [0, 1], [0, 720]);

    return (
        <>
            {/* The 2D UI Overlay with circular hole */}
            <motion.div
                className="fixed inset-0 z-20 pointer-events-none"
                style={{ opacity: overlayOpacity }}
            >
                {/* Dark background with circular cutout - positioned to match reference */}
                <div
                    className="absolute inset-0 bg-[#0A0A0A]"
                    style={{
                        maskImage: 'radial-gradient(circle at 60% 50%, transparent 220px, black 221px)',
                        WebkitMaskImage: 'radial-gradient(circle at 60% 50%, transparent 220px, black 221px)',
                    }}
                />

                {/* Golden Portal Ring - The expanding circle */}
                <motion.div
                    className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2"
                    style={{
                        scale: circleScale,
                    }}
                >
                    {/* Outer golden ring */}
                    <div
                        className="w-[460px] h-[460px] rounded-full"
                        style={{
                            border: '3px solid rgba(218, 165, 32, 0.7)',
                            boxShadow: `
                0 0 40px rgba(255, 215, 0, 0.3),
                0 0 80px rgba(255, 165, 0, 0.2),
                inset 0 0 60px rgba(255, 215, 0, 0.1)
              `,
                        }}
                    />
                </motion.div>

                {/* Rotating Social Ring Text */}
                <motion.div
                    className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        opacity: textOpacity,
                        rotate: ringRotation,
                    }}
                >
                    <div className="w-[520px] h-[520px]">
                        <svg viewBox="0 0 520 520" className="w-full h-full">
                            <defs>
                                <path
                                    id="circlePath"
                                    d="M 260, 260 m -230, 0 a 230,230 0 1,1 460,0 a 230,230 0 1,1 -460,0"
                                />
                            </defs>
                            <text
                                fill="rgba(218, 165, 32, 0.6)"
                                fontSize="13"
                                fontFamily="monospace"
                                letterSpacing="6"
                                fontWeight="500"
                            >
                                <textPath href="#circlePath">
                                    WHATSAPP • CONNECT • TELEGRAM • CONNECT • WHATSAPP • TELEGRAM • CONNECT •
                                </textPath>
                            </text>
                        </svg>
                    </div>
                </motion.div>

                {/* Light rays emanating from portal */}
                <motion.div
                    className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ opacity: textOpacity }}
                >
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-[2px] h-[400px] origin-bottom"
                            style={{
                                background: 'linear-gradient(to top, rgba(255, 215, 0, 0.15), transparent)',
                                transform: `rotate(${i * 45}deg) translateY(-50%)`,
                                top: '50%',
                                left: '50%',
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>

            {/* Left side content - Profile & Title */}
            <motion.div
                className="fixed left-12 top-12 z-30 pointer-events-auto"
                style={{ opacity: textOpacity }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-16">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <span className="text-white text-sm font-bold">R</span>
                    </div>
                    <span className="text-amber-100/70 text-sm font-light tracking-[0.3em] uppercase">Rizik Portal</span>
                </div>

                {/* Main Title */}
                <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-[0.9] tracking-tight">
                    RIZIK<br />PORTAL
                </h1>
                <p className="text-amber-100/50 text-xl font-light mb-12 tracking-wide">
                    Explore Your Digital Horizon
                </p>

                {/* Divider line */}
                <div className="w-24 h-[2px] bg-gradient-to-r from-amber-500 to-transparent mb-12" />

                {/* Profile Avatar */}
                <button
                    onClick={onProfileClick}
                    className="flex items-center gap-4 group"
                >
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-amber-500/40 ring-offset-2 ring-offset-[#0A0A0A] group-hover:ring-amber-400 transition-all duration-300">
                        <img
                            src={userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`}
                            alt={username}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </button>
            </motion.div>

            {/* Bottom left indicators */}
            <motion.div
                className="fixed bottom-12 left-12 z-30 flex gap-3"
                style={{ opacity: textOpacity }}
            >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </motion.div>

            {/* Menu icon - top right */}
            <motion.button
                className="fixed top-12 right-12 z-30 w-12 h-12 rounded-xl bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                style={{ opacity: textOpacity }}
            >
                <div className="space-y-1.5">
                    <div className="w-5 h-0.5 bg-white/70" />
                    <div className="w-5 h-0.5 bg-white/70" />
                </div>
            </motion.button>

            {/* Navigation arrows - bottom right */}
            <motion.div
                className="fixed bottom-12 right-12 z-30 flex gap-3"
                style={{ opacity: textOpacity }}
            >
                <button className="w-11 h-11 rounded-lg bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white/80 transition-all">
                    ‹
                </button>
                <button className="w-11 h-11 rounded-lg bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white/80 transition-all">
                    ›
                </button>
            </motion.div>

            {/* Decorative star - bottom right */}
            <motion.div
                className="fixed bottom-24 right-24 z-20"
                style={{ opacity: textOpacity }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
                        fill="rgba(255, 215, 0, 0.4)"
                    />
                </svg>
            </motion.div>
        </>
    );
}
