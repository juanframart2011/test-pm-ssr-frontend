import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { consultarTarifa } from '@/services/tarifas.service'
import { ApiError } from '@/services/http'
import type { Tarifa, TarifaConOrigen } from '@/types/tarifa'

const STORAGE_KEY = 'tarifas:locales'

function cargarLocales(): Tarifa[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as Tarifa[]) : []
  } catch {
    return []
  }
}

export const useTarifasStore = defineStore('tarifas', () => {
  /** Registros dados de alta por el usuario; viven solo en el navegador. */
  const locales = ref<Tarifa[]>(cargarLocales())

  const cargando = ref(false)
  const ultimoIdBuscado = ref<string | null>(null)
  const resultados = ref<TarifaConOrigen[]>([])
  const error = ref<string | null>(null)

  let peticionEnCurso: AbortController | null = null

  watch(
    locales,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // Cuota agotada o almacenamiento bloqueado: el alta sigue viva en memoria.
      }
    },
    { deep: true },
  )

  const totalLocales = computed(() => locales.value.length)
  const sinResultados = computed(
    () => !cargando.value && ultimoIdBuscado.value !== null && resultados.value.length === 0,
  )

  function existeIdLocal(idTarifa: number | string) {
    return locales.value.some((tarifa) => String(tarifa.idTarifa) === String(idTarifa))
  }

  function agregarLocal(tarifa: Tarifa) {
    locales.value = [tarifa, ...locales.value]
  }

  function eliminarLocal(idTarifa: number | string) {
    locales.value = locales.value.filter(
      (tarifa) => String(tarifa.idTarifa) !== String(idTarifa),
    )
  }

  function buscarLocales(idTarifa: string): TarifaConOrigen[] {
    return locales.value
      .filter((tarifa) => String(tarifa.idTarifa) === idTarifa.trim())
      .map((tarifa) => ({ ...tarifa, origen: 'local' as const }))
  }

  /**
   * Busca por id en el API y en los registros locales.
   * Los registros del API se muestran primero; los locales quedan en segundo lugar.
   */
  async function buscarPorId(idTarifa: string): Promise<TarifaConOrigen[]> {
    const id = idTarifa.trim()

    // Una búsqueda nueva cancela la anterior para evitar respuestas fuera de orden.
    peticionEnCurso?.abort()
    peticionEnCurso = new AbortController()

    cargando.value = true
    error.value = null
    ultimoIdBuscado.value = id

    const deLocales = buscarLocales(id)

    try {
      const deApi = await consultarTarifa(id, { signal: peticionEnCurso.signal })
      resultados.value = [
        ...deApi.map((tarifa) => ({ ...tarifa, origen: 'api' as const })),
        ...deLocales,
      ]
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return resultados.value
      }

      error.value =
        err instanceof ApiError ? err.message : 'Ocurrió un error inesperado en la consulta.'

      // Aunque el API falle, los registros locales siguen siendo consultables.
      resultados.value = deLocales
    } finally {
      cargando.value = false
      peticionEnCurso = null
    }

    return resultados.value
  }

  function limpiarBusqueda() {
    peticionEnCurso?.abort()
    peticionEnCurso = null
    resultados.value = []
    ultimoIdBuscado.value = null
    error.value = null
    cargando.value = false
  }

  return {
    locales,
    cargando,
    resultados,
    error,
    ultimoIdBuscado,
    totalLocales,
    sinResultados,
    existeIdLocal,
    agregarLocal,
    eliminarLocal,
    buscarPorId,
    limpiarBusqueda,
  }
})
