"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireCommunityUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/community");
  }

  return user;
}

export async function createCommunityPostAction(formData: FormData) {
  const user = await requireCommunityUser();
  const postText = String(formData.get("post_text") || "").trim();
  const imageUrl = String(formData.get("image_url") || "").trim();

  if (postText.length < 3) {
    redirect("/community?error=post_too_short");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("rizik_social_posts").insert({
    user_id: user.id,
    post_text: postText,
    image_url: imageUrl || null,
    visibility: "PUBLIC",
  });

  if (error) {
    redirect("/community?error=post_failed");
  }

  revalidatePath("/community");
  redirect("/community?posted=1");
}

export async function createCommunityCommentAction(formData: FormData) {
  const user = await requireCommunityUser();
  const postId = String(formData.get("post_id") || "").trim();
  const commentText = String(formData.get("comment_text") || "").trim();

  if (!postId || commentText.length < 2) {
    redirect("/community?error=invalid_comment");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("rizik_social_comments").insert({
    post_id: postId,
    user_id: user.id,
    comment_text: commentText,
  });

  if (error) {
    redirect("/community?error=comment_failed");
  }

  revalidatePath("/community");
  redirect(`/community?commented=1#post-${postId}`);
}
