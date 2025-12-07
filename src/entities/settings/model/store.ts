import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings } from './types'
import { STORAGE_KEY, DEFAULT_SETTINGS } from './types'
import { StorageService } from '@/shared/lib/services'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })

  function load() {
    try {
      const stored = StorageService.getItem<Partial<AppSettings>>(
        STORAGE_KEY,
        {}
      )
      settings.value = {
        ...DEFAULT_SETTINGS,
        ...stored
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
      settings.value = { ...DEFAULT_SETTINGS }
    }
  }

  function save() {
    try {
      StorageService.setItem(STORAGE_KEY, settings.value)
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

