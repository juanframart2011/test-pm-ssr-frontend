<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useTheme } from 'vuetify'

import AppSnackbar from '@/components/AppSnackbar.vue'
import BrandMark from '@/components/BrandMark.vue'

const THEME_STORAGE_KEY = 'tarifas:theme'

const theme = useTheme()
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
    <v-app-bar flat height="72" color="transparent">
      <v-container class="d-flex align-center ga-4 py-0">
        <BrandMark />

        <v-spacer />

        <v-tabs
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

        <v-spacer />

        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          :aria-label="isDark ? 'Activar tema claro' : 'Activar tema oscuro'"
          @click="toggleTheme"
        />
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container class="py-6 py-md-10">
        <router-view v-slot="{ Component }">
          <transition name="view-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <AppSnackbar />
  </v-app>
</template>

<style scoped lang="scss">
.app-tabs :deep(.v-tab) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}
</style>
