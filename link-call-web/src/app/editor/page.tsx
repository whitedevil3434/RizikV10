'use client';

import dynamic from 'next/dynamic';

// Dynamic import for heavy editor
const RizikEditor = dynamic(
    () => import('@/components/RizikEditor'),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-cyan-500/30 animate-spin" />
                <p className="text-cyan-500/60 mt-6 text-sm tracking-widest animate-pulse">
                    LOADING 3D STUDIO...
                </p>
            </div>
        )
    }
);

export default function EditorPage() {
    return <RizikEditor />;
}
