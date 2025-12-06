<template>
  <v-list lines="two" class="elevation-1 rounded">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      :is-deletion-pending="isDeletionPending(task.id)"
      :deletion-time-left="getDeletionTimeLeft(task.id)"
      @toggle="$emit('toggle', task.id)"
      @edit="$emit('edit', task.id)"
      @delete="$emit('delete', task.id)"
      @cancel-deletion="$emit('cancel-deletion', task.id)"
    />
    
    <v-list-item v-if="tasks.length === 0">
      <v-list-item-title class="text-grey text-center py-4">
        <v-icon size="48" class="mb-2">mdi-clipboard-text-outline</v-icon>
        <p>Нет задач</p>
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { Task } from '@/types'
import { TaskItem } from '@/components/TaskItem'

defineProps<{
  tasks: Task[]
  isDeletionPending: (id: number) => boolean
  getDeletionTimeLeft: (id: number) => number
}>()

defineEmits<{
  toggle: [id: number]
  edit: [id: number]
  delete: [id: number]
  'cancel-deletion': [id: number]
}>()
</script>
