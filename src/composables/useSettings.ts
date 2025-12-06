import { ref, watch } from 'vue'
import type { AppSettings } from '@/types'
import { STORAGE_KEYS } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false
}

export function useSettings() {
  const settings = ref<AppSettings>(DEFAULT_SETTINGS)

  const load = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (stored) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
      settings.value = DEFAULT_SETTINGS
    }
  }

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings.value))
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error)
    }
  }

  const toggleDarkMode = () => {
    settings.value.darkMode = !settings.value.darkMode
  }

  watch(settings, save, { deep: true })

  return {
    settings,
    load,
    toggleDarkMode
  }
}

