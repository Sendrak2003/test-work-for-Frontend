import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilter, TaskSort, TaskPriority, DeletionTimer } from '@/types'
import { STORAGE_KEYS, DEFAULT_TASKS } from '@/types'
import { useActivityStore } from './activity'

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const currentFilter = ref<TaskFilter>('all')
  const currentSort = ref<TaskSort>('date')
  const searchQuery = ref('')
  const pendingDeletions = ref<Set<number>>(new Set())
  const deletionTimers = ref<Record<number, DeletionTimer>>({})

  const filteredTasks = computed(() => {
    let result = tasks.value

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(t => t.title.toLowerCase().includes(query))
    }

    switch (currentFilter.value) {
      case 'active':
        result = result.filter(t => !t.completed)
        break
      case 'completed':
        result = result.filter(t => t.completed)
        break
    }

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

  function load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS)
      if (stored) {
        const parsed = JSON.parse(stored)
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

  function save() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks.value))
    } catch (error) {
      console.error('Ошибка сохранения задач:', error)
    }
  }

  function addTask(title: string, priority: TaskPriority = 'medium') {
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
    save()
    
    const activityStore = useActivityStore()
    activityStore.addEntry('created', trimmedTitle)
    
    return true
  }

  function editTask(id: number, title: string, priority?: TaskPriority) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return false

    const trimmedTitle = title.trim()
    if (!trimmedTitle) return false

    task.title = trimmedTitle
    if (priority) {
      task.priority = priority
    }
    task.updatedAt = new Date().toISOString()
    save()

    const activityStore = useActivityStore()
    activityStore.addEntry('edited', trimmedTitle)
    
    return true
  }

  function toggleTask(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    const now = new Date().toISOString()
    task.completed = !task.completed
    task.updatedAt = now
    task.completedAt = task.completed ? now : null
    save()

    const activityStore = useActivityStore()
    activityStore.addEntry(task.completed ? 'completed' : 'uncompleted', task.title)
  }

  function startDeletion(id: number) {
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

  function executeDelete(id: number) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      const activityStore = useActivityStore()
      activityStore.addEntry('deleted', task.title)
    }

    tasks.value = tasks.value.filter(t => t.id !== id)
    save()
    cleanupDeletion(id)
  }

  function cancelDeletion(id: number) {
    cleanupDeletion(id)
  }

  function cleanupDeletion(id: number) {
    pendingDeletions.value.delete(id)

    const timer = deletionTimers.value[id]
    if (timer) {
      clearInterval(timer.timerId)
      delete deletionTimers.value[id]
    }
  }

  function isDeletionPending(id: number) {
    return pendingDeletions.value.has(id)
  }

  function getDeletionTimeLeft(id: number) {
    return deletionTimers.value[id]?.timeLeft || 5
  }

  function getTaskById(id: number) {
    return tasks.value.find(t => t.id === id)
  }

  function $dispose() {
    Object.values(deletionTimers.value).forEach(timer => {
      clearInterval(timer.timerId)
    })
  }

  function exportTasks() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: tasks.value
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function importTasks(file: File): Promise<{ success: boolean; count: number; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const data = JSON.parse(content)
          
          if (!data.tasks || !Array.isArray(data.tasks)) {
            resolve({ success: false, count: 0, error: 'Неверный формат файла' })
            return
          }
          
          const importedTasks: Task[] = data.tasks.map((t: Partial<Task>) => ({
            id: t.id || Date.now() + Math.random(),
            title: t.title || 'Без названия',
            completed: t.completed || false,
            priority: t.priority || 'medium',
            createdAt: t.createdAt || new Date().toISOString(),
            updatedAt: t.updatedAt || new Date().toISOString(),
            completedAt: t.completedAt || null
          }))
          
          const now = Date.now()
          importedTasks.forEach((task, index) => {
            task.id = now + index
          })
          
          tasks.value = [...tasks.value, ...importedTasks]
          save()
          
          const activityStore = useActivityStore()
          activityStore.addEntry('created', `Импортировано ${importedTasks.length} задач`)
          
          resolve({ success: true, count: importedTasks.length })
        } catch {
          resolve({ success: false, count: 0, error: 'Ошибка чтения файла' })
        }
      }
      
      reader.onerror = () => {
        resolve({ success: false, count: 0, error: 'Ошибка загрузки файла' })
      }
      
      reader.readAsText(file)
    })
  }

  function replaceAllTasks(file: File): Promise<{ success: boolean; count: number; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const data = JSON.parse(content)
          
          if (!data.tasks || !Array.isArray(data.tasks)) {
            resolve({ success: false, count: 0, error: 'Неверный формат файла' })
            return
          }
          
          const importedTasks: Task[] = data.tasks.map((t: Partial<Task>, index: number) => ({
            id: Date.now() + index,
            title: t.title || 'Без названия',
            completed: t.completed || false,
            priority: t.priority || 'medium',
            createdAt: t.createdAt || new Date().toISOString(),
            updatedAt: t.updatedAt || new Date().toISOString(),
            completedAt: t.completedAt || null
          }))
          
          tasks.value = importedTasks
          save()
          
          const activityStore = useActivityStore()
          activityStore.addEntry('created', `Заменено на ${importedTasks.length} задач`)
          
          resolve({ success: true, count: importedTasks.length })
        } catch {
          resolve({ success: false, count: 0, error: 'Ошибка чтения файла' })
        }
      }
      
      reader.onerror = () => {
        resolve({ success: false, count: 0, error: 'Ошибка загрузки файла' })
      }
      
      reader.readAsText(file)
    })
  }

  function exportTasksCSV() {
    const headers = ['Название', 'Статус', 'Приоритет', 'Создано', 'Обновлено', 'Завершено']
    const priorityLabels: Record<TaskPriority, string> = {
      low: 'Низкий',
      medium: 'Средний', 
      high: 'Высокий'
    }
    
    const rows = tasks.value.map(task => [
      `"${task.title.replace(/"/g, '""')}"`,
      task.completed ? 'Завершено' : 'Активно',
      priorityLabels[task.priority],
      formatDateCSV(task.createdAt),
      formatDateCSV(task.updatedAt),
      task.completedAt ? formatDateCSV(task.completedAt) : ''
    ])
    
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function formatDateCSV(isoDate: string): string {
    const date = new Date(isoDate)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function importTasksCSV(file: File): Promise<{ success: boolean; count: number; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split('\n').filter(line => line.trim())
          
          if (lines.length < 2) {
            resolve({ success: false, count: 0, error: 'Файл пуст или содержит только заголовки' })
            return
          }
          
          const dataLines = lines.slice(1)
          const now = Date.now()
          
          const importedTasks: Task[] = dataLines.map((line, index) => {
            const cols = parseCSVLine(line)
            const title = cols[0]?.replace(/^"|"$/g, '').replace(/""/g, '"') || 'Без названия'
            const statusText = cols[1]?.trim().toLowerCase() || ''
            const priorityText = cols[2]?.trim().toLowerCase() || ''
            
            let priority: TaskPriority = 'medium'
            if (priorityText.includes('высок') || priorityText === 'high') priority = 'high'
            else if (priorityText.includes('низк') || priorityText === 'low') priority = 'low'
            
            const completed = statusText.includes('заверш') || statusText === 'completed'
            const nowISO = new Date().toISOString()
            
            return {
              id: now + index,
              title,
              completed,
              priority,
              createdAt: nowISO,
              updatedAt: nowISO,
              completedAt: completed ? nowISO : null
            }
          })
          
          tasks.value = [...tasks.value, ...importedTasks]
          save()
          
          const activityStore = useActivityStore()
          activityStore.addEntry('created', `Импортировано ${importedTasks.length} задач из CSV`)
          
          resolve({ success: true, count: importedTasks.length })
        } catch {
          resolve({ success: false, count: 0, error: 'Ошибка чтения CSV файла' })
        }
      }
      
      reader.onerror = () => {
        resolve({ success: false, count: 0, error: 'Ошибка загрузки файла' })
      }
      
      reader.readAsText(file)
    })
  }

  function replaceAllTasksCSV(file: File): Promise<{ success: boolean; count: number; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split('\n').filter(line => line.trim())
          
          if (lines.length < 2) {
            resolve({ success: false, count: 0, error: 'Файл пуст или содержит только заголовки' })
            return
          }
          
          const dataLines = lines.slice(1)
          const now = Date.now()
          
          const importedTasks: Task[] = dataLines.map((line, index) => {
            const cols = parseCSVLine(line)
            const title = cols[0]?.replace(/^"|"$/g, '').replace(/""/g, '"') || 'Без названия'
            const statusText = cols[1]?.trim().toLowerCase() || ''
            const priorityText = cols[2]?.trim().toLowerCase() || ''
            
            let priority: TaskPriority = 'medium'
            if (priorityText.includes('высок') || priorityText === 'high') priority = 'high'
            else if (priorityText.includes('низк') || priorityText === 'low') priority = 'low'
            
            const completed = statusText.includes('заверш') || statusText === 'completed'
            const nowISO = new Date().toISOString()
            
            return {
              id: now + index,
              title,
              completed,
              priority,
              createdAt: nowISO,
              updatedAt: nowISO,
              completedAt: completed ? nowISO : null
            }
          })
          
          tasks.value = importedTasks
          save()
          
          const activityStore = useActivityStore()
          activityStore.addEntry('created', `Заменено на ${importedTasks.length} задач из CSV`)
          
          resolve({ success: true, count: importedTasks.length })
        } catch {
          resolve({ success: false, count: 0, error: 'Ошибка чтения CSV файла' })
        }
      }
      
      reader.onerror = () => {
        resolve({ success: false, count: 0, error: 'Ошибка загрузки файла' })
      }
      
      reader.readAsText(file)
    })
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if ((char === ';' || char === ',') && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
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
    $dispose
  }
})

