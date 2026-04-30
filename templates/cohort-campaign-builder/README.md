# Extend App UI — Cohort Campaign Builder

A React template that demonstrates how an Extend App UI can **tie multiple AGS services together** without an Extend backend, using AccelByte's typed SDK packages directly.

The shipped UI has two tabs.

## Reward tab

Two stacked sections:

1. **Configure reward tiers** — an Antd `Collapse` accordion that edits a Cloud Save admin game record at a key like `pvp-season-1`. Each tier holds a rank range, a Platform item, and a quantity. The item picker is a server-side debounced search over `useItemAdminApi_GetItemsByCriteria_v2` from `@accelbyte/sdk-platform/react-query`, which exposes an `itemName` filter so the keyword maps directly to a backend name search (no client-side filtering needed). A `granted` array per tier is appended to whenever a grant succeeds, so re-runs are idempotent. The record schema:

   ```json
   "pvp-season-1": {
     "tier_1": { "ranks": "1-10",  "itemId": "<uuid>", "quantity": 1, "granted": [] },
     "tier_2": { "ranks": "11-50", "itemId": "<uuid>", "quantity": 1, "granted": [] },
     "tier_3": { "ranks": "51-100","itemId": "<uuid>", "quantity": 1, "granted": [] }
   }
   ```

2. **Grant rewards** — reads the same game record, fetches the leaderboard's all-time top 100 via `useLeaderboardDataV3AdminApi_GetAlltime_ByLeaderboardCode_v3`, joins each entry to its tier, and renders a table with per-row status:
   - **Granted (recorded)** — userId is in this tier's `granted` list.
   - **Already owns** — Platform ownership check via `useEntitlementAdminApi_GetEntitlementsOwnershipByItemIds_ByUserId` fired per row.
   - **Pending** — neither, ready to grant.

   "Grant" / "Bulk grant all" call `useEntitlementAdminApi_CreateEntitlement_ByUserIdMutation` and append the userId to the tier's `granted` list, persisted back to Cloud Save in the same transaction.

## Simulate tab

A test-data seeder. The flow is:

1. Pick a device ID (one is auto-generated; "Regenerate" rolls a new one).
2. Pick a stat code. The dropdown is **server-side searched**: when the input is empty, `useStatConfigurationAdminApi_GetStats` lists all stats; when the user starts typing, a debounced (300ms) `useStatConfigurationAdminApi_GetStatsSearch` takes over with the keyword. The two queries are gated by `enabled` so only one is ever in flight, and `GetStatsSearch` is never called with an empty keyword (it has a backend `NotBlank` validation). If a leaderboard is selected at the top of the page, its underlying `statCode` is pre-filled.
3. Pick a stat value.
4. Click **Create player & set stat**:
   - `useOAuth20V4Api_PostTokenOauth_ByPlatformIdMutation_v4({ platformId: 'device', data: { device_id, skipSetCookie: true }, axiosConfig: { request: { headers: { Authorization: 'Basic ' + btoa(clientId + ':') } } } })` triggers the v4 OAuth device-login endpoint. AGS auto-provisions a fresh user bound to that device ID. Two non-obvious details:
     - **`Authorization` is overridden to HTTP Basic** for this one call. The public OAuth platform-token endpoint expects Basic auth keyed on the public client_id (empty password), not the admin's Bearer token. The SDK's `axiosConfig.request.headers` escape hatch lets us swap headers for a single mutation without disturbing the rest of the SDK's auth.
     - **`skipSetCookie: true` is critical.** Without it, the response writes the new player's session cookie to the browser and clobbers the admin's session cookie, signing the admin out mid-flow.

     The response is typed as `unknown` (v4 can return either a `TokenResponse` on success or a `LoginQueueTicketResponse` when queued); we cast to `TokenResponseV3` and check for `user_id`.
   - `useUserStatisticAdminApi_UpdateStatitemValue_ByUserId_ByStatCodeMutation_v2({ userId, statCode, data: { value, updateStrategy: 'OVERRIDE' } })` sets the stat value, which propagates to the leaderboard.
5. The seeded player is **persisted** in a Cloud Save admin game record at the fixed key `__SIMULATION_DEVICE_IDS__` (schema: `{ entries: CreatedPlayer[] }`). Only successful seeds are written; failures stay as an inline error on the form. On every write the record is also defensively filtered to drop any pre-existing entries with empty `userId`. The list survives page reloads, is shared across admins, and can be reused later for cleanup, audit, or as a test fixture.

Each persisted row has an **Update stat** button that opens a modal to change the stat code and/or value for that user without re-creating the player. The modal calls `useUserStatisticAdminApi_UpdateStatitemValue_ByUserId_ByStatCodeMutation_v2` with the existing `userId` and the new `statCode`/`value` (`updateStrategy: 'OVERRIDE'`), then patches the matching entry in the Cloud Save record by composite key (`deviceId + createdAt`) and stamps `updatedAt`. The picker inside the modal is the same `<StatCodeSelect>` component used by the seed form, so empty-input + server-side keyword search behave consistently.

Repeat to fill the leaderboard with synthetic entries before driving the Reward tab end-to-end.

> ⚠️ Note: device login is a public OAuth endpoint. From the Admin Portal context, the SDK reuses admin auth — this works in some AGS deployments without further configuration. If your deployment rejects that, swap the call for `useUsersV4AdminApi_CreateTestUserMutation_v4` which creates a test user under the admin context directly.

## Quick start

```bash
npx tiged AccelByte/extend-app-ui-templates/templates/cohort-campaign-builder my-app-ui
cd my-app-ui
```

Export your AGS credentials (keep this terminal session open):

```bash
export AB_BASE_URL='<YourAGSBaseURL>'
export AB_CLIENT_ID='<YourClientID>'
export AB_CLIENT_SECRET='<YourClientSecret>'
export AB_NAMESPACE='<YourGameNamespace>'
export AB_APPUI_NAME='<YourAppUIName>'
```

Register the App UI, generate the local `.env.local` for AGS API access, and install dependencies:

```bash
extend-helper-cli appui create --namespace $AB_NAMESPACE --name $AB_APPUI_NAME
extend-helper-cli appui setup-env --namespace $AB_NAMESPACE --name $AB_APPUI_NAME
npm install
```

Then run the dev server:

```bash
npm run dev
```

Open `http://localhost:5173`. You should see the cohort campaign builder. Edits are reflected immediately.

When ready to deploy:

```bash
extend-helper-cli appui upload --namespace $AB_NAMESPACE --name $AB_APPUI_NAME
```

## How it differs from the other templates

- **No `swaggers.json` or codegen step.** The other templates run `@accelbyte/codegen` against an Extend service's Swagger to generate a typed client. This template never talks to an Extend service, so there is nothing to codegen.
- **No `VITE_AB_EXTEND_APP_NAME`.** The other templates rewrite the SDK base URL to point at an Extend app (`/ext-<namespace>-<appname>`). This template leaves the base URL alone so requests reach AGS services directly.
- **Uses the typed AGS SDK packages directly.** All hooks come from `@accelbyte/sdk-cloudsave`, `@accelbyte/sdk-platform`, `@accelbyte/sdk-leaderboard`, `@accelbyte/sdk-iam`, and `@accelbyte/sdk-social` — each at its `/react-query` subpath, where TanStack Query hooks live. The top-level package paths expose API factory functions and types only.

## Project layout

```
cohort-campaign-builder/
├── src/
│   ├── federated-element.tsx   # Top-level shell: header + Tabs.
│   ├── reward-tab.tsx          # Configure tier section + Grant section.
│   ├── simulate-tab.tsx        # Device-login + stat-injection seeder.
│   ├── module.tsx              # AppUIModule wiring (no Extend baseURL override).
│   ├── main.tsx                # Local dev entry point.
│   ├── mf-entry.ts             # Module Federation entry for the Admin Portal host.
│   ├── index.css               # Tailwind utilities, prefixed with `appui:`.
│   ├── devmode.css             # Tailwind preflight, dev-only.
│   └── vite-env.d.ts
├── public/
├── index.html
├── vite.config.ts
├── eslint.config.js
├── tsconfig*.json
├── package.json
└── README.md
```

## SDK hooks used

From `@accelbyte/sdk-cloudsave/react-query`:

- `useGameRecordAdminApi_GetRecord_ByKey` — read the season record.
- `useGameRecordAdminApi_UpdateRecord_ByKeyMutation` — replace the record (used both when saving the form and after each grant to update the `granted` list).
- `Key_GameRecordAdmin` — for cache invalidation.

From `@accelbyte/sdk-platform/react-query`:

- `useItemAdminApi_GetItemsByCriteria_v2` — server-side item search for the picker, using the `itemName` query param so the keyword filters by name on the backend.
- `useEntitlementAdminApi_GetEntitlementsOwnershipByItemIds_ByUserId` — per-row ownership check.
- `useEntitlementAdminApi_CreateEntitlement_ByUserIdMutation` — grant the entitlement.

From `@accelbyte/sdk-leaderboard/react-query`:

- `useLeaderboardConfigurationV3AdminApi_GetLeaderboards_v3` — populates the leaderboard picker.
- `useLeaderboardConfigurationV3AdminApi_GetLeaderboard_ByLeaderboardCode_v3` — used by Simulate to discover the leaderboard's underlying stat code.
- `useLeaderboardDataV3AdminApi_GetAlltime_ByLeaderboardCode_v3` — top-N rankings.

From `@accelbyte/sdk-iam/react-query`:

- `useOAuth20V4Api_PostTokenOauth_ByPlatformIdMutation_v4` — device login that auto-creates the test user and returns its `user_id` (v4 — the v1 `useOAuthApi_PostTokenOauth_ByPlatformIdMutation` is deprecated).

From `@accelbyte/sdk-social/react-query`:

- `useStatConfigurationAdminApi_GetStats` — lists stats when the picker's search input is empty.
- `useStatConfigurationAdminApi_GetStatsSearch` — server-side keyword filter when the user types (gated on a non-blank keyword to satisfy backend validation).
- `useUserStatisticAdminApi_UpdateStatitemValue_ByUserId_ByStatCodeMutation_v2` — sets the new player's stat value.
