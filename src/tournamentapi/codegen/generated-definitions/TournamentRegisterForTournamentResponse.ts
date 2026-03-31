/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'

export const TournamentRegisterForTournamentResponse = z.object({
  participantId: z.string().nullish(),
  tournamentId: z.string().nullish(),
  userId: z.string().nullish(),
  registeredAt: z.string().nullish()
})

export interface TournamentRegisterForTournamentResponse extends z.TypeOf<typeof TournamentRegisterForTournamentResponse> {}
