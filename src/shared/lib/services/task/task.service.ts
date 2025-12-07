import type { Task, TaskPriority } from '@/entities/task'

/**
 * Сервис для бизнес-логики работы с задачами
 */
export class TaskService {
  /**
   * Валидация названия задачи
   */
  static validateTitle(title: string): boolean {
    return title.trim().length > 0
  }

  /**
   * Создать новую задачу
   */
  static createTask(title: string, priority: TaskPriority = 'medium'): Task | null {
    const trimmedTitle = title.trim()
    if (!this.validateTitle(trimmedTitle)) {
      return null
    }

    const now = new Date().toISOString()
    return {
      id: Date.now(),
      title: trimmedTitle,
      completed: false,
      priority,
      createdAt: now,
      updatedAt: now,
      completedAt: null
    }
  }

  /**
   * Обновить задачу
   */
  static updateTask(
    task: Task,
    title?: string,
    priority?: TaskPriority
  ): Task | null {
    if (title !== undefined) {
      const trimmedTitle = title.trim()
      if (!this.validateTitle(trimmedTitle)) {
        return null
      }
      task.title = trimmedTitle
    }

    if (priority !== undefined) {
      task.priority = priority
    }

    task.updatedAt = new Date().toISOString()
    return task
  }

  /**
   * Переключить статус выполнения задачи
   */
  static toggleTask(task: Task): Task {
    const now = new Date().toISOString()
    task.completed = !task.completed
    task.updatedAt = now
    task.completedAt = task.completed ? now : null
    return task
  }

  /**
   * Найти задачу по ID
   */
  static findTaskById(tasks: Task[], id: number): Task | undefined {
    return tasks.find(t => t.id === id)
  }

  /**
   * Удалить задачу
   */
  static removeTask(tasks: Task[], id: number): Task[] {
    return tasks.filter(t => t.id !== id)
  }

  /**
   * Добавить задачу в список
   */
  static addTaskToList(tasks: Task[], task: Task): Task[] {
    return [...tasks, task]
  }

  /**
   * Обновить задачу в списке
   */
  static updateTaskInList(tasks: Task[], updatedTask: Task): Task[] {
    return tasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
  }
}

