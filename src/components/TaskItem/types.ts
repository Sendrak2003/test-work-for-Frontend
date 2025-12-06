import type { Task } from '@/types'

export interface TaskItemProps {
  task: Task
  isDeletionPending: boolean
  deletionTimeLeft: number
}

export interface TaskItemEmits {
  toggle: []
  edit: []
  delete: []
  'cancel-deletion': []
}
