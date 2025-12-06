/**
 * Утилиты форматирования
 */

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

/**
 * Форматирование даты в русском формате
 */
export function formatDate(date: string | null): string {
  if (!date) return '—'
  return dateFormatter.format(new Date(date))
}

/**
 * Обрезка текста с многоточием
 */
export function truncateText(text: string, maxLength = 25): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

