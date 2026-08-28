<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useNotificationsStore } from '@/stores/notifications.store'

const notifications = useNotificationsStore()
const { current, visible } = storeToRefs(notifications)

const icon = computed(() => {
  switch (current.value?.kind) {
    case 'success':
      return 'mdi-check-circle-outline'
    case 'error':
      return 'mdi-alert-circle-outline'
    case 'warning':
      return 'mdi-alert-outline'
    default:
      return 'mdi-information-outline'
  }
})
</script>

<template>
  <v-snackbar
    v-model="visible"
    :color="current?.kind ?? 'info'"
    :timeout="current?.timeout ?? 4500"
    location="top right"
    rounded="lg"
    variant="elevated"
    max-width="440"
  >
    <div class="d-flex align-start ga-3">
      <v-icon :icon="icon" size="22" />
      <div class="d-flex flex-column">
        <span class="font-weight-medium">{{ current?.message }}</span>
        <span v-if="current?.detail" class="text-caption" style="opacity: 0.85">
          {{ current.detail }}
        </span>
      </div>
    </div>

    <template #actions>
      <v-btn variant="text" size="small" @click="notifications.dismiss()">Cerrar</v-btn>
    </template>
  </v-snackbar>
</template>
