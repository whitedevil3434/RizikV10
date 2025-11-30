
import { get_squad_financial_health } from '../services/FinancialAccountability';

// --- MOCKS ---
const mockSupabase = {
    from: (table: string) => {
        const queryBuilder: any = {
            select: (columns: string) => queryBuilder,
            eq: (col: string, val: string) => queryBuilder,
            order: (col: string, opts: any) => queryBuilder,
            limit: (n: number) => queryBuilder,
            single: async () => {
                if (table === 'squads') return { data: { id: 'squad_123', name: 'Alpha Squad' }, error: null };
                // Mock rent ledger for due date calculation
                if (table === 'khata_ledgers') return { data: { created_at: '2023-10-01' }, error: null };
                return { data: null, error: null };
            },
            then: (resolve: any) => {
                // Handle await directly on the chain (for .select().eq().eq())
                if (table === 'khata_ledgers') {
                    resolve({
                        data: [
                            { paid_amount: 15000, type: 'RENT' },
                            { paid_amount: 6000, type: 'SHARED_SQUAD' }
                        ],
                        error: null
                    });
                } else if (table === 'squad_members') {
                    resolve({ data: [{ user_id: 'u1' }, { user_id: 'u2' }], error: null });
                } else {
                    resolve({ data: [], error: null });
                }
            }
        };
        // Handle insert separately as it's usually terminal
        queryBuilder.insert = async (data: any) => {
            console.log(`[DB] Inserted into ${table}:`, data);
            return { error: null };
        };
        return queryBuilder;
    },
    rpc: async (func: string, params: any) => {
        console.log(`[DB] Called RPC ${func} with:`, params);
        return { data: null, error: null };
    }
};

// Mock AI Response
const mockAI = {
    run: async (model: string, inputs: any) => {
        console.log(`[AI] Processing Input: "${inputs.messages[1].content}"`);
        // Simulate Llama 3.1 identifying the tool
        return {
            tool_calls: [{
                name: 'check_financial_health',
                arguments: { squad_id: 'squad_123' }
            }]
        };
    }
};

// --- SIMULATION ---
async function runSimulation() {
    console.log("🚀 STARTING V10 SYSTEM SIMULATION (MOVER MICRO-FLOAT SCENARIO)\n");

    // Step 1: Voice Input
    const userQuery = "My motorcycle is out of fuel, and I need money to fill the tank.";
    console.log(`1️⃣  [VOICE INPUT] User: "${userQuery}"`);

    // Step 2: AI Tool Identification
    console.log("2️⃣  [AI ORCHESTRATOR] Analyzing intent...");
    const aiResponse = await mockAI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
            { role: 'system', content: 'You are the Rizik AI Orchestrator.' },
            { role: 'user', content: userQuery }
        ]
    });

    const toolCall = aiResponse.tool_calls[0];
    console.log(`   ✅ Tool Identified: ${toolCall.name}`);
    console.log(`   ✅ Arguments: ${JSON.stringify(toolCall.arguments)}`);

    // Step 3: Economic Action (Financial Logic)
    if (toolCall.name === 'check_financial_health') {
        console.log("3️⃣  [ECONOMIC ENGINE] Verifying eligibility...");
        // Execute the actual service logic (with mocked DB)
        const health = await get_squad_financial_health(
            'mock_url',
            'mock_key',
            toolCall.arguments.squad_id,
            mockSupabase
        );

        console.log(`   📊 Squad Financial Health:`);
        console.log(`      - Tohobil Balance: ${health.tohobil_balance}`);
        console.log(`      - Rent Due In: ${health.rent_due_days} days`);
        console.log(`      - Status: ${health.status}`);

        // Logic Check: Is balance sufficient for Micro-Float?
        const microFloatAmount = 500; // Fuel cost
        const isEligible = health.tohobil_balance > microFloatAmount;
        console.log(`   ✅ Eligibility Check: ${isEligible ? 'PASSED' : 'FAILED'}`);

        // Step 4: Operational Action (Update Ledger & UI)
        if (isEligible) {
            console.log("4️⃣  [OPERATIONAL ENGINE] Executing Micro-Float...");

            // Simulate DB Update
            await mockSupabase.from('khata_ledgers').insert({
                squad_id: 'squad_123',
                member_id: 'mover_user_1',
                amount: -microFloatAmount,
                type: 'MICRO_FLOAT',
                description: 'Fuel Loan (AI Triggered)'
            });

            // Simulate UI Update (Float Status Card)
            const updatedFloatStatus = {
                balance: 1500 - microFloatAmount, // Assuming initial 1500
                limit: 2000,
                status: 'ACTIVE'
            };
            console.log(`   📱 [UI UPDATE] float_status_card refreshed:`, updatedFloatStatus);
        }

        // Step 5: AI Voice Output
        console.log("5️⃣  [AI VOICE OUTPUT] Generating response...");
        const finalResponse = `I've checked the squad's Tohobil. You have ${health.tohobil_balance} BDT available. I've released 500 BDT for your fuel. Drive safely!`;
        console.log(`   🔊 Agent: "${finalResponse}"`);
    }

    console.log("\n✅ SIMULATION COMPLETE. V10 SYSTEM READY FOR LAUNCH.");
}

runSimulation().catch(console.error);
