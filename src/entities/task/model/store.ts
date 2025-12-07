import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilter, TaskSort, TaskPriority, DeletionTimer } from './types'
import { STORAGE_KEY, DEFAULT_TASKS } from './types'
import { useActivityStore } from '@/entities/activity'
import {
  StorageService,
  TaskService,
  TaskFilterService,
  ImportExportService
} from '@/shared/lib/services'

const DELETION_DELAY = 5 // секунд

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const currentFilter = ref<TaskFilter>('all')
  const currentSort = ref<TaskSort>('date')
  const searchQuery = ref('')
  
  const deletionTimers = ref<Record<number, DeletionTimer>>({})
  const pendingDeletions = ref<Record<number, boolean>>({})

  const filteredTasks = computed(() => {
    return TaskFilterService.applyFilters(
      tasks.value,
      currentFilter.value,
      currentSort.value,
      searchQuery.value
    )
  })

  const stats = computed(() => {
    return TaskFilterService.calculateStats(tasks.value)
  })

  // Computed для реактивного отслеживания таймеров удаления
  // Доступ к deletionTimers.value и pendingDeletions.value делает это computed реактивным
  const deletionTimersInfo = computed(() => {
    const info: Record<number, { isPending: boolean; timeLeft: number }> = {}
    const timers = deletionTimers.value
    const pending = pendingDeletions.value
    
    tasks.value.forEach(task => {
      info[task.id] = {
        isPending: !!pending[task.id],
        timeLeft: timers[task.id]?.timeLeft ?? DELETION_DELAY
      }
    })
    
    Object.keys(timers).forEach(idStr => {
      const id = Number(idStr)
      if (!info[id]) {
        info[id] = {
          isPending: !!pending[id],
          timeLeft: timers[id]?.timeLeft ?? DELETION_DELAY
        }
      }
    })
    
    return info
  })

  function load() {
    try {
      // Различаем первый запуск и пустой список (пользователь удалил все задачи)
      const hasStoredData = typeof localStorage !== 'undefined' && 
        localStorage.getItem(STORAGE_KEY) !== null
      
      if (!hasStoredData) {
        tasks.value = DEFAULT_TASKS
        save()
        return
      }

      const stored = StorageService.getItem<Task[]>(STORAGE_KEY, [])
      
      if (stored.length === 0) {
        tasks.value = []
        return
      }

      tasks.value = stored.map((t: Task) => ({
        ...t,
        priority: t.priority || 'medium'
      }))
    } catch (error) {
      console.error('Ошибка загрузки задач:', error)
      const hasStoredData = typeof localStorage !== 'undefined' && 
        localStorage.getItem(STORAGE_KEY) !== null
      if (!hasStoredData) {
        tasks.value = DEFAULT_TASKS
      } else {
        tasks.value = []
      }
    }
  }

  function save() {
    try {
      StorageService.setItem(STORAGE_KEY, tasks.value)
    } catch (error) {
      console.error('Ошибка сохранения задач:', error)
    }
  }

  function addTask(title: string, priority: TaskPriority = 'medium') {
    const newTask = TaskService.createTask(title, priority)
    if (!newTask) return false

    tasks.value = TaskService.addTaskToList(tasks.value, newTask)
    save()

    const activityStore = useActivityStore()
    activityStore.addEntry('created', newTask.title)

    return true
  }

  function editTask(id: number, title: string, priority?: TaskPriority) {
    const task = TaskService.findTaskById(tasks.value, id)
    if (!task) return false

    const updatedTask = TaskService.updateTask(task, title, priority)
    if (!updatedTask) return false

    tasks.value = TaskService.updateTaskInList(tasks.value, updatedTask)
    save()

    const activityStore = useActivityStore()
    activityStore.addEntry('edited', updatedTask.title)

    return true
  }

  function toggleTask(id: number) {
    const task = TaskService.findTaskById(tasks.value, id)
    if (!task) return

    const updatedTask = TaskService.toggleTask(task)
    tasks.value = TaskService.updateTaskInList(tasks.value, updatedTask)
    save()

    const activityStore = useActivityStore()
    activityStore.addEntry(
      updatedTask.completed ? 'completed' : 'uncompleted',
      updatedTask.title
    )
  }

  function startDeletion(id: number) {
    pendingDeletions.value = { ...pendingDeletions.value, [id]: true }

    const timerId = window.setInterval(() => {
      const timer = deletionTimers.value[id]
      if (!timer) return

      const newTimeLeft = timer.timeLeft - 1

      if (newTimeLeft <= 0) {
        cleanupDeletion(id)
        executeDelete(id)
        return
      }

      deletionTimers.value = {
        ...deletionTimers.value,
        [id]: {
          ...timer,
          timeLeft: newTimeLeft
        }
      }
    }, 1000)

    deletionTimers.value = {
      ...deletionTimers.value,
      [id]: {
        timerId,
        timeLeft: DELETION_DELAY
      }
    }
  }

  function executeDelete(id: number) {
    const task = TaskService.findTaskById(tasks.value, id)
    if (task) {
      const activityStore = useActivityStore()
      activityStore.addEntry('deleted', task.title)
    }

    tasks.value = TaskService.removeTask(tasks.value, id)
    save()
  }

  function cancelDeletion(id: number) {
    cleanupDeletion(id)
  }

  function cleanupDeletion(id: number) {
    const { [id]: removedPending, ...restPending } = pendingDeletions.value
    pendingDeletions.value = restPending

    const timer = deletionTimers.value[id]
    if (timer) {
      clearInterval(timer.timerId)
      const { [id]: removed, ...rest } = deletionTimers.value
      deletionTimers.value = rest
    }
  }

  function isDeletionPending(id: number) {
    return deletionTimersInfo.value[id]?.isPending ?? false
  }

  function getDeletionTimeLeft(id: number) {
    return deletionTimersInfo.value[id]?.timeLeft ?? DELETION_DELAY
  }

  function getTaskById(id: number) {
    return TaskService.findTaskById(tasks.value, id)
  }

  function dispose() {
    Object.values(deletionTimers.value).forEach(timer => {
      clearInterval(timer.timerId)
    })
    deletionTimers.value = {}
    pendingDeletions.value = {}
  }

  function exportTasks() {
    if (tasks.value.length === 0) {
      throw new Error('Нет задач для экспорта')
    }
    ImportExportService.exportToJSON(tasks.value)
  }

  function importTasks(
    file: File
  ): Promise<{ success: boolean; count: number; error?: string }> {
    return ImportExportService.importFromJSON(file).then((result) => {
      if (result.success) {
        tasks.value = [...tasks.value, ...result.tasks]
        save()

        const activityStore = useActivityStore()
        activityStore.addEntry(
          'created',
          `Импортировано ${result.tasks.length} задач`
        )

        return {
          success: true,
          count: result.tasks.length,
          error: result.error // Предупреждение о частичных ошибках, если есть
        }
      }
      return {
        success: false,
        count: 0,
        error: result.error
      }
    })
  }

  function replaceAllTasks(
    file: File
  ): Promise<{ success: boolean; count: number; error?: string }> {
    return ImportExportService.importFromJSON(file).then((result) => {
      if (result.success) {
        tasks.value = result.tasks
        save()

        const activityStore = useActivityStore()
        activityStore.addEntry(
          'created',
          `Заменено на ${result.tasks.length} задач`
        )

        return {
          success: true,
          count: result.tasks.length,
          error: result.error // Предупреждение о частичных ошибках, если есть
        }
      }
      return {
        success: false,
        count: 0,
        error: result.error
      }
    })
  }

  function exportTasksCSV() {
    if (tasks.value.length === 0) {
      throw new Error('Нет задач для экспорта')
    }
    ImportExportService.exportToCSV(tasks.value)
  }

  function importTasksCSV(
    file: File
  ): Promise<{ success: boolean; count: number; error?: string }> {
    return ImportExportService.importFromCSV(file).then((result) => {
      if (result.success) {
        tasks.value = [...tasks.value, ...result.tasks]
        save()

        const activityStore = useActivityStore()
        activityStore.addEntry(
          'created',
          `Импортировано ${result.tasks.length} задач из CSV`
        )

        return {
          success: true,
          count: result.tasks.length,
          error: result.error // Предупреждение, если есть
        }
      }
      return {
        success: false,
        count: 0,
        error: result.error
      }
    })
  }

  function replaceAllTasksCSV(
    file: File
  ): Promise<{ success: boolean; count: number; error?: string }> {
    return ImportExportService.importFromCSV(file).then((result) => {
      if (result.success) {
        tasks.value = result.tasks
        save()

        const activityStore = useActivityStore()
        activityStore.addEntry(
          'created',
          `Заменено на ${result.tasks.length} задач из CSV`
        )

        return {
          success: true,
          count: result.tasks.length,
          error: result.error // Предупреждение, если есть
        }
      }
      return {
        success: false,
        count: 0,
        error: result.error
      }
    })
  }

  return {
    tasks,
    currentFilter,
    currentSort,
    searchQuery,
    filteredTasks,
    stats,
    load,
    addTask,
    editTask,
    toggleTask,
    startDeletion,
    cancelDeletion,
    isDeletionPending,
    getDeletionTimeLeft,
    getTaskById,
    exportTasks,
    importTasks,
    replaceAllTasks,
    exportTasksCSV,
    importTasksCSV,
    replaceAllTasksCSV,
    dispose
  }
})

