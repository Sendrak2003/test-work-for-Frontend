import { describe, it, expect } from 'vitest'
import { TaskFilterService } from './task-filter.service'
import type { Task, TaskFilter, TaskSort } from '@/entities/task'

describe('TaskFilterService', () => {
  const tasks: Task[] = [
    {
      id: 1,
      title: 'Активная задача',
      completed: false,
      priority: 'high',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
      completedAt: null
    },
    {
      id: 2,
      title: 'Завершенная задача',
      completed: true,
      priority: 'medium',
      createdAt: '2024-01-02T00:00:00',
      updatedAt: '2024-01-02T00:00:00',
      completedAt: '2024-01-02T00:00:00'
    },
    {
      id: 3,
      title: 'Еще одна активная',
      completed: false,
      priority: 'low',
      createdAt: '2024-01-03T00:00:00',
      updatedAt: '2024-01-03T00:00:00',
      completedAt: null
    }
  ]

  describe('filterByStatus', () => {
    it('должен возвращать все задачи для фильтра "all"', () => {
      const result = TaskFilterService.filterByStatus(tasks, 'all')
      
      expect(result).toHaveLength(3)
    })

    it('должен возвращать только активные задачи', () => {
      const result = TaskFilterService.filterByStatus(tasks, 'active')
      
      expect(result).toHaveLength(2)
      expect(result.every(t => !t.completed)).toBe(true)
    })

    it('должен возвращать только завершенные задачи', () => {
      const result = TaskFilterService.filterByStatus(tasks, 'completed')
      
      expect(result).toHaveLength(1)
      expect(result[0]?.completed).toBe(true)
    })
  })

  describe('searchTasks', () => {
    it('должен возвращать все задачи для пустого запроса', () => {
      const result = TaskFilterService.searchTasks(tasks, '')
      
      expect(result).toHaveLength(3)
    })

    it('должен находить задачи по названию', () => {
      const result = TaskFilterService.searchTasks(tasks, 'активная')
      
      expect(result).toHaveLength(2)
      expect(result.every(t => t.title.toLowerCase().includes('активная'))).toBe(true)
    })

    it('должен быть регистронезависимым', () => {
      const result = TaskFilterService.searchTasks(tasks, 'ЗАВЕРШЕННАЯ')
      
      expect(result).toHaveLength(1)
    })

    it('должен возвращать пустой массив, если ничего не найдено', () => {
      const result = TaskFilterService.searchTasks(tasks, 'несуществующая задача')
      
      expect(result).toHaveLength(0)
    })
  })

  describe('sortTasks', () => {
    it('должен сортировать по приоритету', () => {
      const result = TaskFilterService.sortTasks(tasks, 'priority')
      
      expect(result[0]?.priority).toBe('high')
      expect(result[1]?.priority).toBe('medium')
      expect(result[2]?.priority).toBe('low')
    })

    it('должен сортировать по дате создания', () => {
      const result = TaskFilterService.sortTasks(tasks, 'date')
      
      const date0 = result[0]?.createdAt
      const date1 = result[1]?.createdAt
      expect(date0).toBeDefined()
      expect(date1).toBeDefined()
      if (date0 && date1) {
        expect(new Date(date0).getTime()).toBeGreaterThanOrEqual(
          new Date(date1).getTime()
        )
      }
    })

    it('должен сортировать по названию', () => {
      const result = TaskFilterService.sortTasks(tasks, 'name')
      
      expect(result[0]?.title.localeCompare(result[1]?.title || '')).toBeLessThanOrEqual(0)
      expect(result[1]?.title.localeCompare(result[2]?.title || '')).toBeLessThanOrEqual(0)
    })
  })

  describe('applyFilters', () => {
    it('должен применять все фильтры вместе', () => {
      const result = TaskFilterService.applyFilters(tasks, 'active', 'priority', 'активная')
      
      expect(result.length).toBeGreaterThan(0)
      expect(result.every(t => !t.completed)).toBe(true)
      expect(result.every(t => t.title.toLowerCase().includes('активная'))).toBe(true)
    })

    it('должен возвращать пустой массив, если ничего не соответствует', () => {
      const result = TaskFilterService.applyFilters(tasks, 'completed', 'priority', 'активная')
      
      expect(result).toHaveLength(0)
    })
  })

  describe('calculateStats', () => {
    it('должен правильно вычислять статистику', () => {
      const stats = TaskFilterService.calculateStats(tasks)
      
      expect(stats.total).toBe(3)
      expect(stats.active).toBe(2)
      expect(stats.completed).toBe(1)
      expect(parseFloat(stats.percentage)).toBeCloseTo(33.33, 1)
    })

    it('должен возвращать 0% для пустого массива', () => {
      const stats = TaskFilterService.calculateStats([])
      
      expect(stats.total).toBe(0)
      expect(stats.active).toBe(0)
      expect(stats.completed).toBe(0)
      expect(stats.percentage).toBe('0.0')
    })
  })
})

