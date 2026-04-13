/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
/**
 * AUTO GENERATED
 */
import type { AccelByteSDK, ApiError, SdkSetConfigParam } from '@accelbyte/sdk'
import type { UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { AxiosError, AxiosResponse } from 'axios'
import { SecondTournamentServiceApi } from '../SecondTournamentServiceApi.js'

import { TournamentGetMatchResponse } from '../../generated-definitions/TournamentGetMatchResponse.js'
import { TournamentGetTournamentMatchesResponse } from '../../generated-definitions/TournamentGetTournamentMatchesResponse.js'
import { TournamentGetTournamentParticipantsResponse } from '../../generated-definitions/TournamentGetTournamentParticipantsResponse.js'
import { TournamentGetTournamentResponse } from '../../generated-definitions/TournamentGetTournamentResponse.js'
import { TournamentListTournamentsResponse } from '../../generated-definitions/TournamentListTournamentsResponse.js'
import { TournamentRegisterForTournamentResponse } from '../../generated-definitions/TournamentRegisterForTournamentResponse.js'
import { TournamentServiceRegisterForTournamentBody } from '../../generated-definitions/TournamentServiceRegisterForTournamentBody.js'

export const Key_SecondTournamentService = {
  Tournaments: 'Secondtournamentapi.SecondTournamentService.Tournaments',
  Tournament_ByTournamentId: 'Secondtournamentapi.SecondTournamentService.Tournament_ByTournamentId',
  Matches_ByTournamentId: 'Secondtournamentapi.SecondTournamentService.Matches_ByTournamentId',
  Register_ByTournamentId: 'Secondtournamentapi.SecondTournamentService.Register_ByTournamentId',
  Participants_ByTournamentId: 'Secondtournamentapi.SecondTournamentService.Participants_ByTournamentId',
  Matche_ByTournamentId_ByMatchId: 'Secondtournamentapi.SecondTournamentService.Matche_ByTournamentId_ByMatchId'
} as const

/**
 * List tournaments with optional filtering by status and date range
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentService.Tournaments, input]
 * }
 * ```
 */
export const useSecondTournamentServiceApi_GetTournaments = (
  sdk: AccelByteSDK,
  input: SdkSetConfigParam & {
    queryParams?: {
      limit?: number
      offset?: number
      status?:
        | 'TOURNAMENT_STATUS_UNSPECIFIED'
        | 'TOURNAMENT_STATUS_DRAFT'
        | 'TOURNAMENT_STATUS_ACTIVE'
        | 'TOURNAMENT_STATUS_STARTED'
        | 'TOURNAMENT_STATUS_COMPLETED'
        | 'TOURNAMENT_STATUS_CANCELLED'
      startDateFrom?: string | null
      startDateTo?: string | null
    }
  },
  options?: Omit<UseQueryOptions<TournamentListTournamentsResponse, AxiosError<ApiError>>, 'queryKey'>,
  callback?: (data: AxiosResponse<TournamentListTournamentsResponse>) => void
): UseQueryResult<TournamentListTournamentsResponse, AxiosError<ApiError>> => {
  const queryFn = (sdk: AccelByteSDK, input: Parameters<typeof useSecondTournamentServiceApi_GetTournaments>[1]) => async () => {
    const response = await SecondTournamentServiceApi(sdk, { coreConfig: input.coreConfig, axiosConfig: input.axiosConfig }).getTournaments(
      input.queryParams
    )
    callback?.(response)
    return response.data
  }

  return useQuery<TournamentListTournamentsResponse, AxiosError<ApiError>>({
    queryKey: [Key_SecondTournamentService.Tournaments, input],
    queryFn: queryFn(sdk, input),
    ...options
  })
}

/**
 * Get tournament details by tournament ID
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentService.Tournament_ByTournamentId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceApi_GetTournament_ByTournamentId = (
  sdk: AccelByteSDK,
  input: SdkSetConfigParam & { tournamentId: string },
  options?: Omit<UseQueryOptions<TournamentGetTournamentResponse, AxiosError<ApiError>>, 'queryKey'>,
  callback?: (data: AxiosResponse<TournamentGetTournamentResponse>) => void
): UseQueryResult<TournamentGetTournamentResponse, AxiosError<ApiError>> => {
  const queryFn =
    (sdk: AccelByteSDK, input: Parameters<typeof useSecondTournamentServiceApi_GetTournament_ByTournamentId>[1]) => async () => {
      const response = await SecondTournamentServiceApi(sdk, {
        coreConfig: input.coreConfig,
        axiosConfig: input.axiosConfig
      }).getTournament_ByTournamentId(input.tournamentId)
      callback?.(response)
      return response.data
    }

  return useQuery<TournamentGetTournamentResponse, AxiosError<ApiError>>({
    queryKey: [Key_SecondTournamentService.Tournament_ByTournamentId, input],
    queryFn: queryFn(sdk, input),
    ...options
  })
}

/**
 * Get all matches for a tournament organized by round
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentService.Matches_ByTournamentId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceApi_GetMatches_ByTournamentId = (
  sdk: AccelByteSDK,
  input: SdkSetConfigParam & { tournamentId: string; queryParams?: { round?: number } },
  options?: Omit<UseQueryOptions<TournamentGetTournamentMatchesResponse, AxiosError<ApiError>>, 'queryKey'>,
  callback?: (data: AxiosResponse<TournamentGetTournamentMatchesResponse>) => void
): UseQueryResult<TournamentGetTournamentMatchesResponse, AxiosError<ApiError>> => {
  const queryFn = (sdk: AccelByteSDK, input: Parameters<typeof useSecondTournamentServiceApi_GetMatches_ByTournamentId>[1]) => async () => {
    const response = await SecondTournamentServiceApi(sdk, {
      coreConfig: input.coreConfig,
      axiosConfig: input.axiosConfig
    }).getMatches_ByTournamentId(input.tournamentId, input.queryParams)
    callback?.(response)
    return response.data
  }

  return useQuery<TournamentGetTournamentMatchesResponse, AxiosError<ApiError>>({
    queryKey: [Key_SecondTournamentService.Matches_ByTournamentId, input],
    queryFn: queryFn(sdk, input),
    ...options
  })
}

/**
 * Register user for tournament with capacity enforcement
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentService.Register_ByTournamentId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceApi_CreateRegister_ByTournamentIdMutation = (
  sdk: AccelByteSDK,
  options?: Omit<
    UseMutationOptions<
      TournamentRegisterForTournamentResponse,
      AxiosError<ApiError>,
      SdkSetConfigParam & { tournamentId: string; data: TournamentServiceRegisterForTournamentBody }
    >,
    'mutationKey'
  >,
  callback?: (data: TournamentRegisterForTournamentResponse) => void
): UseMutationResult<
  TournamentRegisterForTournamentResponse,
  AxiosError<ApiError>,
  SdkSetConfigParam & { tournamentId: string; data: TournamentServiceRegisterForTournamentBody }
> => {
  const mutationFn = async (input: SdkSetConfigParam & { tournamentId: string; data: TournamentServiceRegisterForTournamentBody }) => {
    const response = await SecondTournamentServiceApi(sdk, {
      coreConfig: input.coreConfig,
      axiosConfig: input.axiosConfig
    }).createRegister_ByTournamentId(input.tournamentId, input.data)
    callback?.(response.data)
    return response.data
  }

  return useMutation({
    mutationKey: [Key_SecondTournamentService.Register_ByTournamentId],
    mutationFn,
    ...options
  })
}

/**
 * List all participants for a tournament with pagination
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentService.Participants_ByTournamentId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceApi_GetParticipants_ByTournamentId = (
  sdk: AccelByteSDK,
  input: SdkSetConfigParam & { tournamentId: string; queryParams?: { pageSize?: number; pageToken?: string | null } },
  options?: Omit<UseQueryOptions<TournamentGetTournamentParticipantsResponse, AxiosError<ApiError>>, 'queryKey'>,
  callback?: (data: AxiosResponse<TournamentGetTournamentParticipantsResponse>) => void
): UseQueryResult<TournamentGetTournamentParticipantsResponse, AxiosError<ApiError>> => {
  const queryFn =
    (sdk: AccelByteSDK, input: Parameters<typeof useSecondTournamentServiceApi_GetParticipants_ByTournamentId>[1]) => async () => {
      const response = await SecondTournamentServiceApi(sdk, {
        coreConfig: input.coreConfig,
        axiosConfig: input.axiosConfig
      }).getParticipants_ByTournamentId(input.tournamentId, input.queryParams)
      callback?.(response)
      return response.data
    }

  return useQuery<TournamentGetTournamentParticipantsResponse, AxiosError<ApiError>>({
    queryKey: [Key_SecondTournamentService.Participants_ByTournamentId, input],
    queryFn: queryFn(sdk, input),
    ...options
  })
}

/**
 * Get detailed information about a specific match
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentService.Matche_ByTournamentId_ByMatchId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceApi_GetMatche_ByTournamentId_ByMatchId = (
  sdk: AccelByteSDK,
  input: SdkSetConfigParam & { tournamentId: string; matchId: string },
  options?: Omit<UseQueryOptions<TournamentGetMatchResponse, AxiosError<ApiError>>, 'queryKey'>,
  callback?: (data: AxiosResponse<TournamentGetMatchResponse>) => void
): UseQueryResult<TournamentGetMatchResponse, AxiosError<ApiError>> => {
  const queryFn =
    (sdk: AccelByteSDK, input: Parameters<typeof useSecondTournamentServiceApi_GetMatche_ByTournamentId_ByMatchId>[1]) => async () => {
      const response = await SecondTournamentServiceApi(sdk, {
        coreConfig: input.coreConfig,
        axiosConfig: input.axiosConfig
      }).getMatche_ByTournamentId_ByMatchId(input.tournamentId, input.matchId)
      callback?.(response)
      return response.data
    }

  return useQuery<TournamentGetMatchResponse, AxiosError<ApiError>>({
    queryKey: [Key_SecondTournamentService.Matche_ByTournamentId_ByMatchId, input],
    queryFn: queryFn(sdk, input),
    ...options
  })
}
