import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings } from '@/types'
import { STORAGE_KEYS } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })

  function load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (stored) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
      settings.value = { ...DEFAULT_SETTINGS }
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings.value))
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error)
    }
  }

  function toggleDarkMode() {
    settings.value.darkMode = !settings.value.darkMode
    save()
  }

  function setDarkMode(value: boolean) {
    settings.value.darkMode = value
    save()
  }

  return {
    settings,
    load,
    toggleDarkMode,
    setDarkMode
  }
})

