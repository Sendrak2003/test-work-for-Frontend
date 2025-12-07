<template>
  <v-card class="mb-4" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-plus-circle</v-icon>
      Добавить задачу
    </v-card-title>
    
    <v-card-text>
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="title"
          label="Название задачи"
          variant="outlined"
          density="comfortable"
          :rules="showValidation ? [rules.required] : []"
          autofocus
          @keydown.enter.prevent="handleSubmit"
        />
        
        <v-select
          v-model="priority"
          :items="priorityItems"
          label="Приоритет"
          variant="outlined"
          density="comfortable"
          class="mt-3"
        />
        
        <v-btn
          type="submit"
          color="primary"
          variant="flat"
          block
          class="mt-4"
        >
          Добавить
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TaskPriority } from '@/entities/task'
import { PRIORITY_LABELS } from '@/entities/task'
import type { VForm } from 'vuetify/components'

const emit = defineEmits<{
  submit: [title: string, priority: TaskPriority]
}>()

const title = ref('')
const priority = ref<TaskPriority>('medium')
const formRef = ref<VForm | null>(null)
const showValidation = ref(false)

const priorityItems = [
  { value: 'low', title: PRIORITY_LABELS.low },
  { value: 'medium', title: PRIORITY_LABELS.medium },
  { value: 'high', title: PRIORITY_LABELS.high }
]

const rules = {
  required: (v: string) => !!v || 'Обязательное поле'
}

async function handleSubmit() {
  showValidation.value = true
  
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  
  if (!valid) {
    return
  }

  const trimmedTitle = title.value.trim()
  if (!trimmedTitle) return

  emit('submit', trimmedTitle, priority.value)
  title.value = ''
  priority.value = 'medium'
  showValidation.value = false
  formRef.value?.resetValidation()
}
</script>

