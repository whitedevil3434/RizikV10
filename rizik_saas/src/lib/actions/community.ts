"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canAccessAdminRole } from "@/lib/auth/policy";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

async function requireAdminModerator(nextPath: string) {
  const user = await requireCommunityUser();
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = String(profile?.role || "");
  if (!role || !canAccessAdminRole(role)) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

function extFromMime(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

async function uploadCommunityImage(admin: ReturnType<typeof createAdminClient>, userId: string, file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("invalid_image_type");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("image_too_large");
  }

  const ext = extFromMime(file.type);
  const objectPath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("rizik-community")
    .upload(objectPath, bytes, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error("image_upload_failed");
  }

  const { data: urlData } = admin.storage.from("rizik-community").getPublicUrl(objectPath);
  const publicUrl = urlData.publicUrl;

  const mediaModerationStatus = process.env.COMMUNITY_AUTO_APPROVE_MEDIA_POSTS === "true" ? "PUBLISHED" : "PENDING";

  const { data: asset, error: assetError } = await admin
    .from("rizik_media_assets")
    .insert({
      owner_user_id: userId,
      bucket_name: "rizik-community",
      object_path: objectPath,
      mime_type: file.type,
      size_bytes: file.size,
      public_url: publicUrl,
      moderation_status: mediaModerationStatus,
    })
    .select("id, moderation_status")
    .single();

  if (assetError || !asset?.id) {
    throw new Error("media_record_failed");
  }

  return {
    mediaAssetId: String(asset.id),
    mediaModerationStatus: String(asset.moderation_status || mediaModerationStatus),
    publicUrl,
  };
}

export async function createCommunityPostAction(formData: FormData) {
  const user = await requireCommunityUser();
  const postText = String(formData.get("post_text") || "").trim();
  const upload = formData.get("image_file");

  if (postText.length < 3) {
    redirect("/community?error=post_too_short");
  }

  const admin = createAdminClient();

  let imageUrl: string | null = null;
  let mediaAssetId: string | null = null;
  let moderationStatus = process.env.COMMUNITY_AUTO_APPROVE_POSTS === "false" ? "PENDING" : "PUBLISHED";

  try {
    if (upload instanceof File && upload.size > 0) {
      const uploaded = await uploadCommunityImage(admin, user.id, upload);
      imageUrl = uploaded.publicUrl;
      mediaAssetId = uploaded.mediaAssetId;
      moderationStatus = uploaded.mediaModerationStatus;
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : "image_upload_failed";
    redirect(`/community?error=${encodeURIComponent(code)}`);
  }

  const { error } = await admin.from("rizik_social_posts").insert({
    user_id: user.id,
    post_text: postText,
    image_url: imageUrl,
    media_asset_id: mediaAssetId,
    visibility: "PUBLIC",
    moderation_status: moderationStatus,
  });

  if (error) {
    redirect("/community?error=post_failed");
  }

  revalidatePath("/community");
  revalidatePath("/admin/community");

  if (moderationStatus === "PUBLISHED") {
    redirect("/community?posted=1");
  }

  redirect("/community?submitted=1");
}

export async function createCommunityCommentAction(formData: FormData) {
  const user = await requireCommunityUser();
  const postId = String(formData.get("post_id") || "").trim();
  const commentText = String(formData.get("comment_text") || "").trim();

  if (!postId || commentText.length < 2) {
    redirect("/community?error=invalid_comment");
  }

  const moderationStatus = process.env.COMMUNITY_AUTO_APPROVE_COMMENTS === "false" ? "PENDING" : "PUBLISHED";

  const admin = createAdminClient();
  const { error } = await admin.from("rizik_social_comments").insert({
    post_id: postId,
    user_id: user.id,
    comment_text: commentText,
    moderation_status: moderationStatus,
  });

  if (error) {
    redirect("/community?error=comment_failed");
  }

  revalidatePath("/community");

  if (moderationStatus === "PUBLISHED") {
    redirect(`/community?commented=1#post-${postId}`);
  }

  redirect(`/community?comment_pending=1#post-${postId}`);
}

export async function reviewCommunityPostAction(formData: FormData) {
  await requireAdminModerator("/admin/community");

  const postId = String(formData.get("post_id") || "").trim();
  const decisionRaw = String(formData.get("decision") || "").trim().toUpperCase();
  const decision = decisionRaw === "PUBLISHED" ? "PUBLISHED" : "REJECTED";

  if (!postId) {
    redirect("/admin/community?error=missing_post");
  }

  const admin = createAdminClient();

  const { data: post } = await admin
    .from("rizik_social_posts")
    .select("id, media_asset_id")
    .eq("id", postId)
    .maybeSingle();

  if (!post) {
    redirect("/admin/community?error=post_not_found");
  }

  await admin
    .from("rizik_social_posts")
    .update({ moderation_status: decision })
    .eq("id", postId);

  if (post.media_asset_id) {
    await admin
      .from("rizik_media_assets")
      .update({ moderation_status: decision })
      .eq("id", post.media_asset_id as string);
  }

  revalidatePath("/community");
  revalidatePath("/admin/community");
  redirect("/admin/community?reviewed=1");
}
