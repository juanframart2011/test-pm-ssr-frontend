const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const DEFAULT_TIMEOUT_MS = 15_000

/** Error de transporte o de negocio con el contexto necesario para notificar al usuario. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly payload?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get esTimeout() {
    return this.status === 408
  }

  get esRed() {
    return this.status === 0
  }
}

/**
 * Punto único de inyección de credenciales. Hoy el endpoint es abierto; cuando exista
 * autenticación basta con registrar aquí el proveedor del token (OIDC, refresh, etc.)
 * sin tocar los servicios de dominio.
 */
type TokenProvider = () => string | null | Promise<string | null>

let tokenProvider: TokenProvider | null = null

export function setTokenProvider(provider: TokenProvider | null) {
  tokenProvider = provider
}

async function authHeaders(): Promise<Record<string, string>> {
  if (!tokenProvider) return {}
  const token = await tokenProvider()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

interface RequestOptions {
  signal?: AbortSignal
  timeoutMs?: number
  headers?: Record<string, string>
}

async function request<TResponse>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, headers = {} } = options

  // Corta la petición si el backend no responde, en lugar de dejar la UI colgada.
  const timeoutController = new AbortController()
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs)
  const compositeSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(await authHeaders()),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: compositeSignal,
    })

    const raw = await response.text()
    const data = raw ? safeParse(raw) : null

    if (!response.ok) {
      throw new ApiError(
        mensajeHttp(response.status),
        response.status,
        extraerCodigo(data),
        data,
      )
    }

    return data as TResponse
  } catch (error) {
    if (error instanceof ApiError) throw error

    if (error instanceof DOMException && error.name === 'AbortError') {
      // Cancelación explícita del consumidor: se propaga tal cual.
      if (signal?.aborted) throw error
      throw new ApiError('El servicio tardó demasiado en responder.', 408)
    }

    throw new ApiError('No fue posible contactar al servicio.', 0, undefined, error)
  } finally {
    clearTimeout(timer)
  }
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function extraerCodigo(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'response' in data) {
    const response = (data as { response?: { code?: string } }).response
    return response?.code
  }
  return undefined
}

function mensajeHttp(status: number): string {
  if (status === 400) return 'La solicitud no es válida.'
  if (status === 401 || status === 403) return 'No cuentas con permisos para esta consulta.'
  if (status === 404) return 'El recurso solicitado no existe.'
  if (status >= 500) return 'El servicio no está disponible en este momento.'
  return `La solicitud falló (HTTP ${status}).`
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
}
