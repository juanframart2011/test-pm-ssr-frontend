<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useDisplay, useTheme } from 'vuetify'

import AppSnackbar from '@/components/AppSnackbar.vue'
import BrandMark from '@/components/BrandMark.vue'

const THEME_STORAGE_KEY = 'tarifas:theme'

const theme = useTheme()
const { mobile } = useDisplay()
const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  theme.change(isDark.value ? 'brandLight' : 'brandDark')
}

onMounted(() => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'brandDark' || stored === 'brandLight') {
    theme.change(stored)
    return
  }
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.change('brandDark')
  }
})

watch(
  () => theme.global.name.value,
  (name) => localStorage.setItem(THEME_STORAGE_KEY, name),
)
</script>

<template>
  <v-app class="app-shell">
    <a class="skip-link" href="#contenido">Ir al contenido</a>

    <v-app-bar flat :height="mobile ? 64 : 72" color="transparent" class="app-bar">
      <v-container class="d-flex align-center ga-4 py-0">
        <BrandMark />

        <v-spacer />

        <!-- En escritorio las pestañas viven en la barra; en móvil pasan a la extensión
             para no comprimir la marca ni el conmutador de tema. -->
        <v-tabs
          v-if="!mobile"
          :model-value="$route.name as string"
          color="primary"
          density="comfortable"
          slider-color="primary"
          class="app-tabs"
        >
          <v-tab value="consulta" :to="{ name: 'consulta' }" prepend-icon="mdi-magnify">
            Consulta
          </v-tab>
          <v-tab value="alta" :to="{ name: 'alta' }" prepend-icon="mdi-plus-box-outline">
            Alta
          </v-tab>
        </v-tabs>

        <v-spacer v-if="!mobile" />

        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          :aria-label="isDark ? 'Activar tema claro' : 'Activar tema oscuro'"
          @click="toggleTheme"
        />
      </v-container>

      <template v-if="mobile" #extension>
        <v-tabs
          :model-value="$route.name as string"
          color="primary"
          grow
          slider-color="primary"
          class="app-tabs w-100"
        >
          <v-tab value="consulta" :to="{ name: 'consulta' }" prepend-icon="mdi-magnify">
            Consulta
          </v-tab>
          <v-tab value="alta" :to="{ name: 'alta' }" prepend-icon="mdi-plus-box-outline">
            Alta
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-main>
      <v-container id="contenido" class="py-6 py-md-10 content-container">
        <router-view v-slot="{ Component }">
          <transition name="view-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <v-footer color="transparent" class="justify-center pb-6 pt-0">
      <span class="text-caption text-medium-emphasis text-center">
        Prueba técnica · Vue 3 + Vuetify 3 + TypeScript · datos de
        <span class="text-mono">/dgs-api-bridge/tarifas/consulta</span>
      </span>
    </v-footer>

    <AppSnackbar />
  </v-app>
</template>

<style scoped lang="scss">
.app-tabs :deep(.v-tab) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}

// Barra translúcida: el contenido se difumina al pasar por debajo.
.app-bar {
  backdrop-filter: blur(12px);
  background: rgba(var(--v-theme-surface), 0.72) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.content-container {
  max-width: 1140px;
}

// Enlace de salto visible solo al navegar con teclado.
.skip-link {
  position: absolute;
  top: -60px;
  left: 12px;
  z-index: 3000;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  font-size: 0.875rem;
  transition: top 0.2s ease;

  &:focus-visible {
    top: 12px;
  }
}
</style>
