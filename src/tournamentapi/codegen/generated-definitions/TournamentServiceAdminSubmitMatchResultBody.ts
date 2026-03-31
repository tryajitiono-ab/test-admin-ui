/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
import { z } from 'zod'

export const TournamentServiceAdminSubmitMatchResultBody = z.object({ winnerUserId: z.string().nullish() })

export interface TournamentServiceAdminSubmitMatchResultBody extends z.TypeOf<typeof TournamentServiceAdminSubmitMatchResultBody> {}
