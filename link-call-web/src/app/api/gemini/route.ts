import { NextRequest, NextResponse } from 'next/server';

// Gemini API for 3D Scene Generation
// Returns JSON with model positions, rotations, scales, and scene settings

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Scene schema for AI to understand
const SCENE_SCHEMA = `
You are a 3D scene generator. You control a scene with these models:
- organic_portal (honeycomb gateway, scale: 2-5)
- real_bee (flying bee, scale: 0.2-0.6)
- tech_tunnel (cylindrical ring, scale: 3-8)
- debris (floating rocks, scale: 0.1-0.5)
- cyborg_honeycomb (futuristic hive, scale: 3-6)
- cyborg_bee (robotic bee, scale: 0.4-1)
- drone_eye (surveillance drone, scale: 0.3-0.8)
- projector (hologram base, scale: 0.5-1.5)

Scene settings:
- lightColor: hex color string
- fogDensity: 10-60
- ambientIntensity: 0.1-1.0
- tunnelCount: 5-80 (how many tech_tunnel rings)
- tunnelSpacing: 2-15 (distance between rings)

Respond ONLY with valid JSON in this exact format:
{
  "models": [
    {
      "name": "model_name",
      "position": [x, y, z],
      "rotation": [rx, ry, rz],
      "scale": number,
      "visible": boolean
    }
  ],
  "settings": {
    "lightColor": "#hexcolor",
    "fogDensity": number,
    "ambientIntensity": number,
    "tunnelCount": number,
    "tunnelSpacing": number
  }
}
`;

export async function POST(request: NextRequest) {
    try {
        const { prompt, currentScene } = await request.json();

        if (!GEMINI_API_KEY) {
            // Fallback to mock responses if no API key
            return NextResponse.json({
                success: true,
                source: 'mock',
                scene: generateMockScene(prompt, currentScene)
            });
        }

        // Build the Gemini prompt
        const systemPrompt = SCENE_SCHEMA + `

Current scene state:
${JSON.stringify(currentScene, null, 2)}

User command: "${prompt}"

Generate the updated scene configuration:`;

        const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON in response');
        }

        const scene = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            success: true,
            source: 'gemini',
            scene
        });

    } catch (error) {
        console.error('Gemini API Error:', error);

        // Fallback to mock on error
        const { prompt, currentScene } = await request.json().catch(() => ({ prompt: '', currentScene: {} }));
        return NextResponse.json({
            success: true,
            source: 'fallback',
            scene: generateMockScene(prompt, currentScene)
        });
    }
}

// Mock scene generator for when API is unavailable
function generateMockScene(prompt: string, currentScene: any) {
    const lowerPrompt = prompt.toLowerCase();

    // Base settings
    let settings = {
        lightColor: currentScene?.settings?.lightColor || '#00ffff',
        fogDensity: currentScene?.settings?.fogDensity || 25,
        ambientIntensity: currentScene?.settings?.ambientIntensity || 0.4,
        tunnelCount: currentScene?.settings?.tunnelCount || 15,
        tunnelSpacing: currentScene?.settings?.tunnelSpacing || 5
    };

    // Horror mode
    if (lowerPrompt.includes('scary') || lowerPrompt.includes('horror') || lowerPrompt.includes('dark')) {
        settings = {
            ...settings,
            lightColor: '#ff0000',
            fogDensity: 12,
            ambientIntensity: 0.15,
            tunnelCount: 40
        };
    }

    // Long tunnel
    if (lowerPrompt.includes('long') || lowerPrompt.includes('endless') || lowerPrompt.includes('infinite')) {
        settings = {
            ...settings,
            tunnelCount: 60,
            tunnelSpacing: 4,
            fogDensity: 35
        };
    }

    // Cyber mode
    if (lowerPrompt.includes('cyber') || lowerPrompt.includes('blue') || lowerPrompt.includes('neon')) {
        settings = {
            ...settings,
            lightColor: '#00ffff',
            fogDensity: 20,
            ambientIntensity: 0.5
        };
    }

    // Golden/warm
    if (lowerPrompt.includes('golden') || lowerPrompt.includes('warm') || lowerPrompt.includes('sunset')) {
        settings = {
            ...settings,
            lightColor: '#FFD700',
            fogDensity: 30,
            ambientIntensity: 0.6
        };
    }

    // Purple
    if (lowerPrompt.includes('purple') || lowerPrompt.includes('magic') || lowerPrompt.includes('mystical')) {
        settings = {
            ...settings,
            lightColor: '#8B5CF6',
            fogDensity: 22,
            ambientIntensity: 0.45
        };
    }

    // Compact
    if (lowerPrompt.includes('compact') || lowerPrompt.includes('tight') || lowerPrompt.includes('dense')) {
        settings = {
            ...settings,
            tunnelSpacing: 2,
            tunnelCount: 30
        };
    }

    // Generate model positions based on settings
    const models = [
        {
            name: 'organic_portal',
            position: [0, -1, 3],
            rotation: [0, 0, 0],
            scale: 3.5,
            visible: true
        },
        {
            name: 'real_bee',
            position: [1.5, 0.5, 1],
            rotation: [0, 0.5, 0],
            scale: 0.4,
            visible: true
        },
        {
            name: 'cyborg_honeycomb',
            position: [0, 0, -(settings.tunnelCount * settings.tunnelSpacing) - 10],
            rotation: [0, 0, 0],
            scale: 4,
            visible: true
        },
        {
            name: 'cyborg_bee',
            position: [-2, 1, -(settings.tunnelCount * settings.tunnelSpacing) - 5],
            rotation: [0, 0.5, 0],
            scale: 0.7,
            visible: true
        },
        {
            name: 'drone_eye',
            position: [3, 0.5, -20],
            rotation: [0, -0.3, 0],
            scale: 0.5,
            visible: true
        },
        {
            name: 'projector',
            position: [0, -2, -(settings.tunnelCount * settings.tunnelSpacing)],
            rotation: [0, 0, 0],
            scale: 0.8,
            visible: true
        }
    ];

    return { models, settings };
}
