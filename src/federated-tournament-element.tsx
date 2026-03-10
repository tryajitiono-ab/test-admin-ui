import { Alert, Button, Card, Spin, Tag, Typography } from 'antd'
import { useMemo, type ReactNode } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router'
import { useGlobalContext } from './context'
import { useExchangeAuthorizationCode } from './hooks/useExchangeAuthorizationCode'
import {
  useTournamentServiceApi_GetMatches_ByTournamentId,
  useTournamentServiceApi_GetParticipants_ByTournamentId,
  useTournamentServiceApi_GetTournament_ByTournamentId,
  useTournamentServiceApi_GetTournaments
} from './tournamentapi/all-query-imports'
import type { TournamentMatch } from './tournamentapi/generated-definitions/TournamentMatch'
import type { TournamentParticipant } from './tournamentapi/generated-definitions/TournamentParticipant'
import type { TournamentTournament } from './tournamentapi/generated-definitions/TournamentTournament'
import type { TournamentTournamentParticipant } from './tournamentapi/generated-definitions/TournamentTournamentParticipant'

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
    <main className="p-4">
      <Routes>
        <Route path="*" element={<TournamentList />} />
        <Route path=":tournamentId" element={<TournamentDetail />} />
      </Routes>
    </main>
  )
}

function TournamentList() {
  const { sdk } = useGlobalContext()
  const navigate = useNavigate()
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
        <TournamentListHeader onRefresh={refetch} />
        <div className="text-center py-16 px-8 border-2 border-dashed border-[#d9d9d9] rounded-lg">
          <Typography.Text type="secondary">No tournaments</Typography.Text>
        </div>
      </>
    )
  }

  return (
    <>
      <TournamentListHeader onRefresh={refetch} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 mt-8">
        {tournaments.map(t => (
          <Card
            key={t.tournamentId ?? undefined}
            hoverable
            className="h-full"
            onClick={() => navigate(`/${t.tournamentId}`)}
            title={
              <div className="flex justify-between items-center">
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

function TournamentListHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <Typography.Title level={2} className="m-0!">
          Tournaments
        </Typography.Title>
        <Typography.Text type="secondary">Browse and manage tournament competitions</Typography.Text>
      </div>
      <Button onClick={onRefresh}>Refresh</Button>
    </div>
  )
}

function ParticipantCount({ current, max }: { current: number; max: number }) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0
  const isFull = current >= max && max > 0

  return (
    <div className="inline-flex items-center gap-2 py-2 px-3 rounded-md border border-[#d9d9d9] text-sm">
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
      <Button type="link" className="pl-0! mb-2!" onClick={() => navigate('/')}>
        ← Back to Tournaments
      </Button>

      <div className="bg-[linear-gradient(135deg,#1677ff_0%,#0958d9_100%)] text-white p-8 rounded-lg mb-8">
        <Typography.Title level={2} className="text-white! m-0! mb-2!">
          {tournament.name || 'Untitled Tournament'}
        </Typography.Title>
        <Typography.Paragraph className="text-white/90! my-2!">{tournament.description || 'No description provided'}</Typography.Paragraph>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-6">
          <InfoCard label="Status">
            <StatusBadge status={tournament.status} />
          </InfoCard>
          <InfoCard label="Participants">
            <strong className="text-xl">
              {tournament.currentParticipants ?? 0} / {tournament.maxParticipants ?? 0}
            </strong>
          </InfoCard>
          <InfoCard label="Created">
            <strong className="text-xl">{tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : '—'}</strong>
          </InfoCard>
        </div>
      </div>

      {tournament.status === 'TOURNAMENT_STATUS_COMPLETED' && winner && participants.length > 0 && (
        <WinnerBanner winnerUserId={winner} participants={participants as TournamentParticipant[]} />
      )}

      <div className="flex justify-between items-center mt-8 mb-4 pb-2 border-b-2 border-[#f0f0f0]">
        <Typography.Title level={3} className="m-0!">
          Participants
        </Typography.Title>
      </div>
      <ParticipantGrid participants={participants as TournamentParticipant[]} isLoading={!participantsData} />

      <div className="flex justify-between items-center mt-8 mb-4 pb-2 border-b-2 border-[#f0f0f0]">
        <Typography.Title level={3} className="m-0!">
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
    <div className="bg-white/10 p-4 rounded-md backdrop-blur-md text-white">
      <div className="text-xs uppercase tracking-wide opacity-80 mb-1">{label}</div>
      {children}
    </div>
  )
}

function WinnerBanner({ winnerUserId, participants }: { winnerUserId: string; participants: TournamentParticipant[] }) {
  const winnerParticipant = participants.find(p => getParticipantUserId(p) === winnerUserId)
  const winnerName = winnerParticipant ? getParticipantName(winnerParticipant) : winnerUserId

  return (
    <div className="bg-[linear-gradient(135deg,#ffd700_0%,#ffed4e_100%)] border-[3px] border-[#f9a825] rounded-lg p-6 mb-8 text-center shadow-[0_4px_12px_rgba(249,168,37,0.3)]">
      <span className="text-5xl block mb-2">🏆</span>
      <Typography.Title level={3} className="text-[#f57f17]! m-0! mb-2!">
        Tournament Winner
      </Typography.Title>
      <div className="text-4xl font-extrabold text-[#e65100] [text-shadow:1px_1px_2px_rgba(0,0,0,0.1)]">{winnerName}</div>
    </div>
  )
}

function ParticipantGrid({ participants, isLoading }: { participants: TournamentParticipant[]; isLoading: boolean }) {
  if (isLoading) return <Spin description="Loading participants..." />

  if (participants.length === 0) {
    return <Typography.Text type="secondary">No participants registered yet.</Typography.Text>
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 mt-4">
      {participants.map((p, i) => {
        const name = getParticipantName(p)
        const userId = getParticipantUserId(p)
        const initial = name.charAt(0).toUpperCase()

        return (
          <div
            key={userId || i}
            className="py-3 px-4 border border-[#f0f0f0] rounded-md flex items-center gap-3 transition-[transform,box-shadow] duration-200 ease-out cursor-default">
            <div className="size-10 shrink-0 bg-[linear-gradient(135deg,#1677ff_0%,#0958d9_100%)] text-white flex items-center justify-center rounded-full font-semibold text-lg">
              {initial}
            </div>
            <div className="flex-1">
              <strong className="block text-[0.9375rem]">{name}</strong>
              <Typography.Text type="secondary" className="text-[0.8125rem]!">
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
    <div className="bg-[#f8f9fa] rounded-lg border border-[#dee2e6] p-5 overflow-x-auto overflow-y-hidden">
      <div className="flex gap-10 min-w-fit items-start">
        {rounds.map(([roundNum, roundMatches], roundIdx) => (
          <div key={roundNum} className="flex flex-col gap-4 min-w-[180px]">
            <div className="text-center font-semibold text-sm text-[#333] pb-2 border-b-2 border-[#dee2e6]">
              {roundIdx === totalRounds - 1 ? 'Final' : roundIdx === totalRounds - 2 ? 'Semi-Final' : `Round ${roundNum}`}
            </div>
            <div className="flex flex-col gap-4 justify-around flex-1">
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
      className={`border-2 rounded-md overflow-hidden min-w-[160px] ${isInProgress ? 'bg-[#e3f2fd]' : 'bg-white'}`}
      style={{ borderColor }}>
      <MatchOpponent name={p1Name} isWinner={p1IsWinner} isLoser={isCompleted && !p1IsWinner && p1Id !== null} isTbd={!p1Id} />
      <div className="h-px bg-[#e0e0e0]" />
      <MatchOpponent name={p2Name} isWinner={p2IsWinner} isLoser={isCompleted && !p2IsWinner && p2Id !== null} isTbd={!p2Id} />
    </div>
  )
}

function MatchOpponent({ name, isWinner, isLoser, isTbd }: { name: string; isWinner: boolean; isLoser: boolean; isTbd: boolean }) {
  return (
    <div
      className={[
        'px-2 py-1 text-[13px]',
        isWinner && 'font-bold text-[#2e7d32] bg-[#e8f5e9] rounded',
        isLoser && 'opacity-60 line-through text-[#757575]',
        isTbd && 'text-[#999] italic'
      ]
        .filter(Boolean)
        .join(' ')}>
      {name}
    </div>
  )
}
