"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateAccountProfileAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const fullName = String(formData.get("full_name") || "").trim();
  if (fullName.length < 2 || fullName.length > 120) {
    redirect("/account?error=invalid_name");
  }

  let error: { message?: string } | null = null;
  try {
    const admin = createAdminClient();
    const response = await admin
      .from("user_profiles")
      .upsert(
        {
          id: user.id,
          full_name: fullName,
        },
        { onConflict: "id" }
      );
    error = response.error;
  } catch {
    const response = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: user.id,
          full_name: fullName,
        },
        { onConflict: "id" }
      );
    error = response.error;
  }

  if (error) {
    redirect("/account?error=profile_update_failed");
  }

  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
    },
  });

  revalidatePath("/account");
  redirect("/account?saved=1");
}
