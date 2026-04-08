import { CrudType, useAppUIContext } from '@accelbyte/sdk-extend-app-ui'
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, DatePicker, Form, InputNumber, Modal, Spin, Tag, Typography } from 'antd'
import Input from 'antd/es/input/Input'
import TextArea from 'antd/es/input/TextArea'
import { useMemo, useState, type ReactNode } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router'
import { useTournamentServiceAdminApi_CreateTournamentMutation } from './tournamentapi/generated-admin/queries/TournamentServiceAdmin.query'
import type { TournamentMatch } from './tournamentapi/generated-definitions/TournamentMatch'
import type { TournamentParticipant } from './tournamentapi/generated-definitions/TournamentParticipant'
import type { TournamentTournament } from './tournamentapi/generated-definitions/TournamentTournament'
import type { TournamentTournamentParticipant } from './tournamentapi/generated-definitions/TournamentTournamentParticipant'
import {
  Key_TournamentService,
  useTournamentServiceApi_GetMatches_ByTournamentId,
  useTournamentServiceApi_GetParticipants_ByTournamentId,
  useTournamentServiceApi_GetTournament_ByTournamentId,
  useTournamentServiceApi_GetTournaments
} from './tournamentapi/generated-public/queries/TournamentService.query'

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  TOURNAMENT_STATUS_DRAFT: { text: 'Draft', color: 'blue' },
  TOURNAMENT_STATUS_ACTIVE: { text: 'Active', color: 'green' },
  TOURNAMENT_STATUS_STARTED: { text: 'Started', color: 'orange' },
  TOURNAMENT_STATUS_COMPLETED: { text: 'Completed', color: 'purple' },
  TOURNAMENT_STATUS_CANCELLED: { text: 'Cancelled', color: 'red' }
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const info = STATUS_MAP[status ?? ''] ?? { text: 'Unknown', color: 'default' }
  return <Tag color={info.color}>{info.text}</Tag>
}

function getParticipantUserId(p: TournamentParticipant): string {
  return p.userId ?? ''
}

function getParticipantName(p: TournamentParticipant): string {
  return p.displayName ?? p.username ?? p.userId ?? 'Unknown'
}

function getMatchParticipantId(p: TournamentTournamentParticipant | null | undefined): string | null {
  return p?.userId ?? null
}

function getMatchParticipantName(p: TournamentTournamentParticipant | null | undefined): string {
  return p?.displayName ?? p?.username ?? p?.userId ?? 'TBD'
}

// Walks all matches to find the winner of the highest (final) round.
function findTournamentWinner(matches: TournamentMatch[]): string | null {
  if (!matches.length) return null
  const maxRound = Math.max(...matches.map(m => m.round ?? 0))
  const finalMatch = matches.find(m => m.round === maxRound && m.status === 'MATCH_STATUS_COMPLETED')
  return finalMatch?.winner ?? null
}

export function FederatedElement() {
  return (
    <div className="appui:p-4">
      <Routes>
        <Route path="/" index element={<TournamentList />} />
        <Route path=":tournamentId" element={<TournamentDetail />} />
      </Routes>
    </div>
  )
}

function TournamentList() {
  const { sdk } = useAppUIContext()
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data, isLoading, error, refetch } = useTournamentServiceApi_GetTournaments(sdk, {})

  const tournaments = data?.tournaments ?? []

  if (isLoading) return <Spin description="Loading tournaments..." />

  if (error) {
    return (
      <Alert
        type="error"
        title="Failed to load tournaments."
        action={
          <Button size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    )
  }

  if (tournaments.length === 0) {
    return (
      <>
        <TournamentListHeader onRefresh={refetch} onCreate={() => setIsCreateOpen(true)} />
        <div className="appui:text-center appui:py-16 appui:px-8 appui:border-2 appui:border-dashed appui:border-[#d9d9d9] appui:rounded-lg">
          <Typography.Text type="secondary">No tournaments</Typography.Text>
        </div>
        <CreateTournamentModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </>
    )
  }

  return (
    <>
      <TournamentListHeader onRefresh={refetch} onCreate={() => setIsCreateOpen(true)} />
      <CreateTournamentModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <div className="appui:grid appui:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] appui:gap-6 appui:mt-8">
        {tournaments.map(t => (
          <Card
            key={t.tournamentId ?? undefined}
            hoverable
            className="appui:h-full"
            onClick={() => navigate(`/${t.tournamentId}`)}
            title={
              <div className="appui:flex appui:justify-between appui:items-center">
                <span>{t.name}</span>
                <StatusBadge status={t.status} />
              </div>
            }>
            <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
              {t.description || 'No description provided'}
            </Typography.Paragraph>
            <ParticipantCount current={t.currentParticipants ?? 0} max={t.maxParticipants ?? 0} />
          </Card>
        ))}
      </div>
    </>
  )
}

function TournamentListHeader({ onRefresh, onCreate }: { onRefresh: () => void; onCreate: () => void }) {
  const { isCurrentUserHasPermission } = useAppUIContext()

  return (
    <div className="appui:flex appui:justify-between appui:items-center appui:mb-4">
      <div>
        <Typography.Title level={2} className="appui:m-0!">
          Tournaments
        </Typography.Title>
        <Typography.Title
          level={2}
          className="appui:m-0!"
          hidden={isCurrentUserHasPermission({ action: CrudType.READ, resource: 'ADMIN:RANDOMRESOURCE' })}>
          This is also a tournaments header but hidden because you may not have the permission
        </Typography.Title>
        <Typography.Text type="secondary">Browse and manage tournament competitions</Typography.Text>
      </div>
      <div className="appui:flex appui:gap-2">
        <Button onClick={onRefresh}>Refresh</Button>
        <Button type="primary" onClick={onCreate}>
          Create Tournament
        </Button>
      </div>
    </div>
  )
}

type CreateTournamentFormValues = {
  name: string
  description?: string
  maxParticipants: number
  dateRange: [{ $d: Date }, { $d: Date }]
}

function CreateTournamentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sdk } = useAppUIContext()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<CreateTournamentFormValues>()

  const createMutation = useTournamentServiceAdminApi_CreateTournamentMutation(sdk, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Key_TournamentService.Tournaments] })
      form.resetFields()
      onClose()
    }
  })

  const handleSubmit = (values: CreateTournamentFormValues) => {
    createMutation.mutate({
      data: {
        name: values.name,
        description: values.description,
        maxParticipants: values.maxParticipants,
        startTime: values.dateRange[0].$d.toISOString(),
        endTime: values.dateRange[1].$d.toISOString()
      }
    })
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal title="Create Tournament" open={open} onCancel={handleCancel} destroyOnHidden footer={null}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="appui:mt-4">
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Tournament name is required' }]}>
          <Input placeholder="e.g. Summer Championship" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Optional description" />
        </Form.Item>

        <Form.Item label="Max Participants" name="maxParticipants" rules={[{ required: true, message: 'Max participants is required' }]}>
          <InputNumber min={2} className="appui:w-full" placeholder="e.g. 16" />
        </Form.Item>

        <Form.Item label="Start & End Date" name="dateRange" rules={[{ required: true, message: 'Start and end date are required' }]}>
          <DatePicker.RangePicker showTime className="appui:w-full" />
        </Form.Item>

        {createMutation.isError && (
          <Form.Item>
            <Alert type="error" message="Failed to create tournament. Please try again." />
          </Form.Item>
        )}

        <Form.Item className="appui:mb-0 appui:flex appui:justify-end">
          <div className="appui:flex appui:gap-2 appui:justify-end">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Create
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

function ParticipantCount({ current, max }: { current: number; max: number }) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0
  const isFull = current >= max && max > 0

  return (
    <div className="appui:inline-flex appui:items-center appui:gap-2 appui:py-2 appui:px-3 appui:rounded-md appui:border appui:border-[#d9d9d9] appui:text-sm">
      <span>👥</span>
      <span>
        <strong>{current}</strong> / {max} participants {isFull ? '(Full)' : `(${percentage}%)`}
      </span>
    </div>
  )
}

function TournamentDetail() {
  const { sdk } = useAppUIContext()
  const { tournamentId = '' } = useParams()
  const navigate = useNavigate()

  const {
    data: tournamentData,
    isLoading,
    error,
    refetch
  } = useTournamentServiceApi_GetTournament_ByTournamentId(sdk, { tournamentId }, { enabled: !!tournamentId })

  const { data: participantsData } = useTournamentServiceApi_GetParticipants_ByTournamentId(
    sdk,
    { tournamentId },
    { enabled: !!tournamentId }
  )

  const { data: matchesData } = useTournamentServiceApi_GetMatches_ByTournamentId(sdk, { tournamentId }, { enabled: !!tournamentId })

  if (isLoading) return <Spin description="Loading tournament..." />

  if (error) {
    return (
      <Alert
        type="error"
        title="Failed to load tournament data."
        action={
          <Button size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    )
  }

  const tournament: TournamentTournament | null | undefined = tournamentData?.tournament
  if (!tournament) return null

  const participants = participantsData?.participants ?? []
  const matches = matchesData?.matches ?? []
  const winner = findTournamentWinner(matches as TournamentMatch[])

  return (
    <>
      <Button type="link" className="appui:pl-0! appui:mb-2!" onClick={() => navigate('/')}>
        ← Back to Tournaments
      </Button>

      <div className="appui:bg-[linear-gradient(135deg,#1677ff_0%,#0958d9_100%)] appui:text-white appui:p-8 appui:rounded-lg appui:mb-8">
        <Typography.Title level={2} className="appui:text-white! appui:m-0! appui:mb-2!">
          {tournament.name || 'Untitled Tournament'}
        </Typography.Title>
        <Typography.Paragraph className="appui:text-white/90! appui:my-2!">
          {tournament.description || 'No description provided'}
        </Typography.Paragraph>
        <div className="appui:grid appui:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] appui:gap-4 appui:mt-6">
          <InfoCard label="Status">
            <StatusBadge status={tournament.status} />
          </InfoCard>
          <InfoCard label="Participants">
            <strong className="appui:text-xl">
              {tournament.currentParticipants ?? 0} / {tournament.maxParticipants ?? 0}
            </strong>
          </InfoCard>
          <InfoCard label="Created">
            <strong className="appui:text-xl">{tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : '—'}</strong>
          </InfoCard>
        </div>
      </div>

      {tournament.status === 'TOURNAMENT_STATUS_COMPLETED' && winner && participants.length > 0 && (
        <WinnerBanner winnerUserId={winner} participants={participants as TournamentParticipant[]} />
      )}

      <div className="appui:flex appui:justify-between appui:items-center appui:mt-8 appui:mb-4 appui:pb-2 appui:border-b-2 appui:border-[#f0f0f0]">
        <Typography.Title level={3} className="appui:m-0!">
          Participants
        </Typography.Title>
      </div>
      <ParticipantGrid participants={participants as TournamentParticipant[]} isLoading={!participantsData} />

      <div className="appui:flex appui:justify-between appui:items-center appui:mt-8 appui:mb-4 appui:pb-2 appui:border-b-2 appui:border-[#f0f0f0]">
        <Typography.Title level={3} className="appui:m-0!">
          Tournament Bracket
        </Typography.Title>
      </div>
      <BracketSection
        matches={matches as TournamentMatch[]}
        participants={participants as TournamentParticipant[]}
        isLoading={!matchesData}
      />
    </>
  )
}

function InfoCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="appui:bg-white/10 appui:p-4 appui:rounded-md appui:backdrop-blur-md appui:text-white">
      <div className="appui:text-xs appui:uppercase appui:tracking-wide appui:opacity-80 appui:mb-1">{label}</div>
      {children}
    </div>
  )
}

function WinnerBanner({ winnerUserId, participants }: { winnerUserId: string; participants: TournamentParticipant[] }) {
  const winnerParticipant = participants.find(p => getParticipantUserId(p) === winnerUserId)
  const winnerName = winnerParticipant ? getParticipantName(winnerParticipant) : winnerUserId

  return (
    <div className="appui:bg-[linear-gradient(135deg,#ffd700_0%,#ffed4e_100%)] appui:border-[3px] appui:border-[#f9a825] appui:rounded-lg appui:p-6 appui:mb-8 appui:text-center appui:shadow-[0_4px_12px_rgba(249,168,37,0.3)]">
      <span className="appui:text-5xl appui:block appui:mb-2">🏆</span>
      <Typography.Title level={3} className="appui:text-[#f57f17]! appui:m-0! appui:mb-2!">
        Tournament Winner
      </Typography.Title>
      <div className="appui:text-4xl appui:font-extrabold appui:text-[#e65100] appui:[text-shadow:1px_1px_2px_rgba(0,0,0,0.1)]">
        {winnerName}
      </div>
    </div>
  )
}

function ParticipantGrid({ participants, isLoading }: { participants: TournamentParticipant[]; isLoading: boolean }) {
  if (isLoading) return <Spin description="Loading participants..." />

  if (participants.length === 0) {
    return <Typography.Text type="secondary">No participants registered yet.</Typography.Text>
  }

  return (
    <div className="appui:grid appui:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] appui:gap-4 appui:mt-4">
      {participants.map((p, i) => {
        const name = getParticipantName(p)
        const userId = getParticipantUserId(p)
        const initial = name.charAt(0).toUpperCase()

        return (
          <div
            key={userId || i}
            className="appui:py-3 appui:px-4 appui:border appui:border-[#f0f0f0] appui:rounded-md appui:flex appui:items-center appui:gap-3 appui:transition-[transform,box-shadow] appui:duration-200 appui:ease-out appui:cursor-default">
            <div className="appui:size-10 appui:shrink-0 appui:bg-[linear-gradient(135deg,#1677ff_0%,#0958d9_100%)] appui:text-white appui:flex appui:items-center appui:justify-center appui:rounded-full appui:font-semibold appui:text-lg">
              {initial}
            </div>
            <div className="appui:flex-1">
              <strong className="appui:block appui:text-[0.9375rem]">{name}</strong>
              <Typography.Text type="secondary" className="appui:text-[0.8125rem]!">
                {userId}
              </Typography.Text>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Wrapper handles empty/loading states before rendering BracketContent,
// so that hooks inside BracketContent are never called conditionally.
function BracketSection({
  matches,
  participants,
  isLoading
}: {
  matches: TournamentMatch[]
  participants: TournamentParticipant[]
  isLoading: boolean
}) {
  if (isLoading) return <Spin description="Loading bracket..." />

  if (matches.length === 0) {
    return <Typography.Text type="secondary">Bracket not yet generated. Tournament must be started to view bracket.</Typography.Text>
  }

  return <BracketContent matches={matches} participants={participants} />
}

function BracketContent({ matches, participants }: { matches: TournamentMatch[]; participants: TournamentParticipant[] }) {
  const participantMap = useMemo(() => {
    const map = new Map<string, TournamentParticipant>()
    participants.forEach(p => {
      const id = getParticipantUserId(p)
      if (id) map.set(id, p)
    })
    return map
  }, [participants])

  const rounds = useMemo(() => {
    const roundMap = new Map<number, TournamentMatch[]>()
    matches.forEach(m => {
      const round = m.round ?? 0
      if (!roundMap.has(round)) roundMap.set(round, [])
      roundMap.get(round)!.push(m)
    })
    const sorted = Array.from(roundMap.entries()).sort(([a], [b]) => a - b)
    sorted.forEach(([, rm]) => rm.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)))
    return sorted
  }, [matches])

  const totalRounds = rounds.length

  return (
    <div className="appui:bg-[#f8f9fa] appui:rounded-lg appui:border appui:border-[#dee2e6] appui:p-5 appui:overflow-x-auto appui:overflow-y-hidden">
      <div className="appui:flex appui:gap-10 appui:min-w-fit appui:items-start">
        {rounds.map(([roundNum, roundMatches], roundIdx) => (
          <div key={roundNum} className="appui:flex appui:flex-col appui:gap-4 appui:min-w-[180px]">
            <div className="appui:text-center appui:font-semibold appui:text-sm appui:text-[#333] appui:pb-2 appui:border-b-2 appui:border-[#dee2e6]">
              {roundIdx === totalRounds - 1 ? 'Final' : roundIdx === totalRounds - 2 ? 'Semi-Final' : `Round ${roundNum}`}
            </div>
            <div className="appui:flex appui:flex-col appui:gap-4 appui:justify-around appui:flex-1">
              {roundMatches.map(match => (
                <BracketMatch key={match.matchId || `${match.round}-${match.position}`} match={match} participantMap={participantMap} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BracketMatch({ match, participantMap }: { match: TournamentMatch; participantMap: Map<string, TournamentParticipant> }) {
  const p1Id = getMatchParticipantId(match.participant1)
  const p2Id = getMatchParticipantId(match.participant2)

  const p1Name = p1Id ? getParticipantName(participantMap.get(p1Id) ?? { userId: p1Id }) : getMatchParticipantName(match.participant1)

  const p2Name = p2Id ? getParticipantName(participantMap.get(p2Id) ?? { userId: p2Id }) : getMatchParticipantName(match.participant2)

  const isCompleted = match.status === 'MATCH_STATUS_COMPLETED'
  const isInProgress = match.status === 'MATCH_STATUS_IN_PROGRESS'

  const p1IsWinner = isCompleted && match.winner === p1Id
  const p2IsWinner = isCompleted && match.winner === p2Id

  // Border color depends on match state; kept as inline since it's a dynamic value.
  const borderColor = isCompleted ? '#50b649' : isInProgress ? '#2196f3' : '#9e9e9e'

  return (
    <div
      className={`appui:border-2 appui:rounded-md appui:overflow-hidden appui:min-w-[160px] ${isInProgress ? 'appui:bg-[#e3f2fd]' : 'appui:bg-white'}`}
      style={{ borderColor }}>
      <MatchOpponent name={p1Name} isWinner={p1IsWinner} isLoser={isCompleted && !p1IsWinner && p1Id !== null} isTbd={!p1Id} />
      <div className="appui:h-px appui:bg-[#e0e0e0]" />
      <MatchOpponent name={p2Name} isWinner={p2IsWinner} isLoser={isCompleted && !p2IsWinner && p2Id !== null} isTbd={!p2Id} />
    </div>
  )
}

function MatchOpponent({ name, isWinner, isLoser, isTbd }: { name: string; isWinner: boolean; isLoser: boolean; isTbd: boolean }) {
  return (
    <div
      className={[
        'appui:px-2 appui:py-1 appui:text-[13px]',
        isWinner && 'appui:font-bold appui:text-[#2e7d32] appui:bg-[#e8f5e9] appui:rounded',
        isLoser && 'appui:opacity-60 appui:line-through appui:text-[#757575]',
        isTbd && 'appui:text-[#999] appui:italic'
      ]
        .filter(Boolean)
        .join(' ')}>
      {name}
    </div>
  )
}
