import { createClient } from '@supabase/supabase-js';

export async function cast_vote(
    supabaseUrl: string,
    supabaseKey: string,
    disputeId: string,
    voterId: string,
    vote: 'GUILTY' | 'INNOCENT'
) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Record the Vote
    const { error: voteError } = await supabase
        .from('dispute_votes')
        .insert({
            dispute_id: disputeId,
            voter_user_id: voterId,
            vote: vote
        });

    if (voteError) {
        // Handle duplicate vote (already voted)
        if (voteError.code === '23505') throw new Error("You have already voted.");
        throw new Error(`Vote Failed: ${voteError.message}`);
    }

    // 2. Check for Consensus (Majority)
    // Get total squad members count
    const { data: disputeData, error: disputeError } = await supabase
        .from('disputes')
        .select('squad_id, accused_user_id, penalty_amount')
        .eq('id', disputeId)
        .single();

    if (disputeError || !disputeData) throw new Error("Dispute not found");

    const squadId = disputeData.squad_id;

    const { count: totalMembers } = await supabase
        .from('squad_members')
        .select('*', { count: 'exact', head: true })
        .eq('squad_id', squadId)
        .eq('is_active', true);

    if (!totalMembers) throw new Error("Squad has no members?");

    // Get current vote counts
    const { data: votes } = await supabase
        .from('dispute_votes')
        .select('vote')
        .eq('dispute_id', disputeId);

    const guiltyVotes = votes?.filter(v => v.vote === 'GUILTY').length || 0;
    const innocentVotes = votes?.filter(v => v.vote === 'INNOCENT').length || 0;
    const totalVotes = votes?.length || 0;

    // Logic: If > 50% of TOTAL members vote GUILTY -> Penalty
    // Or if all active members (minus accused) have voted? 
    // Let's stick to simple majority of total members for now to avoid deadlocks.
    // Actually, usually it's majority of quorum. Let's say if Guilty > Total/2

    const threshold = totalMembers / 2;

    if (guiltyVotes > threshold) {
        // VERDICT: GUILTY
        await resolve_dispute(supabase, disputeId, 'GUILTY', disputeData.penalty_amount, disputeData.accused_user_id, squadId);
        return { status: 'RESOLVED', verdict: 'GUILTY', message: 'The Tribunal has spoken. Accused is GUILTY.' };
    } else if (innocentVotes > threshold) {
        // VERDICT: INNOCENT
        await resolve_dispute(supabase, disputeId, 'INNOCENT', 0, disputeData.accused_user_id, squadId);
        return { status: 'RESOLVED', verdict: 'INNOCENT', message: 'The Tribunal has spoken. Accused is innocent.' };
    }

    return { status: 'VOTING', message: 'Vote recorded. Waiting for consensus.', guilty: guiltyVotes, innocent: innocentVotes, required: Math.floor(threshold) + 1 };
}

export async function resolve_dispute(
    supabase: any,
    disputeId: string,
    verdict: 'GUILTY' | 'INNOCENT',
    penaltyAmount: number,
    accusedUserId: string,
    squadId: string
) {
    console.log(`Resolving dispute ${disputeId} as ${verdict}`);

    // 1. Update Dispute Status
    const { error: updateError } = await supabase
        .from('disputes')
        .update({
            status: 'RESOLVED',
            resolved_at: new Date().toISOString(),
            // We could store the final verdict if we had a column for it,
            // but for now status=RESOLVED implies the logic ran.
            // Ideally add a 'verdict' column to disputes table.
        })
        .eq('id', disputeId);

    if (updateError) {
        console.error('Error resolving dispute:', updateError);
        return;
    }

    // 2. If GUILTY, Execute Penalty
    if (verdict === 'GUILTY' && penaltyAmount > 0) {

        // A. Find User's Personal Wallet
        const { data: userWallet, error: userWalletError } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('owner_user_id', accusedUserId)
            .eq('type', 'personal')
            .single();

        if (userWalletError || !userWallet) {
            console.error('User wallet not found:', userWalletError);
            return;
        }

        // B. Find Squad's Shared Wallet
        const { data: squadWallet, error: squadWalletError } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('owner_squad_id', squadId)
            .eq('type', 'squad_shared')
            .single();

        if (squadWalletError || !squadWallet) {
            console.error('Squad wallet not found:', squadWalletError);
            return;
        }

        // C. Create Negative Transaction for User (Deduction)
        const { error: deductionError } = await supabase
            .from('transactions')
            .insert({
                wallet_id: userWallet.id,
                amount: -penaltyAmount, // Negative for deduction
                type: 'expense', // Considered an expense/fine
                source: 'manual', // Or 'tribunal' if we add that enum
                description: `Tribunal Penalty: Dispute #${disputeId.substring(0, 8)}`,
                performed_by_user_id: accusedUserId, // Technically system, but attributed to user
                metadata: { dispute_id: disputeId, type: 'penalty' }
            });

        if (deductionError) {
            console.error('Error deducting penalty:', deductionError);
            return; // Stop if deduction fails
        }

        // D. Create Positive Transaction for Squad (Compensation)
        const { error: depositError } = await supabase
            .from('transactions')
            .insert({
                wallet_id: squadWallet.id,
                amount: penaltyAmount,
                type: 'deposit', // Income for the squad
                source: 'manual',
                description: `Tribunal Compensation: Dispute #${disputeId.substring(0, 8)}`,
                metadata: { dispute_id: disputeId, type: 'compensation', from_user: accusedUserId }
            });

        if (depositError) {
            console.error('Error depositing compensation:', depositError);
        }

        // E. Update Wallet Balances (Atomic increment/decrement is better, but simple update for now)
        // Note: In production, use an RPC function for atomic updates to avoid race conditions.
        await supabase.from('wallets').update({ balance: userWallet.balance - penaltyAmount }).eq('id', userWallet.id);
        await supabase.from('wallets').update({ balance: squadWallet.balance + penaltyAmount }).eq('id', squadWallet.id);

        console.log('Penalty executed and funds transferred.');

        // F. Send Notification (Mock)
        console.log(`NOTIFICATION to ${accusedUserId}: Tribunal Verdict: GUILTY. ${penaltyAmount} BDT deducted.`);
    }
}
