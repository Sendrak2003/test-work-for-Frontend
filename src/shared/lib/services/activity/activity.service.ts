import type { ActivityEntry, ActivityAction } from '@/entities/activity'

const MAX_ENTRIES = 50

/**
 * Сервис для работы с лентой активности
 */
export class ActivityService {
  /**
   * Создать запись активности
   */
  static createEntry(
    action: ActivityAction,
    taskTitle: string
  ): ActivityEntry {
    return {
      action,
      taskTitle,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Добавить запись в ленту активности с ограничением размера
   */
  static addEntry(
    entries: ActivityEntry[],
    action: ActivityAction,
    taskTitle: string
  ): ActivityEntry[] {
    const newEntry = this.createEntry(action, taskTitle)
    const updated = [newEntry, ...entries]

    if (updated.length > MAX_ENTRIES) {
      return updated.slice(0, MAX_ENTRIES)
    }

    return updated
  }

  /**
   * Очистить ленту активности
   */
  static clear(): ActivityEntry[] {
    return []
  }
}

