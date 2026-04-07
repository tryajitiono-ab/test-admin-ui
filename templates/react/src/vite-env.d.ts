/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AB_URL: string
  readonly VITE_AB_NAMESPACE: string
  readonly VITE_AB_CLIENT_ID: string
  readonly VITE_AGS_REDIRECT_URI: string
  readonly VITE_INSTANCE_LABEL: string
  readonly VITE_AB_EXTEND_APP_NAME: string
  readonly VITE_AGS_GAME_NAMESPACE: string
  readonly VITE_BASE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
