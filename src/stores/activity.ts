import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ActivityEntry, ActivityAction } from '@/types'
import { STORAGE_KEYS } from '@/types'

const MAX_ENTRIES = 50

export const useActivityStore = defineStore('activity', () => {
  const activityLog = ref<ActivityEntry[]>([])

  function load() {
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

  function save() {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activityLog.value))
    } catch (error) {
      console.error('Ошибка сохранения истории активности:', error)
    }
  }

  function addEntry(action: ActivityAction, taskTitle: string) {
    const entry: ActivityEntry = {
      action,
      taskTitle,
      timestamp: new Date().toISOString()
    }

    activityLog.value.unshift(entry)

    if (activityLog.value.length > MAX_ENTRIES) {
      activityLog.value = activityLog.value.slice(0, MAX_ENTRIES)
    }

    save()
  }

  function clear() {
    activityLog.value = []
    save()
  }

  return {
    activityLog,
    load,
    addEntry,
    clear
  }
})

