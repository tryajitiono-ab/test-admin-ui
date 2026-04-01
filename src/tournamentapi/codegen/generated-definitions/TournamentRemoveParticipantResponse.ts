/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'

export const TournamentRemoveParticipantResponse = z.object({
  removed: z.boolean().nullish(),
  tournamentId: z.string().nullish(),
  userId: z.string().nullish()
})

export interface TournamentRemoveParticipantResponse extends z.TypeOf<typeof TournamentRemoveParticipantResponse> {}
