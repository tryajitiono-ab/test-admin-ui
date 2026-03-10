/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
/**
 * AUTO GENERATED
 */
/* eslint-disable camelcase */
// @ts-ignore -> ts-expect-error TS6133
import { AccelByteSDK, ApiUtils, Network, type SdkSetConfigParam } from '@accelbyte/sdk'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { TournamentGetMatchResponse } from '../generated-definitions/TournamentGetMatchResponse.js'
import { TournamentGetTournamentMatchesResponse } from '../generated-definitions/TournamentGetTournamentMatchesResponse.js'
import { TournamentGetTournamentParticipantsResponse } from '../generated-definitions/TournamentGetTournamentParticipantsResponse.js'
import { TournamentGetTournamentResponse } from '../generated-definitions/TournamentGetTournamentResponse.js'
import { TournamentListTournamentsResponse } from '../generated-definitions/TournamentListTournamentsResponse.js'
import { TournamentRegisterForTournamentResponse } from '../generated-definitions/TournamentRegisterForTournamentResponse.js'
import { TournamentServiceRegisterForTournamentBody } from '../generated-definitions/TournamentServiceRegisterForTournamentBody.js'
import { TournamentService$ } from './endpoints/TournamentService$.js'

export function TournamentServiceApi(sdk: AccelByteSDK, args?: SdkSetConfigParam) {
  const sdkAssembly = sdk.assembly()

  const namespace = args?.coreConfig?.namespace ?? sdkAssembly.coreConfig.namespace
  const useSchemaValidation = args?.coreConfig?.useSchemaValidation ?? sdkAssembly.coreConfig.useSchemaValidation

  let axiosInstance = sdkAssembly.axiosInstance
  const requestConfigOverrides = args?.axiosConfig?.request
  const baseURLOverride = args?.coreConfig?.baseURL
  const interceptorsOverride = args?.axiosConfig?.interceptors

  if (requestConfigOverrides || baseURLOverride || interceptorsOverride) {
    const requestConfig = ApiUtils.mergeAxiosConfigs(sdkAssembly.axiosInstance.defaults as AxiosRequestConfig, {
      ...(baseURLOverride ? { baseURL: baseURLOverride } : {}),
      ...requestConfigOverrides
    })
    axiosInstance = Network.create(requestConfig)

    if (interceptorsOverride) {
      for (const interceptor of interceptorsOverride) {
        if (interceptor.type === 'request') {
          axiosInstance.interceptors.request.use(interceptor.onRequest, interceptor.onError)
        }

        if (interceptor.type === 'response') {
          axiosInstance.interceptors.response.use(interceptor.onSuccess, interceptor.onError)
        }
      }
    } else {
      axiosInstance.interceptors = sdkAssembly.axiosInstance.interceptors
    }
  }

  async function getTournaments(queryParams?: {
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
  }): Promise<AxiosResponse<TournamentListTournamentsResponse>> {
    const $ = new TournamentService$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.getTournaments(queryParams)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function getTournament_ByTournamentId(tournamentId: string): Promise<AxiosResponse<TournamentGetTournamentResponse>> {
    const $ = new TournamentService$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.getTournament_ByTournamentId(tournamentId)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function getMatches_ByTournamentId(
    tournamentId: string,
    queryParams?: { round?: number }
  ): Promise<AxiosResponse<TournamentGetTournamentMatchesResponse>> {
    const $ = new TournamentService$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.getMatches_ByTournamentId(tournamentId, queryParams)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function createRegister_ByTournamentId(
    tournamentId: string,
    data: TournamentServiceRegisterForTournamentBody
  ): Promise<AxiosResponse<TournamentRegisterForTournamentResponse>> {
    const $ = new TournamentService$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.createRegister_ByTournamentId(tournamentId, data)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function getParticipants_ByTournamentId(
    tournamentId: string,
    queryParams?: { pageSize?: number; pageToken?: string | null }
  ): Promise<AxiosResponse<TournamentGetTournamentParticipantsResponse>> {
    const $ = new TournamentService$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.getParticipants_ByTournamentId(tournamentId, queryParams)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function getMatche_ByTournamentId_ByMatchId(
    tournamentId: string,
    matchId: string
  ): Promise<AxiosResponse<TournamentGetMatchResponse>> {
    const $ = new TournamentService$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.getMatche_ByTournamentId_ByMatchId(tournamentId, matchId)
    if (resp.error) throw resp.error
    return resp.response
  }

  return {
    /**
     * List tournaments with optional filtering by status and date range
     */
    getTournaments,
    /**
     * Get tournament details by tournament ID
     */
    getTournament_ByTournamentId,
    /**
     * Get all matches for a tournament organized by round
     */
    getMatches_ByTournamentId,
    /**
     * Register user for tournament with capacity enforcement
     */
    createRegister_ByTournamentId,
    /**
     * List all participants for a tournament with pagination
     */
    getParticipants_ByTournamentId,
    /**
     * Get detailed information about a specific match
     */
    getMatche_ByTournamentId_ByMatchId
  }
}
