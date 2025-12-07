import { ref } from 'vue'

export interface Notification {
  message: string
  color: string
  timeout?: number
}

export function useNotification() {
  const show = ref(false)
  const message = ref('')
  const color = ref('success')
  const timeout = ref(3000)

  const notify = (notification: Notification) => {
    message.value = notification.message
    color.value = notification.color
    timeout.value = notification.timeout ?? 3000
    show.value = true
  }

  const success = (msg: string) => notify({ message: msg, color: 'success' })
  const error = (msg: string) => notify({ message: msg, color: 'error' })
  const info = (msg: string) => notify({ message: msg, color: 'info' })
  const warning = (msg: string) => notify({ message: msg, color: 'warning' })

  const close = () => {
    show.value = false
  }

  return {
    show,
    message,
    color,
    timeout,
    notify,
    success,
    error,
    info,
    warning,
    close
  }
}

