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
        
        <v-list-item @click="openImportDialog('replace', 'json')">
          <template v-slot:prepend>
            <v-icon color="warning">mdi-file-replace</v-icon>
          </template>
          <v-list-item-title>Заменить все (JSON)</v-list-item-title>
          <v-list-item-subtitle>Удалит текущие задачи</v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item @click="openImportDialog('replace', 'csv')">
          <template v-slot:prepend>
            <v-icon color="warning">mdi-file-replace</v-icon>
          </template>
          <v-list-item-title>Заменить все (CSV)</v-list-item-title>
          <v-list-item-subtitle>Удалит текущие задачи</v-list-item-subtitle>
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
          <v-icon start color="warning">mdi-alert</v-icon>
          Подтверждение
        </v-card-title>
        <v-card-text>
          Вы уверены, что хотите заменить все текущие задачи? 
          Это действие нельзя отменить.
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
import { useTasksStore } from '@/stores'

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
  tasksStore.exportTasks()
  emit('success', 'Экспортировано в JSON')
}

function handleExportCSV() {
  tasksStore.exportTasksCSV()
  emit('success', 'Экспортировано в CSV')
}

function openImportDialog(mode: 'add' | 'replace', format: 'json' | 'csv') {
  importMode.value = mode
  importFormat.value = format
  
  if (format === 'json') {
    jsonFileInput.value?.click()
  } else {
    csvFileInput.value?.click()
  }
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  if (importMode.value === 'replace') {
    pendingFile.value = file
    confirmDialog.value = true
  } else {
    await performImport(file)
  }
  
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
  let result: { success: boolean; count: number; error?: string }
  
  if (importFormat.value === 'csv') {
    if (importMode.value === 'replace') {
      result = await tasksStore.replaceAllTasksCSV(file)
    } else {
      result = await tasksStore.importTasksCSV(file)
    }
  } else {
    if (importMode.value === 'replace') {
      result = await tasksStore.replaceAllTasks(file)
    } else {
      result = await tasksStore.importTasks(file)
    }
  }
  
  if (result.success) {
    emit('success', `Импортировано ${result.count} задач`)
  } else {
    emit('error', result.error || 'Ошибка импорта')
  }
}
</script>

<style scoped>
.import-export {
  display: inline-flex;
}
</style>
