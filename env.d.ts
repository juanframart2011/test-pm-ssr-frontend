/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base del API consumido por la app (por defecto `/api`, resuelto vía proxy de Vite). */
  readonly VITE_API_BASE_URL?: string
  /** Host real al que apunta el proxy del dev server. */
  readonly VITE_API_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
