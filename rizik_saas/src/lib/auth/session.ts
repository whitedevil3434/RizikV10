import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role) {
      return { user, role: profile.role as AppRole };
    }
  } catch {
    // try server-side fallback
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
