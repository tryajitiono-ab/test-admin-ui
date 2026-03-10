/* 
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'
import { TournamentParticipant } from './TournamentParticipant.js'


export const TournamentGetTournamentParticipantsResponse = z.object({'participants': z.array(TournamentParticipant).nullish(),'totalParticipants': z.number().int().nullish(),'nextPageToken': z.string().nullish()})

export interface TournamentGetTournamentParticipantsResponse extends z.TypeOf<typeof TournamentGetTournamentParticipantsResponse> {}
  