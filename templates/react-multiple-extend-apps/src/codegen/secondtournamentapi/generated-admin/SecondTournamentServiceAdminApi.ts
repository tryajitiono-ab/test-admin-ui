/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
/**
 * AUTO GENERATED
 */
import type { AccelByteSDK, SdkSetConfigParam } from '@accelbyte/sdk'
import { ApiUtils, Network } from '@accelbyte/sdk'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { TournamentActivateTournamentResponse } from '../generated-definitions/TournamentActivateTournamentResponse.js'
import { TournamentAdminSubmitMatchResultResponse } from '../generated-definitions/TournamentAdminSubmitMatchResultResponse.js'
import { TournamentCancelTournamentResponse } from '../generated-definitions/TournamentCancelTournamentResponse.js'
import { TournamentCreateTournamentResponse } from '../generated-definitions/TournamentCreateTournamentResponse.js'
import { TournamentRemoveParticipantResponse } from '../generated-definitions/TournamentRemoveParticipantResponse.js'
import { TournamentServiceActivateTournamentBody } from '../generated-definitions/TournamentServiceActivateTournamentBody.js'
import { TournamentServiceAdminSubmitMatchResultBody } from '../generated-definitions/TournamentServiceAdminSubmitMatchResultBody.js'
import { TournamentServiceCancelTournamentBody } from '../generated-definitions/TournamentServiceCancelTournamentBody.js'
import { TournamentServiceCreateTournamentBody } from '../generated-definitions/TournamentServiceCreateTournamentBody.js'
import { TournamentServiceStartTournamentBody } from '../generated-definitions/TournamentServiceStartTournamentBody.js'
import { TournamentServiceSubmitMatchResultBody } from '../generated-definitions/TournamentServiceSubmitMatchResultBody.js'
import { TournamentStartTournamentResponse } from '../generated-definitions/TournamentStartTournamentResponse.js'
import { TournamentSubmitMatchResultResponse } from '../generated-definitions/TournamentSubmitMatchResultResponse.js'
import { SecondTournamentServiceAdmin$ } from './endpoints/SecondTournamentServiceAdmin$.js'

export function SecondTournamentServiceAdminApi(sdk: AccelByteSDK, args?: SdkSetConfigParam) {
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

  async function createTournament(data: TournamentServiceCreateTournamentBody): Promise<AxiosResponse<TournamentCreateTournamentResponse>> {
    const $ = new SecondTournamentServiceAdmin$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.createTournament(data)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function createStart_ByTournamentId(
    tournamentId: string,
    data: TournamentServiceStartTournamentBody
  ): Promise<AxiosResponse<TournamentStartTournamentResponse>> {
    const $ = new SecondTournamentServiceAdmin$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.createStart_ByTournamentId(tournamentId, data)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function createCancel_ByTournamentId(
    tournamentId: string,
    data: TournamentServiceCancelTournamentBody
  ): Promise<AxiosResponse<TournamentCancelTournamentResponse>> {
    const $ = new SecondTournamentServiceAdmin$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.createCancel_ByTournamentId(tournamentId, data)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function createActivate_ByTournamentId(
    tournamentId: string,
    data: TournamentServiceActivateTournamentBody
  ): Promise<AxiosResponse<TournamentActivateTournamentResponse>> {
    const $ = new SecondTournamentServiceAdmin$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.createActivate_ByTournamentId(tournamentId, data)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function deleteParticipant_ByTournamentId_ByUserId(
    tournamentId: string,
    userId: string
  ): Promise<AxiosResponse<TournamentRemoveParticipantResponse>> {
    const $ = new SecondTournamentServiceAdmin$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.deleteParticipant_ByTournamentId_ByUserId(tournamentId, userId)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function createResult_ByTournamentId_ByMatchId(
    tournamentId: string,
    matchId: string,
    data: TournamentServiceSubmitMatchResultBody
  ): Promise<AxiosResponse<TournamentSubmitMatchResultResponse>> {
    const $ = new SecondTournamentServiceAdmin$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.createResult_ByTournamentId_ByMatchId(tournamentId, matchId, data)
    if (resp.error) throw resp.error
    return resp.response
  }

  async function createResultAdmin_ByTournamentId_ByMatchId(
    tournamentId: string,
    matchId: string,
    data: TournamentServiceAdminSubmitMatchResultBody
  ): Promise<AxiosResponse<TournamentAdminSubmitMatchResultResponse>> {
    const $ = new SecondTournamentServiceAdmin$(axiosInstance, namespace, useSchemaValidation)
    const resp = await $.createResultAdmin_ByTournamentId_ByMatchId(tournamentId, matchId, data)
    if (resp.error) throw resp.error
    return resp.response
  }

  return {
    /**
     * Create a new tournament with specified configuration
     */
    createTournament,
    /**
     * Start a tournament to generate brackets and begin competition
     */
    createStart_ByTournamentId,
    /**
     * Cancel a tournament and prevent further participation
     */
    createCancel_ByTournamentId,
    /**
     * Activate a tournament to open registration for participants
     */
    createActivate_ByTournamentId,
    /**
     * Admin-only: Remove participant from tournament
     */
    deleteParticipant_ByTournamentId_ByUserId,
    /**
     * Game server: Submit match result with winner information
     */
    createResult_ByTournamentId_ByMatchId,
    /**
     * Admin override: Submit match result with winner information
     */
    createResultAdmin_ByTournamentId_ByMatchId
  }
}
