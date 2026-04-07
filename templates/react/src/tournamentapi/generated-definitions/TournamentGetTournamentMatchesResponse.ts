/* 
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'
import { TournamentMatch } from './TournamentMatch.js'


export const TournamentGetTournamentMatchesResponse = z.object({'currentRound': z.number().int().nullish(),'matches': z.array(TournamentMatch).nullish(),'totalRounds': z.number().int().nullish()})

export interface TournamentGetTournamentMatchesResponse extends z.TypeOf<typeof TournamentGetTournamentMatchesResponse> {}
  