<template>
  <v-list-item class="task-item py-3">
    <template v-slot:prepend>
      <v-checkbox
        :model-value="task.completed"
        @update:model-value="$emit('toggle')"
        density="comfortable"
        hide-details
      />
    </template>
    
    <div class="task-content">
      <div class="task-header">
        <v-chip
          :color="PRIORITY_COLORS[task.priority]"
          size="small"
          variant="flat"
          class="priority-chip"
        >
          <v-icon size="small" start>{{ PRIORITY_ICONS[task.priority] }}</v-icon>
          {{ PRIORITY_LABELS[task.priority] }}
        </v-chip>
        
        <span 
          :class="{ 'text-decoration-line-through': task.completed }"
          class="task-title font-weight-medium"
        >
          {{ task.title }}
        </span>
      </div>
      
      <div class="task-dates text-caption text-medium-emphasis mt-1">
        <span class="d-none d-sm-inline">Создано: </span>{{ formatDate(task.createdAt) }}
        <span v-if="task.completed && task.completedAt" class="d-none d-sm-inline">
          | Завершено: {{ formatDate(task.completedAt) }}
        </span>
      </div>
    </div>
    
    <template v-slot:append>
      <div v-if="isDeletionPending" class="deletion-pending">
        <v-chip color="error" size="small" class="mr-1">
          {{ deletionTimeLeft }}
        </v-chip>
        <v-btn 
          @click="$emit('cancel-deletion')"
          variant="text"
          color="warning"
          size="small"
          class="d-none d-sm-flex"
        >
          Отмена
        </v-btn>
        <v-btn 
          @click="$emit('cancel-deletion')"
          icon
          variant="text"
          color="warning"
          size="small"
          class="d-sm-none"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <div v-else class="action-buttons">
        <v-btn 
          icon 
          @click="$emit('edit')"
          variant="text"
          color="info"
          size="small"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn 
          icon 
          @click="$emit('delete')"
          variant="text"
          color="error"
          size="small"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import type { Task } from '@/types'
import { PRIORITY_COLORS, PRIORITY_ICONS, PRIORITY_LABELS } from '@/types'
import { formatDate } from '@/composables'

defineProps<{
  task: Task
  isDeletionPending: boolean
  deletionTimeLeft: number
}>()

defineEmits<{
  toggle: []
  edit: []
  delete: []
  'cancel-deletion': []
}>()
</script>

<style src="./styles.css" scoped />
