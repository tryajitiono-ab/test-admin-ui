import { useAppUIContext } from '@accelbyte/sdk-extend-app-ui'
import {
  Key_GameRecordAdmin,
  useGameRecordAdminApi_GetRecord_ByKey,
  useGameRecordAdminApi_UpdateRecord_ByKeyMutation
} from '@accelbyte/sdk-cloudsave/react-query'
import {
  Key_EntitlementAdmin,
  useEntitlementAdminApi_CreateEntitlement_ByUserIdMutation,
  useEntitlementAdminApi_GetEntitlements,
  useEntitlementAdminApi_GetEntitlements_ByUserId,
  useEntitlementAdminApi_UpdateEntitlementRevokeById_ByUserIdMutation,
  useItemAdminApi_GetItemsByCriteria_v2
} from '@accelbyte/sdk-platform/react-query'
import { useLeaderboardDataV3AdminApi_GetAlltime_ByLeaderboardCode_v3 } from '@accelbyte/sdk-leaderboard/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Collapse, Form, Input, InputNumber, Select, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { useEffect, useState } from 'react'
import type { RewardRecord, TierConfig } from './federated-element'

const { Paragraph, Text } = Typography

type TierEntry = { name: string; cfg: TierConfig }

export function RewardTab({ seasonKey, leaderboardCode }: { seasonKey: string; leaderboardCode: string | undefined }) {
  return (
    <div className="appui:flex appui:flex-col appui:gap-6">
      <ConfigureSection key={seasonKey} seasonKey={seasonKey} />
      <GrantSection seasonKey={seasonKey} leaderboardCode={leaderboardCode} />
    </div>
  )
}

function recordToTiers(record: RewardRecord): TierEntry[] {
  const entries = Object.entries(record).map(([name, cfg]) => ({
    name,
    cfg: { ranks: cfg.ranks ?? '', itemId: cfg.itemId ?? '', quantity: cfg.quantity ?? 1, granted: cfg.granted ?? [] }
  }))
  return entries.length > 0 ? entries : [{ name: 'tier_1', cfg: { ranks: '1-10', itemId: '', quantity: 1, granted: [] } }]
}

function ConfigureSection({ seasonKey }: { seasonKey: string }) {
  const { sdk } = useAppUIContext()
  const queryClient = useQueryClient()

  const recordQuery = useGameRecordAdminApi_GetRecord_ByKey(sdk, { key: seasonKey }, { enabled: !!seasonKey })
  const updateRecord = useGameRecordAdminApi_UpdateRecord_ByKeyMutation(sdk)

  // The form shows server data by default; once the user starts editing we
  // hold a local override until save (or remount via the parent's `key`).
  const serverTiers = recordToTiers((recordQuery.data?.value ?? {}) as RewardRecord)
  const [localTiers, setLocalTiers] = useState<TierEntry[] | null>(null)
  const tiers = localTiers ?? serverTiers
  const dirty = localTiers !== null

  const editTiers = (mutate: (prev: TierEntry[]) => TierEntry[]) => {
    setLocalTiers(prev => mutate(prev ?? serverTiers))
  }

  const updateTier = (index: number, patch: Partial<TierConfig> & { name?: string }) =>
    editTiers(prev => {
      const next = [...prev]
      const cur = next[index]
      next[index] = { name: patch.name ?? cur.name, cfg: { ...cur.cfg, ...patch } }
      return next
    })

  const addTier = () =>
    editTiers(prev => [...prev, { name: `tier_${prev.length + 1}`, cfg: { ranks: '', itemId: '', quantity: 1, granted: [] } }])

  const removeTier = (index: number) => editTiers(prev => prev.filter((_, i) => i !== index))

  const handleSave = async () => {
    const data: RewardRecord = Object.fromEntries(tiers.map(t => [t.name, t.cfg]))
    await updateRecord.mutateAsync({ key: seasonKey, data })
    queryClient.invalidateQueries({ queryKey: [Key_GameRecordAdmin.Record_ByKey] })
    setLocalTiers(null)
  }

  return (
    <Card title="1. Configure reward tiers">
      <Paragraph type="secondary" className="appui:mt-0!">
        Stored as a Cloud Save admin game record at key <Text code>{seasonKey}</Text>. Each tier maps a rank range to a Platform item +
        quantity. Grant eligibility is checked live against Platform entitlements, so the Grant button is disabled as soon as a user owns the item.
      </Paragraph>

      <Collapse
        accordion
        items={tiers.map((tier, i) => ({
          key: tier.name + i,
          label: (
            <div className="appui:flex appui:justify-between appui:items-center appui:w-full appui:pr-2">
              <strong>{tier.name}</strong>
              <Space>
                <Tag color="blue">ranks {tier.cfg.ranks || '—'}</Tag>
                <Tag>×{tier.cfg.quantity}</Tag>
                {tier.cfg.itemId && <ItemOwnerCount itemId={tier.cfg.itemId} />}
              </Space>
            </div>
          ),
          children: <TierEditor tier={tier} onChange={p => updateTier(i, p)} onRemove={() => removeTier(i)} />
        }))}
      />

      <Space className="appui:mt-4">
        <Button onClick={addTier}>+ Add tier</Button>
        <Button type="primary" loading={updateRecord.isPending} disabled={!dirty} onClick={handleSave}>
          Save tiers
        </Button>
        {!dirty && recordQuery.data && <Text type="secondary">Saved.</Text>}
      </Space>

      {updateRecord.error && (
        <Alert className="appui:mt-3" type="error" showIcon message="Failed to save record" description={updateRecord.error.message} />
      )}
    </Card>
  )
}

function ItemOwnerCount({ itemId }: { itemId: string }) {
  const { sdk } = useAppUIContext()
  const query = useEntitlementAdminApi_GetEntitlements(sdk, { queryParams: { itemId: [itemId], limit: 200 } }, { enabled: !!itemId })
  if (!itemId || query.isLoading) return null
  const data = query.data?.data ?? []
  const count = new Set(data.map(e => e.userId).filter(Boolean)).size
  const hasMore = !!query.data?.paging?.next
  const label = hasMore ? `${count}+ owners` : `${count} owner${count !== 1 ? 's' : ''}`
  const color = count === 0 ? 'green' : count < 10 ? 'blue' : count < 50 ? 'orange' : 'red'
  const tip = count === 0 ? 'No one owns this yet — truly rare' : count < 10 ? 'Rare' : count < 50 ? 'Uncommon' : 'Common'
  return (
    <Tag color={color} title={tip}>
      {label}
    </Tag>
  )
}

function TierEditor({
  tier,
  onChange,
  onRemove
}: {
  tier: { name: string; cfg: TierConfig }
  onChange: (patch: Partial<TierConfig> & { name?: string }) => void
  onRemove: () => void
}) {
  return (
    <Form layout="vertical">
      <div className="appui:grid appui:grid-cols-2 appui:gap-4">
        <Form.Item label="Tier name (object key)">
          <Input value={tier.name} onChange={e => onChange({ name: e.target.value })} placeholder="tier_1" />
        </Form.Item>
        <Form.Item label="Ranks" tooltip='Inclusive rank range, e.g. "1-10"'>
          <Input value={tier.cfg.ranks} onChange={e => onChange({ ranks: e.target.value })} placeholder="1-10" />
        </Form.Item>
      </div>
      <div className="appui:grid appui:grid-cols-2 appui:gap-4">
        <Form.Item label="Item">
          <ItemSearchSelect value={tier.cfg.itemId} onChange={itemId => onChange({ itemId })} />
        </Form.Item>
        <Form.Item label="Quantity">
          <InputNumber
            min={1}
            className="appui:w-full"
            value={tier.cfg.quantity}
            onChange={v => onChange({ quantity: typeof v === 'number' ? v : 1 })}
          />
        </Form.Item>
      </div>
      <div className="appui:flex appui:justify-end">
        <Button danger size="small" onClick={onRemove}>
          Remove tier
        </Button>
      </div>
    </Form>
  )
}

// Searchable Platform-item picker. Uses the v2 GetItemsByCriteria endpoint
// so the search keyword maps to the server-side `itemName` filter — no
// client-side filtering needed.
function ItemSearchSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { sdk } = useAppUIContext()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const itemsQuery = useItemAdminApi_GetItemsByCriteria_v2(sdk, {
    queryParams: {
      itemStatus: 'ACTIVE',
      limit: 50,
      ...(debouncedSearch ? { itemName: debouncedSearch } : {})
    }
  })

  const data = (itemsQuery.data?.data ?? []) as Array<{
    itemId?: string | null
    name?: string | null
    sku?: string | null
    itemType?: string | null
  }>
  const options = data.map(it => ({
    value: it.itemId ?? '',
    label: `${it.name ?? '(unnamed)'} — ${it.sku ?? it.itemId} [${it.itemType ?? 'ITEM'}]`
  }))

  const matchedLabel = options.find(o => o.value === value)?.label
  if (matchedLabel && matchedLabel !== selectedLabel) setSelectedLabel(matchedLabel)

  if (value && !options.some(o => o.value === value)) options.unshift({ value, label: selectedLabel || value })

  return (
    <Select
      showSearch
      placeholder="Search items by name"
      value={value || undefined}
      onChange={(id, option) => {
        const opt = Array.isArray(option) ? option[0] : option
        setSelectedLabel((opt as { label?: string })?.label ?? '')
        onChange(id)
      }}
      onSearch={setSearch}
      filterOption={false}
      loading={itemsQuery.isLoading}
      options={options}
      notFoundContent={itemsQuery.isLoading ? 'Searching…' : 'No items found'}
    />
  )
}

type Row = {
  rank: number
  userId: string
  point: number
  tierName: string | null
  tierCfg: TierConfig | null
}

function GrantSection({ seasonKey, leaderboardCode }: { seasonKey: string; leaderboardCode: string | undefined }) {
  const { sdk } = useAppUIContext()
  const queryClient = useQueryClient()
  const itemNamespace = sdk.assembly().coreConfig.namespace

  const recordQuery = useGameRecordAdminApi_GetRecord_ByKey(sdk, { key: seasonKey }, { enabled: !!seasonKey })
  const rankingQuery = useLeaderboardDataV3AdminApi_GetAlltime_ByLeaderboardCode_v3(
    sdk,
    { leaderboardCode: leaderboardCode ?? '', queryParams: { limit: 100, offset: 0 } },
    { enabled: !!leaderboardCode }
  )

  const tiers: RewardRecord = (recordQuery.data?.value ?? {}) as RewardRecord
  const ranking = rankingQuery.data?.data ?? []

  const rows: Row[] = ranking.map((entry, idx) => {
    const rank = idx + 1
    const match = matchTier(rank, tiers)
    return {
      rank,
      userId: entry.userId ?? '',
      point: entry.point ?? 0,
      tierName: match?.name ?? null,
      tierCfg: match?.cfg ?? null
    }
  })

  const grantEntitlement = useEntitlementAdminApi_CreateEntitlement_ByUserIdMutation(sdk)
  const revokeEntitlements = useEntitlementAdminApi_UpdateEntitlementRevokeById_ByUserIdMutation(sdk)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const grantOne = async (row: Row) => {
    if (!row.tierCfg || !row.userId) return
    const cfg = row.tierCfg
    setBusy(row.userId)
    setError(null)
    try {
      await grantEntitlement.mutateAsync({
        userId: row.userId,
        data: [
          {
            itemId: cfg.itemId,
            itemNamespace,
            quantity: cfg.quantity,
            source: 'OTHER',
            origin: 'System'
          }
        ]
      })
      queryClient.invalidateQueries({ queryKey: [Key_EntitlementAdmin.Entitlements_ByUserId] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Grant failed')
    } finally {
      setBusy(null)
    }
  }

  const grantAll = async () => {
    setError(null)
    for (const row of rows) {
      if (!row.tierCfg || !row.userId) continue
      setBusy(row.userId)
      try {
        await grantEntitlement.mutateAsync({
          userId: row.userId,
          data: [{ itemId: row.tierCfg.itemId, itemNamespace, quantity: row.tierCfg.quantity, source: 'OTHER', origin: 'System' }]
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : `Grant failed for ${row.userId}`)
        break
      }
    }
    setBusy(null)
    queryClient.invalidateQueries({ queryKey: [Key_EntitlementAdmin.Entitlements_ByUserId] })
  }

  const revokeOne = async (row: Row, entitlementIds: string[]) => {
    if (!row.userId || entitlementIds.length === 0) return
    setBusy(row.userId)
    setError(null)
    try {
      await revokeEntitlements.mutateAsync({ userId: row.userId, queryParams: { entitlementIds: entitlementIds.join(',') } })
      queryClient.invalidateQueries({ queryKey: [Key_EntitlementAdmin.Entitlements_ByUserId] })
      queryClient.invalidateQueries({ queryKey: [Key_EntitlementAdmin.Entitlements] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke failed')
    } finally {
      setBusy(null)
    }
  }

  if (!leaderboardCode) {
    return (
      <Card title="2. Grant rewards">
        <Alert type="info" showIcon message="Pick a leaderboard above to load rankings." />
      </Card>
    )
  }

  if (Object.keys(tiers).length === 0) {
    return (
      <Card title="2. Grant rewards">
        <Alert type="info" showIcon message="Configure at least one tier in section 1 first." />
      </Card>
    )
  }

  return (
    <Card
      title="2. Grant rewards"
      extra={
        <Space>
          <Button
            loading={rankingQuery.isFetching}
            onClick={() => {
              rankingQuery.refetch()
              queryClient.invalidateQueries({ queryKey: [Key_EntitlementAdmin.Entitlements_ByUserId] })
            }}>
            Refresh
          </Button>
          <Button type="primary" loading={!!busy} onClick={grantAll} disabled={rows.every(r => !r.tierCfg)}>
            Bulk grant all
          </Button>
        </Space>
      }>
      <Paragraph type="secondary" className="appui:mt-0!">
        Top {ranking.length} from the leaderboard, joined with the tier rules above. Status and Grant/Revoke actions reflect live Platform entitlement ownership.
      </Paragraph>
      {error && <Alert className="appui:mb-4" type="error" showIcon message={error} />}
      <Table<Row>
        rowKey={r => `${r.rank}-${r.userId}`}
        size="small"
        pagination={false}
        loading={rankingQuery.isLoading}
        dataSource={rows}
        columns={[
          { title: 'Rank', dataIndex: 'rank', width: 60 },
          { title: 'User ID', dataIndex: 'userId', ellipsis: true },
          { title: 'Points', dataIndex: 'point', width: 90 },
          {
            title: 'Tier',
            width: 120,
            render: (_, r) => (r.tierName ? <Tag color="blue">{r.tierName}</Tag> : <Text type="secondary">—</Text>)
          },
          {
            title: 'Status',
            width: 220,
            render: (_, r) => <RowStatus row={r} />
          },
          {
            title: 'Action',
            width: 180,
            render: (_, r) => <RowAction row={r} busy={busy === r.userId} onGrant={() => grantOne(r)} onRevoke={ids => revokeOne(r, ids)} />
          }
        ]}
      />
    </Card>
  )
}

// Match a rank against tier rule strings like "1-10" or "5".
function matchTier(rank: number, tiers: RewardRecord): { name: string; cfg: TierConfig } | null {
  for (const [name, cfg] of Object.entries(tiers)) {
    if (rankInRange(rank, cfg.ranks)) return { name, cfg }
  }
  return null
}

function rankInRange(rank: number, range: string): boolean {
  const trimmed = range.trim()
  if (!trimmed) return false
  if (!trimmed.includes('-')) return parseInt(trimmed, 10) === rank
  const [loStr, hiStr] = trimmed.split('-')
  const lo = parseInt(loStr, 10)
  const hi = parseInt(hiStr, 10)
  return Number.isFinite(lo) && Number.isFinite(hi) && rank >= lo && rank <= hi
}

// Per-row components fire their own ownership query. This satisfies the rules
// of hooks (each row is a separate component) and avoids the need for
// useQueries gymnastics. For larger leaderboards you'd swap to the bulk
// endpoint `GetEntitlementsByItemIds` keyed on the union of userIds.
function useRowOwnership(row: Row) {
  const { sdk } = useAppUIContext()
  const enabled = !!row.tierCfg && !!row.userId
  const query = useEntitlementAdminApi_GetEntitlements_ByUserId(
    sdk,
    { userId: row.userId, queryParams: { itemId: row.tierCfg ? [row.tierCfg.itemId] : [], activeOnly: true } },
    { enabled }
  )
  const active = query.data?.data ?? []
  const entitlementIds = active.map(e => e.id).filter((id): id is string => !!id)
  return { owns: entitlementIds.length > 0, ownedCount: entitlementIds.length, entitlementIds, isLoading: query.isLoading }
}

function RowStatus({ row }: { row: Row }) {
  const { owns, ownedCount, isLoading } = useRowOwnership(row)
  if (!row.tierCfg) return <Text type="secondary">No tier</Text>
  if (isLoading) return <Tag>Checking…</Tag>
  if (owns) return <Tag color="green">Owns ×{ownedCount}</Tag>
  return <Tag>Pending</Tag>
}

function RowAction({ row, busy, onGrant, onRevoke }: { row: Row; busy: boolean; onGrant: () => void; onRevoke: (ids: string[]) => void }) {
  const { owns, entitlementIds, isLoading } = useRowOwnership(row)
  const noTier = !row.tierCfg
  const grantTip = noTier ? 'No tier assigned for this rank' : owns ? 'User already owns this item' : `Grant ×${row.tierCfg!.quantity}`
  return (
    <Space>
      <Tooltip title={grantTip}>
        <Button size="small" disabled={noTier || owns} loading={busy || isLoading} onClick={onGrant}>
          Grant
        </Button>
      </Tooltip>
      {owns && (
        <Tooltip title={`Revoke ${entitlementIds.length} entitlement${entitlementIds.length !== 1 ? 's' : ''}`}>
          <Button size="small" danger loading={busy || isLoading} onClick={() => onRevoke(entitlementIds)}>
            Revoke
          </Button>
        </Tooltip>
      )}
    </Space>
  )
}
