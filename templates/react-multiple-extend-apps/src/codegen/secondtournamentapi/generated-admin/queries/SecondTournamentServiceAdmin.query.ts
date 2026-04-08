/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
/**
 * AUTO GENERATED
 */
import type { AccelByteSDK, ApiError, SdkSetConfigParam } from '@accelbyte/sdk'
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { SecondTournamentServiceAdminApi } from '../SecondTournamentServiceAdminApi.js'

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

export const Key_SecondTournamentServiceAdmin = {
  Tournament: 'Secondtournamentapi.SecondTournamentServiceAdmin.Tournament',
  Start_ByTournamentId: 'Secondtournamentapi.SecondTournamentServiceAdmin.Start_ByTournamentId',
  Cancel_ByTournamentId: 'Secondtournamentapi.SecondTournamentServiceAdmin.Cancel_ByTournamentId',
  Activate_ByTournamentId: 'Secondtournamentapi.SecondTournamentServiceAdmin.Activate_ByTournamentId',
  Participant_ByTournamentId_ByUserId: 'Secondtournamentapi.SecondTournamentServiceAdmin.Participant_ByTournamentId_ByUserId',
  Result_ByTournamentId_ByMatchId: 'Secondtournamentapi.SecondTournamentServiceAdmin.Result_ByTournamentId_ByMatchId',
  ResultAdmin_ByTournamentId_ByMatchId: 'Secondtournamentapi.SecondTournamentServiceAdmin.ResultAdmin_ByTournamentId_ByMatchId'
} as const

/**
 * Create a new tournament with specified configuration
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentServiceAdmin.Tournament, input]
 * }
 * ```
 */
export const useSecondTournamentServiceAdminApi_CreateTournamentMutation = (
  sdk: AccelByteSDK,
  options?: Omit<
    UseMutationOptions<
      TournamentCreateTournamentResponse,
      AxiosError<ApiError>,
      SdkSetConfigParam & { data: TournamentServiceCreateTournamentBody }
    >,
    'mutationKey'
  >,
  callback?: (data: TournamentCreateTournamentResponse) => void
): UseMutationResult<
  TournamentCreateTournamentResponse,
  AxiosError<ApiError>,
  SdkSetConfigParam & { data: TournamentServiceCreateTournamentBody }
> => {
  const mutationFn = async (input: SdkSetConfigParam & { data: TournamentServiceCreateTournamentBody }) => {
    const response = await SecondTournamentServiceAdminApi(sdk, {
      coreConfig: input.coreConfig,
      axiosConfig: input.axiosConfig
    }).createTournament(input.data)
    callback?.(response.data)
    return response.data
  }

  return useMutation({
    mutationKey: [Key_SecondTournamentServiceAdmin.Tournament],
    mutationFn,
    ...options
  })
}

/**
 * Start a tournament to generate brackets and begin competition
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentServiceAdmin.Start_ByTournamentId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceAdminApi_CreateStart_ByTournamentIdMutation = (
  sdk: AccelByteSDK,
  options?: Omit<
    UseMutationOptions<
      TournamentStartTournamentResponse,
      AxiosError<ApiError>,
      SdkSetConfigParam & { tournamentId: string; data: TournamentServiceStartTournamentBody }
    >,
    'mutationKey'
  >,
  callback?: (data: TournamentStartTournamentResponse) => void
): UseMutationResult<
  TournamentStartTournamentResponse,
  AxiosError<ApiError>,
  SdkSetConfigParam & { tournamentId: string; data: TournamentServiceStartTournamentBody }
> => {
  const mutationFn = async (input: SdkSetConfigParam & { tournamentId: string; data: TournamentServiceStartTournamentBody }) => {
    const response = await SecondTournamentServiceAdminApi(sdk, {
      coreConfig: input.coreConfig,
      axiosConfig: input.axiosConfig
    }).createStart_ByTournamentId(input.tournamentId, input.data)
    callback?.(response.data)
    return response.data
  }

  return useMutation({
    mutationKey: [Key_SecondTournamentServiceAdmin.Start_ByTournamentId],
    mutationFn,
    ...options
  })
}

/**
 * Cancel a tournament and prevent further participation
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentServiceAdmin.Cancel_ByTournamentId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceAdminApi_CreateCancel_ByTournamentIdMutation = (
  sdk: AccelByteSDK,
  options?: Omit<
    UseMutationOptions<
      TournamentCancelTournamentResponse,
      AxiosError<ApiError>,
      SdkSetConfigParam & { tournamentId: string; data: TournamentServiceCancelTournamentBody }
    >,
    'mutationKey'
  >,
  callback?: (data: TournamentCancelTournamentResponse) => void
): UseMutationResult<
  TournamentCancelTournamentResponse,
  AxiosError<ApiError>,
  SdkSetConfigParam & { tournamentId: string; data: TournamentServiceCancelTournamentBody }
> => {
  const mutationFn = async (input: SdkSetConfigParam & { tournamentId: string; data: TournamentServiceCancelTournamentBody }) => {
    const response = await SecondTournamentServiceAdminApi(sdk, {
      coreConfig: input.coreConfig,
      axiosConfig: input.axiosConfig
    }).createCancel_ByTournamentId(input.tournamentId, input.data)
    callback?.(response.data)
    return response.data
  }

  return useMutation({
    mutationKey: [Key_SecondTournamentServiceAdmin.Cancel_ByTournamentId],
    mutationFn,
    ...options
  })
}

/**
 * Activate a tournament to open registration for participants
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentServiceAdmin.Activate_ByTournamentId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceAdminApi_CreateActivate_ByTournamentIdMutation = (
  sdk: AccelByteSDK,
  options?: Omit<
    UseMutationOptions<
      TournamentActivateTournamentResponse,
      AxiosError<ApiError>,
      SdkSetConfigParam & { tournamentId: string; data: TournamentServiceActivateTournamentBody }
    >,
    'mutationKey'
  >,
  callback?: (data: TournamentActivateTournamentResponse) => void
): UseMutationResult<
  TournamentActivateTournamentResponse,
  AxiosError<ApiError>,
  SdkSetConfigParam & { tournamentId: string; data: TournamentServiceActivateTournamentBody }
> => {
  const mutationFn = async (input: SdkSetConfigParam & { tournamentId: string; data: TournamentServiceActivateTournamentBody }) => {
    const response = await SecondTournamentServiceAdminApi(sdk, {
      coreConfig: input.coreConfig,
      axiosConfig: input.axiosConfig
    }).createActivate_ByTournamentId(input.tournamentId, input.data)
    callback?.(response.data)
    return response.data
  }

  return useMutation({
    mutationKey: [Key_SecondTournamentServiceAdmin.Activate_ByTournamentId],
    mutationFn,
    ...options
  })
}

/**
 * Admin-only: Remove participant from tournament
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentServiceAdmin.Participant_ByTournamentId_ByUserId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceAdminApi_DeleteParticipant_ByTournamentId_ByUserIdMutation = (
  sdk: AccelByteSDK,
  options?: Omit<
    UseMutationOptions<
      TournamentRemoveParticipantResponse,
      AxiosError<ApiError>,
      SdkSetConfigParam & { tournamentId: string; userId: string }
    >,
    'mutationKey'
  >,
  callback?: (data: TournamentRemoveParticipantResponse) => void
): UseMutationResult<
  TournamentRemoveParticipantResponse,
  AxiosError<ApiError>,
  SdkSetConfigParam & { tournamentId: string; userId: string }
> => {
  const mutationFn = async (input: SdkSetConfigParam & { tournamentId: string; userId: string }) => {
    const response = await SecondTournamentServiceAdminApi(sdk, {
      coreConfig: input.coreConfig,
      axiosConfig: input.axiosConfig
    }).deleteParticipant_ByTournamentId_ByUserId(input.tournamentId, input.userId)
    callback?.(response.data)
    return response.data
  }

  return useMutation({
    mutationKey: [Key_SecondTournamentServiceAdmin.Participant_ByTournamentId_ByUserId],
    mutationFn,
    ...options
  })
}

/**
 * Game server: Submit match result with winner information
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentServiceAdmin.Result_ByTournamentId_ByMatchId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceAdminApi_CreateResult_ByTournamentId_ByMatchIdMutation = (
  sdk: AccelByteSDK,
  options?: Omit<
    UseMutationOptions<
      TournamentSubmitMatchResultResponse,
      AxiosError<ApiError>,
      SdkSetConfigParam & { tournamentId: string; matchId: string; data: TournamentServiceSubmitMatchResultBody }
    >,
    'mutationKey'
  >,
  callback?: (data: TournamentSubmitMatchResultResponse) => void
): UseMutationResult<
  TournamentSubmitMatchResultResponse,
  AxiosError<ApiError>,
  SdkSetConfigParam & { tournamentId: string; matchId: string; data: TournamentServiceSubmitMatchResultBody }
> => {
  const mutationFn = async (
    input: SdkSetConfigParam & { tournamentId: string; matchId: string; data: TournamentServiceSubmitMatchResultBody }
  ) => {
    const response = await SecondTournamentServiceAdminApi(sdk, {
      coreConfig: input.coreConfig,
      axiosConfig: input.axiosConfig
    }).createResult_ByTournamentId_ByMatchId(input.tournamentId, input.matchId, input.data)
    callback?.(response.data)
    return response.data
  }

  return useMutation({
    mutationKey: [Key_SecondTournamentServiceAdmin.Result_ByTournamentId_ByMatchId],
    mutationFn,
    ...options
  })
}

/**
 * Admin override: Submit match result with winner information
 *
 * #### Default Query Options
 * The default options include:
 * ```
 * {
 *    queryKey: [Key_SecondTournamentServiceAdmin.ResultAdmin_ByTournamentId_ByMatchId, input]
 * }
 * ```
 */
export const useSecondTournamentServiceAdminApi_CreateResultAdmin_ByTournamentId_ByMatchIdMutation = (
  sdk: AccelByteSDK,
  options?: Omit<
    UseMutationOptions<
      TournamentAdminSubmitMatchResultResponse,
      AxiosError<ApiError>,
      SdkSetConfigParam & { tournamentId: string; matchId: string; data: TournamentServiceAdminSubmitMatchResultBody }
    >,
    'mutationKey'
  >,
  callback?: (data: TournamentAdminSubmitMatchResultResponse) => void
): UseMutationResult<
  TournamentAdminSubmitMatchResultResponse,
  AxiosError<ApiError>,
  SdkSetConfigParam & { tournamentId: string; matchId: string; data: TournamentServiceAdminSubmitMatchResultBody }
> => {
  const mutationFn = async (
    input: SdkSetConfigParam & { tournamentId: string; matchId: string; data: TournamentServiceAdminSubmitMatchResultBody }
  ) => {
    const response = await SecondTournamentServiceAdminApi(sdk, {
      coreConfig: input.coreConfig,
      axiosConfig: input.axiosConfig
    }).createResultAdmin_ByTournamentId_ByMatchId(input.tournamentId, input.matchId, input.data)
    callback?.(response.data)
    return response.data
  }

  return useMutation({
    mutationKey: [Key_SecondTournamentServiceAdmin.ResultAdmin_ByTournamentId_ByMatchId],
    mutationFn,
    ...options
  })
}
