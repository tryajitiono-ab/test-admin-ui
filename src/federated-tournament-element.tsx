import { useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, DatePicker, Form, InputNumber, Modal, Spin, Tag, Typography } from 'antd'
import Input from 'antd/es/input/Input'
import TextArea from 'antd/es/input/TextArea'
import { useMemo, useState, type ReactNode } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router'
import { useGlobalContext } from './context'
import { useExchangeAuthorizationCode } from './hooks/useExchangeAuthorizationCode'
import { useTournamentServiceAdminApi_CreateTournamentMutation } from './tournamentapi/codegen/generated-admin/queries/TournamentServiceAdmin.query'
import type { TournamentMatch } from './tournamentapi/codegen/generated-definitions/TournamentMatch'
import type { TournamentParticipant } from './tournamentapi/codegen/generated-definitions/TournamentParticipant'
import type { TournamentTournament } from './tournamentapi/codegen/generated-definitions/TournamentTournament'
import type { TournamentTournamentParticipant } from './tournamentapi/codegen/generated-definitions/TournamentTournamentParticipant'
import {
  Key_TournamentService,
  useTournamentServiceApi_GetMatches_ByTournamentId,
  useTournamentServiceApi_GetParticipants_ByTournamentId,
  useTournamentServiceApi_GetTournament_ByTournamentId,
  useTournamentServiceApi_GetTournaments
} from './tournamentapi/codegen/generated-public/queries/TournamentService.query'

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

export function FederatedTournamentElement() {
  useExchangeAuthorizationCode()

  return (
    <div className="adminui:p-4">
      <Routes>
        <Route path="/" index element={<TournamentList />} />
        <Route path=":tournamentId" element={<TournamentDetail />} />
      </Routes>
    </div>
  )
}

function TournamentList() {
  const { sdk } = useGlobalContext()
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
        <div className="adminui:text-center adminui:py-16 adminui:px-8 adminui:border-2 adminui:border-dashed adminui:border-[#d9d9d9] adminui:rounded-lg">
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
      <div className="adminui:grid adminui:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] adminui:gap-6 adminui:mt-8">
        {tournaments.map(t => (
          <Card
            key={t.tournamentId ?? undefined}
            hoverable
            className="adminui:h-full"
            onClick={() => navigate(`/${t.tournamentId}`)}
            title={
              <div className="adminui:flex adminui:justify-between adminui:items-center">
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
  return (
    <div className="adminui:flex adminui:justify-between adminui:items-center adminui:mb-4">
      <div>
        <Typography.Title level={2} className="adminui:m-0!">
          Tournaments
        </Typography.Title>
        <Typography.Text type="secondary">Browse and manage tournament competitions</Typography.Text>
      </div>
      <div className="adminui:flex adminui:gap-2">
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
  const { sdk } = useGlobalContext()
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
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="adminui:mt-4">
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Tournament name is required' }]}>
          <Input placeholder="e.g. Summer Championship" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Optional description" />
        </Form.Item>

        <Form.Item label="Max Participants" name="maxParticipants" rules={[{ required: true, message: 'Max participants is required' }]}>
          <InputNumber min={2} className="adminui:w-full" placeholder="e.g. 16" />
        </Form.Item>

        <Form.Item label="Start & End Date" name="dateRange" rules={[{ required: true, message: 'Start and end date are required' }]}>
          <DatePicker.RangePicker showTime className="adminui:w-full" />
        </Form.Item>

        {createMutation.isError && (
          <Form.Item>
            <Alert type="error" message="Failed to create tournament. Please try again." />
          </Form.Item>
        )}

        <Form.Item className="adminui:mb-0 adminui:flex adminui:justify-end">
          <div className="adminui:flex adminui:gap-2 adminui:justify-end">
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
    <div className="adminui:inline-flex adminui:items-center adminui:gap-2 adminui:py-2 adminui:px-3 adminui:rounded-md adminui:border adminui:border-[#d9d9d9] adminui:text-sm">
      <span>👥</span>
      <span>
        <strong>{current}</strong> / {max} participants {isFull ? '(Full)' : `(${percentage}%)`}
      </span>
    </div>
  )
}

function TournamentDetail() {
  const { sdk } = useGlobalContext()
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
      <Button type="link" className="adminui:pl-0! adminui:mb-2!" onClick={() => navigate('/')}>
        ← Back to Tournaments
      </Button>

      <div className="adminui:bg-[linear-gradient(135deg,#1677ff_0%,#0958d9_100%)] adminui:text-white adminui:p-8 adminui:rounded-lg adminui:mb-8">
        <Typography.Title level={2} className="adminui:text-white! adminui:m-0! adminui:mb-2!">
          {tournament.name || 'Untitled Tournament'}
        </Typography.Title>
        <Typography.Paragraph className="adminui:text-white/90! adminui:my-2!">
          {tournament.description || 'No description provided'}
        </Typography.Paragraph>
        <div className="adminui:grid adminui:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] adminui:gap-4 adminui:mt-6">
          <InfoCard label="Status">
            <StatusBadge status={tournament.status} />
          </InfoCard>
          <InfoCard label="Participants">
            <strong className="adminui:text-xl">
              {tournament.currentParticipants ?? 0} / {tournament.maxParticipants ?? 0}
            </strong>
          </InfoCard>
          <InfoCard label="Created">
            <strong className="adminui:text-xl">{tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : '—'}</strong>
          </InfoCard>
        </div>
      </div>

      {tournament.status === 'TOURNAMENT_STATUS_COMPLETED' && winner && participants.length > 0 && (
        <WinnerBanner winnerUserId={winner} participants={participants as TournamentParticipant[]} />
      )}

      <div className="adminui:flex adminui:justify-between adminui:items-center adminui:mt-8 adminui:mb-4 adminui:pb-2 adminui:border-b-2 adminui:border-[#f0f0f0]">
        <Typography.Title level={3} className="adminui:m-0!">
          Participants
        </Typography.Title>
      </div>
      <ParticipantGrid participants={participants as TournamentParticipant[]} isLoading={!participantsData} />

      <div className="adminui:flex adminui:justify-between adminui:items-center adminui:mt-8 adminui:mb-4 adminui:pb-2 adminui:border-b-2 adminui:border-[#f0f0f0]">
        <Typography.Title level={3} className="adminui:m-0!">
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
    <div className="adminui:bg-white/10 adminui:p-4 adminui:rounded-md adminui:backdrop-blur-md adminui:text-white">
      <div className="adminui:text-xs adminui:uppercase adminui:tracking-wide adminui:opacity-80 adminui:mb-1">{label}</div>
      {children}
    </div>
  )
}

function WinnerBanner({ winnerUserId, participants }: { winnerUserId: string; participants: TournamentParticipant[] }) {
  const winnerParticipant = participants.find(p => getParticipantUserId(p) === winnerUserId)
  const winnerName = winnerParticipant ? getParticipantName(winnerParticipant) : winnerUserId

  return (
    <div className="adminui:bg-[linear-gradient(135deg,#ffd700_0%,#ffed4e_100%)] adminui:border-[3px] adminui:border-[#f9a825] adminui:rounded-lg adminui:p-6 adminui:mb-8 adminui:text-center adminui:shadow-[0_4px_12px_rgba(249,168,37,0.3)]">
      <span className="adminui:text-5xl adminui:block adminui:mb-2">🏆</span>
      <Typography.Title level={3} className="adminui:text-[#f57f17]! adminui:m-0! adminui:mb-2!">
        Tournament Winner
      </Typography.Title>
      <div className="adminui:text-4xl adminui:font-extrabold adminui:text-[#e65100] adminui:[text-shadow:1px_1px_2px_rgba(0,0,0,0.1)]">
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
    <div className="adminui:grid adminui:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] adminui:gap-4 adminui:mt-4">
      {participants.map((p, i) => {
        const name = getParticipantName(p)
        const userId = getParticipantUserId(p)
        const initial = name.charAt(0).toUpperCase()

        return (
          <div
            key={userId || i}
            className="adminui:py-3 adminui:px-4 adminui:border adminui:border-[#f0f0f0] adminui:rounded-md adminui:flex adminui:items-center adminui:gap-3 adminui:transition-[transform,box-shadow] adminui:duration-200 adminui:ease-out adminui:cursor-default">
            <div className="adminui:size-10 adminui:shrink-0 adminui:bg-[linear-gradient(135deg,#1677ff_0%,#0958d9_100%)] adminui:text-white adminui:flex adminui:items-center adminui:justify-center adminui:rounded-full adminui:font-semibold adminui:text-lg">
              {initial}
            </div>
            <div className="adminui:flex-1">
              <strong className="adminui:block adminui:text-[0.9375rem]">{name}</strong>
              <Typography.Text type="secondary" className="adminui:text-[0.8125rem]!">
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
    <div className="adminui:bg-[#f8f9fa] adminui:rounded-lg adminui:border adminui:border-[#dee2e6] adminui:p-5 adminui:overflow-x-auto adminui:overflow-y-hidden">
      <div className="adminui:flex adminui:gap-10 adminui:min-w-fit adminui:items-start">
        {rounds.map(([roundNum, roundMatches], roundIdx) => (
          <div key={roundNum} className="adminui:flex adminui:flex-col adminui:gap-4 adminui:min-w-[180px]">
            <div className="adminui:text-center adminui:font-semibold adminui:text-sm adminui:text-[#333] adminui:pb-2 adminui:border-b-2 adminui:border-[#dee2e6]">
              {roundIdx === totalRounds - 1 ? 'Final' : roundIdx === totalRounds - 2 ? 'Semi-Final' : `Round ${roundNum}`}
            </div>
            <div className="adminui:flex adminui:flex-col adminui:gap-4 adminui:justify-around adminui:flex-1">
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
      className={`adminui:border-2 adminui:rounded-md adminui:overflow-hidden adminui:min-w-[160px] ${isInProgress ? 'adminui:bg-[#e3f2fd]' : 'adminui:bg-white'}`}
      style={{ borderColor }}>
      <MatchOpponent name={p1Name} isWinner={p1IsWinner} isLoser={isCompleted && !p1IsWinner && p1Id !== null} isTbd={!p1Id} />
      <div className="adminui:h-px adminui:bg-[#e0e0e0]" />
      <MatchOpponent name={p2Name} isWinner={p2IsWinner} isLoser={isCompleted && !p2IsWinner && p2Id !== null} isTbd={!p2Id} />
    </div>
  )
}

function MatchOpponent({ name, isWinner, isLoser, isTbd }: { name: string; isWinner: boolean; isLoser: boolean; isTbd: boolean }) {
  return (
    <div
      className={[
        'adminui:px-2 adminui:py-1 adminui:text-[13px]',
        isWinner && 'adminui:font-bold adminui:text-[#2e7d32] adminui:bg-[#e8f5e9] adminui:rounded',
        isLoser && 'adminui:opacity-60 adminui:line-through adminui:text-[#757575]',
        isTbd && 'adminui:text-[#999] adminui:italic'
      ]
        .filter(Boolean)
        .join(' ')}>
      {name}
    </div>
  )
}
