/* 
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'


export const TournamentServiceCreateTournamentBody = z.object({'name': z.string().nullish(),'description': z.string().nullish(),'maxParticipants': z.number().int().nullish(),'startTime': z.string().nullish(),'endTime': z.string().nullish()})

export interface TournamentServiceCreateTournamentBody extends z.TypeOf<typeof TournamentServiceCreateTournamentBody> {}
  