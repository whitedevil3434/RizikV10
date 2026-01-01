'use client';

import { useRef, useState, useCallback, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Float, Environment, OrbitControls, TransformControls, Sparkles, Html } from '@react-three/drei';
import { useControls, folder, button, Leva } from 'leva';
import * as THREE from 'three';

// === TYPES ===
interface ModelState {
    id: string;
    name: string;
    displayName: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
    visible: boolean;
}

interface SceneSettings {
    lightColor: string;
    fogDensity: number;
    ambientIntensity: number;
    tunnelCount: number;
    tunnelSpacing: number;
}

interface SceneState {
    models: ModelState[];
    settings: SceneSettings;
    selectedModelId: string | null;
}

// === INITIAL SCENE STATE ===
const INITIAL_MODELS: ModelState[] = [
    { id: 'portal', name: 'organic_portal', displayName: 'Organic Portal', position: [0, -1, 3], rotation: [0, 0, 0], scale: 3.5, visible: true },
    { id: 'bee1', name: 'real_bee', displayName: 'Real Bee', position: [1.5, 0.5, 1], rotation: [0, 0.5, 0], scale: 0.4, visible: true },
    { id: 'honeycomb', name: 'cyborg_honeycomb', displayName: 'Cyborg Honeycomb', position: [0, 0, -85], rotation: [0, 0, 0], scale: 4, visible: true },
    { id: 'cyberbee1', name: 'cyborg_bee', displayName: 'Cyborg Bee', position: [-2, 1, -80], rotation: [0, 0.5, 0], scale: 0.7, visible: true },
    { id: 'cyberbee2', name: 'cyborg_bee', displayName: 'Cyborg Bee 2', position: [2, -0.5, -82], rotation: [0, -0.5, 0], scale: 0.6, visible: true },
    { id: 'drone', name: 'drone_eye', displayName: 'Drone Eye', position: [3, 0.5, -20], rotation: [0, -0.3, 0], scale: 0.5, visible: true },
    { id: 'projector', name: 'projector', displayName: 'Projector', position: [0, -2, -75], rotation: [0, 0, 0], scale: 0.8, visible: true },
];

const INITIAL_SETTINGS: SceneSettings = {
    lightColor: '#00ffff',
    fogDensity: 30,
    ambientIntensity: 0.4,
    tunnelCount: 15,
    tunnelSpacing: 5,
};

// === DRAGGABLE MODEL COMPONENT ===
function DraggableModel({
    model,
    isSelected,
    onSelect,
    onTransformChange,
    transformMode
}: {
    model: ModelState;
    isSelected: boolean;
    onSelect: () => void;
    onTransformChange: (position: [number, number, number], rotation: [number, number, number], scale: number) => void;
    transformMode: 'translate' | 'rotate' | 'scale';
}) {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF(`/models/${model.name}.glb`);
    const clone = useMemo(() => scene.clone(), [scene]);

    if (!model.visible) return null;

    return (
        <>
            <group
                ref={groupRef}
                position={model.position}
                rotation={model.rotation}
                scale={model.scale}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}
            >
                <primitive object={clone} />

                {/* Selection indicator */}
                {isSelected && (
                    <mesh>
                        <sphereGeometry args={[1.2, 16, 16]} />
                        <meshBasicMaterial color="#FFD700" wireframe transparent opacity={0.3} />
                    </mesh>
                )}
            </group>

            {/* TransformControls for selected model */}
            {isSelected && groupRef.current && (
                <TransformControls
                    object={groupRef.current}
                    mode={transformMode}
                    onObjectChange={() => {
                        if (groupRef.current) {
                            const pos = groupRef.current.position;
                            const rot = groupRef.current.rotation;
                            const scl = groupRef.current.scale.x;
                            onTransformChange(
                                [pos.x, pos.y, pos.z],
                                [rot.x, rot.y, rot.z],
                                scl
                            );
                        }
                    }}
                />
            )}
        </>
    );
}

// === DYNAMIC TUNNEL ===
function DynamicTunnel({ settings }: { settings: SceneSettings }) {
    const { scene } = useGLTF('/models/tech_tunnel.glb');

    return (
        <group>
            {Array.from({ length: settings.tunnelCount }).map((_, i) => {
                const clone = scene.clone();
                return (
                    <group
                        key={i}
                        position={[0, 0, -i * settings.tunnelSpacing]}
                        rotation={[0, 0, i * 0.25]}
                    >
                        <primitive object={clone} scale={5} />
                    </group>
                );
            })}
        </group>
    );
}

// === DEBRIS ===
function FloatingDebris({ settings }: { settings: SceneSettings }) {
    const { scene } = useGLTF('/models/debris.glb');

    const debrisPositions = useMemo(() => {
        return Array.from({ length: Math.floor(settings.tunnelCount / 2) }).map((_, i) => ({
            x: (Math.sin(i * 1.7) * 3),
            y: (Math.cos(i * 2.3) * 3),
            z: -i * settings.tunnelSpacing * 2 - 5
        }));
    }, [settings.tunnelCount, settings.tunnelSpacing]);

    return (
        <group>
            {debrisPositions.map((pos, i) => (
                <Float key={i} speed={2} rotationIntensity={2}>
                    <primitive
                        object={scene.clone()}
                        scale={0.2}
                        position={[pos.x, pos.y, pos.z]}
                    />
                </Float>
            ))}
        </group>
    );
}

// === EDITOR SCENE ===
function EditorScene({
    sceneState,
    onModelSelect,
    onModelTransform,
    transformMode
}: {
    sceneState: SceneState;
    onModelSelect: (id: string | null) => void;
    onModelTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: number) => void;
    transformMode: 'translate' | 'rotate' | 'scale';
}) {
    return (
        <>
            {/* Background & Fog */}
            <color attach="background" args={['#050505']} />
            <fog attach="fog" args={['#050505', 5, sceneState.settings.fogDensity]} />

            {/* Lighting */}
            <ambientLight intensity={sceneState.settings.ambientIntensity} />
            <pointLight
                position={[0, 5, 0]}
                color={sceneState.settings.lightColor}
                intensity={10}
                distance={40}
            />
            <pointLight
                position={[0, 0, -30]}
                color={sceneState.settings.lightColor}
                intensity={15}
                distance={35}
            />
            <pointLight
                position={[0, 0, -60]}
                color={sceneState.settings.lightColor}
                intensity={10}
                distance={30}
            />

            <Environment preset="night" />

            {/* Orbit Controls */}
            <OrbitControls makeDefault />

            {/* Click background to deselect */}
            <mesh
                position={[0, 0, -50]}
                onClick={() => onModelSelect(null)}
                visible={false}
            >
                <planeGeometry args={[200, 200]} />
            </mesh>

            {/* Dynamic Tunnel */}
            <DynamicTunnel settings={sceneState.settings} />

            {/* Floating Debris */}
            <FloatingDebris settings={sceneState.settings} />

            {/* Draggable Models */}
            {sceneState.models.map((model) => (
                <DraggableModel
                    key={model.id}
                    model={model}
                    isSelected={sceneState.selectedModelId === model.id}
                    onSelect={() => onModelSelect(model.id)}
                    onTransformChange={(pos, rot, scale) => onModelTransform(model.id, pos, rot, scale)}
                    transformMode={transformMode}
                />
            ))}

            {/* Sparkles at destination */}
            <Sparkles
                count={150}
                scale={15}
                size={4}
                speed={0.3}
                color={sceneState.settings.lightColor}
                position={[0, 0, -(sceneState.settings.tunnelCount * sceneState.settings.tunnelSpacing) - 5]}
            />
        </>
    );
}

// === MODEL LIST PANEL ===
function ModelList({
    models,
    selectedId,
    onSelect,
    onToggleVisibility
}: {
    models: ModelState[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onToggleVisibility: (id: string) => void;
}) {
    return (
        <div className="absolute top-4 left-4 w-56 bg-black/80 backdrop-blur rounded-xl border border-white/10 overflow-hidden">
            <div className="px-3 py-2 bg-white/5 border-b border-white/10">
                <span className="text-white/70 text-xs font-medium">📦 Scene Objects</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {models.map((model) => (
                    <div
                        key={model.id}
                        onClick={() => onSelect(model.id)}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${selectedId === model.id ? 'bg-cyan-500/20 border-l-2 border-cyan-400' : 'hover:bg-white/5'
                            }`}
                    >
                        <span className={`text-sm ${model.visible ? 'text-white' : 'text-white/40'}`}>
                            {model.displayName}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleVisibility(model.id);
                            }}
                            className={`text-xs px-2 py-0.5 rounded ${model.visible
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                        >
                            {model.visible ? '👁️' : '🚫'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// === TRANSFORM MODE SELECTOR ===
function TransformModeSelector({
    mode,
    onChange
}: {
    mode: 'translate' | 'rotate' | 'scale';
    onChange: (mode: 'translate' | 'rotate' | 'scale') => void;
}) {
    const modes = [
        { key: 'translate', icon: '↔️', label: 'Move' },
        { key: 'rotate', icon: '🔄', label: 'Rotate' },
        { key: 'scale', icon: '📐', label: 'Scale' },
    ] as const;

    return (
        <div className="absolute top-4 left-64 flex gap-1 bg-black/80 backdrop-blur rounded-lg p-1 border border-white/10">
            {modes.map((m) => (
                <button
                    key={m.key}
                    onClick={() => onChange(m.key)}
                    className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${mode === m.key
                            ? 'bg-cyan-500/30 text-cyan-300'
                            : 'text-white/60 hover:bg-white/10'
                        }`}
                >
                    <span>{m.icon}</span>
                    {m.label}
                </button>
            ))}
        </div>
    );
}

// === MAIN EDITOR COMPONENT ===
export default function RizikEditor() {
    // Scene State
    const [sceneState, setSceneState] = useState<SceneState>({
        models: INITIAL_MODELS,
        settings: INITIAL_SETTINGS,
        selectedModelId: null
    });

    // Transform mode
    const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');

    // AI State
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiStatus, setAiStatus] = useState<string>("");

    // Leva Controls for Settings
    useControls({
        'Tunnel': folder({
            'Ring Count': {
                value: sceneState.settings.tunnelCount,
                min: 5, max: 80, step: 1,
                onChange: (v) => setSceneState(s => ({ ...s, settings: { ...s.settings, tunnelCount: v } }))
            },
            'Ring Spacing': {
                value: sceneState.settings.tunnelSpacing,
                min: 2, max: 15, step: 0.5,
                onChange: (v) => setSceneState(s => ({ ...s, settings: { ...s.settings, tunnelSpacing: v } }))
            },
        }),
        'Lighting': folder({
            'Color': {
                value: sceneState.settings.lightColor,
                onChange: (v) => setSceneState(s => ({ ...s, settings: { ...s.settings, lightColor: v } }))
            },
            'Ambient': {
                value: sceneState.settings.ambientIntensity,
                min: 0.1, max: 1, step: 0.05,
                onChange: (v) => setSceneState(s => ({ ...s, settings: { ...s.settings, ambientIntensity: v } }))
            },
            'Fog Distance': {
                value: sceneState.settings.fogDensity,
                min: 10, max: 60, step: 5,
                onChange: (v) => setSceneState(s => ({ ...s, settings: { ...s.settings, fogDensity: v } }))
            },
        }),
        'Quick Presets': folder({
            '🔴 Horror': button(() => applyPreset('horror')),
            '🔵 Cyber': button(() => applyPreset('cyber')),
            '🟡 Golden': button(() => applyPreset('golden')),
            '🟣 Mystic': button(() => applyPreset('mystic')),
        }),
        'Scene': folder({
            '🔄 Reset All': button(() => {
                setSceneState({
                    models: INITIAL_MODELS,
                    settings: INITIAL_SETTINGS,
                    selectedModelId: null
                });
            }),
        }),
    });

    // Preset handler
    const applyPreset = (preset: string) => {
        const presets: Record<string, Partial<SceneSettings>> = {
            horror: { lightColor: '#ff0000', fogDensity: 12, ambientIntensity: 0.15, tunnelCount: 40 },
            cyber: { lightColor: '#00ffff', fogDensity: 25, ambientIntensity: 0.5, tunnelCount: 20 },
            golden: { lightColor: '#FFD700', fogDensity: 30, ambientIntensity: 0.6, tunnelCount: 15 },
            mystic: { lightColor: '#8B5CF6', fogDensity: 20, ambientIntensity: 0.4, tunnelCount: 25 },
        };
        if (presets[preset]) {
            setSceneState(s => ({ ...s, settings: { ...s.settings, ...presets[preset] } }));
        }
    };

    // Model selection
    const handleModelSelect = useCallback((id: string | null) => {
        setSceneState(s => ({ ...s, selectedModelId: id }));
    }, []);

    // Model transform
    const handleModelTransform = useCallback((
        id: string,
        position: [number, number, number],
        rotation: [number, number, number],
        scale: number
    ) => {
        setSceneState(s => ({
            ...s,
            models: s.models.map(m =>
                m.id === id ? { ...m, position, rotation, scale } : m
            )
        }));
    }, []);

    // Toggle visibility
    const handleToggleVisibility = useCallback((id: string) => {
        setSceneState(s => ({
            ...s,
            models: s.models.map(m =>
                m.id === id ? { ...m, visible: !m.visible } : m
            )
        }));
    }, []);

    // AI Scene Generation
    const handleAIPrompt = useCallback(async () => {
        if (!prompt.trim()) return;

        setIsProcessing(true);
        setAiStatus("🤖 AI is thinking...");

        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    currentScene: {
                        models: sceneState.models,
                        settings: sceneState.settings
                    }
                })
            });

            const data = await response.json();

            if (data.success && data.scene) {
                // Apply new settings
                if (data.scene.settings) {
                    setSceneState(s => ({
                        ...s,
                        settings: { ...s.settings, ...data.scene.settings }
                    }));
                }

                // Apply new model positions if provided
                if (data.scene.models) {
                    setSceneState(s => ({
                        ...s,
                        models: s.models.map(existing => {
                            const newData = data.scene.models.find((m: any) => m.name === existing.name);
                            if (newData) {
                                return {
                                    ...existing,
                                    position: newData.position || existing.position,
                                    rotation: newData.rotation || existing.rotation,
                                    scale: newData.scale || existing.scale,
                                    visible: newData.visible ?? existing.visible
                                };
                            }
                            return existing;
                        })
                    }));
                }

                setAiStatus(`✅ Scene updated via ${data.source}`);
            }

            setPrompt("");
        } catch (error) {
            console.error("AI Error:", error);
            setAiStatus("❌ AI error - using fallback");
        } finally {
            setIsProcessing(false);
            setTimeout(() => setAiStatus(""), 3000);
        }
    }, [prompt, sceneState]);

    return (
        <div className="w-full h-screen bg-[#050505] relative overflow-hidden">
            {/* Leva Panel */}
            <Leva
                collapsed={false}
                titleBar={{ title: '🎛️ Rizik 3D Studio' }}
                theme={{
                    sizes: { rootWidth: '280px' },
                    colors: { accent1: '#FFD700', accent2: '#06B6D4' }
                }}
            />

            {/* 3D Canvas */}
            <Canvas
                camera={{ position: [0, 5, 15], fov: 60 }}
                gl={{ antialias: true }}
            >
                <Suspense fallback={null}>
                    <EditorScene
                        sceneState={sceneState}
                        onModelSelect={handleModelSelect}
                        onModelTransform={handleModelTransform}
                        transformMode={transformMode}
                    />
                </Suspense>
            </Canvas>

            {/* Model List Panel */}
            <ModelList
                models={sceneState.models}
                selectedId={sceneState.selectedModelId}
                onSelect={handleModelSelect}
                onToggleVisibility={handleToggleVisibility}
            />

            {/* Transform Mode Selector */}
            <TransformModeSelector
                mode={transformMode}
                onChange={setTransformMode}
            />

            {/* Editor Mode Badge */}
            <div className="absolute top-4 left-[420px] px-4 py-2 bg-amber-500/20 backdrop-blur rounded-full border border-amber-500/30">
                <span className="text-amber-400 text-sm font-medium">🎨 Editor Mode</span>
            </div>

            {/* Selected Model Info */}
            {sceneState.selectedModelId && (
                <div className="absolute top-20 left-4 w-56 bg-black/80 backdrop-blur rounded-xl border border-cyan-500/30 p-3">
                    <p className="text-cyan-400 text-xs mb-2">Selected Model</p>
                    <p className="text-white font-medium">
                        {sceneState.models.find(m => m.id === sceneState.selectedModelId)?.displayName}
                    </p>
                    <p className="text-white/50 text-xs mt-2">
                        Use gizmo to {transformMode}
                    </p>
                </div>
            )}

            {/* AI Command Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl">
                {/* AI Status */}
                {aiStatus && (
                    <div className="text-center mb-2">
                        <span className="text-sm text-cyan-400">{aiStatus}</span>
                    </div>
                )}

                <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAIPrompt()}
                            placeholder="Tell AI: 'Make a horror tunnel' or 'Golden endless passage' or 'Cyber blue neon'..."
                            className="flex-1 bg-white/5 text-white px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-cyan-500/50 transition-colors placeholder-gray-500"
                            disabled={isProcessing}
                        />
                        <button
                            onClick={handleAIPrompt}
                            disabled={isProcessing}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-2 min-w-[140px] justify-center"
                        >
                            {isProcessing ? (
                                <><span className="animate-spin">⚙️</span> Processing</>
                            ) : (
                                <>🤖 Generate</>
                            )}
                        </button>
                    </div>

                    {/* Quick Prompts */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {['Horror tunnel', 'Endless blue', 'Golden warm', 'Purple mystic', 'Tight compact'].map((q) => (
                            <button
                                key={q}
                                onClick={() => setPrompt(q)}
                                className="px-3 py-1 bg-white/5 text-white/60 text-xs rounded-full hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Help */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-white/40 text-xs text-center">
                <p>🖱️ Click model to select • Drag gizmo to transform • Use panel on right for settings</p>
            </div>
        </div>
    );
}

// Preload models
useGLTF.preload('/models/tech_tunnel.glb');
useGLTF.preload('/models/debris.glb');
useGLTF.preload('/models/organic_portal.glb');
useGLTF.preload('/models/real_bee.glb');
useGLTF.preload('/models/cyborg_honeycomb.glb');
useGLTF.preload('/models/cyborg_bee.glb');
useGLTF.preload('/models/drone_eye.glb');
useGLTF.preload('/models/projector.glb');
