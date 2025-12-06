import { ref, watch } from 'vue'
import type { ActivityEntry, ActivityAction } from '@/types'
import { STORAGE_KEYS } from '@/types'

const MAX_ENTRIES = 50

export function useActivityLog() {
  const activityLog = ref<ActivityEntry[]>([])

  // Загрузка из localStorage
  const load = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY)
      if (stored) {
        activityLog.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Ошибка загрузки истории активности:', error)
      activityLog.value = []
    }
  }

  // Сохранение в localStorage
  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activityLog.value))
    } catch (error) {
      console.error('Ошибка сохранения истории активности:', error)
    }
  }

  // Добавить запись
  const addEntry = (action: ActivityAction, taskTitle: string) => {
    const entry: ActivityEntry = {
      action,
      taskTitle,
      timestamp: new Date().toISOString()
    }
    
    activityLog.value.unshift(entry)
    
    // Ограничиваем количество записей
    if (activityLog.value.length > MAX_ENTRIES) {
      activityLog.value = activityLog.value.slice(0, MAX_ENTRIES)
    }
  }

  // Очистить историю
  const clear = () => {
    activityLog.value = []
  }

  // Автосохранение при изменениях
  watch(activityLog, save, { deep: true })

  return {
    activityLog,
    load,
    addEntry,
    clear
  }
}

