
import { createClient } from '@supabase/supabase-js'

export async function clone_squad_as_franchise(
    supabaseUrl: string,
    supabaseKey: string,
    originalSquadId: string,
    newMemberUserIds: string[]
) {
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log(`[FranchiseEngine] Cloning Squad: ${originalSquadId} for ${newMemberUserIds.length} new members`)

    // 1. Fetch Original Squad Settings
    const { data: originalSquad, error: fetchError } = await supabase
        .from('squads')
        .select('settings, name')
        .eq('id', originalSquadId)
        .single()

    if (fetchError || !originalSquad) {
        throw new Error(`Original Squad not found: ${fetchError?.message}`)
    }

    // 2. Create New Squad (The Franchise Unit)
    // We'll append "Franchise" or a random number to the name to distinguish it
    const newSquadName = `${originalSquad.name} (Franchise Unit ${Math.floor(Math.random() * 1000)})`

    // Note: In a real production app, we would also create a new Wallet for this squad here.
    // For this implementation, we focus on the Squad entity and Settings cloning.
    const { data: newSquad, error: createError } = await supabase
        .from('squads')
        .insert({
            name: newSquadName,
            settings: originalSquad.settings, // CLONING THE SETTINGS (The "Secret Sauce")
            reputation_score: 50 // Start with neutral reputation
        })
        .select()
        .single()

    if (createError || !newSquad) {
        throw new Error(`Failed to create new squad: ${createError.message}`)
    }

    const newSquadId = newSquad.id

    // 3. Assign New Members
    // A. Update User Profiles (Link to Home Unit)
    // This ensures the user's "Home" context is updated to this new squad.
    const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ current_squad_id: newSquadId })
        .in('id', newMemberUserIds)

    if (profileError) {
        throw new Error(`Failed to update user profiles: ${profileError.message}`)
    }

    // B. Insert into Squad Members (Operational Link)
    // This is crucial for the Operational Engine (Rota, Tasks) to work.
    // We assign them a default role (e.g., 'member') initially. 
    // The Manager can later assign specific roles like 'chef' or 'buyer'.
    const memberEntries = newMemberUserIds.map(userId => ({
        squad_id: newSquadId,
        user_id: userId,
        role: 'member', // Default role
        is_active: true
    }))

    const { error: memberError } = await supabase
        .from('squad_members')
        .insert(memberEntries)

    if (memberError) {
        throw new Error(`Failed to add members to squad: ${memberError.message}`)
    }

    console.log(`[FranchiseEngine] Successfully created Franchise Unit: ${newSquadId}`)

    return {
        success: true,
        original_squad_id: originalSquadId,
        new_squad_id: newSquadId,
        new_squad_name: newSquadName,
        member_count: newMemberUserIds.length,
        cloned_settings: originalSquad.settings
    }
}
