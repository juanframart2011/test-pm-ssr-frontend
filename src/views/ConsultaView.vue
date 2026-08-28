<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import TarifaCard from '@/components/TarifaCard.vue'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useTarifasStore } from '@/stores/tarifas.store'

const route = useRoute()
const router = useRouter()
const tarifas = useTarifasStore()
const notificaciones = useNotificationsStore()
const { cargando, resultados, ultimoIdBuscado, locales } = storeToRefs(tarifas)

const idBusqueda = ref('')
const formValido = ref(false)

const reglas = [
  (v: string) => (!!v && v.trim() !== '') || 'Ingresa un ID de tarifa.',
  (v: string) => /^\d+$/.test(v?.trim() ?? '') || 'El ID debe ser numérico.',
  (v: string) => Number(v) > 0 || 'El ID debe ser mayor a cero.',
]

const busquedaVacia = computed(() => ultimoIdBuscado.value === null && !cargando.value)
const sinResultados = computed(
  () => ultimoIdBuscado.value !== null && !cargando.value && resultados.value.length === 0,
)

/** IDs disponibles localmente, como atajo de búsqueda. */
const idsLocales = computed(() => locales.value.map((tarifa) => String(tarifa.idTarifa)))

async function buscar() {
  if (!/^\d+$/.test(idBusqueda.value.trim())) return

  const encontrados = await tarifas.buscarPorId(idBusqueda.value)

  if (tarifas.error) {
    notificaciones.error('No se pudo completar la consulta.', tarifas.error)
    return
  }

  if (encontrados.length === 0) {
    notificaciones.warning(
      `Sin resultados para el ID ${idBusqueda.value.trim()}.`,
      'Verifica el número o da de alta la tarifa desde la pestaña Alta.',
    )
    return
  }

  const desdeLocal = encontrados.filter((t) => t.origen === 'local').length
  notificaciones.success(
    `${encontrados.length} ${encontrados.length === 1 ? 'registro encontrado' : 'registros encontrados'}.`,
    desdeLocal > 0 ? `${desdeLocal} proviene(n) de tus registros locales.` : undefined,
  )
}

function buscarId(id: string) {
  idBusqueda.value = id
  void buscar()
}

function limpiar() {
  idBusqueda.value = ''
  tarifas.limpiarBusqueda()
}

// Permite llegar aquí desde el alta (`/consulta?id=123`) con la búsqueda ya resuelta.
onMounted(() => {
  const id = route.query.id
  if (typeof id === 'string' && /^\d+$/.test(id)) {
    buscarId(id)
    void router.replace({ name: 'consulta' })
  }
})

function eliminarLocal(idTarifa: number) {
  tarifas.eliminarLocal(idTarifa)
  notificaciones.info(`Se eliminó el registro local #${idTarifa}.`)
  if (ultimoIdBuscado.value) void tarifas.buscarPorId(ultimoIdBuscado.value)
}
</script>

<template>
  <div class="d-flex flex-column ga-6">
    <!-- Buscador -->
    <v-card class="pa-5 pa-md-6">
      <div class="d-flex flex-column ga-1 mb-5">
        <h1 class="section-title text-h5">Consulta de tarifas</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Busca por ID; se muestran primero los registros del servicio y luego los que diste de
          alta localmente.
        </p>
      </div>

      <v-form v-model="formValido" @submit.prevent="buscar">
        <v-row dense align="start">
          <v-col cols="12" sm="7" md="8">
            <v-text-field
              v-model="idBusqueda"
              label="ID de tarifa"
              placeholder="Ej. 12"
              inputmode="numeric"
              prepend-inner-icon="mdi-pound"
              :rules="reglas"
              :disabled="cargando"
              clearable
              hide-details="auto"
              @click:clear="limpiar"
            />
          </v-col>
          <v-col cols="12" sm="5" md="4">
            <div class="d-flex ga-2">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                variant="flat"
                block
                :loading="cargando"
                :disabled="!formValido"
                append-icon="mdi-arrow-right"
              >
                Buscar
              </v-btn>
              <v-btn
                v-if="ultimoIdBuscado"
                size="large"
                variant="tonal"
                icon="mdi-backspace-outline"
                aria-label="Limpiar búsqueda"
                @click="limpiar"
              />
            </div>
          </v-col>
        </v-row>
      </v-form>

      <div v-if="idsLocales.length" class="d-flex flex-wrap align-center ga-2 mt-4">
        <span class="text-caption text-medium-emphasis">Tus altas locales:</span>
        <v-chip
          v-for="id in idsLocales"
          :key="id"
          size="small"
          variant="tonal"
          color="secondary"
          class="text-mono"
          link
          @click="buscarId(id)"
        >
          #{{ id }}
        </v-chip>
      </div>
    </v-card>

    <!-- Cargando -->
    <v-card v-if="cargando" class="pa-6">
      <v-skeleton-loader type="article, list-item-two-line, actions" />
    </v-card>

    <!-- Resultados -->
    <template v-else-if="resultados.length">
      <div class="d-flex align-center ga-2 px-1">
        <v-icon icon="mdi-format-list-bulleted" size="18" class="text-medium-emphasis" />
        <span class="text-subtitle-2 font-weight-bold">
          Resultados para el ID {{ ultimoIdBuscado }}
        </span>
        <v-chip size="x-small" variant="tonal">{{ resultados.length }}</v-chip>
      </div>

      <TarifaCard
        v-for="(tarifa, index) in resultados"
        :key="`${tarifa.origen}-${tarifa.idTarifa}-${index}`"
        :tarifa="tarifa"
        @eliminar="eliminarLocal"
      />
    </template>

    <!-- Sin resultados -->
    <v-card v-else-if="sinResultados" class="pa-10 text-center">
      <v-avatar size="64" color="warning" variant="tonal" class="mb-4">
        <v-icon icon="mdi-file-search-outline" size="32" />
      </v-avatar>
      <h2 class="text-h6 font-weight-bold mb-1">Sin coincidencias</h2>
      <p class="text-body-2 text-medium-emphasis mb-5">
        No encontramos tarifas con el ID <strong>{{ ultimoIdBuscado }}</strong> ni en el servicio
        ni en tus registros locales.
      </p>
      <v-btn color="primary" variant="tonal" :to="{ name: 'alta' }" prepend-icon="mdi-plus">
        Dar de alta esta tarifa
      </v-btn>
    </v-card>

    <!-- Estado inicial -->
    <v-card v-else-if="busquedaVacia" class="pa-10 text-center">
      <v-avatar size="64" color="primary" variant="tonal" class="mb-4">
        <v-icon icon="mdi-magnify" size="32" />
      </v-avatar>
      <h2 class="text-h6 font-weight-bold mb-1">Comienza una búsqueda</h2>
      <p class="text-body-2 text-medium-emphasis mb-5">
        Escribe el ID de la tarifa que quieres consultar.
      </p>
      <v-btn variant="tonal" color="primary" class="text-mono" @click="buscarId('12')">
        Probar con el ID 12
      </v-btn>
    </v-card>
  </div>
</template>
