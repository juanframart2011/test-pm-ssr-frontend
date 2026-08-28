<script setup lang="ts">
import { computed } from 'vue'

import DataField from '@/components/DataField.vue'
import type { TarifaConOrigen } from '@/types/tarifa'
import { formatoFecha, formatoImporte, formatoRangoDias, oGuion } from '@/utils/format'

const props = defineProps<{
  tarifa: TarifaConOrigen
}>()

defineEmits<{ eliminar: [idTarifa: number] }>()

const esLocal = computed(() => props.tarifa.origen === 'local')

const estatusColor = computed(() => {
  const descripcion = props.tarifa.estatus?.descripcion?.toLowerCase() ?? ''
  if (descripcion.includes('activ')) return 'success'
  if (descripcion.includes('baja') || descripcion.includes('inactiv')) return 'error'
  if (descripcion.includes('pend')) return 'warning'
  return 'info'
})

/** Variación contra el importe anterior, cuando el API la reporta. */
const variacion = computed(() => {
  const actual = Number(props.tarifa.importe)
  const anterior = Number(props.tarifa.importeAnterior)
  if (!Number.isFinite(actual) || !Number.isFinite(anterior) || anterior === 0) return null

  const porcentaje = ((actual - anterior) / anterior) * 100
  if (Math.abs(porcentaje) < 0.01) return null

  return {
    porcentaje: porcentaje.toFixed(1),
    sube: porcentaje > 0,
  }
})
</script>

<template>
  <v-card class="tarifa-card">
    <div class="tarifa-card__accent" :class="{ 'tarifa-card__accent--local': esLocal }" />

    <v-card-item class="pb-2">
      <div class="d-flex flex-wrap align-start ga-3">
        <v-chip color="primary" variant="tonal" size="small" class="text-mono font-weight-bold">
          #{{ tarifa.idTarifa }}
        </v-chip>

        <div class="flex-grow-1" style="min-width: 220px">
          <h3 class="text-subtitle-1 font-weight-bold" style="line-height: 1.3">
            {{ oGuion(tarifa.tarifa) }}
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-0 mt-1">
            {{ oGuion(tarifa.concepto) }}
          </p>
        </div>

        <div class="d-flex align-center ga-2">
          <v-chip
            :color="estatusColor"
            variant="flat"
            size="small"
            prepend-icon="mdi-circle-medium"
          >
            {{ oGuion(tarifa.estatus?.descripcion) }}
          </v-chip>

          <v-chip
            :color="esLocal ? 'secondary' : 'primary'"
            variant="outlined"
            size="small"
            :prepend-icon="esLocal ? 'mdi-laptop' : 'mdi-cloud-outline'"
          >
            {{ esLocal ? 'Local' : 'API' }}
          </v-chip>

          <v-btn
            v-if="esLocal"
            icon="mdi-trash-can-outline"
            variant="text"
            size="small"
            color="error"
            aria-label="Eliminar registro local"
            @click="$emit('eliminar', tarifa.idTarifa)"
          />
        </div>
      </div>
    </v-card-item>

    <v-divider class="mx-4" />

    <v-card-text class="pt-4">
      <!-- Bloque de importes: el dato de mayor peso para el usuario. -->
      <v-row dense class="mb-2">
        <v-col cols="12" sm="4">
          <div class="importe-tile importe-tile--principal">
            <span class="text-caption text-medium-emphasis">Importe</span>
            <div class="d-flex align-center ga-2">
              <span class="text-h5 font-weight-bold text-mono">
                {{ formatoImporte(tarifa.importe) }}
              </span>
              <v-chip
                v-if="variacion"
                size="x-small"
                variant="tonal"
                :color="variacion.sube ? 'warning' : 'success'"
                :prepend-icon="variacion.sube ? 'mdi-trending-up' : 'mdi-trending-down'"
              >
                {{ variacion.porcentaje }}%
              </v-chip>
            </div>
          </div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="importe-tile">
            <span class="text-caption text-medium-emphasis">Propuesto</span>
            <span class="text-body-1 font-weight-medium text-mono">
              {{ formatoImporte(tarifa.importePropuesto) }}
            </span>
          </div>
        </v-col>
        <v-col cols="6" sm="4">
          <div class="importe-tile">
            <span class="text-caption text-medium-emphasis">Anterior</span>
            <span class="text-body-1 font-weight-medium text-mono">
              {{ formatoImporte(tarifa.importeAnterior) }}
            </span>
          </div>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" sm="6" md="4">
          <DataField
            label="Tipo de documento"
            icon="mdi-file-document-outline"
            :value="oGuion(tarifa.tipoDocumento?.descripcion)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <DataField
            label="Tipo de producto"
            icon="mdi-package-variant-closed"
            :value="oGuion(tarifa.tipoProducto?.descripcion)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <DataField
            label="Vigencia"
            icon="mdi-calendar-range"
            :value="formatoRangoDias(tarifa.diaInicio, tarifa.diaFin)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <DataField
            label="Código miscelánea"
            icon="mdi-barcode"
            :value="oGuion(tarifa.codigoMiscelanea)"
            mono
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <DataField
            label="Última modificación"
            icon="mdi-clock-outline"
            :value="formatoFecha(tarifa.fh_ultima_modificacion)"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <DataField
            label="Modificado por"
            icon="mdi-account-outline"
            :value="oGuion(tarifa.usuario_ultima_modificacion)"
          />
        </v-col>
        <v-col v-if="tarifa.comentarios" cols="12">
          <DataField
            label="Comentarios"
            icon="mdi-comment-text-outline"
            :value="oGuion(tarifa.comentarios)"
          />
        </v-col>
      </v-row>

      <template v-if="tarifa.aplicativos?.length">
        <v-divider class="my-4" />

        <div class="d-flex align-center ga-2 mb-3">
          <v-icon icon="mdi-apps" size="18" class="text-medium-emphasis" />
          <span class="text-subtitle-2 font-weight-bold">Aplicativos</span>
          <v-chip size="x-small" variant="tonal">{{ tarifa.aplicativos.length }}</v-chip>
        </div>

        <v-row dense>
          <v-col v-for="app in tarifa.aplicativos" :key="app.idAplicativo" cols="12" sm="6" md="4">
            <div class="aplicativo-tile d-flex align-center justify-space-between ga-3">
              <div class="d-flex flex-column" style="min-width: 0">
                <span class="text-body-2 font-weight-medium text-truncate">
                  {{ app.aplicativo }}
                </span>
                <span class="text-caption text-medium-emphasis text-mono">
                  ID {{ app.idAplicativo }}
                </span>
              </div>
              <v-chip size="small" variant="tonal" color="secondary" class="text-mono">
                {{ oGuion(app.cuotaAplicativo) }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.tarifa-card {
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 14px 34px rgba(15, 20, 40, 0.1);
  }

  &__accent {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    width: 4px;
    background: linear-gradient(180deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-accent)));

    &--local {
      background: linear-gradient(
        180deg,
        rgb(var(--v-theme-secondary)),
        rgb(var(--v-theme-success))
      );
    }
  }
}

.importe-tile {
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(var(--v-theme-on-surface), 0.04);

  &--principal {
    background: linear-gradient(
      135deg,
      rgba(var(--v-theme-primary), 0.14),
      rgba(var(--v-theme-accent), 0.1)
    );
  }
}

.aplicativo-tile {
  height: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
