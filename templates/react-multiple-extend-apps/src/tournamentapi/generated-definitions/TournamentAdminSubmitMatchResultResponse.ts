/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'
import { TournamentMatch } from './TournamentMatch.js'

export const TournamentAdminSubmitMatchResultResponse = z.object({ match: TournamentMatch.nullish() })

export interface TournamentAdminSubmitMatchResultResponse extends z.TypeOf<typeof TournamentAdminSubmitMatchResultResponse> {}
