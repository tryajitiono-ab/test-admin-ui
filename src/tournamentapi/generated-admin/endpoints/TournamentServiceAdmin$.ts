/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
/**
 * AUTO GENERATED
 */
import { type Response, Validate } from '@accelbyte/sdk'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { TournamentActivateTournamentResponse } from '../../generated-definitions/TournamentActivateTournamentResponse.js'
import { TournamentAdminSubmitMatchResultResponse } from '../../generated-definitions/TournamentAdminSubmitMatchResultResponse.js'
import { TournamentCancelTournamentResponse } from '../../generated-definitions/TournamentCancelTournamentResponse.js'
import { TournamentCreateTournamentResponse } from '../../generated-definitions/TournamentCreateTournamentResponse.js'
import { TournamentRemoveParticipantResponse } from '../../generated-definitions/TournamentRemoveParticipantResponse.js'
import { TournamentServiceActivateTournamentBody } from '../../generated-definitions/TournamentServiceActivateTournamentBody.js'
import { TournamentServiceAdminSubmitMatchResultBody } from '../../generated-definitions/TournamentServiceAdminSubmitMatchResultBody.js'
import { TournamentServiceCancelTournamentBody } from '../../generated-definitions/TournamentServiceCancelTournamentBody.js'
import { TournamentServiceCreateTournamentBody } from '../../generated-definitions/TournamentServiceCreateTournamentBody.js'
import { TournamentServiceStartTournamentBody } from '../../generated-definitions/TournamentServiceStartTournamentBody.js'
import { TournamentServiceSubmitMatchResultBody } from '../../generated-definitions/TournamentServiceSubmitMatchResultBody.js'
import { TournamentStartTournamentResponse } from '../../generated-definitions/TournamentStartTournamentResponse.js'
import { TournamentSubmitMatchResultResponse } from '../../generated-definitions/TournamentSubmitMatchResultResponse.js'

export class TournamentServiceAdmin$ {
  // @ts-ignore
  // prettier-ignore
  constructor(private axiosInstance: AxiosInstance, private namespace: string, private useSchemaValidation = true) {}
  /**
   * Create a new tournament with specified configuration
   */
  createTournament(data: TournamentServiceCreateTournamentBody): Promise<Response<TournamentCreateTournamentResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/v1/admin/namespace/{namespace}/tournaments'.replace('{namespace}', this.namespace)
    const resultPromise = this.axiosInstance.post(url, data, { params })

    return Validate.validateOrReturnResponse(
      this.useSchemaValidation,
      () => resultPromise,
      TournamentCreateTournamentResponse,
      'TournamentCreateTournamentResponse'
    )
  }
  /**
   * Start a tournament to generate brackets and begin competition
   */
  createStart_ByTournamentId(
    tournamentId: string,
    data: TournamentServiceStartTournamentBody
  ): Promise<Response<TournamentStartTournamentResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/v1/admin/namespace/{namespace}/tournaments/{tournamentId}/start'
      .replace('{namespace}', this.namespace)
      .replace('{tournamentId}', tournamentId)
    const resultPromise = this.axiosInstance.post(url, data, { params })

    return Validate.validateOrReturnResponse(
      this.useSchemaValidation,
      () => resultPromise,
      TournamentStartTournamentResponse,
      'TournamentStartTournamentResponse'
    )
  }
  /**
   * Cancel a tournament and prevent further participation
   */
  createCancel_ByTournamentId(
    tournamentId: string,
    data: TournamentServiceCancelTournamentBody
  ): Promise<Response<TournamentCancelTournamentResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/v1/admin/namespace/{namespace}/tournaments/{tournamentId}/cancel'
      .replace('{namespace}', this.namespace)
      .replace('{tournamentId}', tournamentId)
    const resultPromise = this.axiosInstance.post(url, data, { params })

    return Validate.validateOrReturnResponse(
      this.useSchemaValidation,
      () => resultPromise,
      TournamentCancelTournamentResponse,
      'TournamentCancelTournamentResponse'
    )
  }
  /**
   * Activate a tournament to open registration for participants
   */
  createActivate_ByTournamentId(
    tournamentId: string,
    data: TournamentServiceActivateTournamentBody
  ): Promise<Response<TournamentActivateTournamentResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/v1/admin/namespace/{namespace}/tournaments/{tournamentId}/activate'
      .replace('{namespace}', this.namespace)
      .replace('{tournamentId}', tournamentId)
    const resultPromise = this.axiosInstance.post(url, data, { params })

    return Validate.validateOrReturnResponse(
      this.useSchemaValidation,
      () => resultPromise,
      TournamentActivateTournamentResponse,
      'TournamentActivateTournamentResponse'
    )
  }
  /**
   * Admin-only: Remove participant from tournament
   */
  deleteParticipant_ByTournamentId_ByUserId(tournamentId: string, userId: string): Promise<Response<TournamentRemoveParticipantResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/v1/admin/namespace/{namespace}/tournaments/{tournamentId}/participants/{userId}'
      .replace('{namespace}', this.namespace)
      .replace('{tournamentId}', tournamentId)
      .replace('{userId}', userId)
    const resultPromise = this.axiosInstance.delete(url, { params })

    return Validate.validateOrReturnResponse(
      this.useSchemaValidation,
      () => resultPromise,
      TournamentRemoveParticipantResponse,
      'TournamentRemoveParticipantResponse'
    )
  }
  /**
   * Game server: Submit match result with winner information
   */
  createResult_ByTournamentId_ByMatchId(
    tournamentId: string,
    matchId: string,
    data: TournamentServiceSubmitMatchResultBody
  ): Promise<Response<TournamentSubmitMatchResultResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/v1/admin/namespace/{namespace}/tournaments/{tournamentId}/matches/{matchId}/result'
      .replace('{namespace}', this.namespace)
      .replace('{tournamentId}', tournamentId)
      .replace('{matchId}', matchId)
    const resultPromise = this.axiosInstance.post(url, data, { params })

    return Validate.validateOrReturnResponse(
      this.useSchemaValidation,
      () => resultPromise,
      TournamentSubmitMatchResultResponse,
      'TournamentSubmitMatchResultResponse'
    )
  }
  /**
   * Admin override: Submit match result with winner information
   */
  createResultAdmin_ByTournamentId_ByMatchId(
    tournamentId: string,
    matchId: string,
    data: TournamentServiceAdminSubmitMatchResultBody
  ): Promise<Response<TournamentAdminSubmitMatchResultResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/v1/admin/namespace/{namespace}/tournaments/{tournamentId}/matches/{matchId}/result/admin'
      .replace('{namespace}', this.namespace)
      .replace('{tournamentId}', tournamentId)
      .replace('{matchId}', matchId)
    const resultPromise = this.axiosInstance.post(url, data, { params })

    return Validate.validateOrReturnResponse(
      this.useSchemaValidation,
      () => resultPromise,
      TournamentAdminSubmitMatchResultResponse,
      'TournamentAdminSubmitMatchResultResponse'
    )
  }
}
