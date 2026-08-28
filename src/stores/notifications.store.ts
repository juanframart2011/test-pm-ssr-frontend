import { defineStore } from 'pinia'
import { ref } from 'vue'

export type NotificationKind = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  message: string
  kind: NotificationKind
  /** Texto secundario opcional (detalle técnico, código de respuesta, etc.). */
  detail?: string
  timeout?: number
}

/**
 * Centraliza los mensajes emergentes de la app para que cualquier vista o servicio
 * pueda notificar sin acoplarse al componente que los renderiza.
 */
export const useNotificationsStore = defineStore('notifications', () => {
  const current = ref<Notification | null>(null)
  const visible = ref(false)

  function notify(notification: Notification) {
    current.value = { timeout: 4500, ...notification }
    visible.value = true
  }

  const success = (message: string, detail?: string) => notify({ message, detail, kind: 'success' })
  const error = (message: string, detail?: string) => notify({ message, detail, kind: 'error' })
  const info = (message: string, detail?: string) => notify({ message, detail, kind: 'info' })
  const warning = (message: string, detail?: string) => notify({ message, detail, kind: 'warning' })

  function dismiss() {
    visible.value = false
  }

  return { current, visible, notify, success, error, info, warning, dismiss }
})
