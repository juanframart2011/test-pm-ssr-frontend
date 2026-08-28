import { http } from './http'
import {
  CODIGO_EXITO,
  type ConsultaTarifaRequest,
  type ConsultaTarifaResponse,
  type Tarifa,
} from '@/types/tarifa'

const ENDPOINT_CONSULTA = '/dgs-api-bridge/tarifas/consulta'

/**
 * Consulta una tarifa por id contra el API.
 * Devuelve la lista de coincidencias (vacía si el API no encontró el registro).
 */
export async function consultarTarifa(
  idTarifa: number | string,
  options?: { signal?: AbortSignal },
): Promise<Tarifa[]> {
  const payload: ConsultaTarifaRequest = { idTarifa: String(idTarifa) }

  const data = await http.post<ConsultaTarifaResponse>(ENDPOINT_CONSULTA, payload, options)

  // El API responde 200 incluso en escenarios de negocio: hay que revisar `code`.
  if (data?.response?.code && data.response.code !== CODIGO_EXITO) {
    return []
  }

  return data?.response?.tarifas ?? []
}
