'use client';

import { useCallback, useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
}

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number | undefined>(undefined);
    const mouseRef = useRef({ x: 0, y: 0 });

    const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'];

    const createParticle = useCallback((width: number, height: number): Particle => {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: colors[Math.floor(Math.random() * colors.length)],
        };
    }, []);

    const initParticles = useCallback((width: number, height: number) => {
        const count = Math.floor((width * height) / 15000);
        particlesRef.current = Array.from({ length: count }, () =>
            createParticle(width, height)
        );
    }, [createParticle]);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        particlesRef.current.forEach((particle, i) => {
            // Mouse repulsion
            const dx = particle.x - mouseRef.current.x;
            const dy = particle.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                const force = (100 - dist) / 100;
                particle.vx += (dx / dist) * force * 0.2;
                particle.vy += (dy / dist) * force * 0.2;
            }

            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;

            // Wrap around edges
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;

            // Draw particle with glow
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();

            // Draw connections
            particlesRef.current.slice(i + 1).forEach((other) => {
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = particle.color;
                    ctx.globalAlpha = (1 - dist / 120) * 0.2;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });

        ctx.globalAlpha = 1;
        animationRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(canvas.width, canvas.height);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate, initParticles]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
}
