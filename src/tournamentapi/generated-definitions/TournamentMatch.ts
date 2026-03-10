/* 
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'
import { TournamentMatchStatus } from './TournamentMatchStatus.js'
import { TournamentTournamentParticipant } from './TournamentTournamentParticipant.js'


export const TournamentMatch = z.object({'matchId': z.string().nullish(),'tournamentId': z.string().nullish(),'round': z.number().int().nullish(),'position': z.number().int().nullish(),'participant1': TournamentTournamentParticipant.nullish(),'participant2': TournamentTournamentParticipant.nullish(),'winner': z.string().nullish(),'status': TournamentMatchStatus.nullish(),'startedAt': z.string().nullish(),'completedAt': z.string().nullish(),'nextMatchId': z.string().nullish(),'sourceMatch1Id': z.string().nullish(),'sourceMatch2Id': z.string().nullish()})

export interface TournamentMatch extends z.TypeOf<typeof TournamentMatch> {}
  