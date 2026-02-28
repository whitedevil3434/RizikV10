import Link from "next/link";
import { getCurrentUserContext } from "@/lib/auth/session";
import { registerForFairAction } from "@/lib/actions/fair";
import { getFairLandingData, getFairUserDashboard } from "@/lib/fair/data";

const errorMessages: Record<string, string> = {
  no_active_fair: "No active fair campaign is available right now.",
  registration_failed: "Registration failed. Please review your form and try again.",
};

const institutionTypes = [
  { value: "UNIVERSITY", label: "University" },
  { value: "COLLEGE", label: "College" },
  { value: "SCHOOL", label: "School" },
  { value: "MADRASA", label: "Madrasa" },
  { value: "MOSQUE_NETWORK", label: "Mosque Network" },
  { value: "COMMUNITY", label: "Community Organization" },
];

export default async function FairJoinPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = (await searchParams) || {};
  const errorKey = params.error || "";

  const { user } = await getCurrentUserContext();
  const landing = await getFairLandingData();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] text-[#031E49]">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <p className="inline-flex px-4 py-1.5 rounded-full border border-[#031E49]/15 bg-[#031E49]/5 text-xs font-semibold uppercase tracking-[0.14em] text-[#031E49]/70">
            Fair Registration
          </p>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold">Join {landing.event.name}</h1>
          <p className="mt-4 text-sm md:text-base text-[#0A2D6C]/70 leading-relaxed">
            Account login is required before registration. After sign-in, this form will capture your department,
            institution, and optional squad-workforce interest.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login?next=/fair/join"
              className="px-6 py-3 rounded-full bg-[#031E49] text-white text-sm font-bold hover:bg-[#0A2D6C]"
            >
              Login to Continue
            </Link>
            <Link
              href="/fair"
              className="px-6 py-3 rounded-full border border-[#031E49]/15 bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]"
            >
              Back to Fair Home
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const dashboard = await getFairUserDashboard(user.id);
  const registration = dashboard.registration;
  const deptCodeById = new Map(landing.departments.map((department) => [department.id, department.department_code]));
  const selectedDepartmentCode = registration?.department_id ? deptCodeById.get(registration.department_id) || "" : "";

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#031E49]">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <p className="inline-flex px-4 py-1.5 rounded-full border border-[#031E49]/15 bg-[#031E49]/5 text-xs font-semibold uppercase tracking-[0.14em] text-[#031E49]/70">
          Fair Registration Form
        </p>
        <h1 className="mt-6 text-4xl md:text-5xl font-bold">Join {landing.event.name}</h1>
        <p className="mt-4 text-sm md:text-base text-[#0A2D6C]/70 leading-relaxed">
          Register your profile for department competition and squad-based part-time opportunities under permanent
          Rizik supervision.
        </p>

        {errorKey ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessages[errorKey] || "Unable to save your registration."}
          </div>
        ) : null}

        {registration ? (
          <div className="mt-6 rounded-2xl border border-[#00B16A]/25 bg-[#00B16A]/10 px-4 py-3 text-sm text-[#065F46]">
            Existing registration detected. Submitting this form again will update your details.
          </div>
        ) : null}

        <form action={registerForFairAction} className="mt-8 space-y-5 rounded-3xl border border-[#031E49]/10 bg-white p-6 md:p-8 shadow-sm">
          <input type="hidden" name="fair_slug" value={landing.event.slug} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#031E49]">Institution Name</span>
              <input
                name="institution_name"
                required
                defaultValue={registration?.institution_name || ""}
                placeholder="e.g. Dhaka University"
                className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#031E49]">Institution Type</span>
              <select
                name="institution_type"
                defaultValue={registration?.institution_type || "UNIVERSITY"}
                className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
              >
                {institutionTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#031E49]">Department Code</span>
              <select
                name="department_code"
                defaultValue={selectedDepartmentCode}
                className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
              >
                <option value="">Select department</option>
                {landing.departments.map((department) => (
                  <option key={department.id} value={department.department_code}>
                    {department.department_code} - {department.department_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#031E49]">Subject Area</span>
              <input
                name="subject_area"
                defaultValue={registration?.subject_area || ""}
                placeholder="e.g. Software Engineering"
                className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-[#031E49]">Phone Number</span>
            <input
              name="phone_number"
              placeholder="e.g. +8801XXXXXXXXX"
              className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#031E49]">Candidate Note (Optional)</span>
            <textarea
              name="candidate_note"
              rows={4}
              placeholder="Mention your preferred work type, availability, or relevant background."
              className="mt-1.5 w-full rounded-xl border border-[#031E49]/15 bg-[#F5F2EB]/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#031E49]/20"
            />
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-[#031E49]/10 bg-[#F5F2EB]/40 px-4 py-3">
            <input
              type="checkbox"
              name="wants_squad_job"
              defaultChecked={registration?.wants_squad_job || false}
              className="mt-1 h-4 w-4 rounded border-[#031E49]/30 accent-[#031E49]"
            />
            <span className="text-sm text-[#0A2D6C]/75">
              I want to join the Rizik squad workforce pool for part-time temporary assignments under squad leaders.
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#031E49] text-white text-sm font-bold hover:bg-[#0A2D6C]"
            >
              {registration ? "Update Fair Registration" : "Submit Fair Registration"}
            </button>
            <Link
              href="/fair/dashboard"
              className="px-6 py-3 rounded-full border border-[#031E49]/15 bg-white text-[#031E49] text-sm font-bold hover:bg-[#F5F2EB]"
            >
              Open My Dashboard
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
