/* 
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
/**
 * AUTO GENERATED
 */
import type { AccelByteSDK, ApiError, SdkSetConfigParam } from '@accelbyte/sdk'
import type { AxiosError, AxiosResponse } from 'axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { TournamentServiceApi } from "../TournamentServiceApi.js"

import { TournamentGetMatchResponse } from '../../generated-definitions/TournamentGetMatchResponse.js'
import { TournamentGetTournamentMatchesResponse } from '../../generated-definitions/TournamentGetTournamentMatchesResponse.js'
import { TournamentGetTournamentParticipantsResponse } from '../../generated-definitions/TournamentGetTournamentParticipantsResponse.js'
import { TournamentGetTournamentResponse } from '../../generated-definitions/TournamentGetTournamentResponse.js'
import { TournamentListTournamentsResponse } from '../../generated-definitions/TournamentListTournamentsResponse.js'
import { TournamentRegisterForTournamentResponse } from '../../generated-definitions/TournamentRegisterForTournamentResponse.js'
import { TournamentServiceRegisterForTournamentBody } from '../../generated-definitions/TournamentServiceRegisterForTournamentBody.js'


export const Key_TournamentService = {
  Tournaments: 'Tournamentapi.TournamentService.Tournaments',
Tournament_ByTournamentId: 'Tournamentapi.TournamentService.Tournament_ByTournamentId',
Matches_ByTournamentId: 'Tournamentapi.TournamentService.Matches_ByTournamentId',
Register_ByTournamentId: 'Tournamentapi.TournamentService.Register_ByTournamentId',
Participants_ByTournamentId: 'Tournamentapi.TournamentService.Participants_ByTournamentId',
Matche_ByTournamentId_ByMatchId: 'Tournamentapi.TournamentService.Matche_ByTournamentId_ByMatchId',

} as const

  

  /**
   * List tournaments with optional filtering by status and date range
   *  
   * #### Default Query Options
   * The default options include:
   * ```
   * {
   *    queryKey: [Key_TournamentService.Tournaments, input]
   * }
   * ```
   */
export const useTournamentServiceApi_GetTournaments = (
    sdk: AccelByteSDK,
    input: SdkSetConfigParam & {  queryParams?: {limit?: number, offset?: number, status?: 'TOURNAMENT_STATUS_UNSPECIFIED' | 'TOURNAMENT_STATUS_DRAFT' | 'TOURNAMENT_STATUS_ACTIVE' | 'TOURNAMENT_STATUS_STARTED' | 'TOURNAMENT_STATUS_COMPLETED' | 'TOURNAMENT_STATUS_CANCELLED', startDateFrom?: string | null, startDateTo?: string | null} },
    options?: Omit<UseQueryOptions<TournamentListTournamentsResponse, AxiosError<ApiError>>, 'queryKey'>,
    callback?: (data: AxiosResponse<TournamentListTournamentsResponse>) => void
  ): UseQueryResult<TournamentListTournamentsResponse, AxiosError<ApiError>> => { 
  
  const queryFn = (
  sdk: AccelByteSDK, 
  input: Parameters<typeof useTournamentServiceApi_GetTournaments>[1]
  ) => async () => {
      const response = 
            (await TournamentServiceApi(sdk, { coreConfig: input.coreConfig, axiosConfig: input.axiosConfig }).
                getTournaments(input.queryParams))
      callback?.(response)
      return response.data
  }
  
  return useQuery<TournamentListTournamentsResponse, AxiosError<ApiError>>({
    queryKey: [Key_TournamentService.Tournaments, input],
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
   *    queryKey: [Key_TournamentService.Tournament_ByTournamentId, input]
   * }
   * ```
   */
export const useTournamentServiceApi_GetTournament_ByTournamentId = (
    sdk: AccelByteSDK,
    input: SdkSetConfigParam & { tournamentId:string },
    options?: Omit<UseQueryOptions<TournamentGetTournamentResponse, AxiosError<ApiError>>, 'queryKey'>,
    callback?: (data: AxiosResponse<TournamentGetTournamentResponse>) => void
  ): UseQueryResult<TournamentGetTournamentResponse, AxiosError<ApiError>> => { 
  
  const queryFn = (
  sdk: AccelByteSDK, 
  input: Parameters<typeof useTournamentServiceApi_GetTournament_ByTournamentId>[1]
  ) => async () => {
      const response = 
            (await TournamentServiceApi(sdk, { coreConfig: input.coreConfig, axiosConfig: input.axiosConfig }).
                getTournament_ByTournamentId(input.tournamentId))
      callback?.(response)
      return response.data
  }
  
  return useQuery<TournamentGetTournamentResponse, AxiosError<ApiError>>({
    queryKey: [Key_TournamentService.Tournament_ByTournamentId, input],
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
   *    queryKey: [Key_TournamentService.Matches_ByTournamentId, input]
   * }
   * ```
   */
export const useTournamentServiceApi_GetMatches_ByTournamentId = (
    sdk: AccelByteSDK,
    input: SdkSetConfigParam & { tournamentId:string,  queryParams?: {round?: number} },
    options?: Omit<UseQueryOptions<TournamentGetTournamentMatchesResponse, AxiosError<ApiError>>, 'queryKey'>,
    callback?: (data: AxiosResponse<TournamentGetTournamentMatchesResponse>) => void
  ): UseQueryResult<TournamentGetTournamentMatchesResponse, AxiosError<ApiError>> => { 
  
  const queryFn = (
  sdk: AccelByteSDK, 
  input: Parameters<typeof useTournamentServiceApi_GetMatches_ByTournamentId>[1]
  ) => async () => {
      const response = 
            (await TournamentServiceApi(sdk, { coreConfig: input.coreConfig, axiosConfig: input.axiosConfig }).
                getMatches_ByTournamentId(input.tournamentId, input.queryParams))
      callback?.(response)
      return response.data
  }
  
  return useQuery<TournamentGetTournamentMatchesResponse, AxiosError<ApiError>>({
    queryKey: [Key_TournamentService.Matches_ByTournamentId, input],
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
   *    queryKey: [Key_TournamentService.Register_ByTournamentId, input]
   * }
   * ```
   */
export const useTournamentServiceApi_CreateRegister_ByTournamentIdMutation = (
    sdk: AccelByteSDK,
    options?: Omit<UseMutationOptions<TournamentRegisterForTournamentResponse, AxiosError<ApiError>, SdkSetConfigParam & { tournamentId:string, data: TournamentServiceRegisterForTournamentBody }>, 'mutationKey'>,
    callback?: (data: TournamentRegisterForTournamentResponse) => void
  ): UseMutationResult<TournamentRegisterForTournamentResponse, AxiosError<ApiError>, SdkSetConfigParam & { tournamentId:string, data: TournamentServiceRegisterForTournamentBody }> => { 
  
  const mutationFn = async (input: SdkSetConfigParam & { tournamentId:string, data: TournamentServiceRegisterForTournamentBody }) => {
      const response = 
            (await TournamentServiceApi(sdk, { coreConfig: input.coreConfig, axiosConfig: input.axiosConfig }).
                createRegister_ByTournamentId(input.tournamentId, input.data))
      callback?.(response.data)
      return response.data
  }
  
  return useMutation({
    mutationKey: [Key_TournamentService.Register_ByTournamentId],
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
   *    queryKey: [Key_TournamentService.Participants_ByTournamentId, input]
   * }
   * ```
   */
export const useTournamentServiceApi_GetParticipants_ByTournamentId = (
    sdk: AccelByteSDK,
    input: SdkSetConfigParam & { tournamentId:string,  queryParams?: {pageSize?: number, pageToken?: string | null} },
    options?: Omit<UseQueryOptions<TournamentGetTournamentParticipantsResponse, AxiosError<ApiError>>, 'queryKey'>,
    callback?: (data: AxiosResponse<TournamentGetTournamentParticipantsResponse>) => void
  ): UseQueryResult<TournamentGetTournamentParticipantsResponse, AxiosError<ApiError>> => { 
  
  const queryFn = (
  sdk: AccelByteSDK, 
  input: Parameters<typeof useTournamentServiceApi_GetParticipants_ByTournamentId>[1]
  ) => async () => {
      const response = 
            (await TournamentServiceApi(sdk, { coreConfig: input.coreConfig, axiosConfig: input.axiosConfig }).
                getParticipants_ByTournamentId(input.tournamentId, input.queryParams))
      callback?.(response)
      return response.data
  }
  
  return useQuery<TournamentGetTournamentParticipantsResponse, AxiosError<ApiError>>({
    queryKey: [Key_TournamentService.Participants_ByTournamentId, input],
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
   *    queryKey: [Key_TournamentService.Matche_ByTournamentId_ByMatchId, input]
   * }
   * ```
   */
export const useTournamentServiceApi_GetMatche_ByTournamentId_ByMatchId = (
    sdk: AccelByteSDK,
    input: SdkSetConfigParam & { tournamentId:string, matchId:string },
    options?: Omit<UseQueryOptions<TournamentGetMatchResponse, AxiosError<ApiError>>, 'queryKey'>,
    callback?: (data: AxiosResponse<TournamentGetMatchResponse>) => void
  ): UseQueryResult<TournamentGetMatchResponse, AxiosError<ApiError>> => { 
  
  const queryFn = (
  sdk: AccelByteSDK, 
  input: Parameters<typeof useTournamentServiceApi_GetMatche_ByTournamentId_ByMatchId>[1]
  ) => async () => {
      const response = 
            (await TournamentServiceApi(sdk, { coreConfig: input.coreConfig, axiosConfig: input.axiosConfig }).
                getMatche_ByTournamentId_ByMatchId(input.tournamentId, input.matchId))
      callback?.(response)
      return response.data
  }
  
  return useQuery<TournamentGetMatchResponse, AxiosError<ApiError>>({
    queryKey: [Key_TournamentService.Matche_ByTournamentId_ByMatchId, input],
    queryFn: queryFn(sdk, input),
    ...options
  })
}
  
  
  