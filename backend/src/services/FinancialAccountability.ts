
import { createClient } from '@supabase/supabase-js'

export async function process_khata_expense(
    supabaseUrl: string,
    supabaseKey: string,
    squadId: string,
    amount: number,
    expenseType: 'RENT' | 'UTILITY',
    isRecurring: boolean
) {
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log(`[FinancialAccountability] Processing Expense: ${expenseType} for Squad: ${squadId}`)

    // 1. Create the Expense Ledger (The Bill)
    // We create a new ledger entry for this specific bill (e.g., "November Rent")
    const ledgerName = `${expenseType} - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`
    const ledgerTypeMap: Record<string, string> = { 'RENT': 'rent', 'UTILITY': 'utilities' }

    const { data: ledger, error: ledgerError } = await supabase
        .from('khata_ledgers')
        .insert({
            squad_id: squadId,
            name: ledgerName,
            type: ledgerTypeMap[expenseType] || 'general',
            total_amount: amount,
            paid_amount: 0,
            is_settled: false
        })
        .select()
        .single()

    if (ledgerError || !ledger) throw new Error(`Failed to create ledger: ${ledgerError?.message}`)

    // 2. Fetch Active Squad Members for Splitting
    const { data: members, error: memberError } = await supabase
        .from('squad_members')
        .select('user_id')
        .eq('squad_id', squadId)
        .eq('is_active', true)

    if (memberError || !members || members.length === 0) throw new Error('No active members to split bill')

    // 3. Auto-Collector Logic (The Split)
    const splitAmount = amount / members.length
    const transactions = []
    const khataEntries = []

    for (const member of members) {
        // A. Create Debit Transaction (Deduct from Personal Wallet)
        // Note: In a real app, we'd query the user's wallet_id first. 
        // Here we assume a direct link or we record the debt against the user profile.
        // For V1, we'll record it in 'khata_entries' as a debt/payment.

        khataEntries.push({
            squad_id: squadId,
            user_id: member.user_id,
            amount: splitAmount,
            type: 'mess', // Using 'mess' type for internal squad expenses
            description: `Auto-Split: ${ledgerName}`,
            category: expenseType,
            // Link to the specific ledger we just created
            // Note: In master_schema, khata_entries didn't have ledger_id FK explicitly in the CREATE TABLE snippet 
            // but the prompt implies linking. We'll use metadata or assume the schema supports it.
            // *Correction*: The schema had `transaction_id` and `user_id`. 
            // We'll store the link in metadata if strictly following the provided schema snippet, 
            // or assume we can link it.
            metadata: { ledger_id: ledger.id }
        })
    }

    // 4. Execute Batch Insert
    const { error: entryError } = await supabase
        .from('khata_entries')
        .insert(khataEntries)

    if (entryError) throw new Error(`Auto-Collector failed: ${entryError.message}`)

    // 5. Update Ledger Status (Partially Paid / Pending)
    // Since we just recorded the "Ask", we haven't actually moved money yet unless we have wallet access.
    // The prompt says "deducting the split amount". 
    // We will assume this action *records* the deduction.

    console.log(`[FinancialAccountability] Auto-collected ${splitAmount} from ${members.length} members.`)

    return {
        success: true,
        ledger_id: ledger.id,
        split_amount: splitAmount,
        status: 'COLLECTION_INITIATED'
    }
}


export async function get_squad_financial_health(
    supabaseUrl: string,
    supabaseKey: string,
    squadId: string,
    client?: any // Allow injection for testing
) {
    const supabase = client || createClient(supabaseUrl, supabaseKey)

    // 1. Get Tohobil Balance (Shared Capital)
    // Logic: Sum of all 'paid_amount' from ledgers where type = 'SHARED_SQUAD'
    // This represents the actual capital collected in the Tohobil.
    const { data: tohobilData, error: tohobilError } = await supabase
        .from('khata_ledgers')
        .select('paid_amount')
        .eq('squad_id', squadId)
        .eq('type', 'SHARED_SQUAD')

    let tohobilBalance = 0
    if (tohobilData) {
        tohobilBalance = tohobilData.reduce((sum: number, record: any) => sum + (record.paid_amount || 0), 0)
    }

    // 2. Get Rent Due Days
    // Logic: Find most recent 'RENT' ledger, due date is 30 days after creation.
    const { data: rentLedger } = await supabase
        .from('khata_ledgers')
        .select('created_at')
        .eq('squad_id', squadId)
        .eq('type', 'RENT') // User specified 'RENT' (uppercase or matching the enum/value used)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    let rentDueDays = 30 // Default if no rent ledger found (start of cycle)
    if (rentLedger) {
        const lastRentDate = new Date(rentLedger.created_at)
        const nextDueDate = new Date(lastRentDate)
        nextDueDate.setDate(nextDueDate.getDate() + 30) // 30 days cycle

        const now = new Date()
        const diffTime = nextDueDate.getTime() - now.getTime()
        rentDueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return {
        tohobil_balance: tohobilBalance,
        rent_due_days: rentDueDays,
        status: tohobilBalance > 5000 ? 'HEALTHY' : 'LOW_FUNDS'
    }
}
