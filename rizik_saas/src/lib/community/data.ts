import { createAdminClient } from "@/lib/supabase/admin";

interface BaseProfile {
  id: string;
  full_name: string | null;
  role: string | null;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  comment_text: string;
  created_at: string;
  masked_author_name: string;
  author_role: string;
}

export interface CommunityPost {
  id: string;
  post_text: string;
  image_url: string | null;
  moderation_status: string;
  created_at: string;
  masked_author_name: string;
  author_role: string;
  comments: CommunityComment[];
}

export interface CommunityModerationItem {
  id: string;
  post_text: string;
  image_url: string | null;
  moderation_status: string;
  created_at: string;
  masked_author_name: string;
}

function maskName(name: string | null): string {
  if (!name || name.trim().length === 0) return "Rizik Member";
  const normalized = name.trim();
  return `${normalized.slice(0, 1)}${"*".repeat(Math.max(normalized.length - 1, 1))}`;
}

export async function getCommunityFeed(limit = 20): Promise<CommunityPost[]> {
  try {
    const admin = createAdminClient();

    const { data: postRows, error: postError } = await admin
      .from("rizik_social_posts")
      .select("id, user_id, post_text, image_url, moderation_status, created_at")
      .eq("visibility", "PUBLIC")
      .eq("moderation_status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (postError || !postRows || postRows.length === 0) {
      return [];
    }

    const posts = postRows as {
      id: string;
      user_id: string | null;
      post_text: string;
      image_url: string | null;
      moderation_status: string;
      created_at: string;
    }[];

    const postIds = posts.map((post) => post.id);
    const userIds = [...new Set(posts.map((post) => post.user_id).filter((id): id is string => Boolean(id)))];

    const [{ data: commentsRows }, { data: profileRows }] = await Promise.all([
      admin
        .from("rizik_social_comments")
        .select("id, post_id, user_id, comment_text, moderation_status, created_at")
        .in("post_id", postIds)
        .eq("moderation_status", "PUBLISHED")
        .order("created_at", { ascending: true }),
      userIds.length > 0
        ? admin.from("user_profiles").select("id, full_name, role").in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const comments = (commentsRows || []) as {
      id: string;
      post_id: string;
      user_id: string | null;
      comment_text: string;
      created_at: string;
    }[];

    const commentUserIds = [...new Set(comments.map((comment) => comment.user_id).filter((id): id is string => Boolean(id)))];

    const commentProfilesResponse =
      commentUserIds.length > 0
        ? await admin.from("user_profiles").select("id, full_name, role").in("id", commentUserIds)
        : { data: [] as unknown[], error: null };

    const profileMap = new Map<string, BaseProfile>();
    for (const row of profileRows || []) {
      const profile = row as BaseProfile;
      profileMap.set(profile.id, profile);
    }
    for (const row of commentProfilesResponse.data || []) {
      const profile = row as BaseProfile;
      profileMap.set(profile.id, profile);
    }

    const commentsByPost = new Map<string, CommunityComment[]>();
    for (const comment of comments) {
      const profile = comment.user_id ? profileMap.get(comment.user_id) : undefined;
      const shaped: CommunityComment = {
        id: comment.id,
        post_id: comment.post_id,
        comment_text: comment.comment_text,
        created_at: comment.created_at,
        masked_author_name: maskName(profile?.full_name || null),
        author_role: profile?.role || "Community Member",
      };

      const list = commentsByPost.get(comment.post_id) || [];
      list.push(shaped);
      commentsByPost.set(comment.post_id, list);
    }

    return posts.map((post) => {
      const profile = post.user_id ? profileMap.get(post.user_id) : undefined;
      return {
        id: post.id,
        post_text: post.post_text,
        image_url: post.image_url,
        moderation_status: post.moderation_status,
        created_at: post.created_at,
        masked_author_name: maskName(profile?.full_name || null),
        author_role: profile?.role || "Community Member",
        comments: commentsByPost.get(post.id) || [],
      };
    });
  } catch {
    return [];
  }
}

export async function getCommunityModerationQueue(limit = 40): Promise<CommunityModerationItem[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("rizik_social_posts")
      .select("id, user_id, post_text, image_url, moderation_status, created_at")
      .in("moderation_status", ["PENDING", "REJECTED"])
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) return [];

    const rows = data as {
      id: string;
      user_id: string | null;
      post_text: string;
      image_url: string | null;
      moderation_status: string;
      created_at: string;
    }[];

    const userIds = [...new Set(rows.map((row) => row.user_id).filter((id): id is string => Boolean(id)))];
    const { data: profileRows } =
      userIds.length > 0
        ? await admin.from("user_profiles").select("id, full_name").in("id", userIds)
        : { data: [] as unknown[] };

    const profileMap = new Map<string, { full_name: string | null }>();
    for (const row of profileRows || []) {
      const typed = row as { id: string; full_name: string | null };
      profileMap.set(typed.id, { full_name: typed.full_name });
    }

    return rows.map((row) => {
      const profile = row.user_id ? profileMap.get(row.user_id) : undefined;
      return {
        id: row.id,
        post_text: row.post_text,
        image_url: row.image_url,
        moderation_status: row.moderation_status,
        created_at: row.created_at,
        masked_author_name: maskName(profile?.full_name || null),
      };
    });
  } catch {
    return [];
  }
}
