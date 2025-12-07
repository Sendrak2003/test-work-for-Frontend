import type { Task, TaskFilter, TaskSort, TaskPriority } from '@/entities/task'

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2
}

/**
 * Сервис для фильтрации и сортировки задач
 */
export class TaskFilterService {
  /**
   * Фильтрация задач по статусу
   */
  static filterByStatus(tasks: Task[], filter: TaskFilter): Task[] {
    switch (filter) {
      case 'active':
        return tasks.filter(t => !t.completed)
      case 'completed':
        return tasks.filter(t => t.completed)
      case 'all':
      default:
        return tasks
    }
  }

  /**
   * Поиск задач по запросу
   */
  static searchTasks(tasks: Task[], query: string): Task[] {
    if (!query.trim()) {
      return tasks
    }

    const searchQuery = query.toLowerCase()
    return tasks.filter(t => t.title.toLowerCase().includes(searchQuery))
  }

  /**
   * Сортировка задач
   */
  static sortTasks(tasks: Task[], sortBy: TaskSort): Task[] {
    const sorted = [...tasks]

    switch (sortBy) {
      case 'priority':
        return sorted.sort(
          (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        )
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
      case 'date':
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
  }

  /**
   * Применить все фильтры и сортировку
   */
  static applyFilters(
    tasks: Task[],
    filter: TaskFilter,
    sortBy: TaskSort,
    searchQuery: string
  ): Task[] {
    let result = tasks
    result = this.searchTasks(result, searchQuery)
    result = this.filterByStatus(result, filter)
    result = this.sortTasks(result, sortBy)
    return result
  }

  /**
   * Вычислить статистику по задачам
   */
  static calculateStats(tasks: Task[]): {
    total: number
    active: number
    completed: number
    percentage: string
  } {
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const active = total - completed
    const percentage = total > 0 ? (completed / total * 100).toFixed(1) : '0.0'

    return { total, active, completed, percentage }
  }
}

