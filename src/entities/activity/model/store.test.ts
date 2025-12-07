import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActivityStore } from './store'

describe('useActivityStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('addEntry', () => {
    it('должен добавлять запись в ленту', () => {
      const store = useActivityStore()
      
      store.addEntry('created', 'Новая задача')
      
      expect(store.activityLog).toHaveLength(1)
      expect(store.activityLog[0]?.action).toBe('created')
      expect(store.activityLog[0]?.taskTitle).toBe('Новая задача')
    })

    it('должен добавлять запись в начало списка', () => {
      const store = useActivityStore()
      store.addEntry('created', 'Первая задача')
      store.addEntry('completed', 'Вторая задача')
      
      expect(store.activityLog[0]?.action).toBe('completed')
      expect(store.activityLog[1]?.action).toBe('created')
    })

    it('должен ограничивать размер ленты до 50 записей', () => {
      const store = useActivityStore()
      
      for (let i = 0; i < 60; i++) {
        store.addEntry('created', `Задача ${i}`)
      }
      
      expect(store.activityLog).toHaveLength(50)
    })
  })

  describe('clear', () => {
    it('должен очищать ленту активности', () => {
      const store = useActivityStore()
      store.addEntry('created', 'Задача 1')
      store.addEntry('completed', 'Задача 2')
      
      store.clear()
      
      expect(store.activityLog).toHaveLength(0)
    })
  })

  describe('load и save', () => {
    it('должен сохранять и загружать записи из localStorage', () => {
      const store1 = useActivityStore()
      store1.addEntry('created', 'Сохраненная задача')
      
      const store2 = useActivityStore()
      store2.load()
      
      expect(store2.activityLog).toHaveLength(1)
      expect(store2.activityLog[0]?.taskTitle).toBe('Сохраненная задача')
    })
  })
})

