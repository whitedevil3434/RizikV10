-- Atomic function to decrement credits for Rizik Writer
-- Returns the new total (free + paid) if successful, or -1 if insufficient
CREATE OR REPLACE FUNCTION public.decrement_user_credits(u_id UUID)
RETURNS TABLE (success BOOLEAN, remaining INTEGER) AS $$
DECLARE
    current_free INTEGER;
    current_paid INTEGER;
BEGIN
    -- Select current values with a row lock to prevent race conditions
    SELECT free_uses_remaining, paid_credits 
    INTO current_free, current_paid
    FROM public.user_usage
    WHERE user_id = u_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0;
        RETURN;
    END IF;

    -- Prioritize free credits
    IF current_free > 0 THEN
        UPDATE public.user_usage
        SET free_uses_remaining = free_uses_remaining - 1,
            total_transformations = total_transformations + 1,
            updated_at = NOW()
        WHERE user_id = u_id;
        
        RETURN QUERY SELECT TRUE, (current_free - 1) + current_paid;
    
    -- Then use paid credits
    ELSIF current_paid > 0 THEN
        UPDATE public.user_usage
        SET paid_credits = paid_credits - 1,
            total_transformations = total_transformations + 1,
            updated_at = NOW()
        WHERE user_id = u_id;
        
        RETURN QUERY SELECT TRUE, current_free + (current_paid - 1);
    
    -- No credits left
    ELSE
        RETURN QUERY SELECT FALSE, 0;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
