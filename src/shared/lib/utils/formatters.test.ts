import { describe, it, expect } from 'vitest'
import { formatDate, truncateText } from './formatters'

describe('formatters', () => {
  describe('formatDate', () => {
    it('должен форматировать валидную дату', () => {
      const date = '2024-01-15T10:30:00'
      const result = formatDate(date)
      
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/)
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('должен возвращать "—" для null', () => {
      expect(formatDate(null)).toBe('—')
    })

    it('должен возвращать "—" для пустой строки', () => {
      expect(formatDate('')).toBe('—')
    })
  })

  describe('truncateText', () => {
    it('должен обрезать длинный текст', () => {
      const longText = 'Это очень длинный текст, который нужно обрезать'
      const result = truncateText(longText, 20)
      
      expect(result.length).toBe(23) // 20 + '...'
      expect(result.endsWith('...')).toBe(true)
    })

    it('не должен обрезать короткий текст', () => {
      const shortText = 'Короткий текст'
      const result = truncateText(shortText, 20)
      
      expect(result).toBe(shortText)
      expect(result).not.toContain('...')
    })

    it('должен использовать длину по умолчанию', () => {
      const text = 'Этот текст точно длиннее 25 символов и должен быть обрезан'
      const result = truncateText(text)
      
      expect(result.length).toBe(28) // 25 + '...'
    })

    it('должен обрабатывать текст точно равный maxLength', () => {
      const text = '1234567890123456789012345' // 25 символов
      const result = truncateText(text, 25)
      
      expect(result).toBe(text)
      expect(result).not.toContain('...')
    })
  })
})

