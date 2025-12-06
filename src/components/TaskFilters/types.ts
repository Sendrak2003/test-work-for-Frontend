import type { TaskFilter, TaskSort, TaskStats } from '@/types'

export interface TaskFiltersProps {
  modelValue: TaskFilter
  sortBy: TaskSort
  searchQuery: string
  stats: TaskStats
}

export interface TaskFiltersEmits {
  'update:modelValue': [value: TaskFilter]
  'update:sortBy': [value: TaskSort]
  'update:searchQuery': [value: string]
}
