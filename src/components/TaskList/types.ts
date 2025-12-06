import type { Task } from '@/types'

export interface TaskListProps {
  tasks: Task[]
  isDeletionPending: (id: number) => boolean
  getDeletionTimeLeft: (id: number) => number
}

export interface TaskListEmits {
  toggle: [id: number]
  edit: [id: number]
  delete: [id: number]
  'cancel-deletion': [id: number]
}
