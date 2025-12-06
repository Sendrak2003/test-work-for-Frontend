<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit" class="mb-6" validate-on="submit">
    <v-row dense>
      <v-col cols="12" sm="7">
        <v-text-field
          v-model="title"
          label="Новая задача"
          :rules="titleRules"
          variant="outlined"
          density="comfortable"
          :error-messages="titleError"
        />
      </v-col>
      <v-col cols="12" sm="5">
        <v-select
          v-model="priority"
          :items="priorityItems"
          label="Приоритет"
          :rules="priorityRules"
          variant="outlined"
          density="comfortable"
          :error-messages="priorityError"
        />
      </v-col>
    </v-row>
    <v-btn type="submit" color="primary" class="mt-2">
      Добавить
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TaskPriority } from '@/types'
import { PRIORITY_LABELS } from '@/types'

const emit = defineEmits<{
  submit: [title: string, priority: TaskPriority]
}>()

const formRef = ref()
const title = ref('')
const priority = ref<TaskPriority | null>(null)
const titleError = ref('')
const priorityError = ref('')

const priorityItems = Object.entries(PRIORITY_LABELS).map(([value, title]) => ({
  value,
  title
}))

const titleRules = [
  (v: string) => !!v?.trim() || 'Введите название задачи'
]

const priorityRules = [
  (v: TaskPriority | null) => !!v || 'Выберите приоритет'
]

const handleSubmit = async () => {
  titleError.value = ''
  priorityError.value = ''
  
  const trimmedTitle = title.value.trim()
  
  // Валидация
  let hasError = false
  
  if (!trimmedTitle) {
    titleError.value = 'Введите название задачи'
    hasError = true
  }
  
  if (!priority.value) {
    priorityError.value = 'Выберите приоритет'
    hasError = true
  }
  
  if (hasError) return
  
  emit('submit', trimmedTitle, priority.value!)
  title.value = ''
  priority.value = null
  titleError.value = ''
  priorityError.value = ''
}
</script>
