import { useAppUIContext } from '@accelbyte/sdk-extend-app-ui'
import {
  Key_GameRecordAdmin,
  useGameRecordAdminApi_GetRecord_ByKey,
  useGameRecordAdminApi_UpdateRecord_ByKeyMutation
} from '@accelbyte/sdk-cloudsave/react-query'
import { TokenResponseV3 } from '@accelbyte/sdk-iam'
import { useOAuth20V4Api_PostTokenOauth_ByPlatformIdMutation_v4 } from '@accelbyte/sdk-iam/react-query'
import { useLeaderboardConfigurationV3AdminApi_GetLeaderboard_ByLeaderboardCode_v3 } from '@accelbyte/sdk-leaderboard/react-query'
import {
  useStatConfigurationAdminApi_GetStats,
  useStatConfigurationAdminApi_GetStatsSearch,
  useUserStatisticAdminApi_UpdateStatitemValue_ByUserId_ByStatCodeMutation_v2
} from '@accelbyte/sdk-social/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, InputNumber, List, Modal, Select, Space, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'

const { Paragraph, Text } = Typography

/**
 * Cloud Save admin-record key under which the seeded-player history lives.
 * Reusing a fixed, known key means subsequent sessions and other admins see
 * the same list — useful for cleanup, audit, or sharing test fixtures.
 */
const SIMULATION_RECORD_KEY = '__SIMULATION_DEVICE_IDS__'

type CreatedPlayer = {
  deviceId: string
  userId: string
  statCode: string
  statValue: number
  ok: boolean
  error?: string
  createdAt: string
  /** Set when the player's stat is later edited via the Update modal. */
  updatedAt?: string
}

type SimulationRecord = { entries: CreatedPlayer[] }

/** Stable composite key per entry, used to locate the row during update. */
function entryKey(p: Pick<CreatedPlayer, 'deviceId' | 'createdAt'>): string {
  return `${p.deviceId}__${p.createdAt}`
}

export function SimulateTab({ leaderboardCode }: { leaderboardCode: string | undefined }) {
  const { sdk } = useAppUIContext()
  const queryClient = useQueryClient()

  // If a leaderboard is selected at the top, pre-fill its underlying stat code
  // so the seeded value actually shows up on the leaderboard.
  const lbConfig = useLeaderboardConfigurationV3AdminApi_GetLeaderboard_ByLeaderboardCode_v3(
    sdk,
    { leaderboardCode: leaderboardCode ?? '' },
    { enabled: !!leaderboardCode }
  )
  const lbStatCode = lbConfig.data?.statCode

  // Cloud Save: persisted history of seeded players. Survives reloads and is
  // shared across admins, so re-using a deviceId or auditing the test fixture
  // is straightforward.
  const historyRecord = useGameRecordAdminApi_GetRecord_ByKey(sdk, { key: SIMULATION_RECORD_KEY })
  const persistedEntries: CreatedPlayer[] = ((historyRecord.data?.value ?? {}) as Partial<SimulationRecord>).entries ?? []
  const updateRecord = useGameRecordAdminApi_UpdateRecord_ByKeyMutation(sdk)

  const tokenMutation = useOAuth20V4Api_PostTokenOauth_ByPlatformIdMutation_v4(sdk)
  const statMutation = useUserStatisticAdminApi_UpdateStatitemValue_ByUserId_ByStatCodeMutation_v2(sdk)

  const [deviceId, setDeviceId] = useState(generateDeviceId())
  const [statCode, setStatCode] = useState<string | undefined>(undefined)
  const [statValue, setStatValue] = useState<number>(100)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<CreatedPlayer | null>(null)

  const applyEntryUpdate = async (target: CreatedPlayer, patch: Pick<CreatedPlayer, 'statCode' | 'statValue'>) => {
    const targetKey = entryKey(target)
    const cleaned = persistedEntries.filter(e => !!e.userId)
    const next: SimulationRecord = {
      entries: cleaned.map(e =>
        entryKey(e) === targetKey ? { ...e, statCode: patch.statCode, statValue: patch.statValue, updatedAt: new Date().toISOString() } : e
      )
    }
    await updateRecord.mutateAsync({ key: SIMULATION_RECORD_KEY, data: next })
    queryClient.invalidateQueries({ queryKey: [Key_GameRecordAdmin.Record_ByKey] })
  }

  useEffect(() => {
    if (lbStatCode && !statCode) setStatCode(lbStatCode)
  }, [lbStatCode, statCode])

  const persistEntry = async (entry: CreatedPlayer) => {
    // Drop any pre-existing entries with empty userIds — those are noise
    // (failed seeds from older versions of this template) and we don't want
    // to keep writing them back into the record.
    const cleaned = persistedEntries.filter(e => !!e.userId)
    const next: SimulationRecord = { entries: [entry, ...cleaned].slice(0, 200) }
    await updateRecord.mutateAsync({ key: SIMULATION_RECORD_KEY, data: next })
    queryClient.invalidateQueries({ queryKey: [Key_GameRecordAdmin.Record_ByKey] })
  }

  const handleCreate = async () => {
    if (!statCode) {
      setError('Pick a stat code first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      // 1. Device login → AGS auto-creates a user bound to this device_id.
      // The public OAuth platform-token endpoint expects HTTP Basic auth
      // keyed on the public client_id (empty password), NOT the admin's
      // Bearer token — so we override Authorization for this one call via
      // axiosConfig.request.headers. skipSetCookie keeps the new player's
      // cookie from clobbering the admin's session. v4 returns `unknown`
      // because the response can be either a TokenResponse (success) or a
      // LoginQueueTicketResponse (queued); we narrow by checking user_id.
      const { clientId } = sdk.assembly().coreConfig
      const token = (await tokenMutation.mutateAsync({
        platformId: 'device',
        data: { device_id: deviceId, skipSetCookie: true },
        axiosConfig: {
          request: {
            headers: { Authorization: `Basic ${btoa(`${clientId}:`)}` }
          }
        }
      })) as TokenResponseV3
      const userId = token.user_id
      if (!userId) throw new Error('Token response did not include a user_id (login may be queued — see LoginQueueTicketResponse)')

      // 2. Set the chosen stat for the new user so it appears on the leaderboard.
      await statMutation.mutateAsync({ userId, statCode, data: { value: statValue, updateStrategy: 'OVERRIDE' } })

      // 3. Persist the success in Cloud Save so it's visible across sessions.
      await persistEntry({ deviceId, userId, statCode, statValue, ok: true, createdAt: new Date().toISOString() })

      setDeviceId(generateDeviceId())
    } catch (err) {
      // On failure, only show the inline error — do NOT persist a row with
      // an empty userId. Those rows clutter the Cloud Save record and aren't
      // useful (the deviceId can be re-tried freely).
      const message = err instanceof Error ? err.message : 'Failed to seed test player'
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="appui:flex appui:flex-col appui:gap-6">
      <Card title="Seed a test player">
        <Paragraph type="secondary" className="appui:mt-0!">
          Create a fresh player by logging in with an arbitrary device ID (the public OAuth flow auto-creates the user), then set a stat
          value so the player surfaces on the configured leaderboard. Repeat to populate the leaderboard with synthetic entries for testing
          the Reward tab end-to-end.
        </Paragraph>

        {leaderboardCode && lbStatCode && (
          <Alert
            type="info"
            showIcon
            className="appui:mb-4"
            message={
              <span>
                Leaderboard <Text code>{leaderboardCode}</Text> is backed by stat <Text code>{lbStatCode}</Text> — pre-filled below.
              </span>
            }
          />
        )}

        <Form layout="vertical">
          <Form.Item label="Device ID" tooltip="Sent as platform_id=device, device_id=<this>. AGS auto-provisions a user bound to it.">
            <Space.Compact className="appui:w-full">
              <Input value={deviceId} onChange={e => setDeviceId(e.target.value)} />
              <Button onClick={() => setDeviceId(generateDeviceId())}>Regenerate</Button>
            </Space.Compact>
          </Form.Item>
          <div className="appui:grid appui:grid-cols-2 appui:gap-4">
            <Form.Item label="Stat code" tooltip="Type to search — server-side keyword filter via Statistic.GetStatsSearch.">
              <StatCodeSelect value={statCode} onChange={setStatCode} placeholder="Pick a stat (type to search)" />
            </Form.Item>
            <Form.Item label="Value to set">
              <InputNumber
                className="appui:w-full"
                value={statValue}
                onChange={v => setStatValue(typeof v === 'number' ? v : 0)}
                placeholder="e.g. 1500"
              />
            </Form.Item>
          </div>
          <Button type="primary" loading={busy} onClick={handleCreate}>
            Create player &amp; set stat
          </Button>
        </Form>

        {error && <Alert className="appui:mt-4" type="error" showIcon message={error} />}
      </Card>

      <Card
        title={`Seeded players (persisted at ${SIMULATION_RECORD_KEY})`}
        loading={historyRecord.isLoading}
        extra={persistedEntries.length > 0 ? <Text type="secondary">{persistedEntries.length} entries</Text> : null}>
        {historyRecord.isError && (
          <Alert
            type="info"
            showIcon
            className="appui:mb-3"
            message="No simulation record yet"
            description="The Cloud Save key will be created on the first successful seed."
          />
        )}
        {persistedEntries.length === 0 && !historyRecord.isLoading && !historyRecord.isError && (
          <Text type="secondary">Nothing persisted yet. Seed a player above.</Text>
        )}
        {persistedEntries.length > 0 && (
          <List
            size="small"
            dataSource={persistedEntries}
            renderItem={p => (
              <List.Item>
                <Space className="appui:w-full appui:flex appui:justify-between">
                  <Space>
                    {p.ok ? <Tag color="green">OK</Tag> : <Tag color="red">FAIL</Tag>}
                    <Text code>{p.userId || '(no user)'}</Text>
                    <Text type="secondary">device {p.deviceId.slice(0, 12)}…</Text>
                  </Space>
                  <Space>
                    <Tag color="blue">
                      {p.statCode}: {p.statValue}
                    </Tag>
                    {(p.updatedAt || p.createdAt) && (
                      <Text type="secondary">
                        {p.updatedAt ? `updated ${new Date(p.updatedAt).toLocaleString()}` : new Date(p.createdAt).toLocaleString()}
                      </Text>
                    )}
                    {p.error && <Text type="danger">{p.error}</Text>}
                    <Button size="small" disabled={!p.userId} onClick={() => setEditing(p)}>
                      Update stat
                    </Button>
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>

      <UpdateStatModal entry={editing} onClose={() => setEditing(null)} onApply={applyEntryUpdate} />

      <Alert
        type="info"
        showIcon
        message="Why this is safe to run from the Admin Portal"
        description="The v4 OAuth device-login call is invoked with skipSetCookie: true so the new player's session cookie is NOT written to the browser. Without that flag, the response would overwrite the admin's session cookie and sign the admin out mid-flow."
      />
    </div>
  )
}

// Reusable stat-code picker with server-side search.
//
// GetStatsSearch rejects a blank keyword (NotBlank validation), so we only
// enable it when the input has something to search; for the empty-input
// state we fall back to GetStats (which lists all stats unconditionally).
function StatCodeSelect({ value, onChange, placeholder }: { value: string | undefined; onChange: (v: string) => void; placeholder?: string }) {
  const { sdk } = useAppUIContext()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const hasKeyword = debouncedSearch.trim().length > 0
  const listQuery = useStatConfigurationAdminApi_GetStats(sdk, { queryParams: { limit: 50 } }, { enabled: !hasKeyword })
  const searchQuery = useStatConfigurationAdminApi_GetStatsSearch(
    sdk,
    { queryParams: { keyword: debouncedSearch, limit: 50 } },
    { enabled: hasKeyword }
  )
  const active = hasKeyword ? searchQuery : listQuery
  const options = (active.data?.data ?? [])
    .map(s => s.statCode)
    .filter((c): c is string => !!c)
    .map(c => ({ value: c, label: c }))

  // Make sure the currently selected value is always in the option list, even
  // if the search keyword filtered it out.
  if (value && !options.some(o => o.value === value)) options.unshift({ value, label: value })

  return (
    <Select
      placeholder={placeholder ?? 'Pick a stat (type to search)'}
      value={value}
      onChange={onChange}
      onSearch={setSearch}
      showSearch
      filterOption={false}
      loading={active.isLoading}
      notFoundContent={active.isLoading ? 'Searching…' : 'No stats match'}
      options={options}
    />
  )
}

// Modal for editing the stat code + value of an already-seeded player. The
// AGS update + Cloud Save record update are stitched together in onApply,
// so this component only owns the form state and the in-flight UI.
function UpdateStatModal({
  entry,
  onClose,
  onApply
}: {
  entry: CreatedPlayer | null
  onClose: () => void
  onApply: (target: CreatedPlayer, patch: { statCode: string; statValue: number }) => Promise<void>
}) {
  const { sdk } = useAppUIContext()
  const statMutation = useUserStatisticAdminApi_UpdateStatitemValue_ByUserId_ByStatCodeMutation_v2(sdk)

  const [statCode, setStatCode] = useState<string | undefined>(entry?.statCode)
  const [statValue, setStatValue] = useState<number>(entry?.statValue ?? 0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form whenever a new entry is opened.
  useEffect(() => {
    setStatCode(entry?.statCode)
    setStatValue(entry?.statValue ?? 0)
    setError(null)
  }, [entry])

  const handleConfirm = async () => {
    if (!entry || !statCode) return
    setBusy(true)
    setError(null)
    try {
      // 1. Update the stat for the existing user via AGS.
      await statMutation.mutateAsync({
        userId: entry.userId,
        statCode,
        data: { value: statValue, updateStrategy: 'OVERRIDE' }
      })
      // 2. Reflect the change in the persisted Cloud Save record.
      await onApply(entry, { statCode, statValue })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stat')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={!!entry}
      title="Update player stat"
      onCancel={onClose}
      onOk={handleConfirm}
      okText="Apply"
      okButtonProps={{ loading: busy, disabled: !statCode }}
      destroyOnClose>
      {entry && (
        <Form layout="vertical">
          <Form.Item label="User ID">
            <Input value={entry.userId} disabled />
          </Form.Item>
          <Form.Item label="Device ID">
            <Input value={entry.deviceId} disabled />
          </Form.Item>
          <Form.Item label="Stat code">
            <StatCodeSelect value={statCode} onChange={setStatCode} />
          </Form.Item>
          <Form.Item label="New value">
            <InputNumber className="appui:w-full" value={statValue} onChange={v => setStatValue(typeof v === 'number' ? v : 0)} />
          </Form.Item>
          {error && <Alert type="error" showIcon message={error} />}
        </Form>
      )}
    </Modal>
  )
}

// Build a plausible-looking but distinct device ID for each seeded player.
function generateDeviceId(): string {
  const rand = () =>
    Math.random()
      .toString(16)
      .slice(2, 10)
      .padEnd(8, '0')
  return `sim-${rand()}-${rand()}`
}
