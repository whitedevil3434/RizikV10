import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/auth/policy";

export async function getCurrentUserContext(): Promise<{ user: User | null; role: AppRole }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, role: "GUEST" };
  }

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return { user, role: (profile?.role as AppRole) || "CUSTOMER" };
  } catch {
    return { user, role: "CUSTOMER" };
  }
}
