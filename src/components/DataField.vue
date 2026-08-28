<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number | null
  icon?: string
  mono?: boolean
}>()
</script>

<template>
  <div class="data-field">
    <div class="d-flex align-center ga-1 mb-1">
      <v-icon v-if="icon" :icon="icon" size="14" class="text-medium-emphasis" />
      <span class="text-caption text-medium-emphasis text-uppercase field-label">{{ label }}</span>
    </div>
    <div class="text-body-2 font-weight-medium" :class="{ 'text-mono': mono }">
      <slot>{{ value ?? '—' }}</slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-field {
  min-width: 0;
}

.field-label {
  letter-spacing: 0.06em;
  font-size: 0.68rem;
}
</style>
