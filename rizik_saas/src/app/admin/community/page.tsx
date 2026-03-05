import OpsShell from "@/components/workspace/ops-shell";
import { adminNavItems } from "@/lib/workspace/nav";
import { getCommunityModerationQueue } from "@/lib/community/data";
import { reviewCommunityPostAction } from "@/lib/actions/community";

const errorMessages: Record<string, string> = {
  missing_post: "Missing post reference.",
  post_not_found: "Post was not found.",
};

export default async function AdminCommunityPage({
  searchParams,
}: {
  searchParams?: Promise<{ reviewed?: string; error?: string }>;
}) {
  const params = (await searchParams) || {};
  const queue = await getCommunityModerationQueue(50);

  return (
    <OpsShell
      title="Community Moderation"
      subtitle="Review and approve public posts before they appear in the community feed."
      activeHref="/admin/community"
      scopeLabel="Admin ERP"
      roleLabel="Community Trust"
      navItems={adminNavItems}
      quickLinks={[
        { href: "/admin/community", label: "Moderation", tone: "neutral" },
        { href: "/community", label: "Public Feed", tone: "neutral" },
        { href: "/admin/notifications", label: "Alerts", tone: "primary" },
      ]}
    >
      {params.reviewed ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Moderation status updated.
        </div>
      ) : null}
      {params.error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessages[params.error] || "Failed to update moderation status."}
        </div>
      ) : null}

      <section className="rounded-3xl border border-[#031E49]/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#031E49]">Pending & Rejected Queue</h2>

        <div className="mt-4 space-y-4">
          {queue.length === 0 ? (
            <p className="text-sm text-[#0A2D6C]/60">No posts waiting for moderation.</p>
          ) : (
            queue.map((post) => (
              <article key={post.id} className="rounded-2xl border border-[#031E49]/10 bg-[#F5F2EB]/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#031E49]">{post.masked_author_name}</p>
                    <p className="text-xs text-[#0A2D6C]/60">
                      {new Date(post.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      post.moderation_status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {post.moderation_status}
                  </span>
                </div>

                <p className="mt-3 text-sm text-[#0A2D6C]/75">{post.post_text}</p>

                {post.image_url ? (
                  <div className="mt-3 rounded-xl border border-[#031E49]/10 overflow-hidden bg-white">
                    <img src={post.image_url} alt="Moderation attachment" className="w-full max-h-80 object-cover" />
                  </div>
                ) : null}

                <form action={reviewCommunityPostAction} className="mt-3 flex flex-wrap gap-2">
                  <input type="hidden" name="post_id" value={post.id} />
                  <button
                    type="submit"
                    name="decision"
                    value="PUBLISHED"
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="REJECTED"
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                  >
                    Reject
                  </button>
                </form>
              </article>
            ))
          )}
        </div>
      </section>
    </OpsShell>
  );
}
