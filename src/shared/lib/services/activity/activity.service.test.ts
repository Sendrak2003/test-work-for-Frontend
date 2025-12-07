import { describe, it, expect } from 'vitest'
import { ActivityService } from './activity.service'
import type { ActivityEntry, ActivityAction } from '@/entities/activity'

describe('ActivityService', () => {
  describe('createEntry', () => {
    it('должен создавать запись активности', () => {
      const entry = ActivityService.createEntry('created', 'Новая задача')
      
      expect(entry.action).toBe('created')
      expect(entry.taskTitle).toBe('Новая задача')
      expect(entry.timestamp).toBeDefined()
      expect(new Date(entry.timestamp).getTime()).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('addEntry', () => {
    it('должен добавлять запись в начало списка', () => {
      const entries: ActivityEntry[] = []
      const result = ActivityService.addEntry(entries, 'created', 'Задача 1')
      
      expect(result).toHaveLength(1)
      expect(result[0]?.action).toBe('created')
      expect(result[0]?.taskTitle).toBe('Задача 1')
    })

    it('должен ограничивать размер ленты до 50 записей', () => {
      let entries: ActivityEntry[] = []
      for (let i = 0; i < 60; i++) {
        entries = ActivityService.addEntry(entries, 'created', `Задача ${i}`)
      }
      
      const result = ActivityService.addEntry(entries, 'completed', 'Последняя задача')
      
      expect(result).toHaveLength(50)
      expect(result[0]?.action).toBe('completed')
    })

    it('должен добавлять новую запись в начало', () => {
      const entries: ActivityEntry[] = [
        ActivityService.createEntry('created', 'Первая задача')
      ]
      
      const result = ActivityService.addEntry(entries, 'completed', 'Вторая задача')
      
      expect(result).toHaveLength(2)
      expect(result[0]?.taskTitle).toBe('Вторая задача')
      expect(result[1]?.taskTitle).toBe('Первая задача')
    })
  })

  describe('clear', () => {
    it('должен возвращать пустой массив', () => {
      const entries: ActivityEntry[] = [
        ActivityService.createEntry('created', 'Задача')
      ]
      
      const result = ActivityService.clear()
      
      expect(result).toHaveLength(0)
    })
  })
})

