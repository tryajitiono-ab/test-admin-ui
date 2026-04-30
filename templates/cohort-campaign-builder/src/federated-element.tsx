import { useAppUIContext } from '@accelbyte/sdk-extend-app-ui'
import { useLeaderboardConfigurationV3AdminApi_GetLeaderboards_v3 } from '@accelbyte/sdk-leaderboard/react-query'
import { Card, Form, Input, Select, Tabs, Typography } from 'antd'
import { useState } from 'react'
import { RewardTab } from './reward-tab'
import { SimulateTab } from './simulate-tab'

const { Title, Paragraph, Text } = Typography

/**
 * The shape of the Cloud Save admin game record that drives the Reward tab.
 * Keys are tier names (e.g. "tier_1"); values describe each tier.
 *
 * Example:
 * {
 *   "tier_1": { "ranks": "1-10", "itemId": "<uuid>", "quantity": 1, "granted": [] },
 *   "tier_2": { "ranks": "11-50", "itemId": "<uuid>", "quantity": 1, "granted": [] }
 * }
 */
export type TierConfig = {
  ranks: string
  itemId: string
  quantity: number
  granted?: string[]
}

export type RewardRecord = Record<string, TierConfig>

export function FederatedElement() {
  const [seasonKey, setSeasonKey] = useState('pvp-season-1')
  const [leaderboardCode, setLeaderboardCode] = useState<string | undefined>(undefined)

  return (
    <div className="appui:p-6 appui:max-w-[1200px] appui:mx-auto">
      <div className="appui:mb-6">
        <Title level={2} className="appui:m-0!">
          Cohort Campaign Builder
        </Title>
        <Paragraph type="secondary" className="appui:m-0!">
          Configure tier-based rewards in <Text code>Cloud Save</Text>, grant <Text code>Platform</Text> entitlements to{' '}
          <Text code>Leaderboard</Text> winners, and seed test players via <Text code>IAM</Text> + <Text code>Social</Text> — no Extend
          backend.
        </Paragraph>
      </div>

      <Card size="small" className="appui:mb-6">
        <Form layout="inline">
          <Form.Item label="Season key" tooltip="Used as the Cloud Save admin game-record key">
            <Input value={seasonKey} onChange={e => setSeasonKey(e.target.value)} placeholder="pvp-season-1" />
          </Form.Item>
          <Form.Item label="Leaderboard">
            <LeaderboardSelect value={leaderboardCode} onChange={setLeaderboardCode} />
          </Form.Item>
        </Form>
      </Card>

      <Tabs
        defaultActiveKey="reward"
        items={[
          {
            key: 'reward',
            label: 'Reward',
            children: <RewardTab seasonKey={seasonKey} leaderboardCode={leaderboardCode} />
          },
          {
            key: 'simulate',
            label: 'Simulate',
            children: <SimulateTab leaderboardCode={leaderboardCode} />
          }
        ]}
      />
    </div>
  )
}

function LeaderboardSelect({ value, onChange }: { value: string | undefined; onChange: (v: string | undefined) => void }) {
  const { sdk } = useAppUIContext()
  const [search, setSearch] = useState('')

  // The leaderboard list endpoint exposes no keyword/name filter, so we
  // fetch the first page on mount and narrow it client-side as the user
  // types. If AGS adds a server-side filter later, swap the .filter() call
  // below for a re-query keyed on `search`.
  const { data, isLoading } = useLeaderboardConfigurationV3AdminApi_GetLeaderboards_v3(sdk, { queryParams: { limit: 100 } })

  const all = (data?.data ?? []).map(lb => ({
    value: lb.leaderboardCode,
    label: `${lb.name} — ${lb.leaderboardCode} (stat: ${lb.statCode ?? '—'})`
  }))
  const lower = search.trim().toLowerCase()
  const options = lower ? all.filter(o => o.label.toLowerCase().includes(lower)) : all

  return (
    <Select
      style={{ minWidth: 280 }}
      placeholder="Pick a leaderboard (type to search)"
      loading={isLoading}
      value={value}
      onChange={onChange}
      onSearch={setSearch}
      filterOption={false}
      options={options}
      allowClear
      showSearch
    />
  )
}
