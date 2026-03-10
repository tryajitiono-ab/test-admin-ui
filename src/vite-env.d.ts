/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AGS_URL: string
  readonly VITE_AGS_NAMESPACE: string
  readonly VITE_AGS_CLIENT_ID: string
  readonly VITE_AGS_REDIRECT_URI: string
  readonly VITE_CONFIG_KEY: string
  readonly VITE_INSTANCE_LABEL: string
  readonly VITE_EXTEND_APP_NAME: string
  readonly VITE_AGS_GAME_NAMESPACE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
