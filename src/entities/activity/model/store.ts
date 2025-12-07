import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ActivityEntry, ActivityAction } from './types'
import { STORAGE_KEY } from './types'
import { StorageService, ActivityService } from '@/shared/lib/services'

export const useActivityStore = defineStore('activity', () => {
  const activityLog = ref<ActivityEntry[]>([])

  function load() {
    try {
      activityLog.value = StorageService.getItem<ActivityEntry[]>(
        STORAGE_KEY,
        []
      )
    } catch (error) {
      console.error('Ошибка загрузки истории активности:', error)
      activityLog.value = []
    }
  }

  function save() {
    try {
      StorageService.setItem(STORAGE_KEY, activityLog.value)
    } catch (error) {
      console.error('Ошибка сохранения истории активности:', error)
    }
  }

  function addEntry(action: ActivityAction, taskTitle: string) {
    activityLog.value = ActivityService.addEntry(
      activityLog.value,
      action,
      taskTitle
    )
    save()
  }

  function clear() {
    activityLog.value = ActivityService.clear()
    save()
  }

  return {
    activityLog,
    load,
    addEntry,
    clear
  }
})

