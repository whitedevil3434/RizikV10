'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import for heavy hybrid portal
const HybridPortalPage = dynamic(
    () => import('@/components/HybridPortal'),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 bg-[#0D0D0D] flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 animate-spin" />
                <p className="text-amber-500/60 mt-6 text-sm tracking-widest animate-pulse">
                    LOADING PORTAL...
                </p>
            </div>
        )
    }
);

// Mock user data - in production, fetch from Supabase
const getMockUserProfile = (username: string) => ({
    id: `user-${username}`,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=0ea5e9,10b981`,
});

export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const user = getMockUserProfile(username);

    return (
        <HybridPortalPage
            username={user.name}
            userAvatar={user.avatar}
        />
    );
}
