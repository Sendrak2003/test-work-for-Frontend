import type { Task, TaskPriority } from '@/entities/task'

/**
 * Сервис для парсинга CSV файлов
 */
export class CsvParserService {
  /**
   * Парсинг строки CSV с учетом кавычек
   */
  static parseLine(line: string, delimiter: string = ';'): string[] {
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
      } else if ((char === delimiter || char === ',') && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  }

  /**
   * Парсинг приоритета из текста
   */
  static parsePriority(priorityText: string): TaskPriority {
    const text = priorityText.trim().toLowerCase()
    if (text.includes('высок') || text === 'high') return 'high'
    if (text.includes('низк') || text === 'low') return 'low'
    return 'medium'
  }

  /**
   * Парсинг статуса из текста
   */
  static parseStatus(statusText: string): boolean {
    const text = statusText.trim().toLowerCase()
    return text.includes('заверш') || text === 'completed'
  }

  /**
   * Очистка строки от кавычек
   */
  static unquote(str: string): string {
    return str.replace(/^"|"$/g, '').replace(/""/g, '"')
  }

  /**
   * Форматирование даты для CSV
   */
  static formatDate(isoDate: string): string {
    const date = new Date(isoDate)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Конвертация задач в CSV формат
   */
  static tasksToCSV(tasks: Task[]): string {
    const headers = ['Название', 'Статус', 'Приоритет', 'Создано', 'Обновлено', 'Завершено']
    const priorityLabels: Record<TaskPriority, string> = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий'
    }

    const rows = tasks.map(task => [
      `"${task.title.replace(/"/g, '""')}"`,
      task.completed ? 'Завершено' : 'Активно',
      priorityLabels[task.priority],
      this.formatDate(task.createdAt),
      this.formatDate(task.updatedAt),
      task.completedAt ? this.formatDate(task.completedAt) : ''
    ])

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const bom = '\uFEFF' // BOM для корректного отображения кириллицы в Excel
    return bom + csv
  }

  /**
   * Парсинг CSV в задачи
   */
  static csvToTasks(content: string): Task[] {
    const lines = content.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      throw new Error('Файл пуст или содержит только заголовки')
    }

    const dataLines = lines.slice(1)
    const now = Date.now()
    const nowISO = new Date().toISOString()

    return dataLines.map((line, index) => {
      const cols = this.parseLine(line)
      const title = this.unquote(cols[0] || '') || 'Без названия'
      const statusText = cols[1]?.trim() || ''
      const priorityText = cols[2]?.trim() || ''

      const priority = this.parsePriority(priorityText)
      const completed = this.parseStatus(statusText)

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
  }
}

