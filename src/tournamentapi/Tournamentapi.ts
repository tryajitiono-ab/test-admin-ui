/* 
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */
/**
 * AUTO GENERATED
 */

import { TournamentServiceAdminApi } from './generated-admin/TournamentServiceAdminApi.js'
import { TournamentServiceApi } from './generated-public/TournamentServiceApi.js'
import { author, name, version } from '../package.json'

console.log(`${name}@${version}`)

const apis = {

TournamentServiceAdminApi, 
TournamentServiceApi, 
  version: () => console.log({
    version,
    name,
    author
  })
}

export const Tournamentapi = apis
  