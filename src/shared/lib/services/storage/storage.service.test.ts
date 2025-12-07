import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageService } from './storage.service'

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('setItem', () => {
    it('должен сохранять данные в localStorage', () => {
      const key = 'test-key'
      const value = { test: 'data' }

      StorageService.setItem(key, value)

      const stored = localStorage.getItem(key)
      expect(stored).toBe(JSON.stringify(value))
    })

    it('должен сохранять примитивные значения', () => {
      StorageService.setItem('string', 'test')
      StorageService.setItem('number', 123)
      StorageService.setItem('boolean', true)

      expect(localStorage.getItem('string')).toBe('"test"')
      expect(localStorage.getItem('number')).toBe('123')
      expect(localStorage.getItem('boolean')).toBe('true')
    })

    it('должен выбрасывать ошибку при проблемах с localStorage', () => {
      const stringifySpy = vi.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      expect(() => {
        StorageService.setItem('key', 'value')
      }).toThrow('QuotaExceededError')

      stringifySpy.mockRestore()
    })
  })

  describe('getItem', () => {
    it('должен получать данные из localStorage', () => {
      const key = 'test-key'
      const value = { test: 'data' }
      localStorage.setItem(key, JSON.stringify(value))

      const result = StorageService.getItem(key, {})

      expect(result).toEqual(value)
    })

    it('должен возвращать значение по умолчанию, если ключ не существует', () => {
      const defaultValue = { default: 'value' }
      const result = StorageService.getItem('non-existent', defaultValue)

      expect(result).toEqual(defaultValue)
    })

    it('должен возвращать значение по умолчанию при ошибке парсинга', () => {
      localStorage.setItem('invalid-json', 'not a json')
      const defaultValue = { default: 'value' }

      const result = StorageService.getItem('invalid-json', defaultValue)

      expect(result).toEqual(defaultValue)
    })

    it('должен обрабатывать примитивные значения по умолчанию', () => {
      const result = StorageService.getItem('non-existent', 'default')
      expect(result).toBe('default')
    })
  })

  describe('removeItem', () => {
    it('должен удалять данные из localStorage', () => {
      localStorage.setItem('test-key', 'test-value')
      
      StorageService.removeItem('test-key')

      expect(localStorage.getItem('test-key')).toBeNull()
    })

    it('не должен выбрасывать ошибку для несуществующего ключа', () => {
      expect(() => {
        StorageService.removeItem('non-existent')
      }).not.toThrow()
    })
  })

  describe('clear', () => {
    it('должен очищать все данные из localStorage', () => {
      localStorage.setItem('key1', 'value1')
      localStorage.setItem('key2', 'value2')

      StorageService.clear()

      expect(localStorage.getItem('key1')).toBeNull()
      expect(localStorage.getItem('key2')).toBeNull()
    })
  })
})

