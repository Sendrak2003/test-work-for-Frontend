export type ActivityAction = 'created' | 'completed' | 'uncompleted' | 'deleted' | 'edited'

export interface ActivityEntry {
  action: ActivityAction
  taskTitle: string
  timestamp: string
}

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

export const STORAGE_KEY = 'tasks-app-activity' as const

