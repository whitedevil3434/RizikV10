import Link from "next/link";
import { createCommunityCommentAction, createCommunityPostAction } from "@/lib/actions/community";
import { getCurrentUserContext } from "@/lib/auth/session";
import { getCommunityFeed } from "@/lib/community/data";

const infoMessages: Record<string, string> = {
  posted: "Your post is now published.",
  commented: "Comment added successfully.",
  submitted: "Post submitted for moderation review.",
  comment_pending: "Comment submitted and waiting moderation.",
};

const errorMessages: Record<string, string> = {
  post_too_short: "Post text is too short.",
  post_failed: "Post could not be saved.",
  invalid_image_type: "Only JPG, PNG, or WEBP images are allowed.",
  image_too_large: "Image exceeds the 5 MB limit.",
  image_upload_failed: "Image upload failed. Try again.",
  media_record_failed: "Media record failed to save.",
  invalid_comment: "Comment is invalid.",
  comment_failed: "Comment could not be saved.",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams?: Promise<{
    posted?: string;
    commented?: string;
    submitted?: string;
    comment_pending?: string;
    error?: string;
  }>;
}) {
  const params = (await searchParams) || {};
  const { user } = await getCurrentUserContext();
  const posts = await getCommunityFeed(24);

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#031E49]">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <p className="inline-flex px-4 py-1.5 rounded-full border border-[#031E49]/15 bg-[#031E49]/5 text-xs font-semibold uppercase tracking-[0.14em] text-[#031E49]/70">
          Community Space
        </p>
        <h1 className="mt-5 text-4xl md:text-5xl font-bold">Rizik Social Feed</h1>
        <p className="mt-3 max-w-3xl text-sm md:text-base text-[#0A2D6C]/70 leading-relaxed">
          Members can share field feedback, fair updates, and ecosystem stories. Author names are masked to preserve
          customer privacy.
        </p>

        {params.posted || params.commented || params.submitted || params.comment_pending || params.error ? (
          <div className="mt-5 space-y-2">
            {params.posted ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {infoMessages.posted}
              </div>
            ) : null}
            {params.commented ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {infoMessages.commented}
              </div>
            ) : null}
            {params.submitted ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                {infoMessages.submitted}
              </div>
            ) : null}
            {params.comment_pending ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                {infoMessages.comment_pending}
              </div>
            ) : null}
            {params.error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessages[params.error] || "Community action failed."}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
          <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Create Post</h2>
            {user ? (
              <form action={createCommunityPostAction} className="mt-4 space-y-3">
                <textarea
                  name="post_text"
                  rows={5}
                  required
                  placeholder="Share your update, experience, or review."
                  className="w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
                />
                <label className="block">
                  <span className="text-xs font-semibold text-[#031E49]/70">Attach image (optional, max 5 MB)</span>
                  <input
                    type="file"
                    name="image_file"
                    accept="image/png,image/jpeg,image/webp"
                    className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#031E49] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                  />
                </label>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#031E49] text-white text-sm font-bold hover:bg-[#0A2D6C]"
                >
                  Publish Post
                </button>
              </form>
            ) : (
              <div className="mt-4 rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/50 px-4 py-4 text-sm text-[#0A2D6C]/70">
                Login is required to create posts or comments.
                <div className="mt-3">
                  <Link href="/login?next=/community" className="inline-flex px-4 py-2 rounded-full bg-[#031E49] text-white text-xs font-bold hover:bg-[#0A2D6C]">
                    Login to Join Discussion
                  </Link>
                </div>
              </div>
            )}
          </article>

          <section className="space-y-4">
            {posts.length === 0 ? (
              <article className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">No posts yet</h3>
                <p className="mt-2 text-sm text-[#0A2D6C]/65">Be the first member to start a discussion.</p>
              </article>
            ) : (
              posts.map((post) => (
                <article key={post.id} id={`post-${post.id}`} className="rounded-3xl border border-[#031E49]/10 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#031E49]">{post.masked_author_name}</p>
                      <p className="text-xs text-[#0A2D6C]/55">{post.author_role}</p>
                    </div>
                    <p className="text-[11px] text-[#0A2D6C]/50">
                      {new Date(post.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
                    </p>
                  </div>

                  <p className="mt-3 text-sm text-[#0A2D6C]/75 leading-relaxed">{post.post_text}</p>

                  {post.image_url ? (
                    <div className="mt-3 rounded-xl border border-[#031E49]/10 overflow-hidden bg-white">
                      <img src={post.image_url} alt="Community attachment" className="w-full max-h-80 object-cover" />
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-2">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/45 px-3 py-2">
                        <p className="text-xs font-semibold text-[#031E49]">{comment.masked_author_name} · {comment.author_role}</p>
                        <p className="mt-1 text-xs text-[#0A2D6C]/70">{comment.comment_text}</p>
                      </div>
                    ))}
                  </div>

                  {user ? (
                    <form action={createCommunityCommentAction} className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input type="hidden" name="post_id" value={post.id} />
                      <input
                        name="comment_text"
                        required
                        placeholder="Write a comment"
                        className="flex-1 rounded-lg border border-[#031E49]/15 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#031E49] text-white text-xs font-bold hover:bg-[#0A2D6C]"
                      >
                        Comment
                      </button>
                    </form>
                  ) : null}
                </article>
              ))
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
