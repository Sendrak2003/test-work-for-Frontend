import type { Task, TaskPriority } from '@/entities/task'
import { CsvParserService } from './csv-parser.service'

interface ExportData {
  version: number
  exportedAt: string
  tasks: Task[]
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_TASKS_COUNT = 10000
const PROCESSING_TIMEOUT = 30000 // 30 секунд

/**
 * Сервис для импорта и экспорта задач
 */
export class ImportExportService {
  /**
   * Валидация размера файла
   */
  private static validateFileSize(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }
    if (file.size === 0) {
      return {
        valid: false,
        error: 'Файл пуст'
      }
    }
    return { valid: true }
  }

  /**
   * Валидация типа файла
   */
  private static validateFileType(
    file: File,
    expectedType: 'json' | 'csv'
  ): { valid: boolean; error?: string } {
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split('.').pop()

    if (expectedType === 'json') {
      const isValidExtension = fileExtension === 'json'
      const isValidMime =
        file.type === 'application/json' || file.type === 'text/json' || file.type === ''

      if (!isValidExtension && !isValidMime) {
        return {
          valid: false,
          error: 'Неверный тип файла. Ожидается JSON файл (.json)'
        }
      }
    } else if (expectedType === 'csv') {
      const isValidExtension = fileExtension === 'csv'
      const isValidMime =
        file.type === 'text/csv' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === ''

      if (!isValidExtension && !isValidMime) {
        return {
          valid: false,
          error: 'Неверный тип файла. Ожидается CSV файл (.csv)'
        }
      }
    }

    return { valid: true }
  }

  /**
   * Валидация структуры задачи
   */
  private static validateTask(task: unknown, index: number): {
    valid: boolean
    task?: Task
    error?: string
  } {
    if (!task || typeof task !== 'object') {
      return {
        valid: false,
        error: `Задача #${index + 1}: не является объектом`
      }
    }

    const t = task as Partial<Task>

    if (t.title !== undefined) {
      if (typeof t.title !== 'string') {
        return {
          valid: false,
          error: `Задача #${index + 1}: поле "title" должно быть строкой`
        }
      }
      if (t.title.trim().length === 0) {
        return {
          valid: false,
          error: `Задача #${index + 1}: поле "title" не может быть пустым`
        }
      }
      if (t.title.length > 500) {
        return {
          valid: false,
          error: `Задача #${index + 1}: поле "title" слишком длинное (максимум 500 символов)`
        }
      }
    }

    if (t.priority !== undefined) {
      const validPriorities: TaskPriority[] = ['low', 'medium', 'high']
      if (!validPriorities.includes(t.priority as TaskPriority)) {
        return {
          valid: false,
          error: `Задача #${index + 1}: неверное значение приоритета. Допустимые: low, medium, high`
        }
      }
    }

    if (t.completed !== undefined && typeof t.completed !== 'boolean') {
      return {
        valid: false,
        error: `Задача #${index + 1}: поле "completed" должно быть булевым значением`
      }
    }

    const dateFields = ['createdAt', 'updatedAt', 'completedAt'] as const
    for (const field of dateFields) {
      if (t[field] !== undefined && t[field] !== null) {
        if (typeof t[field] !== 'string') {
          return {
            valid: false,
            error: `Задача #${index + 1}: поле "${field}" должно быть строкой`
          }
        }
        const date = new Date(t[field] as string)
        if (isNaN(date.getTime())) {
          return {
            valid: false,
            error: `Задача #${index + 1}: неверный формат даты в поле "${field}"`
          }
        }
      }
    }

    const now = Date.now()
    const nowISO = new Date().toISOString()

    const validTask: Task = {
      id: typeof t.id === 'number' && t.id > 0 ? t.id : now + index,
      title: (t.title?.trim() || 'Без названия').slice(0, 500),
      completed: t.completed ?? false,
      priority: (t.priority as TaskPriority) || 'medium',
      createdAt: t.createdAt || nowISO,
      updatedAt: t.updatedAt || nowISO,
      completedAt: t.completedAt || null
    }

    return { valid: true, task: validTask }
  }

  /**
   * Валидация массива задач
   */
  private static validateTasksArray(
    tasks: unknown
  ): { valid: boolean; tasks?: Task[]; error?: string } {
    if (!Array.isArray(tasks)) {
      return {
        valid: false,
        error: 'Поле "tasks" должно быть массивом'
      }
    }

    if (tasks.length === 0) {
      return {
        valid: false,
        error: 'Файл не содержит задач'
      }
    }

    if (tasks.length > MAX_TASKS_COUNT) {
      return {
        valid: false,
        error: `Слишком много задач. Максимум: ${MAX_TASKS_COUNT}`
      }
    }

    const validTasks: Task[] = []
    const errors: string[] = []

    for (let i = 0; i < tasks.length; i++) {
      const validation = this.validateTask(tasks[i], i)
      if (!validation.valid) {
        errors.push(validation.error || `Задача #${i + 1}: неизвестная ошибка`)
        continue
      }
      if (validation.task) {
        validTasks.push(validation.task)
      }
    }

    if (validTasks.length === 0) {
      return {
        valid: false,
        error: `Не удалось импортировать ни одной задачи. Ошибки:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... и еще ${errors.length - 5} ошибок` : ''}`
      }
    }

    if (errors.length > 0) {
      return {
        valid: true,
        tasks: validTasks,
        error: `Импортировано ${validTasks.length} из ${tasks.length} задач. Ошибки в ${errors.length} задачах:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n... и еще ${errors.length - 3} ошибок` : ''}`
      }
    }

    return { valid: true, tasks: validTasks }
  }
  /**
   * Экспорт задач в JSON
   */
  static exportToJSON(tasks: Task[]): void {
    const data: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Экспорт задач в CSV
   */
  static exportToCSV(tasks: Task[]): void {
    const csv = CsvParserService.tasksToCSV(tasks)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Импорт задач из JSON файла
   */
  static async importFromJSON(
    file: File
  ): Promise<{ success: boolean; tasks: Task[]; error?: string }> {
    const sizeValidation = this.validateFileSize(file)
    if (!sizeValidation.valid) {
      return {
        success: false,
        tasks: [],
        error: sizeValidation.error
      }
    }

    const typeValidation = this.validateFileType(file, 'json')
    if (!typeValidation.valid) {
      return {
        success: false,
        tasks: [],
        error: typeValidation.error
      }
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          tasks: [],
          error: `Превышено время ожидания обработки файла (${PROCESSING_TIMEOUT / 1000} секунд)`
        })
      }, PROCESSING_TIMEOUT)

      const reader = new FileReader()

      reader.onload = (e) => {
        clearTimeout(timeout)
        try {
          const content = e.target?.result as string

          if (!content || content.trim().length === 0) {
            resolve({
              success: false,
              tasks: [],
              error: 'Файл пуст или содержит только пробелы'
            })
            return
          }

          let data: unknown
          try {
            data = JSON.parse(content)
          } catch (parseError) {
            resolve({
              success: false,
              tasks: [],
              error: `Ошибка парсинга JSON: ${parseError instanceof Error ? parseError.message : 'Неверный формат JSON'}`
            })
            return
          }

          if (!data || typeof data !== 'object' || Array.isArray(data)) {
            resolve({
              success: false,
              tasks: [],
              error: 'Неверная структура файла. Ожидается объект с полем "tasks"'
            })
            return
          }

          const dataObj = data as { tasks?: unknown; version?: unknown }

          if (!dataObj.tasks) {
            resolve({
              success: false,
              tasks: [],
              error: 'Файл не содержит поле "tasks"'
            })
            return
          }

          const tasksValidation = this.validateTasksArray(dataObj.tasks)
          if (!tasksValidation.valid) {
            resolve({
              success: false,
              tasks: [],
              error: tasksValidation.error
            })
            return
          }

          const now = Date.now()
          const importedTasks = tasksValidation.tasks!.map((task, index) => ({
            ...task,
            id: now + index
          }))

          resolve({
            success: true,
            tasks: importedTasks,
            error: tasksValidation.error
          })
        } catch (error) {
          clearTimeout(timeout)
          resolve({
            success: false,
            tasks: [],
            error: `Неожиданная ошибка при обработке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          })
        }
      }

      reader.onerror = () => {
        clearTimeout(timeout)
        resolve({
          success: false,
          tasks: [],
          error: 'Ошибка чтения файла. Возможно, файл поврежден или недоступен'
        })
      }

      reader.onabort = () => {
        clearTimeout(timeout)
        resolve({
          success: false,
          tasks: [],
          error: 'Чтение файла было прервано'
        })
      }

      try {
        reader.readAsText(file, 'UTF-8')
      } catch (error) {
        clearTimeout(timeout)
        resolve({
          success: false,
          tasks: [],
          error: `Ошибка при открытии файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        })
      }
    })
  }

  /**
   * Импорт задач из CSV файла
   */
  static async importFromCSV(
    file: File
  ): Promise<{ success: boolean; tasks: Task[]; error?: string }> {
    const sizeValidation = this.validateFileSize(file)
    if (!sizeValidation.valid) {
      return {
        success: false,
        tasks: [],
        error: sizeValidation.error
      }
    }

    const typeValidation = this.validateFileType(file, 'csv')
    if (!typeValidation.valid) {
      return {
        success: false,
        tasks: [],
        error: typeValidation.error
      }
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          tasks: [],
          error: `Превышено время ожидания обработки файла (${PROCESSING_TIMEOUT / 1000} секунд)`
        })
      }, PROCESSING_TIMEOUT)

      const reader = new FileReader()

      reader.onload = (e) => {
        clearTimeout(timeout)
        try {
          const content = e.target?.result as string

          if (!content || content.trim().length === 0) {
            resolve({
              success: false,
              tasks: [],
              error: 'Файл пуст или содержит только пробелы'
            })
            return
          }

          const tasks = CsvParserService.csvToTasks(content)

          if (tasks.length === 0) {
            resolve({
              success: false,
              tasks: [],
              error: 'CSV файл не содержит валидных задач'
            })
            return
          }

          if (tasks.length > MAX_TASKS_COUNT) {
            resolve({
              success: false,
              tasks: [],
              error: `Слишком много задач. Максимум: ${MAX_TASKS_COUNT}`
            })
            return
          }

          resolve({ success: true, tasks })
        } catch (error) {
          clearTimeout(timeout)
          resolve({
            success: false,
            tasks: [],
            error:
              error instanceof Error
                ? `Ошибка парсинга CSV: ${error.message}`
                : 'Ошибка чтения CSV файла'
          })
        }
      }

      reader.onerror = () => {
        clearTimeout(timeout)
        resolve({
          success: false,
          tasks: [],
          error: 'Ошибка чтения файла. Возможно, файл поврежден или недоступен'
        })
      }

      reader.onabort = () => {
        clearTimeout(timeout)
        resolve({
          success: false,
          tasks: [],
          error: 'Чтение файла было прервано'
        })
      }

      try {
        reader.readAsText(file, 'UTF-8')
      } catch (error) {
        clearTimeout(timeout)
        resolve({
          success: false,
          tasks: [],
          error: `Ошибка при открытии файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        })
      }
    })
  }
}

