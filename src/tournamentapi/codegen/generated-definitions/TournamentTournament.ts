/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'
import { TournamentTournamentStatus } from './TournamentTournamentStatus.js'

export const TournamentTournament = z.object({
  tournamentId: z.string().nullish(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  maxParticipants: z.number().int().nullish(),
  currentParticipants: z.number().int().nullish(),
  status: TournamentTournamentStatus.nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish()
})

export interface TournamentTournament extends z.TypeOf<typeof TournamentTournament> {}
