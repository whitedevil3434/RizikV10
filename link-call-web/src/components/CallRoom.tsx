'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    LiveKitRoom,
    AudioConference,
    useRoomContext,
    RoomAudioRenderer,
    ControlBar,
    useTracks,
    useParticipants,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface CallRoomProps {
    roomName: string;
    participantName: string;
    onDisconnect: () => void;
}

export default function CallRoom({ roomName, participantName, onDisconnect }: CallRoomProps) {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);

    const LIVEKIT_URL =
        process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://rizik-ai-femz194x.livekit.cloud';

    useEffect(() => {
        const getToken = async () => {
            try {
                const response = await fetch('/api/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ room: roomName, participant: participantName }),
                });

                if (!response.ok) throw new Error('Failed to get token');

                const data = await response.json();
                setToken(data.token);
                setIsConnecting(false);
            } catch (err) {
                setError('Connection failed. Please try again.');
                setIsConnecting(false);
            }
        };

        getToken();
    }, [roomName, participantName]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-red-400 text-xl mb-4">❌ {error}</div>
                <button
                    onClick={onDisconnect}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (isConnecting || !token) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse" />
                    <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-white/20 animate-ping" />
                </div>
                <p className="text-white/80 mt-8 text-lg">Connecting to call...</p>
            </div>
        );
    }

    return (
        <LiveKitRoom
            token={token}
            serverUrl={LIVEKIT_URL}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={onDisconnect}
            className="h-screen bg-gradient-to-br from-slate-900 to-slate-800"
        >
            <CallInterface onDisconnect={onDisconnect} />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
}

function CallInterface({ onDisconnect }: { onDisconnect: () => void }) {
    const room = useRoomContext();
    const participants = useParticipants();
    const tracks = useTracks([Track.Source.Microphone]);

    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    // Duration timer
    useEffect(() => {
        const interval = setInterval(() => {
            setDuration(d => d + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = useCallback(async () => {
        const localParticipant = room.localParticipant;
        await localParticipant.setMicrophoneEnabled(isMuted);
        setIsMuted(!isMuted);
    }, [room, isMuted]);

    const endCall = useCallback(() => {
        room.disconnect();
        onDisconnect();
    }, [room, onDisconnect]);

    // Check if AI agent is connected
    const aiAgent = participants.find(p => p.identity.startsWith('agent-'));

    return (
        <div className="flex flex-col items-center justify-center h-full">
            {/* Call Status */}
            <div className="text-center mb-12">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                        <span className="text-4xl">🎙️</span>
                    </div>
                    {/* Audio visualizer ring */}
                    <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-emerald-400/50 animate-pulse" />
                </div>

                <h2 className="text-white text-2xl font-bold mt-6">
                    {aiAgent ? 'Rizik AI Speaking...' : 'Connecting to AI...'}
                </h2>
                <p className="text-white/60 mt-2 text-lg">{formatDuration(duration)}</p>
            </div>

            {/* Controls */}
            <div className="flex gap-6">
                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMuted
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                >
                    <span className="text-2xl">{isMuted ? '🔇' : '🎤'}</span>
                </button>

                {/* End Call Button */}
                <button
                    onClick={endCall}
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
                >
                    <span className="text-2xl">📞</span>
                </button>
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-white/40 text-sm">
                    {participants.length} participant{participants.length !== 1 ? 's' : ''} in room
                </p>
            </div>
        </div>
    );
}
