<template>
  <div>
    <Header 
      title="Управление задачами" 
      :dark-mode="settings.darkMode"
      @toggle-theme="settingsStore.toggleDarkMode"
    />

    <v-main>
      <v-container fluid class="pa-2 pa-sm-4">
        <v-row>
          <v-col cols="12" md="7">
            <div class="d-flex align-center justify-space-between mb-4">
              <h1 class="text-h5 text-sm-h4">Мои задачи</h1>
              <ImportExport 
                @success="notification.success"
                @error="notification.error"
              />
            </div>
            
            <TaskFilters 
              v-model="currentFilter"
              v-model:sort-by="currentSort"
              v-model:search-query="searchQuery"
              :stats="stats" 
            />

            <TaskCreateForm @submit="handleAddTask" />
          </v-col>
          
          <v-col cols="12" md="5">
            <ActivityFeed 
              :activities="activityLog"
              @clear="activityStore.clear"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <TaskList
              :tasks="filteredTasks"
              :is-deletion-pending="tasksStore.isDeletionPending"
              :get-deletion-time-left="tasksStore.getDeletionTimeLeft"
              @toggle="tasksStore.toggleTask"
              @edit="openEditDialog"
              @delete="tasksStore.startDeletion"
              @cancel-deletion="tasksStore.cancelDeletion"
            />

            <TaskStatsComponent :stats="stats" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <TaskEditDialog
      v-model="editDialogOpen"
      :task="editingTask"
      @save="handleEditTask"
    />

    <v-snackbar
      v-model="notification.show.value"
      :color="notification.color.value"
      :timeout="notification.timeout.value"
      location="bottom right"
    >
      {{ notification.message.value }}
      <template v-slot:actions>
        <v-btn variant="text" @click="notification.close">
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Header } from '@/shared/ui'
import { TaskCreateForm } from '@/features/task-create'
import { TaskFilters } from '@/features/task-filter'
import { TaskEditDialog } from '@/features/task-edit'
import { ImportExport } from '@/features/task-import-export'
import { TaskList, TaskStatsComponent } from '@/entities/task'
import { ActivityFeed } from '@/widgets/activity-feed'
import { useTasksStore, useActivityStore, useSettingsStore } from '@/entities'
import { useNotification } from '@/shared/lib'
import type { TaskPriority } from '@/entities/task'

const tasksStore = useTasksStore()
const activityStore = useActivityStore()
const settingsStore = useSettingsStore()

const { filteredTasks, stats, currentFilter, currentSort, searchQuery } = storeToRefs(tasksStore)
const { activityLog } = storeToRefs(activityStore)
const { settings } = storeToRefs(settingsStore)

const notification = useNotification()

const editDialogOpen = ref(false)
import type { Task } from '@/entities/task'

const editingTask = ref<Task | undefined>(undefined)

const openEditDialog = (id: number) => {
  editingTask.value = tasksStore.getTaskById(id)
  editDialogOpen.value = true
}

const handleAddTask = (title: string, priority: TaskPriority) => {
  if (tasksStore.addTask(title, priority)) {
    notification.success('Задача создана')
  }
}

const handleEditTask = (id: number, title: string, priority: TaskPriority) => {
  if (tasksStore.editTask(id, title, priority)) {
    notification.info('Задача обновлена')
  }
}

onMounted(() => {
  settingsStore.load()
  tasksStore.load()
  activityStore.load()
})
</script>

