# C-Link Business Profile — Research and Product Direction

## What the profile should be

C-Link Business Profile should be an **operating identity**, not a public rating page and not a social profile.

It answers five practical questions:

1. Which business or person is participating?
2. What are they authorized to do inside this workspace?
3. What does this business actually do and in which operating context?
4. Which profile information may be shared with a counterparty?
5. What changed, who changed it, and when?

It must not imply that C-Link has independently verified every claim.

## Research findings

### Stripe: identity should be reusable and visibility-controlled

Stripe treats a business profile as a business identity that can be entered once and reused, while allowing the business to choose whether it is visible to other businesses. This supports two C-Link principles: avoid repeatedly re-entering identity data, and separate private workspace data from selectively shared profile data.

Source: https://docs.stripe.com/get-started/account/profile

### Corporate registries: legal identity is structured, not just a name

OpenCorporates models legal name, jurisdiction, company number, entity type, status, incorporation date, dissolution date, branch status, business number, alternative legal name, and registry URL. C-Link should keep these as separate fields with source and status metadata instead of putting everything into one free-text description.

Source: https://knowledge.opencorporates.com/knowledge-base/data-dictionary-companies/

### Enterprise identity systems: members, guests, owners, roles, and scope matter

Microsoft Entra and GitHub both distinguish organization membership from guest/external access and use role-based permissions. Enterprise access should therefore be represented as a relationship between a person, a business workspace, a role, and a scope—not as a single `isAdmin` flag.

Sources:

- https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/what-is-application-management
- https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization

### W3C Verifiable Credentials: claims need subject, issuer, validity, status, and disclosure boundaries

The W3C model separates a claim from its issuer, subject, holder, verifier, validity period, status, and evidence. It also makes clear that cryptographic verification does not automatically prove the truth of the claim. This is exactly the boundary C-Link needs: store profile claims and their source; do not label them universally true.

Source: https://www.w3.org/TR/vc-data-model/

## Recommended profile architecture

### 1. Profile header

- Display name
- Legal name, if supplied
- Business/person type
- Logo or initials
- Short operating description
- Primary location
- Profile completeness indicator
- Last updated timestamp
- Visibility state: private, shared, or link-accessible

The completeness indicator must describe missing information, not trustworthiness.

### 2. Identity and registration

- Display name
- Legal name
- Local/alternative name
- Entity type
- Country and jurisdiction
- Registration number and identifier type
- Registry URL or source note
- Incorporation/start date
- Current self-declared operating status
- Branch or operating-unit label
- Tax identifier only when explicitly needed and tightly permissioned

Every identifier should have:

```text
value
source
providedBy
providedAt
expiresAt (optional)
status: submitted | confirmed | expired | disputed
```

### 3. Operating context

This is the part that makes C-Link useful for commitments.

- What the business supplies or does
- Product/service categories
- Typical order types
- Service locations or coverage area
- Operating hours and timezone
- Preferred contact channels
- Languages
- Pickup, delivery, or service modes
- Typical lead time, if the owner chooses to share it
- Payment methods accepted
- Currencies used
- Minimum order or scheduling notes

These are operational claims, not universal capability guarantees.

### 4. People and access

Each person should have:

- Name
- Contact channel
- Relationship to the business
- Role
- Membership status
- Invited/accepted/removed timestamps
- Last activity
- Scope of authority

Initial roles:

- Owner — manage workspace, people, profile, and all commitments
- Operator — create and manage commitments assigned to them
- Finance — view commercial terms and record settlement information
- Counterparty responder — respond to shared commitments only
- Viewer — read permitted workspace records
- External guest — limited access to a specific commitment or shared profile

Avoid a generic administrator role wherever a narrower role can work.

### 5. Sharing controls

Business profile sharing should be a first-class feature:

- Share selected sections only
- Share with a named counterparty or by expiring link
- Set purpose: onboarding, commitment, procurement, or review
- Set expiry
- Revoke link
- See who opened it
- See what was shared at that time
- Never expose private contacts, margin, internal notes, or unrelated relationships by default

The share screen should preview exactly what the recipient will see before the owner confirms.

### 6. Activity and audit

Profile activity should record:

- Profile created
- Field added or changed
- Member invited, accepted, role changed, or removed
- Profile section shared
- Share link opened, expired, or revoked
- Identity document attached or replaced
- Permission granted or revoked

Corrections should append a new change event. They should not silently overwrite history.

## C-Link profile data model direction

```text
clink_parties
  id, kind, display_name, legal_name, status, created_at, updated_at

clink_party_identity_claims
  party_id, claim_type, value, source, status, provided_by,
  provided_at, expires_at, visibility

clink_party_operating_context
  party_id, categories, service_areas, hours, channels,
  languages, delivery_modes, payment_methods, visibility

clink_party_members
  party_id, person_id, role, status, scope, invited_at,
  accepted_at, removed_at

clink_profile_shares
  party_id, recipient_party_id, sections, purpose, token_hash,
  expires_at, revoked_at, opened_at, created_by

clink_profile_audit_log
  party_id, actor_id, action, changed_fields, occurred_at,
  correlation_id
```

## What should ship first

### Profile MVP

- Edit display name, legal name, business type, location, contact channel, description
- Add logo or initials
- Add one owner and authorized members
- Role-based access for owner, operator, viewer, and external guest
- Add operating categories and service area
- Private-by-default visibility
- Share a selected profile summary through an expiring link
- Audit profile edits and share opens
- Profile preview before sharing

### Later

- Registry integrations
- Document expiry reminders
- Portable business credential
- Selective disclosure credentials
- Multi-location branches
- Delegated approval workflows
- Business continuity and successor handover
- Relationship-specific operating context

### Explicitly excluded

- Public trust score
- Universal rating
- Public profile discovery
- Automatic verification
- Lending, insurance, or underwriting decisions
- Open relationship graph
- AI-generated capability claims

## Product conclusion

The profile is not where C-Link says “this business is trustworthy.”

It is where C-Link says:

> “This is the business identity, operating context, authorized people, and exact information this owner has chosen to share.”

That makes Business Profile the control plane for every future commitment, share link, permission, evidence record, and relationship—not a decorative settings page.
