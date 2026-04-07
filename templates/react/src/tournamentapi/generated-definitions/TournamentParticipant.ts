/* 
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'


export const TournamentParticipant = z.object({'displayName': z.string().nullish(),'participantId': z.string().nullish(),'registeredAt': z.string().nullish(),'tournamentId': z.string().nullish(),'updatedAt': z.string().nullish(),'userId': z.string().nullish(),'username': z.string().nullish()})

export interface TournamentParticipant extends z.TypeOf<typeof TournamentParticipant> {}
  