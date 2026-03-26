/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'
import { TournamentTournament } from './TournamentTournament.js'

export const TournamentListTournamentsResponse = z.object({
  tournaments: z.array(TournamentTournament).nullish(),
  totalCount: z.number().int().nullish()
})

export interface TournamentListTournamentsResponse extends z.TypeOf<typeof TournamentListTournamentsResponse> {}
