
import { createClient } from '@supabase/supabase-js';

export async function create_squad(
    supabaseUrl: string,
    supabaseKey: string,
    name: string,
    type: string,
    creatorId: string
) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Generate Invite Code (Human Readable)
    // Format: RZK-[CITY]-[RANDOM] -> RZK-DHAKA-42
    const randomNum = Math.floor(Math.random() * 1000);
    const inviteCode = `RZK-DHAKA-${randomNum}`;

    // 2. Create Squad
    const { data: squadData, error: squadError } = await supabase
        .from('squads')
        .insert({
            name: name,
            type: type, // 'bachelor_mess', 'family', etc.
            created_by: creatorId,
            invite_code: inviteCode,
            trust_score: 50.0
        })
        .select()
        .single();

    if (squadError) throw new Error(`Squad Creation Failed: ${squadError.message}`);

    const squadId = squadData.id;

    // 3. Create Shared Wallet
    const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .insert({
            type: 'squad_shared',
            owner_squad_id: squadId,
            balance: 0.00,
            currency: 'BDT',
            is_active: true
        })
        .select()
        .single();

    if (walletError) throw new Error(`Wallet Creation Failed: ${walletError.message}`);

    // 4. Link Wallet to Squad
    await supabase
        .from('squads')
        .update({ wallet_id: walletData.id })
        .eq('id', squadId);

    // 5. Add Creator as LEADER
    const { error: memberError } = await supabase
        .from('squad_members')
        .insert({
            squad_id: squadId,
            user_id: creatorId,
            role: 'leader',
            joined_at: new Date().toISOString(),
            is_active: true
        });

    if (memberError) throw new Error(`Member Assignment Failed: ${memberError.message}`);

    // 6. Update User's Current Squad
    await supabase
        .from('user_profiles')
        .update({ current_squad_id: squadId })
        .eq('id', creatorId);

    return {
        squad_id: squadId,
        invite_code: inviteCode,
        wallet_id: walletData.id,
        message: "Squad created successfully!"
    };
}

export async function join_squad(
    supabaseUrl: string,
    supabaseKey: string,
    userId: string,
    inviteCode: string
) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Find Squad by Invite Code
    const { data: squadData, error: squadError } = await supabase
        .from('squads')
        .select('id, name')
        .eq('invite_code', inviteCode)
        .single();

    if (squadError || !squadData) throw new Error("Invalid Invite Code");

    const squadId = squadData.id;

    // 2. Check if User is Already a Member
    const { data: existingMember } = await supabase
        .from('squad_members')
        .select('role')
        .eq('squad_id', squadId)
        .eq('user_id', userId)
        .single();

    if (existingMember) throw new Error("You are already a member of this squad.");

    // 3. Add User as MEMBER
    const { error: joinError } = await supabase
        .from('squad_members')
        .insert({
            squad_id: squadId,
            user_id: userId,
            role: 'member',
            joined_at: new Date().toISOString(),
            is_active: true
        });

    if (joinError) throw new Error(`Joining Failed: ${joinError.message}`);

    // 4. Update User's Current Squad
    await supabase
        .from('user_profiles')
        .update({ current_squad_id: squadId })
        .eq('id', userId);

    return {
        success: true,
        squad_id: squadId,
        squad_name: squadData.name,
        message: `Welcome to ${squadData.name}!`
    };
}
