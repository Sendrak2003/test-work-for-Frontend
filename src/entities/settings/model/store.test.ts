import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from './store'

describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('toggleDarkMode', () => {
    it('должен переключать темный режим', () => {
      const store = useSettingsStore()
      const initialValue = store.settings.darkMode
      
      store.toggleDarkMode()
      
      expect(store.settings.darkMode).toBe(!initialValue)
    })
  })

  describe('load и save', () => {
    it('должен сохранять и загружать настройки из localStorage', () => {
      const store1 = useSettingsStore()
      store1.toggleDarkMode()
      const darkModeValue = store1.settings.darkMode
      
      const store2 = useSettingsStore()
      store2.load()
      
      expect(store2.settings.darkMode).toBe(darkModeValue)
    })
  })
})

