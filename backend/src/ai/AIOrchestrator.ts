
import { generate_daily_rota } from '../services/OperationalEngine'
import { get_squad_financial_health } from '../services/FinancialAccountability'
// import { request_swap_task } from '../services/ResilienceEngine' // Assuming this exists or we mock it

// Tool Definitions for Llama 3.1
const TOOLS = [
    {
        name: 'assign_duty_rota',
        description: 'Generates and assigns the duty rota for a specific date. Use this when the user wants to set up duties or "start the day".',
        parameters: {
            type: 'object',
            properties: {
                squad_id: { type: 'string', description: 'The ID of the squad' },
                date: { type: 'string', description: 'The date for the rota in YYYY-MM-DD format' }
            },
            required: ['squad_id', 'date']
        }
    },
    {
        name: 'check_financial_health',
        description: 'Retrieves the current financial health, tohobil balance, and rent due status. Use this when the user asks about money, rent, or funds.',
        parameters: {
            type: 'object',
            properties: {
                squad_id: { type: 'string', description: 'The ID of the squad' }
            },
            required: ['squad_id']
        }
    },
    {
        name: 'request_swap_task',
        description: 'Initiates a request to swap a specific duty task with another member. Use this when a user wants to change their duty.',
        parameters: {
            type: 'object',
            properties: {
                squad_id: { type: 'string', description: 'The ID of the squad' },
                user_id: { type: 'string', description: 'The ID of the user requesting the swap' },
                task_id: { type: 'string', description: 'The ID of the task/duty to swap' }
            },
            required: ['squad_id', 'user_id', 'task_id']
        }
    },
    {
        name: 'manage_squad',
        description: 'Perform administrative actions on the squad like inviting, removing, or promoting members.',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['invite', 'kick', 'promote'],
                    description: 'The action to perform'
                },
                target_name: {
                    type: 'string',
                    description: 'The name of the user to act upon (e.g., "Rahim")'
                }
            },
            required: ['action', 'target_name']
        }
    },
    {
        name: 'update_student_profile',
        description: 'Updates the student\'s academic profile with their department and skills. Use this when a user mentions their study field or skills.',
        parameters: {
            type: 'object',
            properties: {
                department: {
                    type: 'string',
                    description: 'The department or major of the student (e.g., "CSE", "Law")'
                },
                skills: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of skills mentioned by the user (e.g., ["Python", "Legal Drafting"])'
                }
            },
            required: ['department', 'skills']
        }
    },
    {
        name: 'post_gig',
        description: 'Posts a new gig or job when a user describes a problem or need. Extracts the department context automatically.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Short title of the gig (e.g., "Draft Rental Agreement")' },
                description: { type: 'string', description: 'Detailed description of the problem' },
                budget: { type: 'number', description: 'Estimated budget for the task' },
                required_department: { type: 'string', description: 'The department best suited to solve this (e.g., "Law", "CSE")' }
            },
            required: ['title', 'description', 'budget', 'required_department']
        }
    },
    {
        name: 'accept_gig',
        description: 'Accepts a gig or job. This locks the budget in escrow and assigns the user to the gig.',
        parameters: {
            type: 'object',
            properties: {
                gig_id: { type: 'string', description: 'The ID of the gig to accept' },
                user_name: { type: 'string', description: 'The name of the user accepting the gig' }
            },
            required: ['gig_id', 'user_name']
        }
    },
    {
        name: 'get_join_screen',
        description: 'Returns the SDUI JSON for the Join Squad screen.',
        parameters: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'get_tribunal_card',
        description: 'Returns the SDUI JSON for the Tribunal Alert Card.',
        parameters: {
            type: 'object',
            properties: {},
            required: []
        }
    }
]

export async function orchestrateAI(
    ai: any, // Cloudflare AI Binding
    supabaseUrl: string,
    supabaseKey: string,
    userMessage: string,
    squadId: string,
    userId: string
) {
    console.log(`[AI Orchestrator] Processing: "${userMessage}" for Squad: ${squadId}`)

    const systemPrompt = `You are the "Squad OS AI", a helpful assistant for managing a shared living squad. 
    You have access to tools to manage duties, finances, and conflicts.
    If the user asks to do something that requires a tool, call that tool.
    If the user just wants to chat, reply helpfully.
    Current Squad ID: ${squadId}
    Current User ID: ${userId}`

    try {
        // 1. Call Llama 3.1 with Tools
        const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            tools: TOOLS,
            tool_choice: 'auto' // Let the model decide
        })

        // 2. Check for Tool Calls
        if (response.tool_calls && response.tool_calls.length > 0) {
            const toolCall = response.tool_calls[0]
            const toolName = toolCall.name
            const toolArgs = toolCall.arguments

            console.log(`[AI Orchestrator] Tool Selected: ${toolName}`, toolArgs)

            let toolResult = null

            // 3. Execute Backend Service
            if (toolName === 'assign_duty_rota') {
                toolResult = await generate_daily_rota(
                    supabaseUrl,
                    supabaseKey,
                    toolArgs.squad_id,
                    toolArgs.date
                )
            } else if (toolName === 'check_financial_health') {
                toolResult = await get_squad_financial_health(
                    supabaseUrl,
                    supabaseKey,
                    toolArgs.squad_id
                )
            } else if (toolName === 'request_swap_task') {
                // Mocking the swap logic as it wasn't explicitly implemented in previous steps
                // or we'd import it if it was.
                toolResult = { status: 'swap_requested', message: 'Swap request sent to pool.' }
            } else if (toolName === 'manage_squad') {
                // Execute Squad Management Logic
                // In a real app, we would call SquadService.ts functions here.

                // Simulate action
                const actionMessage = `Successfully executed ${toolArgs.action} on ${toolArgs.target_name}`;

                // GENERATE NEW SDUI DASHBOARD JSON
                // This is the "Visual Brain" part. The AI (or logic) decides what the screen looks like.
                const newDashboardJson = {
                    type: "screen",
                    appBar: {
                        title: "Squad Dashboard",
                        backgroundColor: "#FFFFFF",
                        foregroundColor: "#000000"
                    },
                    child: {
                        type: "column",
                        padding: 16,
                        children: [
                            {
                                type: "rizik_gradient_card",
                                data: {
                                    title: "Squad Status",
                                    subtitle: "Active • 2 Members Online",
                                    gradientColors: ["#6200EE", "#B00020"],
                                    icon: "groups"
                                }
                            },
                            { type: "sized_box", height: 24 },
                            {
                                type: "text",
                                text: "Members",
                                fontSize: 18,
                                fontWeight: "bold"
                            },
                            { type: "sized_box", height: 16 },
                            {
                                type: "row",
                                mainAxisAlignment: "spaceAround",
                                children: [
                                    {
                                        type: "column",
                                        children: [
                                            { type: "icon", icon: "person", size: 40, color: "#6200EE" },
                                            { type: "text", text: "You" }
                                        ]
                                    },
                                    {
                                        type: "column",
                                        children: [
                                            { type: "icon", icon: "person", size: 40, color: "#6200EE" },
                                            { type: "text", text: toolArgs.target_name } // The new member!
                                        ]
                                    }
                                ]
                            },
                            { type: "sized_box", height: 32 },
                            {
                                type: "rizik_tribunal_case", // The Tribunal Card
                                data: {
                                    accusedName: toolArgs.target_name, // Dynamic!
                                    issue: "Just joined. No issues yet.",
                                    votes: 0
                                }
                            }
                        ]
                    }
                };

                // SIGNAL SQUAD CORE TO BROADCAST UI UPDATE
                // We need to find the Squad DO. 
                // Note: In this function we don't have direct access to `c.env` or `idFromName` easily 
                // unless we pass it or use a fetch to the worker itself.
                // For simplicity in this architecture, we will assume `ai` object or context allows it, 
                // OR we return the `ui_update` in the result and let the calling Worker (index.ts) handle the broadcast.

                // Let's return it in the result, and update index.ts to handle `ui_update_payload`.

                toolResult = {
                    success: true,
                    action: toolArgs.action,
                    target: toolArgs.target_name,
                    message: actionMessage,
                    ui_update_payload: newDashboardJson // Pass this back to index.ts
                }
            } else if (toolName === 'update_student_profile') {
                // Execute Profile Update Logic
                // In real app: await supabase.from('user_profiles').update(...)

                const department = toolArgs.department;
                const skills = toolArgs.skills.join(', ');
                const actionMessage = `Updated profile: ${department} Student with skills: ${skills}`;

                // GENERATE BADGE UI JSON (The Visual Reward)
                const newDashboardJson = {
                    type: "screen",
                    appBar: {
                        title: "Squad Dashboard",
                        backgroundColor: "#FFFFFF",
                        foregroundColor: "#000000"
                    },
                    child: {
                        type: "column",
                        padding: 16,
                        children: [
                            {
                                type: "rizik_gradient_card",
                                data: {
                                    title: "Squad Status",
                                    subtitle: "Active • 2 Members Online",
                                    gradientColors: ["#6200EE", "#B00020"],
                                    icon: "groups"
                                }
                            },
                            { type: "sized_box", height: 24 },
                            // THE NEW BADGE WIDGET
                            {
                                type: "rizik_glass_card", // Using Glass Card for premium feel
                                data: {
                                    title: `Verified ${department} Student`,
                                    subtitle: `Skills: ${skills}`,
                                    icon: "school",
                                    iconColor: "#FFD700", // Gold
                                    backgroundColor: "#006400" // Dark Green
                                }
                            },
                            { type: "sized_box", height: 24 },
                            {
                                type: "text",
                                text: "Members",
                                fontSize: 18,
                                fontWeight: "bold"
                            },
                            { type: "sized_box", height: 16 },
                            {
                                type: "row",
                                mainAxisAlignment: "spaceAround",
                                children: [
                                    {
                                        type: "column",
                                        children: [
                                            { type: "icon", icon: "person", size: 40, color: "#6200EE" },
                                            { type: "text", text: "You" }
                                        ]
                                    },
                                    {
                                        type: "column",
                                        children: [
                                            { type: "icon", icon: "person", size: 40, color: "#6200EE" },
                                            { type: "text", text: "Rahim" }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                };

                toolResult = {
                    success: true,
                    action: 'update_profile',
                    department: department,
                    skills: toolArgs.skills,
                    message: actionMessage,
                    ui_update_payload: newDashboardJson
                }
            } else if (toolName === 'post_gig') {
                // Execute Post Gig Logic
                // In real app: await supabase.from('gigs').insert(...)

                const title = toolArgs.title;
                const dept = toolArgs.required_department;
                const budget = toolArgs.budget;
                const actionMessage = `Posted Gig: "${title}" for ${dept} Department (Budget: ৳${budget})`;

                // GENERATE DASHBOARD JSON FOR SEEKER (Confirmation)
                // Or if we want to simulate the "Student View", we might need to know who the current user is.
                // For this demo, let's assume we are updating the dashboard to show the "Posted" state 
                // OR if the user switches roles, they see it.

                // Let's create a "Gig Market" view for the dashboard update
                const newDashboardJson = {
                    type: "screen",
                    appBar: {
                        title: "Gig Market",
                        backgroundColor: "#FFFFFF",
                        foregroundColor: "#000000"
                    },
                    child: {
                        type: "column",
                        padding: 16,
                        children: [
                            {
                                type: "rizik_gradient_card",
                                data: {
                                    title: "Gig Posted Successfully",
                                    subtitle: `Target: ${dept} Students`,
                                    gradientColors: ["#00C853", "#64DD17"],
                                    icon: "check_circle"
                                }
                            },
                            { type: "sized_box", height: 24 },
                            {
                                type: "text",
                                text: "Live Gigs",
                                fontSize: 18,
                                fontWeight: "bold"
                            },
                            { type: "sized_box", height: 16 },
                            // THE GIG CARD (Simulated "Feed")
                            {
                                type: "rizik_mission_offer", // Reusing Mission Offer as Gig Card
                                data: {
                                    title: title,
                                    subtitle: toolArgs.description,
                                    reward: `৳${budget}`,
                                    location: "Online / Hybrid",
                                    distance: "N/A",
                                    icon: "work"
                                }
                            }
                        ]
                    }
                };

                toolResult = {
                    success: true,
                    action: 'post_gig',
                    title: title,
                    department: dept,
                    message: actionMessage,
                    ui_update_payload: newDashboardJson
                }
            } else if (toolName === 'accept_gig') {
                // Execute Accept Gig Logic
                // In real app: 
                // 1. Update gig status to 'in_progress'
                // 2. Set assigned_to = user_id
                // 3. Lock funds in escrow_balance

                const gigId = toolArgs.gig_id;
                const userName = toolArgs.user_name;
                const actionMessage = `Gig Accepted by ${userName}. Funds Locked in Escrow.`;

                // GENERATE DASHBOARD JSON FOR STUDENT (Mission Active)
                const newDashboardJson = {
                    type: "screen",
                    appBar: {
                        title: "Active Mission",
                        backgroundColor: "#000000",
                        foregroundColor: "#FFFFFF"
                    },
                    child: {
                        type: "column",
                        padding: 16,
                        children: [
                            {
                                type: "rizik_gradient_card",
                                data: {
                                    title: "Mission Active",
                                    subtitle: "Funds Locked in Escrow",
                                    gradientColors: ["#FFD700", "#FF8C00"], // Gold/Orange for Action
                                    icon: "bolt"
                                }
                            },
                            { type: "sized_box", height: 24 },
                            {
                                type: "text",
                                text: "Current Objectives",
                                fontSize: 18,
                                fontWeight: "bold"
                            },
                            { type: "sized_box", height: 16 },
                            {
                                type: "rizik_mission_offer",
                                data: {
                                    title: "Draft Rental Agreement", // Hardcoded for demo flow
                                    subtitle: "Client: Seeker • Deadline: 24h",
                                    reward: "৳5000 (Locked)",
                                    location: "Online",
                                    distance: "Active",
                                    icon: "gavel"
                                }
                            },
                            { type: "sized_box", height: 24 },
                            {
                                type: "button",
                                action: { type: "API_CALL", method: "POST", url: "/api/gig/complete" }, // Placeholder
                                child: {
                                    type: "text",
                                    text: "Mark as Complete",
                                    color: "white",
                                    fontWeight: "bold"
                                },
                                padding: 16,
                                color: "#00C853",
                                margin: 0
                            }
                        ]
                    }
                };

                toolResult = {
                    success: true,
                    action: 'accept_gig',
                    gig_id: gigId,
                    assigned_to: userName,
                    message: actionMessage,
                    ui_update_payload: newDashboardJson
                }
            } else if (toolName === 'get_join_screen') {
                // GENERATE JOIN SCREEN SDUI JSON
                const joinScreenJson = {
                    type: "screen",
                    appBar: {
                        title: "Join a Squad",
                        backgroundColor: "#FFFFFF",
                        foregroundColor: "#000000"
                    },
                    child: {
                        type: "column",
                        padding: 24,
                        mainAxisAlignment: "center",
                        children: [
                            {
                                type: "icon",
                                icon: "groups",
                                size: 80,
                                color: "#6200EE"
                            },
                            { type: "sized_box", height: 32 },
                            {
                                type: "text",
                                text: "Enter Invite Code",
                                fontSize: 24,
                                fontWeight: "bold",
                                textAlign: "center"
                            },
                            { type: "sized_box", height: 16 },
                            {
                                type: "text",
                                text: "Ask your squad leader for the code (e.g., RZK-DHAKA-42)",
                                fontSize: 14,
                                color: "grey",
                                textAlign: "center"
                            },
                            { type: "sized_box", height: 32 },
                            {
                                type: "input_field",
                                hint: "RZK-XXXX-XX",
                                label: "Invite Code", // Used as ID for FormStateManager
                                filled: true,
                                fillColor: "#F5F5F5"
                            },
                            { type: "sized_box", height: 16 },
                            {
                                type: "button",
                                action: { type: "PASTE_CLIPBOARD", targetId: "Invite Code" }, // Matches label
                                child: {
                                    type: "row",
                                    mainAxisAlignment: "center",
                                    children: [
                                        { type: "icon", icon: "content_paste", color: "#6200EE" },
                                        { type: "sized_box", width: 8 },
                                        { type: "text", text: "Paste from Clipboard", color: "#6200EE" }
                                    ]
                                },
                                padding: 12,
                                color: "#F3E5F5", // Light Purple
                                margin: 0
                            },
                            { type: "sized_box", height: 32 },
                            {
                                type: "button",
                                action: {
                                    type: "API_CALL",
                                    method: "POST",
                                    url: "/api/squad/join",
                                    body: {
                                        invite_code: "${Invite Code}" // Matches label
                                    }
                                },
                                child: {
                                    type: "text",
                                    text: "Join Squad",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: 18
                                },
                                padding: 16,
                                color: "#6200EE",
                                margin: 0
                            }
                        ]
                    }
                };

                toolResult = {
                    success: true,
                    action: 'get_join_screen',
                    message: "Here is the Join Squad screen.",
                    ui_update_payload: joinScreenJson
                }
            } else if (toolName === 'get_tribunal_card') {
                // GENERATE TRIBUNAL CARD SDUI JSON
                // This simulates a "Red Alert" card for a dispute
                const tribunalCardJson = {
                    type: "squad_tribunal_card", // Custom widget we already have or will refine
                    data: {
                        title: "TRIBUNAL IN SESSION",
                        subtitle: "Dispute #404: Raju missed Bazar Duty",
                        accusedName: "Raju",
                        accuserName: "Karim",
                        reason: "Missed Bazar Duty on Friday",
                        status: "VOTING",
                        timeLeft: "2h 30m",
                        disputeId: "dispute-123", // Mock ID
                        votes: {
                            guilty: 1,
                            innocent: 0,
                            required: 3
                        }
                    }
                };

                toolResult = {
                    success: true,
                    action: 'get_tribunal_card',
                    message: "Tribunal Alert! A dispute requires your vote.",
                    ui_update_payload: {
                        // Injecting into Maker Dashboard (simulated update)
                        type: "update_component",
                        targetId: "tribunal_section", // Assuming we have a placeholder
                        component: tribunalCardJson
                    }
                }
            }

            // 4. Return Result (or feed back to LLM for final summary - simplified here)
            return {
                type: 'action_result',
                tool: toolName,
                result: toolResult,
                ai_response: `Executed ${toolName} successfully.`
            }
        }

        // 5. No Tool Call -> Return Text Response
        return {
            type: 'chat_response',
            message: response.response || "I'm not sure how to help with that yet."
        }

    } catch (e: any) {
        console.error('[AI Orchestrator] Error:', e)
        return { error: e.message }
    }
}
