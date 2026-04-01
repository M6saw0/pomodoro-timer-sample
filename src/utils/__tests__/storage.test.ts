import { describe, it, expect, beforeEach } from 'vitest'
import { saveSequence, loadSequence, clearStorage } from '../storage'
import { CLASSIC_POMODORO, type TimerSequence } from '../../types/timer'

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveSequence', () => {
    it('should save a sequence to localStorage', () => {
      saveSequence(CLASSIC_POMODORO)
      const stored = localStorage.getItem('pomodoro:sequence')
      expect(stored).not.toBeNull()
    })

    it('should serialize the sequence correctly', () => {
      saveSequence(CLASSIC_POMODORO)
      const stored = localStorage.getItem('pomodoro:sequence')
      expect(JSON.parse(stored!)).toEqual(CLASSIC_POMODORO)
    })
  })

  describe('loadSequence', () => {
    it('should return null when nothing is stored', () => {
      expect(loadSequence()).toBeNull()
    })

    it('should return the saved sequence', () => {
      saveSequence(CLASSIC_POMODORO)
      const loaded = loadSequence()
      expect(loaded).toEqual(CLASSIC_POMODORO)
    })

    it('should return null when stored data is corrupted', () => {
      localStorage.setItem('pomodoro:sequence', 'not-valid-json{{{')
      expect(loadSequence()).toBeNull()
    })

    it('should return null when stored data is missing required fields', () => {
      localStorage.setItem('pomodoro:sequence', JSON.stringify({ invalid: true }))
      expect(loadSequence()).toBeNull()
    })

    it('should return null when stored data is null', () => {
      localStorage.setItem('pomodoro:sequence', 'null')
      expect(loadSequence()).toBeNull()
    })

    it('should return null when steps have invalid items', () => {
      localStorage.setItem(
        'pomodoro:sequence',
        JSON.stringify({
          steps: [{ label: 123, durationSeconds: 'oops' }],
          repeatCount: 1,
        }),
      )
      expect(loadSequence()).toBeNull()
    })

    it('should return null when steps is present but repeatCount is missing', () => {
      localStorage.setItem(
        'pomodoro:sequence',
        JSON.stringify({ steps: [] }),
      )
      expect(loadSequence()).toBeNull()
    })
  })

  describe('clearStorage', () => {
    it('should remove the saved sequence', () => {
      saveSequence(CLASSIC_POMODORO)
      clearStorage()
      expect(loadSequence()).toBeNull()
    })
  })

  describe('storage unavailability', () => {
    it('should not throw when localStorage.setItem throws', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })
      expect(() => saveSequence(CLASSIC_POMODORO)).not.toThrow()
    })

    it('should not throw when localStorage.removeItem throws', () => {
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage unavailable')
      })
      expect(() => clearStorage()).not.toThrow()
    })
  })

  describe('immutability', () => {
    it('should not return the same object reference on multiple loads', () => {
      const seq: TimerSequence = {
        steps: [{ label: '作業', durationSeconds: 1500 }],
        repeatCount: 4,
      }
      saveSequence(seq)
      const a = loadSequence()
      const b = loadSequence()
      expect(a).not.toBe(b)
    })
  })
})
