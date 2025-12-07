<template>
  <div class="import-export">
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="outlined"
          color="primary"
          size="small"
        >
          <v-icon start>mdi-swap-vertical</v-icon>
          <span class="d-none d-sm-inline">Данные</span>
        </v-btn>
      </template>
      
      <v-list density="compact">
        <v-list-subheader>Экспорт</v-list-subheader>
        
        <v-list-item @click="handleExportJSON">
          <template v-slot:prepend>
            <v-icon color="success">mdi-code-json</v-icon>
          </template>
          <v-list-item-title>Экспорт JSON</v-list-item-title>
          <v-list-item-subtitle>Полные данные</v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item @click="handleExportCSV">
          <template v-slot:prepend>
            <v-icon color="success">mdi-file-delimited</v-icon>
          </template>
          <v-list-item-title>Экспорт CSV</v-list-item-title>
          <v-list-item-subtitle>Для Excel</v-list-item-subtitle>
        </v-list-item>
        
        <v-divider />
        
        <v-list-subheader>Импорт</v-list-subheader>
        
        <v-list-item @click="openImportDialog('add', 'json')">
          <template v-slot:prepend>
            <v-icon color="info">mdi-code-json</v-icon>
          </template>
          <v-list-item-title>Импорт JSON</v-list-item-title>
          <v-list-item-subtitle>Добавить задачи</v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item @click="openImportDialog('add', 'csv')">
          <template v-slot:prepend>
            <v-icon color="info">mdi-file-delimited</v-icon>
          </template>
          <v-list-item-title>Импорт CSV</v-list-item-title>
          <v-list-item-subtitle>Добавить задачи</v-list-item-subtitle>
        </v-list-item>
        
        <v-divider />
        
        <v-list-item @click="openImportDialog('replace', 'json')" color="warning">
          <template v-slot:prepend>
            <v-icon color="warning">mdi-code-json</v-icon>
          </template>
          <v-list-item-title>Заменить JSON</v-list-item-title>
          <v-list-item-subtitle>Заменить все задачи</v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item @click="openImportDialog('replace', 'csv')" color="warning">
          <template v-slot:prepend>
            <v-icon color="warning">mdi-file-delimited</v-icon>
          </template>
          <v-list-item-title>Заменить CSV</v-list-item-title>
          <v-list-item-subtitle>Заменить все задачи</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-menu>
    
    <input
      ref="jsonFileInput"
      type="file"
      accept=".json,application/json"
      style="display: none"
      @change="handleFileSelect"
    />
    <input
      ref="csvFileInput"
      type="file"
      accept=".csv,text/csv"
      style="display: none"
      @change="handleFileSelect"
    />
    
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-warning">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Внимание!
        </v-card-title>
        <v-card-text>
          Вы уверены, что хотите заменить все существующие задачи? Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Отмена</v-btn>
          <v-btn color="warning" variant="flat" @click="confirmReplace">Заменить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTasksStore } from '@/entities/task'

const emit = defineEmits<{
  success: [message: string]
  error: [message: string]
}>()

const tasksStore = useTasksStore()

const jsonFileInput = ref<HTMLInputElement | null>(null)
const csvFileInput = ref<HTMLInputElement | null>(null)
const importMode = ref<'add' | 'replace'>('add')
const importFormat = ref<'json' | 'csv'>('json')
const confirmDialog = ref(false)
const pendingFile = ref<File | null>(null)

function handleExportJSON() {
  try {
    tasksStore.exportTasks()
    emit('success', 'Экспортировано в JSON')
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Нет задач для экспорта')
  }
}

function handleExportCSV() {
  try {
    tasksStore.exportTasksCSV()
    emit('success', 'Экспортировано в CSV')
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Нет задач для экспорта')
  }
}

function openImportDialog(mode: 'add' | 'replace', format: 'json' | 'csv') {
  importMode.value = mode
  importFormat.value = format
  
  if (format === 'json') {
    jsonFileInput.value?.click()
    return
  }
  
  csvFileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  if (importMode.value === 'replace') {
    pendingFile.value = file
    confirmDialog.value = true
    input.value = ''
    return
  }
  
  await performImport(file)
  input.value = ''
}

async function confirmReplace() {
  confirmDialog.value = false
  if (pendingFile.value) {
    await performImport(pendingFile.value)
    pendingFile.value = null
  }
}

async function performImport(file: File) {
  const isReplace = importMode.value === 'replace'
  let result: { success: boolean; count: number; error?: string }
  
  if (importFormat.value === 'csv') {
    result = isReplace
      ? await tasksStore.replaceAllTasksCSV(file)
      : await tasksStore.importTasksCSV(file)
  } else if (importFormat.value === 'json') {
    result = isReplace
      ? await tasksStore.replaceAllTasks(file)
      : await tasksStore.importTasks(file)
  } else {
    emit('error', 'Неподдерживаемый формат файла')
    return
  }
  
  if (!result.success) {
    emit('error', result.error || 'Ошибка импорта')
    return
  }
  
  if (result.error) {
    emit('success', `Импортировано ${result.count} задач. Предупреждение: ${result.error}`)
    return
  }
  
  emit('success', `Импортировано ${result.count} задач`)
}
</script>

<style scoped>
.import-export {
  display: inline-block;
}
</style>

