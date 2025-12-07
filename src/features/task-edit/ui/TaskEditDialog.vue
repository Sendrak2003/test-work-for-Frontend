<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500">
    <v-card>
      <v-card-title>Редактировать задачу</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editTitle"
          label="Название"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        />
        <v-select
          v-model="editPriority"
          :items="priorityItems"
          label="Приоритет"
          variant="outlined"
          density="comfortable"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">
          Отмена
        </v-btn>
        <v-btn color="primary" variant="flat" @click="handleSave">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Task, TaskPriority } from '@/entities/task'
import { PRIORITY_LABELS } from '@/entities/task'

const props = defineProps<{
  modelValue: boolean
  task: Task | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [id: number, title: string, priority: TaskPriority]
}>()

const editTitle = ref('')
const editPriority = ref<TaskPriority>('medium')

const priorityItems = Object.entries(PRIORITY_LABELS).map(([value, title]) => ({
  value,
  title
}))

watch(() => props.task, (task) => {
  if (task) {
    editTitle.value = task.title
    editPriority.value = task.priority
  }
}, { immediate: true })

const handleSave = () => {
  if (!props.task || !editTitle.value.trim()) return
  emit('save', props.task.id, editTitle.value.trim(), editPriority.value)
  emit('update:modelValue', false)
}
</script>

