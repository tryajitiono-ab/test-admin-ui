/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'
import { TournamentMatch } from './TournamentMatch.js'

export const TournamentSubmitMatchResultResponse = z.object({ match: TournamentMatch.nullish() })

export interface TournamentSubmitMatchResultResponse extends z.TypeOf<typeof TournamentSubmitMatchResultResponse> {}
