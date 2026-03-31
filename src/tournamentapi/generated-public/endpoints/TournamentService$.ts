/* 
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
/**
 * AUTO GENERATED
 */
import { Validate } from '@accelbyte/sdk'
import type { Response } from '@accelbyte/sdk'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { TournamentGetMatchResponse } from '../../generated-definitions/TournamentGetMatchResponse.js'
import { TournamentGetTournamentMatchesResponse } from '../../generated-definitions/TournamentGetTournamentMatchesResponse.js'
import { TournamentGetTournamentParticipantsResponse } from '../../generated-definitions/TournamentGetTournamentParticipantsResponse.js'
import { TournamentGetTournamentResponse } from '../../generated-definitions/TournamentGetTournamentResponse.js'
import { TournamentListTournamentsResponse } from '../../generated-definitions/TournamentListTournamentsResponse.js'
import { TournamentRegisterForTournamentResponse } from '../../generated-definitions/TournamentRegisterForTournamentResponse.js'
import { TournamentServiceRegisterForTournamentBody } from '../../generated-definitions/TournamentServiceRegisterForTournamentBody.js'

export class TournamentService$ {
  private axiosInstance: AxiosInstance
private namespace: string
private useSchemaValidation: boolean

  constructor(axiosInstance: AxiosInstance, namespace: string, useSchemaValidation = true) {
    this.axiosInstance = axiosInstance
this.namespace = namespace
this.useSchemaValidation = useSchemaValidation
  }

    /**
   * List tournaments with optional filtering by status and date range
   */
  getTournaments( queryParams?: {limit?: number, offset?: number, status?: 'TOURNAMENT_STATUS_UNSPECIFIED' | 'TOURNAMENT_STATUS_DRAFT' | 'TOURNAMENT_STATUS_ACTIVE' | 'TOURNAMENT_STATUS_STARTED' | 'TOURNAMENT_STATUS_COMPLETED' | 'TOURNAMENT_STATUS_CANCELLED', startDateFrom?: string | null, startDateTo?: string | null}): Promise<Response<TournamentListTournamentsResponse>> {
    const params = {status: 'TOURNAMENT_STATUS_UNSPECIFIED', ...queryParams} as AxiosRequestConfig
    const url = '/ext-abtesttryaji2026033001-xdd-tournmanet-system-local2/v1/public/namespace/{namespace}/tournaments'.replace('{namespace}', this.namespace)     
    const resultPromise = this.axiosInstance.get(url, {params})

    return Validate.validateOrReturnResponse(this.useSchemaValidation, () => resultPromise, TournamentListTournamentsResponse, 'TournamentListTournamentsResponse')
  }
    /**
   * Get tournament details by tournament ID
   */
  getTournament_ByTournamentId(tournamentId:string): Promise<Response<TournamentGetTournamentResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/ext-abtesttryaji2026033001-xdd-tournmanet-system-local2/v1/public/namespace/{namespace}/tournaments/{tournamentId}'.replace('{namespace}', this.namespace).replace('{tournamentId}', tournamentId)     
    const resultPromise = this.axiosInstance.get(url, {params})

    return Validate.validateOrReturnResponse(this.useSchemaValidation, () => resultPromise, TournamentGetTournamentResponse, 'TournamentGetTournamentResponse')
  }
    /**
   * Get all matches for a tournament organized by round
   */
  getMatches_ByTournamentId(tournamentId:string,  queryParams?: {round?: number}): Promise<Response<TournamentGetTournamentMatchesResponse>> {
    const params = { ...queryParams} as AxiosRequestConfig
    const url = '/ext-abtesttryaji2026033001-xdd-tournmanet-system-local2/v1/public/namespace/{namespace}/tournaments/{tournamentId}/matches'.replace('{namespace}', this.namespace).replace('{tournamentId}', tournamentId)     
    const resultPromise = this.axiosInstance.get(url, {params})

    return Validate.validateOrReturnResponse(this.useSchemaValidation, () => resultPromise, TournamentGetTournamentMatchesResponse, 'TournamentGetTournamentMatchesResponse')
  }
    /**
   * Register user for tournament with capacity enforcement
   */
  createRegister_ByTournamentId(tournamentId:string, data: TournamentServiceRegisterForTournamentBody): Promise<Response<TournamentRegisterForTournamentResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/ext-abtesttryaji2026033001-xdd-tournmanet-system-local2/v1/public/namespace/{namespace}/tournaments/{tournamentId}/register'.replace('{namespace}', this.namespace).replace('{tournamentId}', tournamentId)     
    const resultPromise = this.axiosInstance.post(url, data, {params})

    return Validate.validateOrReturnResponse(this.useSchemaValidation, () => resultPromise, TournamentRegisterForTournamentResponse, 'TournamentRegisterForTournamentResponse')
  }
    /**
   * List all participants for a tournament with pagination
   */
  getParticipants_ByTournamentId(tournamentId:string,  queryParams?: {pageSize?: number, pageToken?: string | null}): Promise<Response<TournamentGetTournamentParticipantsResponse>> {
    const params = { ...queryParams} as AxiosRequestConfig
    const url = '/ext-abtesttryaji2026033001-xdd-tournmanet-system-local2/v1/public/namespace/{namespace}/tournaments/{tournamentId}/participants'.replace('{namespace}', this.namespace).replace('{tournamentId}', tournamentId)     
    const resultPromise = this.axiosInstance.get(url, {params})

    return Validate.validateOrReturnResponse(this.useSchemaValidation, () => resultPromise, TournamentGetTournamentParticipantsResponse, 'TournamentGetTournamentParticipantsResponse')
  }
    /**
   * Get detailed information about a specific match
   */
  getMatche_ByTournamentId_ByMatchId(tournamentId:string, matchId:string): Promise<Response<TournamentGetMatchResponse>> {
    const params = {} as AxiosRequestConfig
    const url = '/ext-abtesttryaji2026033001-xdd-tournmanet-system-local2/v1/public/namespace/{namespace}/tournaments/{tournamentId}/matches/{matchId}'.replace('{namespace}', this.namespace).replace('{tournamentId}', tournamentId).replace('{matchId}', matchId)     
    const resultPromise = this.axiosInstance.get(url, {params})

    return Validate.validateOrReturnResponse(this.useSchemaValidation, () => resultPromise, TournamentGetMatchResponse, 'TournamentGetMatchResponse')
  }
  
}
  