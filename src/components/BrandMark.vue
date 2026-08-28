<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { smAndUp } = useDisplay()
</script>

<template>
  <div class="d-flex align-center ga-3">
    <div class="brand-badge d-flex align-center justify-center">
      <v-icon icon="mdi-tag-multiple-outline" size="20" color="white" />
    </div>
    <div v-if="smAndUp" class="d-flex flex-column">
      <span class="text-subtitle-1 font-weight-bold" style="line-height: 1.1">Tarifas</span>
      <span class="text-caption text-medium-emphasis" style="line-height: 1.1">
        Consulta y alta
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.brand-badge {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-accent)));
  box-shadow: 0 6px 18px rgba(61, 90, 254, 0.32);
}
</style>
