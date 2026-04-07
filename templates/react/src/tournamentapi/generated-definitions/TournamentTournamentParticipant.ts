/* 
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'


export const TournamentTournamentParticipant = z.object({'displayName': z.string().nullish(),'userId': z.string().nullish(),'username': z.string().nullish()})

export interface TournamentTournamentParticipant extends z.TypeOf<typeof TournamentTournamentParticipant> {}
  