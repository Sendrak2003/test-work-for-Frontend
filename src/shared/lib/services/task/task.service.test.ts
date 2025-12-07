import { describe, it, expect } from 'vitest'
import { TaskService } from './task.service'
import type { Task, TaskPriority } from '@/entities/task'

describe('TaskService', () => {
  describe('validateTitle', () => {
    it('должен возвращать true для валидного названия', () => {
      expect(TaskService.validateTitle('Тестовая задача')).toBe(true)
      expect(TaskService.validateTitle('  Задача с пробелами  ')).toBe(true)
    })

    it('должен возвращать false для пустого названия', () => {
      expect(TaskService.validateTitle('')).toBe(false)
      expect(TaskService.validateTitle('   ')).toBe(false)
    })
  })

  describe('createTask', () => {
    it('должен создавать задачу с валидным названием', () => {
      const task = TaskService.createTask('Новая задача', 'high')
      
      expect(task).not.toBeNull()
      expect(task?.title).toBe('Новая задача')
      expect(task?.priority).toBe('high')
      expect(task?.completed).toBe(false)
      expect(task?.id).toBeTypeOf('number')
      expect(task?.createdAt).toBeDefined()
      expect(task?.updatedAt).toBeDefined()
      expect(task?.completedAt).toBeNull()
    })

    it('должен использовать приоритет по умолчанию', () => {
      const task = TaskService.createTask('Задача')
      
      expect(task?.priority).toBe('medium')
    })

    it('должен обрезать пробелы в названии', () => {
      const task = TaskService.createTask('  Задача с пробелами  ')
      
      expect(task?.title).toBe('Задача с пробелами')
    })

    it('должен возвращать null для пустого названия', () => {
      const task = TaskService.createTask('')
      
      expect(task).toBeNull()
    })
  })

  describe('updateTask', () => {
    const baseTask: Task = {
      id: 1,
      title: 'Исходная задача',
      completed: false,
      priority: 'medium',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
      completedAt: null
    }

    it('должен обновлять название задачи', () => {
      const updated = TaskService.updateTask(baseTask, 'Обновленное название')
      
      expect(updated?.title).toBe('Обновленное название')
      expect(updated?.updatedAt).toBeDefined()
      expect(updated?.updatedAt).toBeTruthy()
    })

    it('должен обновлять приоритет задачи', () => {
      const updated = TaskService.updateTask(baseTask, undefined, 'high')
      
      expect(updated?.priority).toBe('high')
      expect(updated?.updatedAt).toBeDefined()
      expect(updated?.updatedAt).toBeTruthy()
    })

    it('должен обновлять и название, и приоритет', () => {
      const updated = TaskService.updateTask(baseTask, 'Новое название', 'low')
      
      expect(updated?.title).toBe('Новое название')
      expect(updated?.priority).toBe('low')
    })

    it('должен возвращать null для пустого названия', () => {
      const updated = TaskService.updateTask(baseTask, '')
      
      expect(updated).toBeNull()
    })

    it('должен обрезать пробелы в названии', () => {
      const updated = TaskService.updateTask(baseTask, '  Название с пробелами  ')
      
      expect(updated?.title).toBe('Название с пробелами')
    })
  })

  describe('toggleTask', () => {
    it('должен переключать статус с false на true', () => {
      const task: Task = {
        id: 1,
        title: 'Задача',
        completed: false,
        priority: 'medium',
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
        completedAt: null
      }

      const toggled = TaskService.toggleTask(task)
      
      expect(toggled.completed).toBe(true)
      expect(toggled.completedAt).not.toBeNull()
      expect(toggled.updatedAt).toBeDefined()
      expect(toggled.updatedAt).toBeTruthy()
    })

    it('должен переключать статус с true на false', () => {
      const task: Task = {
        id: 1,
        title: 'Задача',
        completed: true,
        priority: 'medium',
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
        completedAt: '2024-01-01T01:00:00'
      }

      const toggled = TaskService.toggleTask(task)
      
      expect(toggled.completed).toBe(false)
      expect(toggled.completedAt).toBeNull()
      expect(toggled.updatedAt).toBeDefined()
      expect(toggled.updatedAt).toBeTruthy()
    })
  })

  describe('findTaskById', () => {
    const tasks: Task[] = [
      { id: 1, title: 'Задача 1', completed: false, priority: 'medium', createdAt: '2024-01-01', updatedAt: '2024-01-01', completedAt: null },
      { id: 2, title: 'Задача 2', completed: true, priority: 'high', createdAt: '2024-01-02', updatedAt: '2024-01-02', completedAt: '2024-01-02' }
    ]

    it('должен находить задачу по ID', () => {
      const task = TaskService.findTaskById(tasks, 1)
      
      expect(task).toBeDefined()
      expect(task?.id).toBe(1)
      expect(task?.title).toBe('Задача 1')
    })

    it('должен возвращать undefined для несуществующего ID', () => {
      const task = TaskService.findTaskById(tasks, 999)
      
      expect(task).toBeUndefined()
    })
  })

  describe('removeTask', () => {
    const tasks: Task[] = [
      { id: 1, title: 'Задача 1', completed: false, priority: 'medium', createdAt: '2024-01-01', updatedAt: '2024-01-01', completedAt: null },
      { id: 2, title: 'Задача 2', completed: true, priority: 'high', createdAt: '2024-01-02', updatedAt: '2024-01-02', completedAt: '2024-01-02' }
    ]

    it('должен удалять задачу по ID', () => {
      const result = TaskService.removeTask(tasks, 1)
      
      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe(2)
    })

    it('должен возвращать исходный массив, если задача не найдена', () => {
      const result = TaskService.removeTask(tasks, 999)
      
      expect(result).toHaveLength(2)
      expect(result).toEqual(tasks)
    })
  })

  describe('addTaskToList', () => {
    const tasks: Task[] = [
      { id: 1, title: 'Задача 1', completed: false, priority: 'medium', createdAt: '2024-01-01', updatedAt: '2024-01-01', completedAt: null }
    ]

    it('должен добавлять задачу в список', () => {
      const newTask: Task = {
        id: 2,
        title: 'Новая задача',
        completed: false,
        priority: 'high',
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        completedAt: null
      }

      const result = TaskService.addTaskToList(tasks, newTask)
      
      expect(result).toHaveLength(2)
      expect(result[1]).toEqual(newTask)
      expect(result[0]).toEqual(tasks[0])
    })

    it('не должен мутировать исходный массив', () => {
      const newTask: Task = {
        id: 2,
        title: 'Новая задача',
        completed: false,
        priority: 'high',
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        completedAt: null
      }

      const originalLength = tasks.length
      TaskService.addTaskToList(tasks, newTask)
      
      expect(tasks).toHaveLength(originalLength)
    })
  })

  describe('updateTaskInList', () => {
    const tasks: Task[] = [
      { id: 1, title: 'Задача 1', completed: false, priority: 'medium', createdAt: '2024-01-01', updatedAt: '2024-01-01', completedAt: null },
      { id: 2, title: 'Задача 2', completed: true, priority: 'high', createdAt: '2024-01-02', updatedAt: '2024-01-02', completedAt: '2024-01-02' }
    ]

    it('должен обновлять задачу в списке', () => {
      const updatedTask: Task = {
        ...tasks[0]!,
        title: 'Обновленная задача',
        priority: 'high'
      }

      const result = TaskService.updateTaskInList(tasks, updatedTask)
      
      expect(result[0]?.title).toBe('Обновленная задача')
      expect(result[0]?.priority).toBe('high')
      expect(result[1]).toEqual(tasks[1])
    })

    it('не должен мутировать исходный массив', () => {
      const updatedTask: Task = {
        ...tasks[0]!,
        title: 'Обновленная задача'
      }

      const originalTitle = tasks[0]!.title
      TaskService.updateTaskInList(tasks, updatedTask)
      
      expect(tasks[0]?.title).toBe(originalTitle)
    })
  })
})

