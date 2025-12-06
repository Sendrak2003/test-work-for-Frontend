// ==================== ПРИОРИТЕТЫ ====================
export type TaskPriority = 'low' | 'medium' | 'high'

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий'
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'success',
  medium: 'warning',
  high: 'error'
}

export const PRIORITY_ICONS: Record<TaskPriority, string> = {
  low: 'mdi-chevron-down',
  medium: 'mdi-minus',
  high: 'mdi-chevron-up'
}

// ==================== ЗАДАЧИ ====================
export interface Task {
  id: number
  title: string
  completed: boolean
  priority: TaskPriority
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export type TaskFilter = 'all' | 'active' | 'completed'
export type TaskSort = 'date' | 'priority' | 'name'

export interface TaskStats {
  total: number
  active: number
  completed: number
  percentage: string
}

// ==================== УДАЛЕНИЕ ====================
export interface DeletionTimer {
  timerId: number
  timeLeft: number
}

// ==================== ЛЕНТА АКТИВНОСТИ ====================
export type ActivityAction = 'created' | 'completed' | 'uncompleted' | 'deleted' | 'edited'

export interface ActivityEntry {
  action: ActivityAction
  taskTitle: string
  timestamp: string
}

// ==================== НАСТРОЙКИ ====================
export interface AppSettings {
  darkMode: boolean
}

// ==================== КОНСТАНТЫ ====================
export const STORAGE_KEYS = {
  TASKS: 'tasks-app-tasks',
  ACTIVITY: 'tasks-app-activity',
  SETTINGS: 'tasks-app-settings'
} as const

export const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: 'Изучить Vue 3 Composition API',
    completed: true,
    priority: 'high',
    createdAt: '2024-01-15T10:00:00',
    updatedAt: '2024-01-20T15:30:00',
    completedAt: '2024-01-20T15:30:00'
  },
  {
    id: 2,
    title: 'Написать тестовое задание',
    completed: false,
    priority: 'high',
    createdAt: '2024-02-01T09:00:00',
    updatedAt: '2024-02-01T09:00:00',
    completedAt: null
  },
  {
    id: 3,
    title: 'Рефакторинг legacy кода',
    completed: false,
    priority: 'medium',
    createdAt: '2024-02-10T14:00:00',
    updatedAt: '2024-02-10T14:00:00',
    completedAt: null
  },
  {
    id: 4,
    title: 'Изучить Pinia и лучшие практики',
    completed: true,
    priority: 'low',
    createdAt: '2024-01-25T11:00:00',
    updatedAt: '2024-01-30T16:00:00',
    completedAt: '2024-01-30T16:00:00'
  }
]

// ==================== МАППИНГИ АКТИВНОСТИ ====================
export const ACTIVITY_ICONS: Record<ActivityAction, string> = {
  created: 'mdi-plus-circle',
  completed: 'mdi-check-circle',
  uncompleted: 'mdi-refresh-circle',
  deleted: 'mdi-delete-circle',
  edited: 'mdi-pencil-circle'
}

export const ACTIVITY_COLORS: Record<ActivityAction, string> = {
  created: 'success',
  completed: 'primary',
  uncompleted: 'warning',
  deleted: 'error',
  edited: 'info'
}

export const ACTIVITY_LABELS: Record<ActivityAction, string> = {
  created: 'Создана задача',
  completed: 'Задача завершена',
  uncompleted: 'Задача возобновлена',
  deleted: 'Задача удалена',
  edited: 'Задача изменена'
}
