import { generate_daily_rota } from '../services/OperationalEngine'
import { get_squad_financial_health } from '../services/FinancialAccountability'
import { ServiceRegistry } from '../services/ServiceRegistry'
import { createClient } from '@supabase/supabase-js'

// --- INTERFACES FOR TYPE SAFETY ---
export interface UserContext {
    name: string;
    role: 'admin' | 'member';
    department?: string;
}

export interface SquadContext {
    name: string;
    memberCount: number;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// --- TOOLS DEFINITION ---
const TOOLS = [
    {
        name: 'assign_duty_rota',
        description: 'Generates duties for the day. Use ONLY when user explicitly asks to "start the day", "assign duties", or "who does what today".',
        parameters: {
            type: 'object',
            properties: {
                date: { type: 'string', description: 'YYYY-MM-DD format. Default to today.' }
            },
            required: ['date']
        }
    },
    {
        name: 'check_financial_health',
        description: 'Checks funds/rent. Use ONLY when user explicitly asks about money, balance, rent, or tohobil status.',
        parameters: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'manage_squad_member',
        description: 'Invite, kick, or promote a member. Use ONLY if the user explicitly says "Invite X", "Kick X", or "Promote X". DO NOT use for general questions like "Ki koro".',
        parameters: {
            type: 'object',
            properties: {
                action: { type: 'string', enum: ['invite', 'kick', 'promote'] },
                target_name: { type: 'string' }
            },
            required: ['action', 'target_name']
        }
    },
    {
        name: 'update_student_profile',
        description: 'Save user academic details. Use ONLY if the user explicitly says "I study X" or "My skill is Y". DO NOT use for general questions.',
        parameters: {
            type: 'object',
            properties: {
                department: { type: 'string' },
                skills: { type: 'array', items: { type: 'string' } }
            },
            required: ['department', 'skills']
        }
    },

    {
        name: 'post_gig',
        description: 'Create a job/gig. Use when user has a problem needing a specific skill (e.g. "I need a lawyer").',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                budget: { type: 'number' },
                required_department: { type: 'string' }
            },
            required: ['title', 'description', 'budget', 'required_department']
        }
    },
    {
        name: 'accept_gig',
        description: 'Accepts a gig. Locks budget.',
        parameters: {
            type: 'object',
            properties: {
                gig_id: { type: 'string' },
            },
            required: ['gig_id']
        }
    },
    {
        name: 'get_join_screen',
        description: 'Show the Join Squad UI. Use ONLY if the user explicitly says "I want to join a squad". DO NOT use for "Who are you" or "What do you do".',
        parameters: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'initiate_asset_rental',
        description: 'Rent an asset (Fridge/AC).',
        parameters: {
            type: 'object',
            properties: {
                asset_name: { type: 'string' },
                duration_hours: { type: 'number' }
            },
            required: ['asset_name', 'duration_hours']
        }
    }
];

export async function orchestrateAI(
    ai: any,
    env: any,
    supabaseUrl: string,
    supabaseKey: string,

    // --- NEW PARAMETERS FOR CONTEXT ---
    userMessage: string,
    history: ChatMessage[], // <--- CRITICAL: Pass last ~6 messages here
    squadId: string,
    userId: string,
    userContext: UserContext, // { name: "Rahim", role: "admin" }
    squadContext: SquadContext // { name: "Bachelor Point", memberCount: 4 }
) {
    console.log(`[Rizik OS] Processing for ${userContext.name} in Squad ${squadContext.name}`);

    // 1. THE "PERSONA" SYSTEM PROMPT
    // 1. THE "PERSONA" SYSTEM PROMPT
    const systemPrompt = `
    You are 'Rizik OS', the intelligent AI Manager for the squad "${squadContext.name}".
    You are talking to ${userContext.name} (Role: ${userContext.role}).
    
    YOUR CAPABILITIES (Reference Only):
    1. **Duty Rota**: Assign daily chores (Bazar, Cleaning).
    2. **Finance**: Check Tohobil balance, Rent status.
    3. **Squad Management**: Invite, Kick, or Promote members.
    4. **Gigs**: Post academic gigs or tasks.
    5. **Asset Rental**: Rent items like AC/Fridge within the squad.

    CRITICAL RULES (DO NOT BREAK):
    1. **IDENTITY ONLY**: You are Rizik OS. You are NOT a language assistant. You are NOT a translator.
    2. **NO EXPLANATIONS**: NEVER explain what a Bengali phrase means. NEVER say "roughly translates to".
    3. **DYNAMIC CHAT**: If the user asks "Who are you?" or "What can you do?", DO NOT call a tool. ANSWER naturally using your capabilities list above.
    4. **ASSUME CONVERSATION**: If the user says "Koro ke tumi" (Who are you), answer directly: "Ami Rizik OS..."
    5. **TOOLS**: Only use tools for EXACT actions (e.g., "Assign rota", "Check balance").
    
    FEW-SHOT EXAMPLES:
    - User: "Koro ke tumi" -> You: "Ami Rizik OS bhai. Ami Rota, Hishab, ar Squad manage kori."
    - User: "Ki koro?" -> You: "Ami Squad er sob kaj manage kori. Kono help lagbe?"
    - User: "Tumi kar?" -> You: "Ami ei Squad er jonno banano hoyechi."
    
    CONTEXT:
    - Today is ${new Date().toLocaleDateString()}.
    - User Department: ${userContext.department || "Unknown"}.
    `;

    // 2. BUILD MESSAGE CHAIN WITH HISTORY
    const recentHistory = history.slice(-6);

    const messages = [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
        { role: 'user', content: userMessage }
    ];

    try {
        // 3. CALL LLAMA
        const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: messages,
            tools: TOOLS,
            tool_choice: 'auto'
        });

        // 4. HANDLE TOOL EXECUTION
        if (response.tool_calls && response.tool_calls.length > 0) {
            const toolCall = response.tool_calls[0];
            const toolName = toolCall.name;
            const toolArgs = toolCall.arguments;

            console.log(`[Rizik OS] Action Triggered: ${toolName}`);

            let toolResult = null;
            let humanResponseText = "";

            // --- EXECUTION BLOCKS ---

            if (toolName === 'assign_duty_rota') {
                toolResult = await generate_daily_rota(supabaseUrl, supabaseKey, squadId, toolArgs.date);
                humanResponseText = `Shuvo sokal, ${userContext.name}! ${toolArgs.date} er duty rota generate kore dichi. Dashboard e check koro ke bazar e jabe.`;
                toolResult = { ...toolResult, message: humanResponseText };

            } else if (toolName === 'check_financial_health') {
                const health = await get_squad_financial_health(supabaseUrl, supabaseKey, squadId);
                humanResponseText = `Ei je hishab. Tohobil Balance: ৳${health.tohobil_balance}. Rent Status: ${health.status}.`;
                toolResult = { success: true, message: humanResponseText };

            } else if (toolName === 'manage_squad_member') {
                const target = toolArgs.target_name;
                const action = toolArgs.action;

                if (action === 'kick') humanResponseText = `Thik ache. ${target} ke squad theke ber kore dichi.`;
                else if (action === 'invite') humanResponseText = `${target} ke invite pathiyechi. Join korle janabo.`;
                else humanResponseText = `${target} ke promote kora hoyeche.`;

                // Return UI payload
                const newDashboardJson = {
                    type: "screen",
                    appBar: { title: "Squad Dashboard", backgroundColor: "#FFFFFF", foregroundColor: "#000000" },
                    child: {
                        type: "column",
                        padding: 16,
                        children: [
                            { type: "text", text: `Action: ${action} on ${target}`, fontSize: 18, fontWeight: "bold" }
                        ]
                    }
                };

                toolResult = {
                    success: true,
                    message: humanResponseText,
                    ui_update_payload: newDashboardJson
                };

            } else if (toolName === 'update_student_profile') {
                const { department, skills } = toolArgs;
                // DB Update Logic Here (Simulated)
                const safeSkills = Array.isArray(skills) ? skills.join(', ') : (skills || "General");
                humanResponseText = `Profile update korechi: Tumi ${department} student ar skills holo ${safeSkills}. Gigs pete subidha hobe.`;

                toolResult = {
                    success: true,
                    message: humanResponseText,
                    ui_update_payload: { /* ... Badge UI JSON ... */ }
                };

            } else if (toolName === 'post_gig') {
                const { title, budget, required_department, description } = toolArgs;
                const supabase = createClient(supabaseUrl, supabaseKey);
                const registry = new ServiceRegistry(supabase, env);

                // We assume poster_id is the current userId
                await registry.post_academic_gig(userId, squadId, title, description, budget, required_department);

                humanResponseText = `Gig post kora hoyeche: "${title}". ${required_department} er studentder notify korechi. Budget ৳${budget} lock kora lagbe.`;

                toolResult = {
                    success: true,
                    message: humanResponseText,
                    ui_update_payload: { /* ... Gig Board UI JSON ... */ }
                };

            } else if (toolName === 'get_join_screen') {
                humanResponseText = "Join Squad screen open kore dichi.";
                toolResult = {
                    success: true,
                    message: humanResponseText,
                    ui_update_payload: { /* ... Join Screen JSON ... */ }
                };

            } else if (toolName === 'initiate_asset_rental') {
                const assetName = toolArgs.asset_name;
                const duration = toolArgs.duration_hours;
                const ownerId = toolArgs.owner_id || 'default_owner_id';

                const supabase = createClient(supabaseUrl, supabaseKey);
                const registry = new ServiceRegistry(supabase, env);

                await registry.initiate_asset_rental(userId, ownerId, assetName, 500, squadId);

                humanResponseText = `Rental confirm! Tumi ${assetName} ${duration} ghontar jonno nile. Cost: ৳500.`;

                toolResult = {
                    success: true,
                    message: humanResponseText,
                    ui_update_payload: {
                        type: "toast",
                        message: humanResponseText,
                        color: "green"
                    }
                }
            } else {
                humanResponseText = "Request ta bujhechi, kintu system confirmation er jonno wait korchi.";
                toolResult = { success: true, message: humanResponseText };
            }

            // 5. TWO-STEP THOUGHT LOOP (The "Brain Surgery")
            // Instead of returning raw text, we feed the result back to Llama-3.

            const toolOutputMessage = {
                role: 'tool',
                content: JSON.stringify(toolResult),
                tool_call_id: toolCall.id || 'call_' + Math.random().toString(36).substr(2, 9)
            };

            // Add tool output to history
            messages.push({ role: 'assistant', content: "", tool_calls: [toolCall] } as any);
            messages.push(toolOutputMessage as any);

            // Add the "Synthesis Instruction"
            messages.push({
                role: 'system',
                content: `
                SYSTEM UPDATE: The tool '${toolName}' has been executed successfully.
                RESULT: ${JSON.stringify(toolResult)}
                
                MISSION:
                1. Analyze the result above.
                2. Explain what you just did to the user in a natural, friendly Banglish voice.
                3. Do NOT mention technical IDs or JSON fields.
                4. If the result contains a UI update (like dashboard or join screen), tell the user you are opening it.
                
                EXAMPLE:
                - Tool Result: { success: true, message: "Invited Rahim" }
                - Your Response: "Thik ache boss! Rahim ke invite pathiyechi. Se join korle tomake janabo."
                `
            });

            // Second LLM Call for Final Synthesis
            const synthesisResponse = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
                messages: messages,
                tools: TOOLS, // Keep tools available just in case, but usually not needed here
                tool_choice: 'none' // Force it to just talk now
            });

            const finalAiResponse = synthesisResponse.content || synthesisResponse.response || "Kaj hoyeche, kintu ami thik moto bolte parchi na.";

            return {
                type: 'action_result',
                tool: toolName,
                result: toolResult,
                ai_response: finalAiResponse
            };
        }

        // 6. NO TOOL -> CHAT RESPONSE
        // Fallback to response.response (common in CF AI) or debug info
        const content = response.content || response.response;

        return {
            type: 'chat_response',
            message: content || `[DEBUG] Raw AI Output: ${JSON.stringify(response)}`
        };

    } catch (e: any) {
        console.error('[Rizik OS] Error:', e);
        return {
            type: 'error',
            message: `Error: ${e.message || e}` // <--- Expose error
        };
    }
}
