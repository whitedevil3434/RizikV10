
import { createClient } from '@supabase/supabase-js'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { cast_vote } from './services/TribunalService';
import { ServiceRegistry } from './services/ServiceRegistry';


type Bindings = {
    SQUAD_DO: DurableObjectNamespace
    CHAT_DO: DurableObjectNamespace
    GIG_DO: DurableObjectNamespace
    SUPABASE_URL: string
    SUPABASE_KEY: string
    AI: any
    CLOUDFLARE_ACCOUNT_ID: string
    CLOUDFLARE_CALLS_APP_ID: string
    CLOUDFLARE_CALLS_APP_SECRET: string
    CLOUDFLARE_API_KEY: string
    REALTIMEKIT_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ... (rest of the file)

// Cloudflare Calls (Rizik Connect)
app.post('/api/connect/session', async (c) => {
    try {
        console.log(`[DEBUG] Account ID: ${c.env.CLOUDFLARE_ACCOUNT_ID}`);
        console.log(`[DEBUG] App ID: ${c.env.CLOUDFLARE_CALLS_APP_ID}`);

        let sessionDescription;
        try {
            const body = await c.req.json();
            sessionDescription = body.sessionDescription;
        } catch (e) {
            // Body might be empty or invalid JSON, ignore
        }

        const result = await create_call_session(
            c.env.CLOUDFLARE_CALLS_APP_ID,
            c.env.CLOUDFLARE_CALLS_APP_SECRET,
            sessionDescription
        );
        return c.json(result);
    } catch (e: any) {
        return c.json({
            error: e.message,
            debug: {
                accountId: c.env.CLOUDFLARE_ACCOUNT_ID,
                appId: c.env.CLOUDFLARE_CALLS_APP_ID
            }
        }, 500);
    }
});

app.post('/api/connect/whip', async (c) => {
    try {
        const body = await c.req.json();
        const { sessionId, sdpOffer, trackType } = body;

        const answer = await handle_whip(
            c.env.CLOUDFLARE_CALLS_APP_ID,
            c.env.CLOUDFLARE_CALLS_APP_SECRET,
            sessionId,
            sdpOffer,
            trackType
        );

        return c.text(answer); // WHIP returns SDP text
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

app.post('/api/connect/whep', async (c) => {
    try {
        const body = await c.req.json();
        const { sessionId, sdpOffer, trackType } = body;

        const answer = await handle_whep(
            c.env.CLOUDFLARE_CALLS_APP_ID,
            c.env.CLOUDFLARE_CALLS_APP_SECRET,
            sessionId,
            sdpOffer,
            trackType
        );

        return c.text(answer); // WHEP returns SDP text
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// RealtimeKit SDK APIs (Official Flutter SDK)
import { create_meeting, add_participant, get_meeting } from './services/RealtimeKitService';
import { create_squad, join_squad } from './services/SquadService';

app.post('/api/realtime/meeting/create', async (c) => {
    try {
        const body = await c.req.json();
        const { meetingName } = body;

        const result = await create_meeting(
            c.env.REALTIMEKIT_API_KEY,
            meetingName || 'Rizik Video Call'
        );
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

app.post('/api/realtime/meeting/:meetingId/participants', async (c) => {
    try {
        const meetingId = c.req.param('meetingId');
        const body = await c.req.json();
        const { participantName, participantId } = body;

        if (!participantName || !participantId) {
            return c.json({ error: 'participantName and participantId required' }, 400);
        }

        const result = await add_participant(
            c.env.REALTIMEKIT_API_KEY,
            meetingId,
            participantName,
            participantId
        );
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

app.get('/api/realtime/meeting/:meetingId', async (c) => {
    try {
        const meetingId = c.req.param('meetingId');
        const result = await get_meeting(c.env.REALTIMEKIT_API_KEY, meetingId);
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// ... (rest of the file)

// Cloudflare Calls (Rizik Connect)


app.use('/*', cors())

app.get('/', (c) => {
    return c.text('Rizik V8 Backend is Running!')
})

import { orchestrateAI, ChatMessage, UserContext, SquadContext } from './ai/AIOrchestrator'

app.post('/api/ai/chat', async (c) => {
    const body = await c.req.json()
    const { message, squad_id, user_id } = body

    if (!message || !squad_id || !user_id) {
        return c.json({ error: 'Missing parameters' }, 400)
    }

    try {
        // --- CONTEXT FETCHING ---
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

        // 1. Fetch User Profile
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('full_name, role, department')
            .eq('id', user_id)
            .maybeSingle();

        const userContext: UserContext = {
            name: userProfile?.full_name || "Squad Member",
            role: (userProfile?.role as 'admin' | 'member') || 'member',
            department: userProfile?.department || "General"
        };

        // 2. Fetch Squad Profile
        const { data: squadProfile } = await supabase
            .from('squads')
            .select('name, member_count')
            .eq('id', squad_id)
            .maybeSingle();

        const squadContext: SquadContext = {
            name: squadProfile?.name || "My Squad",
            memberCount: squadProfile?.member_count || 4
        };

        // 3. Fetch History
        const { data: historyData } = await supabase
            .from('chat_messages')
            .select('role, content')
            .eq('squad_id', squad_id)
            .order('created_at', { ascending: false })
            .limit(6);

        // Reverse to chronological order
        const history: ChatMessage[] = (historyData || []).reverse().map((msg: any) => ({
            role: (['system', 'user', 'assistant'].includes(msg.role) ? msg.role : 'user') as 'system' | 'user' | 'assistant',
            content: msg.content || ""
        }));

        const result = await orchestrateAI(
            c.env.AI,
            c.env,
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            message,
            history,
            squad_id,
            user_id,
            userContext,
            squadContext
        )

        // SAVE INTERACTION TO DB (Memory)
        c.executionCtx.waitUntil((async () => {
            let aiResponseText = "";
            if (result.type === 'chat_response') {
                aiResponseText = result.message;
            } else if (result.type === 'action_result') {
                aiResponseText = result.ai_response || "Action executed.";
            }

            if (aiResponseText) {
                await supabase.from('chat_messages').insert([
                    { squad_id: squad_id, user_id: user_id, role: 'user', content: message },
                    { squad_id: squad_id, user_id: null, role: 'assistant', content: aiResponseText }
                ]);
            }
        })());

        // CHECK FOR UI UPDATE PAYLOAD
        // The result structure from orchestrateAI might be { type: 'action_result', result: { ui_update_payload: ... } }
        // We need to extract it safely.
        let uiPayload = null;
        if (result.type === 'action_result' && result.result && (result.result as any).ui_update_payload) {
            uiPayload = (result.result as any).ui_update_payload;
        }

        if (uiPayload) {
            const idObj = c.env.SQUAD_DO.idFromName(squad_id)
            const stub = c.env.SQUAD_DO.get(idObj)

            // Fire and forget signal to DO
            c.executionCtx.waitUntil(
                stub.fetch(new Request('http://internal/ui-update', {
                    method: 'POST',
                    body: JSON.stringify(uiPayload)
                }))
            )
        }

        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

import { supabase } from './supabase'

app.all('/api/squad/:id/websocket', async (c) => {
    const id = c.req.param('id')
    const idObj = c.env.SQUAD_DO.idFromName(id)
    const stub = c.env.SQUAD_DO.get(idObj)

    // Forward the Upgrade request to the DO
    return stub.fetch(c.req.raw)
})

app.all('/api/squad/:id/:path*', async (c) => {
    const id = c.req.param('id')
    const idObj = c.env.SQUAD_DO.idFromName(id)
    const stub = c.env.SQUAD_DO.get(idObj)
    return stub.fetch(c.req.raw)
})

app.post('/api/auth/signup', async (c) => {
    const body = await c.req.json()
    const { email, password } = body

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    return c.json({ user: data.user, session: data.session })
})

app.post('/api/auth/login', async (c) => {
    const body = await c.req.json()
    const { email, password } = body

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return c.json({ error: error.message }, 401)
    }

    return c.json({ user: data.user, session: data.session })
})

app.get('/api/home', (c) => {
    return c.json({
        type: 'container',
        color: 'white',
        child: {
            type: 'column',
            crossAxisAlignment: 'stretch',
            children: [
                // Header
                {
                    type: 'container',
                    color: '#6200EE',
                    padding: 16,
                    child: {
                        type: 'column',
                        crossAxisAlignment: 'start',
                        children: [
                            {
                                type: 'text',
                                text: 'Rizik V8 (Server Driven)',
                                color: 'white',
                                fontSize: 24,
                                fontWeight: 'bold',
                            },
                            {
                                type: 'text',
                                text: 'Youth Life Operating System',
                                color: 'white',
                                fontSize: 14,
                            },
                        ],
                    },
                },
                // Spacing
                { type: 'sized_box', height: 20 },
                // Categories Title
                {
                    type: 'container',
                    padding: 16,
                    child: {
                        type: 'text',
                        text: 'Explore',
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: 'black',
                    },
                },
                // Categories Row
                {
                    type: 'row',
                    mainAxisAlignment: 'spaceEvenly',
                    children: [
                        {
                            type: 'container',
                            width: 80,
                            height: 80,
                            color: '#FF5722',
                            child: {
                                type: 'center',
                                child: {
                                    type: 'text',
                                    text: 'Major',
                                    color: 'white',
                                    fontWeight: 'bold',
                                },
                            },
                        },
                        {
                            type: 'container',
                            width: 80,
                            height: 80,
                            color: '#4CAF50',
                            child: {
                                type: 'center',
                                child: {
                                    type: 'text',
                                    text: 'League',
                                    color: 'white',
                                    fontWeight: 'bold',
                                },
                            },
                        },
                        {
                            type: 'container',
                            width: 80,
                            height: 80,
                            color: '#2196F3',
                            child: {
                                type: 'center',
                                child: {
                                    type: 'text',
                                    text: 'Bazar',
                                    color: 'white',
                                    fontWeight: 'bold',
                                },
                            },
                        },
                    ],
                },
                // Spacing
                { type: 'sized_box', height: 20 },
                // Feed Item 1
                {
                    type: 'container',
                    margin: 16,
                    padding: 16,
                    color: '#E0E0E0',
                    child: {
                        type: 'column',
                        crossAxisAlignment: 'start',
                        children: [
                            {
                                type: 'text',
                                text: 'Law Student Gig',
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: 'black',
                            },
                            { type: 'sized_box', height: 4 },
                            {
                                type: 'text',
                                text: 'Legal advice for startups',
                                fontSize: 14,
                                color: 'black',
                            },
                        ],
                    },
                },
            ],
        },
    })
})

app.get('/api/gigs', (c) => {
    return c.json({
        type: 'column',
        crossAxisAlignment: 'stretch',
        children: [
            // Header
            {
                type: 'container',
                color: '#6200EE',
                padding: 16,
                child: {
                    type: 'text',
                    text: 'Departmental Gigs',
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold',
                },
            },
            // Filter Row
            {
                type: 'container',
                padding: 16,
                child: {
                    type: 'row',
                    children: [
                        _buildChip('All', true),
                        { type: 'sized_box', width: 8 },
                        _buildChip('Law', false),
                        { type: 'sized_box', width: 8 },
                        _buildChip('Marketing', false),
                        { type: 'sized_box', width: 8 },
                        _buildChip('CS', false),
                    ],
                },
            },
            // Gig List
            {
                type: 'column',
                children: [
                    _buildGigCard(
                        'legal-consultant-1',
                        'Legal Consultant',
                        'Review startup contracts',
                        'Law',
                        '500 BDT',
                        'https://placehold.co/100x100/png?text=Law'
                    ),
                    _buildGigCard(
                        'social-media-manager-1',
                        'Social Media Manager',
                        'Manage IG for cloud kitchen',
                        'Marketing',
                        '1200 BDT',
                        'https://placehold.co/100x100/png?text=Mkt'
                    ),
                    _buildGigCard(
                        'flutter-developer-1',
                        'Flutter Developer',
                        'Fix bugs in Rizik App',
                        'CS',
                        '5000 BDT',
                        'https://placehold.co/100x100/png?text=Code'
                    ),
                ],
            },
        ],
    })
})

app.get('/api/gigs/:id', (c) => {
    const id = c.req.param('id')
    // In a real app, fetch gig data from DB using 'id'
    // For now, returning mock SDUI for the specific gig
    return c.json({
        type: 'column',
        crossAxisAlignment: 'stretch',
        children: [
            // Hero Image Section
            {
                type: 'stack',
                alignment: 'bottomLeft',
                children: [
                    {
                        type: 'image',
                        url: 'https://placehold.co/600x400/png',
                        height: 200,
                        width: 600, // approximate full width
                        fit: 'cover',
                    },
                    {
                        type: 'container',
                        color: '#80000000',
                        padding: 16,
                        width: 600,
                        child: {
                            type: 'text',
                            text: `Gig Details: ${id}`, // Dynamic Title
                            color: 'white',
                            fontSize: 22,
                            fontWeight: 'bold',
                        },
                    },
                ],
            },
            // Content Body
            {
                type: 'container',
                padding: 16,
                child: {
                    type: 'column',
                    crossAxisAlignment: 'start',
                    children: [
                        // Tags
                        {
                            type: 'row',
                            children: [
                                _buildTag('Law Student', '#E1BEE7', '#4A148C'),
                                { type: 'sized_box', width: 8 },
                                _buildTag('Remote', '#C8E6C9', '#1B5E20'),
                            ],
                        },
                        { type: 'sized_box', height: 16 },
                        // Description
                        {
                            type: 'text',
                            text: 'Description',
                            fontSize: 18,
                            fontWeight: 'bold',
                        },
                        { type: 'sized_box', height: 8 },
                        {
                            type: 'text',
                            text: 'We are looking for a 3rd or 4th year law student to help draft basic contracts for our new startup. Must have knowledge of commercial law.',
                            fontSize: 14,
                            color: '#616161',
                        },
                        { type: 'sized_box', height: 24 },
                        // Application Form
                        {
                            type: 'card',
                            elevation: 4,
                            padding: 16,
                            child: {
                                type: 'column',
                                crossAxisAlignment: 'start',
                                children: [
                                    {
                                        type: 'text',
                                        text: 'Apply for this Gig',
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                    },
                                    { type: 'sized_box', height: 16 },
                                    {
                                        type: 'input_field',
                                        label: 'Full Name',
                                        hint: 'Enter your name',
                                    },
                                    { type: 'sized_box', height: 12 },
                                    {
                                        type: 'input_field',
                                        label: 'University ID',
                                        hint: 'e.g. 18101123',
                                    },
                                    { type: 'sized_box', height: 16 },
                                    {
                                        type: 'button',
                                        color: '#6200EE',
                                        padding: 16,
                                        // Action definition for the frontend
                                        action: {
                                            type: 'api_call',
                                            method: 'POST',
                                            url: `/api/gigs/${id}/apply`,
                                            body_fields: ['Full Name', 'University ID'] // Simplistic binding for now
                                        },
                                        child: {
                                            type: 'center',
                                            child: {
                                                type: 'text',
                                                text: 'Submit Application',
                                                color: 'white',
                                                fontWeight: 'bold',
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        ],
    })
})

app.post('/api/gigs/:id/apply', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { fullName, universityId } = body // Expecting these from frontend

    // 1. Update Real-time State via Durable Object
    const idObj = c.env.GIG_DO.idFromName(id)
    const stub = c.env.GIG_DO.get(idObj)
    // We send a request to the DO to register the application
    // Note: In a real app, we'd pass the user ID. Here we use a placeholder or generate one.
    const userId = universityId || 'anon_user'
    await stub.fetch(new Request('http://fake/apply', {
        method: 'POST',
        body: JSON.stringify({ userId })
    }))

    // 2. Persist to Supabase
    const { error } = await supabase
        .from('applications')
        .insert({
            gig_id: id,
            user_id: userId,
            applicant_name: fullName,
            status: 'pending'
        })

    if (error) {
        return c.json({ error: error.message }, 500)
    }

    return c.json({ success: true, message: 'Application submitted successfully!' })
})

function _buildTag(text: string, bgColor: string, textColor: string) {
    return {
        type: 'container',
        color: bgColor,
        padding: 8,
        child: {
            type: 'text',
            text: text,
            color: textColor,
            fontSize: 12,
            fontWeight: 'bold',
        },
    }
}



// Helper functions for SDUI construction
function _buildChip(label: string, isSelected: boolean) {
    return {
        type: 'container',
        padding: 8,
        color: isSelected ? '#6200EE' : '#E0E0E0',
        child: {
            type: 'text',
            text: label,
            color: isSelected ? 'white' : 'black',
            fontSize: 12,
        },
    }
}

function _buildGigCard(gigId: string, title: string, desc: string, dept: string, price: string, imgUrl: string) {
    return {
        type: 'card',
        margin: 16,
        elevation: 2,
        child: {
            type: 'column',
            crossAxisAlignment: 'start',
            children: [
                {
                    type: 'row',
                    children: [
                        {
                            type: 'image',
                            url: imgUrl,
                            width: 80,
                            height: 80,
                            fit: 'cover',
                        },
                        { type: 'sized_box', width: 16 },
                        {
                            type: 'column',
                            crossAxisAlignment: 'start',
                            children: [
                                {
                                    type: 'text',
                                    text: title,
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                },
                                { type: 'sized_box', height: 4 },
                                {
                                    type: 'text',
                                    text: dept,
                                    color: '#757575',
                                    fontSize: 12,
                                },
                                { type: 'sized_box', height: 4 },
                                {
                                    type: 'text',
                                    text: price,
                                    color: '#4CAF50',
                                    fontWeight: 'bold',
                                },
                            ],
                        },
                    ],
                },
                {
                    type: 'container',
                    padding: 12,
                    child: {
                        type: 'text',
                        text: desc,
                        fontSize: 14,
                    },
                },
                {
                    type: 'container',
                    padding: 8,
                    child: {
                        type: 'button',
                        color: '#6200EE',
                        padding: 12,
                        action: {
                            type: 'navigate',
                            url: `/api/gigs/${gigId}`,
                        },
                        child: {
                            type: 'center',
                            child: {
                                type: 'text',
                                text: 'View Details',
                                color: 'white',
                                fontWeight: 'bold',
                            },
                        },
                    },
                },
            ],
        },
    }
}


app.get('/api/fetch_seeker_home', (c) => {
    return c.json({
        type: 'column',
        crossAxisAlignment: 'stretch',
        children: [
            // Hero Banner
            {
                type: 'hero_banner',
                data: {
                    title: 'Welcome Home, Seeker',
                    imageUrl: 'https://placehold.co/600x200/png?text=Rizik+Home',
                }
            },
            { type: 'sized_box', height: 16 },
            // Meal Toggle Card
            {
                type: 'meal_toggle_card',
                data: {
                    title: 'Today\'s Meal Plan',
                    status: 'active',
                }
            },
            { type: 'sized_box', height: 16 },
            // Savings Advisor
            {
                type: 'savings_advisor_card',
                data: {
                    currentSavings: '৳5,000',
                    target: '৳10,000',
                    advice: 'You are on track! Save ৳200 more today.',
                }
            },
            { type: 'sized_box', height: 16 },
            // Test Navigation Button
            {
                type: 'button',
                color: '#4CAF50',
                padding: 16,
                margin: 16,
                child: {
                    type: 'center',
                    child: {
                        type: 'text',
                        text: 'Go to Source Dashboard',
                        color: 'white',
                        fontWeight: 'bold',
                    }
                },
                action: {
                    type: 'NAVIGATE',
                    route: '/source'
                }
            }
        ]
    })
})

app.post('/api/confirm_duty', async (c) => {
    const body = await c.req.json()
    console.log('Duty Confirmation Request:', body)

    // Simulate DB update
    return c.json({
        success: true,
        message: 'Duty confirmed successfully!',
        duty_id: body.duty_id,
        status: 'confirmed'
    })
})


import { execute_income_split } from './services/IncomeSplitter'

app.post('/api/squad/income/split', async (c) => {
    const body = await c.req.json()
    const { order_id, squad_id } = body

    if (!order_id || !squad_id) {
        return c.json({ error: 'Missing order_id or squad_id' }, 400)
    }

    try {
        const result = await execute_income_split(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            order_id,
            squad_id
        )
        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


import { generate_daily_rota, trigger_next_task } from './services/OperationalEngine'

app.post('/api/squad/rota/generate', async (c) => {
    const body = await c.req.json()
    const { squad_id, date } = body

    if (!squad_id || !date) return c.json({ error: 'Missing squad_id or date' }, 400)

    try {
        const result = await generate_daily_rota(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squad_id,
            date
        )
        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


// ==========================================
// SQUAD SYSTEM API (The Backbone)
// ==========================================



app.post('/api/squad/create', async (c) => {
    const body = await c.req.json()
    const { name, type, creator_id } = body

    if (!name || !type || !creator_id) {
        return c.json({ error: 'Missing name, type, or creator_id' }, 400)
    }

    try {
        const result = await create_squad(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            name,
            type,
            creator_id
        )
        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

app.post('/api/squad/join', async (c) => {
    const body = await c.req.json()
    const { user_id, invite_code } = body

    if (!user_id || !invite_code) {
        return c.json({ error: 'Missing user_id or invite_code' }, 400)
    }

    try {
        const result = await join_squad(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            user_id,
            invite_code
        )

        // SIGNAL THE SQUAD CORE DO
        const squadId = result.squad_id
        const idObj = c.env.SQUAD_DO.idFromName(squadId)
        const stub = c.env.SQUAD_DO.get(idObj)

        // Fire and forget (don't await to keep API fast)
        c.executionCtx.waitUntil(
            stub.fetch(new Request('http://internal/user-joined', {
                method: 'POST',
                body: JSON.stringify({ user_id, name: 'New Member' }) // Fetch name from DB in real app
            }))
        )

        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

app.get('/api/squad/invite/:squad_id', async (c) => {
    const squadId = c.req.param('squad_id')

    try {
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY)
        const { data, error } = await supabase
            .from('squads')
            .select('invite_code')
            .eq('id', squadId)
            .single()

        if (error || !data) return c.json({ error: 'Squad not found' }, 404)

        return c.json({
            invite_code: data.invite_code,
            deep_link: `https://rizik.app/join?code=${data.invite_code}`
        })
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// --- 4. TRIBUNAL SYSTEM ---
// --- 4. TRIBUNAL SYSTEM ---
app.post('/api/squad/tribunal/vote', async (c) => {
    const body = await c.req.json();
    const { dispute_id, voter_id, vote, justification } = body;

    if (!dispute_id || !voter_id || !vote) {
        return c.json({ error: 'Missing dispute_id, voter_id, or vote' }, 400)
    }

    try {
        const result = await cast_vote(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            dispute_id,
            voter_id,
            vote
        );
        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
});

// --- 5. SERVICE REGISTRY (The Revolutionary Features) ---
app.post('/api/services/rent', async (c) => {
    const body = await c.req.json();
    const { renter_id, owner_id, asset_name, monthly_rent, squad_id } = body;

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
    const registry = new ServiceRegistry(supabase, c.env);
    const result = await registry.initiate_asset_rental(renter_id, owner_id, asset_name, monthly_rent, squad_id);

    return c.json(result);
});

app.post('/api/services/gig/academic', async (c) => {
    const body = await c.req.json();
    const { poster_id, squad_id, title, description, bounty, required_tag } = body;

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
    const registry = new ServiceRegistry(supabase, c.env);
    const result = await registry.post_academic_gig(poster_id, squad_id, title, description, bounty, required_tag);

    return c.json(result);
});

app.post('/api/services/mission/proxy', async (c) => {
    const body = await c.req.json();
    const { requester_id, squad_id, mission_type, location, duration_hours, bounty } = body;

    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
    const registry = new ServiceRegistry(supabase, c.env);
    const result = await registry.launch_proxy_mission(requester_id, squad_id, mission_type, location, duration_hours, bounty);

    return c.json(result);
});

// Deep Link Redirect (Magic Link)
app.get('/api/squad/invite/:code', (c) => {
    const code = c.req.param('code')
    // Redirect to app scheme or play store
    // For now, just a simple HTML page that tries to open app
    return c.html(`
        <html>
            <head>
                <title>Join Rizik Squad</title>
                <meta http-equiv="refresh" content="0;url=rizik://join?code=${code}" />
            </head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>You've been invited to a Squad!</h1>
                <p>Opening Rizik App...</p>
                <a href="rizik://join?code=${code}" style="background: #6200EE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Join Now</a>
            </body>
        </html>
    `)
})

// SDUI for "Create Squad" Screen
app.get('/api/sdui/squad/create', (c) => {
    return c.json({
        type: 'screen',
        appBar: {
            title: 'Create New Squad',
            backgroundColor: '#FFFFFF',
            foregroundColor: '#000000'
        },
        child: {
            type: 'form',
            padding: 24,
            children: [
                {
                    type: 'text',
                    text: 'Name your Squad',
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#000000'
                },
                { type: 'sized_box', height: 8 },
                {
                    type: 'text',
                    text: 'Give your team a cool identity.',
                    fontSize: 14,
                    color: '#757575'
                },
                { type: 'sized_box', height: 24 },
                {
                    type: 'input_field',
                    name: 'squad_name',
                    label: 'Squad Name',
                    hint: 'e.g. Dhanmondi Boys, Cloud Kitchen 1',
                    required: true
                },
                { type: 'sized_box', height: 24 },
                {
                    type: 'text',
                    text: 'Select Squad Type',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#000000'
                },
                { type: 'sized_box', height: 16 },
                {
                    type: 'radio_group',
                    name: 'squad_type',
                    options: [
                        {
                            label: 'Bachelor Mess',
                            value: 'bachelor_mess',
                            description: 'Shared living, meal system, khata.',
                            icon: 'home'
                        },
                        {
                            label: 'Family',
                            value: 'family',
                            description: 'Household expenses, chores.',
                            icon: 'family_restroom'
                        },
                        {
                            label: 'Cloud Kitchen',
                            value: 'cloud_kitchen',
                            description: 'Business inventory, orders, profit split.',
                            icon: 'restaurant'
                        },
                        {
                            label: 'Logistics Team',
                            value: 'mover_squad',
                            description: 'Delivery tracking, earnings.',
                            icon: 'local_shipping'
                        }
                    ]
                },
                { type: 'sized_box', height: 32 },
                {
                    type: 'button',
                    text: 'Create & Invite',
                    color: '#6200EE',
                    textColor: '#FFFFFF',
                    action: {
                        type: 'api_call',
                        method: 'POST',
                        url: '/api/squad/create',
                        body_fields: ['squad_name', 'squad_type'], // creator_id injected by client
                        on_success: {
                            type: 'navigate',
                            route: '/squad/dashboard' // Or show invite code dialog
                        }
                    }
                }
            ]
        }
    })
})

// SDUI for "Join Squad" Screen
app.get('/api/sdui/squad/join', (c) => {
    return c.json({
        type: 'screen',
        appBar: {
            title: 'Join a Squad',
            backgroundColor: '#FFFFFF',
            foregroundColor: '#000000'
        },
        child: {
            type: 'form',
            padding: 24,
            children: [
                {
                    type: 'center',
                    child: {
                        type: 'icon',
                        icon: 'groups',
                        size: 64,
                        color: '#6200EE'
                    }
                },
                { type: 'sized_box', height: 24 },
                {
                    type: 'text',
                    text: 'Have an Invite Code?',
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#000000',
                    textAlign: 'center'
                },
                { type: 'sized_box', height: 8 },
                {
                    type: 'text',
                    text: 'Enter the code shared by your Squad Leader.',
                    fontSize: 14,
                    color: '#757575',
                    textAlign: 'center'
                },
                { type: 'sized_box', height: 32 },
                {
                    type: 'input_field',
                    name: 'invite_code',
                    label: 'Invite Code',
                    hint: 'e.g. RZK-DHAKA-42',
                    required: true,
                    textAlign: 'center',
                    style: {
                        fontSize: 20,
                        letterSpacing: 2
                    }
                },
                { type: 'sized_box', height: 16 },
                {
                    type: 'button',
                    text: 'Paste from Clipboard',
                    variant: 'text', // Text button
                    color: '#6200EE',
                    action: {
                        type: 'clipboard_paste',
                        target_field: 'invite_code'
                    }
                },
                { type: 'sized_box', height: 32 },
                {
                    type: 'button',
                    text: 'Join Squad',
                    color: '#6200EE',
                    textColor: '#FFFFFF',
                    action: {
                        type: 'api_call',
                        method: 'POST',
                        url: '/api/squad/join',
                        body_fields: ['invite_code'], // user_id injected by client
                        on_success: {
                            type: 'navigate',
                            route: '/squad/dashboard'
                        }
                    }
                }
            ]
        }
    })
})



app.post('/api/squad/task/complete', async (c) => {
    const body = await c.req.json()
    const { duty_id, squad_id, status } = body

    if (!duty_id || !squad_id || status !== 'completed') {
        return c.json({ error: 'Invalid request' }, 400)
    }

    try {
        const result = await trigger_next_task(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            duty_id,
            squad_id
        )
        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


import { process_khata_expense, get_squad_financial_health } from './services/FinancialAccountability'

app.post('/api/squad/khata/expense', async (c) => {
    const body = await c.req.json()
    const { squad_id, amount, expense_type, is_recurring } = body

    if (!squad_id || !amount || !expense_type) {
        return c.json({ error: 'Missing required fields' }, 400)
    }

    try {
        const result = await process_khata_expense(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squad_id,
            amount,
            expense_type,
            is_recurring || false
        )
        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

app.get('/api/squad/health/:id', async (c) => {
    const squadId = c.req.param('id')
    if (!squadId) return c.json({ error: 'Missing squad_id' }, 400)

    try {
        const result = await get_squad_financial_health(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squadId
        )
        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


app.get('/api/squad/dashboard/financial', async (c) => {
    // In a real app, we'd get the squad_id from the user's session or query param
    // For V1 demo, we'll use a hardcoded or query param squad_id
    const squadId = c.req.query('squad_id') || 'default_squad_id'

    try {
        const healthData = await get_squad_financial_health(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squadId
        )

        return c.json({
            type: 'column',
            crossAxisAlignment: 'stretch',
            children: [
                {
                    type: 'tohobil_health_card',
                    data: {
                        balance: healthData.tohobil_balance,
                        days_remaining: healthData.rent_due_days,
                        status: healthData.status
                    }
                }
            ]
        })
    } catch (e: any) {
        return c.json({
            type: 'container',
            padding: 16,
            child: {
                type: 'text',
                text: `Error loading financial data: ${e.message}`,
                color: 'red'
            }
        })
    }
})


import { clone_squad_as_franchise } from './services/FranchiseEngine'

app.post('/api/squad/franchise/clone', async (c) => {
    const body = await c.req.json()
    const { original_squad_id, new_member_user_ids } = body

    if (!original_squad_id || !new_member_user_ids || !Array.isArray(new_member_user_ids)) {
        return c.json({ error: 'Invalid request parameters' }, 400)
    }

    try {
        const result = await clone_squad_as_franchise(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            original_squad_id,
            new_member_user_ids
        )
        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


import { generate_liquidation_report } from './services/LiquidationEngine'

app.post('/api/squad/liquidation/report', async (c) => {
    const body = await c.req.json()
    const { squad_id, leaving_user_id } = body

    if (!squad_id || !leaving_user_id) {
        return c.json({ error: 'Missing squad_id or leaving_user_id' }, 400)
    }

    try {
        const result = await generate_liquidation_report(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squad_id,
            leaving_user_id
        )
        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


import { buildMakerDashboard } from './sdui/MakerDashboard'

app.get('/api/maker/dashboard', async (c) => {
    const squadId = c.req.query('squad_id') || 'default_squad_id'
    const userId = c.req.query('user_id') || 'current_user_id'

    try {
        const dashboardJson = await buildMakerDashboard(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squadId,
            userId
        )
        return c.json(dashboardJson)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


import { execute_liquidation_settlement } from './services/LiquidationEngine'

app.post('/api/squad/liquidation/execute', async (c) => {
    const body = await c.req.json()
    const { squad_id, leaving_user_id, liquidation_report } = body

    if (!squad_id || !leaving_user_id || !liquidation_report) {
        return c.json({ error: 'Missing required parameters' }, 400)
    }

    try {
        const result = await execute_liquidation_settlement(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squad_id,
            leaving_user_id,
            liquidation_report
        )
        return c.json(result)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


import { buildSeekerDashboard } from './sdui/SeekerDashboard'

app.get('/api/seeker/dashboard', async (c) => {
    const squadId = c.req.query('squad_id') || 'default_household_id'
    const userId = c.req.query('user_id') || 'current_user_id'

    try {
        const dashboardJson = await buildSeekerDashboard(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squadId,
            userId
        )
        return c.json(dashboardJson)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})


import { buildMoverDashboard } from './sdui/MoverDashboard'

app.get('/api/mover/dashboard', async (c) => {
    const squadId = c.req.query('squad_id') || 'default_squad_id'
    const userId = c.req.query('user_id') || 'current_user_id'

    try {
        const dashboardJson = await buildMoverDashboard(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squadId,
            userId
        )
        return c.json(dashboardJson)
    } catch (e: any) {
        return c.json({ error: e.message }, 500)
    }
})

// --- PHASE 8: CLOUDFLARE ECOSYSTEM ---

import { create_call_session, handle_whip, handle_whep } from './services/CallOrchestrator';
import { process_voice_command } from './services/VoiceAgent';

// Cloudflare Workers AI (Rizik Co-Pilot) (Workers AI)
app.post('/api/ai/voice-chat', async (c) => {
    try {
        let input: ArrayBuffer | string;
        const contentType = c.req.header('content-type');

        console.log('Received request method:', c.req.method);
        console.log('Content-Type:', contentType);

        if (contentType && contentType.includes('application/json')) {
            const body = await c.req.json();
            input = body.text;
            console.log('Input Type: Text');
        } else {
            input = await c.req.arrayBuffer();
            console.log('Input Type: Audio Blob');
            console.log('Audio Blob Size:', input.byteLength);
        }

        const squadId = c.req.header('x-squad-id') || 'default_squad_id';
        const userId = c.req.header('x-user-id') || 'current_user_id';

        console.log(`[VoiceChat] Context - Squad: ${squadId}, User: ${userId}`);

        const result = await process_voice_command(
            c.env.AI,
            c.env,
            c.env.SUPABASE_URL,
            c.env.SUPABASE_KEY,
            squadId,
            userId,
            input
        );

        // result.audio is now already a Base64 string from VoiceAgent
        const audioBase64 = result.audio;

        // Return JSON with debug info and audio
        return c.json({
            success: true,
            transcript: result.transcript,
            ai_response: result.response,
            ui_payload: result.ui_payload,
            audio: audioBase64,
            debug_error: result.debug_error
        });

    } catch (e: any) {
        console.error("Voice Chat Error:", e);
        return c.json({
            success: false,
            error: e.message,
            stack: e.stack
        }, 500);
    }
});

// ==========================================
// DURABLE OBJECTS EXPORTS
// ==========================================
export { SquadCore } from './do/SquadCore'

// ... (Other exports if any)

export { SquadDO } from './do/SquadDO'
export { ChatDO } from './do/ChatDO'
export { GigDO } from './do/GigDO'

// ==========================================
// CRON HANDLER (Scheduled Tasks)
// ==========================================
export default {
    fetch: app.fetch,
    async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
        console.log('[Cron] Scheduled event triggered:', event.cron);

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
        const registry = new ServiceRegistry(supabase, env);

        ctx.waitUntil(registry.process_scheduled_tasks());
    }
}
