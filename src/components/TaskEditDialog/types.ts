import type { Task, TaskPriority } from '@/types'

export interface TaskEditDialogProps {
  modelValue: boolean
  task: Task | undefined
}

export interface TaskEditDialogEmits {
  'update:modelValue': [value: boolean]
  save: [id: number, title: string, priority: TaskPriority]
}

