
import { createClient } from '@supabase/supabase-js'

// Role Weightage Configuration (Factor 2)
const ROLE_WEIGHTS: Record<string, number> = {
    'chef': 1.5,      // High complexity
    'manager': 1.3,   // High responsibility
    'delivery': 1.2,  // High physical effort
    'buyer': 1.1,     // Medium effort
    'cleaner': 1.0,   // Standard effort
    'member': 1.0     // Base
}

// Split Configuration
const SPLIT_CONFIG = {
    BASE_POOL: 0.40,        // 40% Equal Split
    ROLE_POOL: 0.40,        // 40% Weighted by Role
    PERFORMANCE_POOL: 0.20  // 20% Weighted by Trust Score
}

export async function execute_income_split(
    supabaseUrl: string,
    supabaseKey: string,
    orderId: string,
    squadId: string
) {
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`[IncomeSplitter] Starting split for Order: ${orderId}, Squad: ${squadId}`)

    // 1. Fetch Order & Financial Context
    // In a real scenario, we'd fetch the transaction amount linked to the order
    // For now, we simulate fetching the Net Profit from the order
    const { data: orderData, error: orderError } = await supabase
        .from('transactions') // Assuming orders link to transactions
        .select('amount, metadata')
        .eq('reference_id', orderId)
        .single()

    if (orderError || !orderData) {
        throw new Error(`Order/Transaction not found: ${orderError?.message}`)
    }

    const netProfit = orderData.amount
    console.log(`[IncomeSplitter] Net Profit to Split: ${netProfit}`)

    // 2. Fetch Squad Members with Roles & Trust Scores
    const { data: members, error: memberError } = await supabase
        .from('squad_members')
        .select(`
            user_id,
            role,
            user_profiles ( trust_score )
        `)
        .eq('squad_id', squadId)
        .eq('is_active', true)

    if (memberError || !members || members.length === 0) {
        throw new Error(`No active squad members found: ${memberError?.message}`)
    }

    // 3. Calculate Pools
    const basePool = netProfit * SPLIT_CONFIG.BASE_POOL
    const rolePool = netProfit * SPLIT_CONFIG.ROLE_POOL
    const performancePool = netProfit * SPLIT_CONFIG.PERFORMANCE_POOL

    // 4. Factor 1: Base Profit (Equal Split)
    const baseSharePerMember = basePool / members.length

    // 5. Factor 2: Role Weightage
    let totalRolePoints = 0
    members.forEach(m => {
        totalRolePoints += (ROLE_WEIGHTS[m.role] || 1.0)
    })
    const roleShareUnit = rolePool / totalRolePoints

    // 6. Factor 3: Performance Bonus (Trust Score)
    let totalTrustPoints = 0
    members.forEach(m => {
        // @ts-ignore
        const score = m.user_profiles?.trust_score || 50.0
        totalTrustPoints += score
    })
    const performanceShareUnit = performancePool / totalTrustPoints

    // 7. Execute Distribution Logic
    const distributionPlan = []

    for (const member of members) {
        // @ts-ignore
        const trustScore = member.user_profiles?.trust_score || 50.0
        const roleWeight = ROLE_WEIGHTS[member.role] || 1.0

        const myBaseShare = baseSharePerMember
        const myRoleShare = roleShareUnit * roleWeight
        const myPerfShare = performanceShareUnit * trustScore

        const totalShare = myBaseShare + myRoleShare + myPerfShare

        distributionPlan.push({
            user_id: member.user_id,
            squad_id: squadId,
            amount: parseFloat(totalShare.toFixed(2)),
            breakdown: {
                base: myBaseShare.toFixed(2),
                role: myRoleShare.toFixed(2),
                performance: myPerfShare.toFixed(2),
                role_type: member.role,
                trust_score: trustScore
            }
        })
    }

    // 8. Commit to Khata Ledger (Database Write)
    // We insert these as 'earning' entries in the khata_ledgers/entries
    const ledgerEntries = distributionPlan.map(plan => ({
        squad_id: squadId,
        user_id: plan.user_id,
        amount: plan.amount,
        type: 'business', // or 'earning'
        description: `Profit Share: Order #${orderId.substring(0, 8)}`,
        category: 'Income Distribution',
        transaction_id: null, // Could link back to main transaction
        metadata: plan.breakdown
    }))

    const { error: writeError } = await supabase
        .from('khata_entries')
        .insert(ledgerEntries)

    if (writeError) {
        throw new Error(`Failed to write ledger entries: ${writeError.message}`)
    }

    console.log(`[IncomeSplitter] Successfully distributed ${netProfit} among ${members.length} members.`)
    return { success: true, distribution: distributionPlan }
}
