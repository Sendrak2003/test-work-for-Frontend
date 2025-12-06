import { ref, computed, watch, onUnmounted } from 'vue'
import type { Task, TaskFilter, TaskSort, TaskPriority, DeletionTimer } from '@/types'
import { STORAGE_KEYS, DEFAULT_TASKS } from '@/types'

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2
}

export function useTasks(onActivity?: (action: 'created' | 'completed' | 'uncompleted' | 'deleted' | 'edited', title: string) => void) {
  const tasks = ref<Task[]>([])
  const currentFilter = ref<TaskFilter>('all')
  const currentSort = ref<TaskSort>('date')
  const searchQuery = ref('')
  const pendingDeletions = ref<Set<number>>(new Set())
  const deletionTimers = ref<Record<number, DeletionTimer>>({})

  // ==================== COMPUTED ====================
  const filteredTasks = computed(() => {
    let result = tasks.value

    // Поиск
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(t => t.title.toLowerCase().includes(query))
    }

    // Фильтр по статусу
    switch (currentFilter.value) {
      case 'active':
        result = result.filter(t => !t.completed)
        break
      case 'completed':
        result = result.filter(t => t.completed)
        break
    }

    // Сортировка
    result = [...result].sort((a, b) => {
      switch (currentSort.value) {
        case 'priority':
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        case 'name':
          return a.title.localeCompare(b.title, 'ru')
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  })

  const stats = computed(() => {
    const total = tasks.value.length
    const completed = tasks.value.filter(t => t.completed).length
    const active = total - completed
    const percentage = total > 0 ? (completed / total * 100).toFixed(1) : '0.0'
    return { total, active, completed, percentage }
  })

  // ==================== STORAGE ====================
  const load = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Миграция старых задач без приоритета
        tasks.value = parsed.map((t: Task) => ({
          ...t,
          priority: t.priority || 'medium'
        }))
      } else {
        tasks.value = DEFAULT_TASKS
      }
    } catch (error) {
      console.error('Ошибка загрузки задач:', error)
      tasks.value = DEFAULT_TASKS
    }
  }

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks.value))
    } catch (error) {
      console.error('Ошибка сохранения задач:', error)
    }
  }

  // ==================== CRUD ====================
  const addTask = (title: string, priority: TaskPriority = 'medium') => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return false

    const now = new Date().toISOString()
    const newTask: Task = {
      id: Date.now(),
      title: trimmedTitle,
      completed: false,
      priority,
      createdAt: now,
      updatedAt: now,
      completedAt: null
    }

    tasks.value.push(newTask)
    onActivity?.('created', trimmedTitle)
    return true
  }

  const editTask = (id: number, title: string, priority?: TaskPriority) => {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return false

    const trimmedTitle = title.trim()
    if (!trimmedTitle) return false

    task.title = trimmedTitle
    if (priority) {
      task.priority = priority
    }
    task.updatedAt = new Date().toISOString()

    onActivity?.('edited', trimmedTitle)
    return true
  }

  const toggleTask = (id: number) => {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    const now = new Date().toISOString()
    task.completed = !task.completed
    task.updatedAt = now
    task.completedAt = task.completed ? now : null

    onActivity?.(task.completed ? 'completed' : 'uncompleted', task.title)
  }

  // ==================== DELETION ====================
  const startDeletion = (id: number) => {
    pendingDeletions.value.add(id)

    const timerId = window.setInterval(() => {
      const timer = deletionTimers.value[id]
      if (!timer) return

      timer.timeLeft--

      if (timer.timeLeft <= 0) {
        executeDelete(id)
      }
    }, 1000)

    deletionTimers.value[id] = {
      timerId,
      timeLeft: 5
    }
  }

  const executeDelete = (id: number) => {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      onActivity?.('deleted', task.title)
    }

    tasks.value = tasks.value.filter(t => t.id !== id)
    cleanupDeletion(id)
  }

  const cancelDeletion = (id: number) => {
    cleanupDeletion(id)
  }

  const cleanupDeletion = (id: number) => {
    pendingDeletions.value.delete(id)

    const timer = deletionTimers.value[id]
    if (timer) {
      clearInterval(timer.timerId)
      delete deletionTimers.value[id]
    }
  }

  const isDeletionPending = (id: number) => pendingDeletions.value.has(id)
  
  const getDeletionTimeLeft = (id: number) => deletionTimers.value[id]?.timeLeft || 5

  // ==================== GETTERS ====================
  const getTaskById = (id: number) => tasks.value.find(t => t.id === id)

  // ==================== WATCHERS & CLEANUP ====================
  watch(tasks, save, { deep: true })

  onUnmounted(() => {
    Object.values(deletionTimers.value).forEach(timer => {
      clearInterval(timer.timerId)
    })
  })

  return {
    tasks,
    filteredTasks,
    stats,
    currentFilter,
    currentSort,
    searchQuery,
    load,
    addTask,
    editTask,
    toggleTask,
    startDeletion,
    cancelDeletion,
    isDeletionPending,
    getDeletionTimeLeft,
    getTaskById
  }
}
