import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTasksStore } from './store'
import type { Task, TaskPriority } from './types'

describe('useTasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('addTask', () => {
    it('должен добавлять новую задачу', () => {
      const store = useTasksStore()
      
      const result = store.addTask('Новая задача', 'high')
      
      expect(result).toBe(true)
      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0]?.title).toBe('Новая задача')
      expect(store.tasks[0]?.priority).toBe('high')
    })

    it('должен возвращать false для пустого названия', () => {
      const store = useTasksStore()
      
      const result = store.addTask('', 'medium')
      
      expect(result).toBe(false)
      expect(store.tasks).toHaveLength(0)
    })

    it('должен использовать приоритет по умолчанию', () => {
      const store = useTasksStore()
      
      store.addTask('Задача')
      
      expect(store.tasks[0]?.priority).toBe('medium')
    })
  })

  describe('toggleTask', () => {
    it('должен переключать статус задачи', () => {
      const store = useTasksStore()
      store.addTask('Тестовая задача')
      const taskId = store.tasks[0]?.id
      expect(taskId).toBeDefined()
      
      store.toggleTask(taskId!)
      
      expect(store.tasks[0]?.completed).toBe(true)
      expect(store.tasks[0]?.completedAt).not.toBeNull()
    })

    it('должен переключать с completed на active', () => {
      const store = useTasksStore()
      store.addTask('Тестовая задача')
      const taskId = store.tasks[0]?.id
      expect(taskId).toBeDefined()
      store.toggleTask(taskId!) // completed = true
      
      store.toggleTask(taskId!) // completed = false
      
      expect(store.tasks[0]?.completed).toBe(false)
      expect(store.tasks[0]?.completedAt).toBeNull()
    })
  })

  describe('editTask', () => {
    it('должен редактировать задачу', () => {
      const store = useTasksStore()
      store.addTask('Исходная задача')
      const taskId = store.tasks[0]?.id
      expect(taskId).toBeDefined()
      
      const result = store.editTask(taskId!, 'Обновленная задача', 'high')
      
      expect(result).toBe(true)
      expect(store.tasks[0]?.title).toBe('Обновленная задача')
      expect(store.tasks[0]?.priority).toBe('high')
    })

    it('должен возвращать false для несуществующей задачи', () => {
      const store = useTasksStore()
      
      const result = store.editTask(999, 'Задача', 'medium')
      
      expect(result).toBe(false)
    })
  })

  describe('filteredTasks', () => {
    it('должен фильтровать задачи по статусу', () => {
      const store = useTasksStore()
      store.addTask('Активная задача')
      store.addTask('Завершенная задача')
      
      expect(store.tasks).toHaveLength(2)
      expect(store.tasks[0]?.completed).toBe(false)
      expect(store.tasks[1]?.completed).toBe(false)
      
      const taskId = store.tasks[1]?.id
      expect(taskId).toBeDefined()
      if (!taskId) return
      store.toggleTask(taskId)
      
      const updatedTask = store.tasks.find(t => t.id === taskId)
      expect(updatedTask?.completed).toBe(true)
      
      store.currentFilter = 'active'
      
      expect(store.filteredTasks.length).toBe(1)
      expect(store.filteredTasks[0]?.completed).toBe(false)
      expect(store.filteredTasks[0]?.title).toBe('Активная задача')
    })

    it('должен искать задачи по запросу', () => {
      const store = useTasksStore()
      store.addTask('Первая задача')
      store.addTask('Вторая задача')
      
      store.searchQuery = 'первая'
      
      expect(store.filteredTasks).toHaveLength(1)
      expect(store.filteredTasks[0]?.title).toBe('Первая задача')
    })
  })

  describe('stats', () => {
    it('должен правильно вычислять статистику', () => {
      const store = useTasksStore()
      store.addTask('Активная 1')
      store.addTask('Активная 2')
      store.addTask('Завершенная')
      
      expect(store.stats.total).toBe(3)
      expect(store.stats.active).toBe(3)
      expect(store.stats.completed).toBe(0)
      
      const taskId = store.tasks[2]?.id
      expect(taskId).toBeDefined()
      if (!taskId) return
      store.toggleTask(taskId)
      
      const updatedTask = store.tasks.find(t => t.id === taskId)
      expect(updatedTask?.completed).toBe(true)
      
      expect(store.stats.total).toBe(3)
      expect(store.stats.completed).toBe(1)
      expect(store.stats.active).toBe(2)
    })
  })

  describe('startDeletion и cancelDeletion', () => {
    it('должен запускать таймер удаления', () => {
      vi.useFakeTimers()
      const store = useTasksStore()
      store.addTask('Задача для удаления')
      const taskId = store.tasks[0]?.id
      expect(taskId).toBeDefined()
      if (!taskId) return
      
      store.startDeletion(taskId)
      
      expect(store.isDeletionPending(taskId)).toBe(true)
      expect(store.getDeletionTimeLeft(taskId)).toBe(5)
      
      vi.useRealTimers()
    })

    it('должен отменять удаление', () => {
      vi.useFakeTimers()
      const store = useTasksStore()
      store.addTask('Задача')
      const taskId = store.tasks[0]?.id
      expect(taskId).toBeDefined()
      if (!taskId) return
      store.startDeletion(taskId)
      
      store.cancelDeletion(taskId)
      
      expect(store.isDeletionPending(taskId)).toBe(false)
      
      vi.useRealTimers()
    })
  })

  describe('load и save', () => {
    it('должен загружать задачи из localStorage', () => {
      const tasks: Task[] = [
        {
          id: 1,
          title: 'Сохраненная задача',
          completed: false,
          priority: 'medium',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          completedAt: null
        }
      ]
      localStorage.setItem('tasks-app-tasks', JSON.stringify(tasks))
      
      const store = useTasksStore()
      store.load()
      
      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0]?.title).toBe('Сохраненная задача')
    })

    it('должен сохранять задачи в localStorage', () => {
      const store = useTasksStore()
      store.addTask('Новая задача')
      
      const stored = localStorage.getItem('tasks-app-tasks')
      expect(stored).not.toBeNull()
      
      const parsed = JSON.parse(stored!) as Task[]
      expect(parsed).toHaveLength(1)
      expect(parsed[0]?.title).toBe('Новая задача')
    })
  })
})

