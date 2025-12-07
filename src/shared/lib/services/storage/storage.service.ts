/**
 * Сервис для работы с localStorage
 */
export class StorageService {
  /**
   * Сохранить данные в localStorage
   */
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Ошибка сохранения в localStorage (${key}):`, error)
      throw error
    }
  }

  /**
   * Получить данные из localStorage
   */
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored) as T
      }
      return defaultValue
    } catch (error) {
      console.error(`Ошибка чтения из localStorage (${key}):`, error)
      return defaultValue
    }
  }

  /**
   * Удалить данные из localStorage
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Ошибка удаления из localStorage (${key}):`, error)
    }
  }

  /**
   * Очистить все данные из localStorage
   */
  static clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Ошибка очистки localStorage:', error)
    }
  }
}

