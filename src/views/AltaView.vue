<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'

import { APLICATIVOS, ESTATUS, TIPOS_DOCUMENTO, TIPOS_PRODUCTO } from '@/constants/catalogos'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useTarifasStore } from '@/stores/tarifas.store'
import type { Aplicativo, Tarifa } from '@/types/tarifa'
import { aFechaInput } from '@/utils/format'
import {
  entre,
  importeValido,
  longitudMaxima,
  longitudMinima,
  mayorQueCero,
  requerido,
  soloEnteros,
} from '@/utils/validaciones'

interface AplicativoForm {
  idAplicativo: number | null
  cuotaAplicativo: string
}

const router = useRouter()
const tarifas = useTarifasStore()
const notificaciones = useNotificationsStore()

const formRef = ref<InstanceType<typeof VForm> | null>(null)
const guardando = ref(false)

function estadoInicial() {
  return {
    idTarifa: '',
    tarifa: '',
    concepto: '',
    estatusId: null as number | null,
    tipoDocumentoId: null as number | null,
    tipoProductoId: null as number | null,
    diaInicio: '',
    diaFin: '',
    importe: '',
    fhUltimaModificacion: aFechaInput(),
    comentarios: '',
    aplicativos: [] as AplicativoForm[],
  }
}

const form = reactive(estadoInicial())

// ---- Reglas de validación -------------------------------------------------

const reglasId = [
  requerido('El ID de tarifa'),
  soloEnteros('El ID de tarifa'),
  mayorQueCero('El ID de tarifa'),
  (v: unknown) =>
    !tarifas.existeIdLocal(String(v ?? '')) || 'Ya existe un registro local con ese ID.',
]

const reglasTarifa = [
  requerido('El nombre de la tarifa'),
  longitudMinima(4, 'El nombre de la tarifa'),
  longitudMaxima(120, 'El nombre de la tarifa'),
]

const reglasConcepto = [
  requerido('El concepto'),
  longitudMinima(10, 'El concepto'),
  longitudMaxima(300, 'El concepto'),
]

const reglasDiaInicio = [
  requerido('El día de inicio'),
  soloEnteros('El día de inicio'),
  entre(1, 31, 'El día de inicio'),
]

const reglasDiaFin = [
  requerido('El día de fin'),
  soloEnteros('El día de fin'),
  entre(1, 31, 'El día de fin'),
  (v: unknown) =>
    !form.diaInicio ||
    !v ||
    Number(v) >= Number(form.diaInicio) ||
    'El día de fin no puede ser menor al día de inicio.',
]

const reglasImporte = [requerido('El importe'), importeValido, mayorQueCero('El importe')]

const reglasFecha = [
  requerido('La fecha de última modificación'),
  (v: unknown) => {
    const fecha = new Date(String(v))
    if (Number.isNaN(fecha.getTime())) return 'Selecciona una fecha válida.'
    const hoy = new Date()
    hoy.setHours(23, 59, 59, 999)
    return fecha <= hoy || 'La fecha no puede ser futura.'
  },
]

const reglaCuota = [requerido('La cuota'), soloEnteros('La cuota'), mayorQueCero('La cuota')]

// ---- Aplicativos dinámicos ------------------------------------------------

/** Evita ofrecer dos veces el mismo aplicativo en la lista. */
function opcionesAplicativo(indice: number) {
  const usados = form.aplicativos
    .filter((_, i) => i !== indice)
    .map((a) => a.idAplicativo)
    .filter((id): id is number => id !== null)

  return APLICATIVOS.filter((a) => !usados.includes(a.id))
}

function agregarAplicativo() {
  form.aplicativos.push({ idAplicativo: null, cuotaAplicativo: '' })
}

function quitarAplicativo(indice: number) {
  form.aplicativos.splice(indice, 1)
}

// ---- Guardado -------------------------------------------------------------

const camposCompletos = computed(
  () =>
    !!form.idTarifa &&
    !!form.tarifa &&
    !!form.concepto &&
    form.estatusId !== null &&
    form.tipoDocumentoId !== null &&
    !!form.diaInicio &&
    !!form.diaFin &&
    !!form.importe,
)

function catalogo(lista: typeof ESTATUS, id: number | null) {
  const item = lista.find((elemento) => elemento.id === id)
  return item ? { id: item.id, descripcion: item.descripcion } : null
}

function construirTarifa(): Tarifa {
  const aplicativos: Aplicativo[] = form.aplicativos
    .filter((a) => a.idAplicativo !== null)
    .map((a) => ({
      idAplicativo: a.idAplicativo as number,
      aplicativo:
        APLICATIVOS.find((catalogoApp) => catalogoApp.id === a.idAplicativo)?.descripcion ?? '',
      cuotaAplicativo: a.cuotaAplicativo.trim(),
    }))

  return {
    idTarifa: Number(form.idTarifa),
    tarifa: form.tarifa.trim(),
    concepto: form.concepto.trim(),
    estatus: catalogo(ESTATUS, form.estatusId),
    tipoProducto: catalogo(TIPOS_PRODUCTO, form.tipoProductoId),
    tipoDocumento: catalogo(TIPOS_DOCUMENTO, form.tipoDocumentoId),
    evento: null,
    diaInicio: String(form.diaInicio).trim(),
    diaFin: String(form.diaFin).trim(),
    // El API entrega los importes como string con dos decimales; se replica el contrato.
    importe: Number(form.importe).toFixed(2),
    importePropuesto: Number(form.importe).toFixed(2),
    importeAnterior: null,
    codigoMiscelanea: null,
    comentarios: form.comentarios.trim() || null,
    fh_ultima_modificacion: new Date(`${form.fhUltimaModificacion}T00:00:00`).toISOString(),
    proceso_ultima_modificacion: 'Alta local',
    usuario_ultima_modificacion: 'usuario_local',
    aplicativos,
  }
}

async function guardar() {
  const validacion = await formRef.value?.validate()
  if (!validacion?.valid) {
    notificaciones.error(
      'Revisa los campos marcados.',
      'Hay información obligatoria pendiente o con formato inválido.',
    )
    return
  }

  guardando.value = true
  const nueva = construirTarifa()
  tarifas.agregarLocal(nueva)
  guardando.value = false

  notificaciones.success(
    `Tarifa #${nueva.idTarifa} guardada correctamente.`,
    'El registro quedó almacenado de forma local y ya es consultable.',
  )

  const id = String(nueva.idTarifa)
  cancelar({ silencioso: true })
  void router.push({ name: 'consulta', query: { id } })
}

function cancelar(opciones: { silencioso?: boolean } = {}) {
  Object.assign(form, estadoInicial())
  formRef.value?.resetValidation()
  if (!opciones.silencioso) notificaciones.info('Se limpió el formulario.')
}
</script>

<template>
  <v-form ref="formRef" validate-on="input" @submit.prevent="guardar">
    <div class="d-flex flex-column ga-6">
      <v-card class="pa-5 pa-md-6">
        <div class="d-flex flex-column ga-1 mb-5">
          <h1 class="section-title text-h5">Alta de tarifa</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Captura los datos de la tarifa. El registro se guarda localmente en tu navegador y
            aparecerá al consultarlo por su ID.
          </p>
        </div>

        <!-- Identificación -->
        <div class="d-flex align-center ga-2 mb-3">
          <v-icon icon="mdi-identifier" size="18" class="text-medium-emphasis" />
          <span class="text-subtitle-2 font-weight-bold">Identificación</span>
        </div>

        <v-row dense>
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="form.idTarifa"
              label="ID de tarifa *"
              inputmode="numeric"
              prepend-inner-icon="mdi-pound"
              :rules="reglasId"
            />
          </v-col>
          <v-col cols="12" sm="8" md="9">
            <v-text-field
              v-model="form.tarifa"
              label="Tarifa *"
              placeholder="Ej. Originales - Comprobante(s)"
              prepend-inner-icon="mdi-tag-outline"
              counter="120"
              :rules="reglasTarifa"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.concepto"
              label="Concepto *"
              placeholder="Describe el concepto de la tarifa"
              rows="2"
              auto-grow
              counter="300"
              :rules="reglasConcepto"
            />
          </v-col>
        </v-row>

        <v-divider class="my-5" />

        <!-- Clasificación -->
        <div class="d-flex align-center ga-2 mb-3">
          <v-icon icon="mdi-shape-outline" size="18" class="text-medium-emphasis" />
          <span class="text-subtitle-2 font-weight-bold">Clasificación</span>
        </div>

        <v-row dense>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="form.estatusId"
              label="Estatus *"
              :items="ESTATUS"
              item-title="descripcion"
              item-value="id"
              prepend-inner-icon="mdi-check-decagram-outline"
              :rules="[requerido('El estatus')]"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="form.tipoDocumentoId"
              label="Tipo de documento *"
              :items="TIPOS_DOCUMENTO"
              item-title="descripcion"
              item-value="id"
              prepend-inner-icon="mdi-file-document-outline"
              :rules="[requerido('El tipo de documento')]"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="form.tipoProductoId"
              label="Tipo de producto"
              :items="TIPOS_PRODUCTO"
              item-title="descripcion"
              item-value="id"
              prepend-inner-icon="mdi-package-variant-closed"
              clearable
              hint="Opcional: el servicio puede devolverlo vacío."
              persistent-hint
            />
          </v-col>
        </v-row>

        <v-divider class="my-5" />

        <!-- Vigencia e importe -->
        <div class="d-flex align-center ga-2 mb-3">
          <v-icon icon="mdi-calendar-clock" size="18" class="text-medium-emphasis" />
          <span class="text-subtitle-2 font-weight-bold">Vigencia e importe</span>
        </div>

        <v-row dense>
          <v-col cols="6" sm="3" md="2">
            <v-text-field
              v-model="form.diaInicio"
              label="Día inicio *"
              inputmode="numeric"
              :rules="reglasDiaInicio"
            />
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-text-field
              v-model="form.diaFin"
              label="Día fin *"
              inputmode="numeric"
              :rules="reglasDiaFin"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.importe"
              label="Importe *"
              placeholder="45.00"
              inputmode="decimal"
              prefix="$"
              :rules="reglasImporte"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.fhUltimaModificacion"
              label="Última modificación *"
              type="date"
              prepend-inner-icon="mdi-calendar"
              :rules="reglasFecha"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.comentarios"
              label="Comentarios"
              rows="2"
              auto-grow
              placeholder="Opcional"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- Aplicativos -->
      <v-card class="pa-5 pa-md-6">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-apps" size="18" class="text-medium-emphasis" />
            <span class="text-subtitle-2 font-weight-bold">Aplicativos</span>
            <v-chip size="x-small" variant="tonal">{{ form.aplicativos.length }}</v-chip>
          </div>
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            prepend-icon="mdi-plus"
            :disabled="form.aplicativos.length >= APLICATIVOS.length"
            @click="agregarAplicativo"
          >
            Agregar aplicativo
          </v-btn>
        </div>

        <v-alert
          v-if="!form.aplicativos.length"
          type="info"
          variant="tonal"
          density="comfortable"
          rounded="lg"
          text="Sin aplicativos asociados. Puedes agregar uno o más con su cuota correspondiente."
        />

        <v-row v-for="(app, indice) in form.aplicativos" :key="indice" dense align="start">
          <v-col cols="12" sm="6">
            <v-select
              v-model="app.idAplicativo"
              label="Aplicativo *"
              :items="opcionesAplicativo(indice)"
              item-title="descripcion"
              item-value="id"
              :rules="[requerido('El aplicativo')]"
            />
          </v-col>
          <v-col cols="9" sm="5">
            <v-text-field
              v-model="app.cuotaAplicativo"
              label="Cuota *"
              inputmode="numeric"
              :rules="reglaCuota"
            />
          </v-col>
          <v-col cols="3" sm="1" class="d-flex justify-end">
            <v-btn
              icon="mdi-close"
              variant="text"
              color="error"
              aria-label="Quitar aplicativo"
              @click="quitarAplicativo(indice)"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- Acciones: quedan siempre a la vista al pie del formulario. -->
      <v-card class="pa-4 acciones-card">
        <div class="d-flex flex-wrap align-center justify-space-between ga-3">
          <span class="text-caption text-medium-emphasis">
            Los campos marcados con * son obligatorios.
          </span>
          <div class="d-flex ga-2 flex-grow-1 flex-sm-grow-0">
            <v-btn
              variant="tonal"
              color="error"
              prepend-icon="mdi-close-circle-outline"
              class="flex-grow-1 flex-sm-grow-0"
              @click="cancelar()"
            >
              Cancelar
            </v-btn>
            <v-btn
              type="submit"
              color="primary"
              variant="flat"
              prepend-icon="mdi-check-circle-outline"
              class="flex-grow-1 flex-sm-grow-0"
              :loading="guardando"
              :disabled="!camposCompletos"
            >
              Guardar tarifa
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>
  </v-form>
</template>

<style scoped lang="scss">
.acciones-card {
  position: sticky;
  bottom: 12px;
  z-index: 2;
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.9);
}
</style>
