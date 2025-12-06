import type { TaskPriority } from '@/types'

export interface TaskFormEmits {
  submit: [title: string, priority: TaskPriority]
}
