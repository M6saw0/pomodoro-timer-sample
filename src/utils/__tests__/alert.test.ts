import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { playBeep, vibrate, playTimerCompleteAlert } from '../alert'

describe('alert utilities', () => {
  describe('vibrate', () => {
    it('should call navigator.vibrate when supported', () => {
      const vibrateMock = vi.fn()
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        writable: true,
        configurable: true,
      })

      vibrate([200, 100, 200])
      expect(vibrateMock).toHaveBeenCalledWith([200, 100, 200])
    })

    it('should not throw when navigator.vibrate is not a function', () => {
      Object.defineProperty(navigator, 'vibrate', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      expect(() => vibrate([200, 100, 200])).not.toThrow()
    })
  })

  describe('playBeep', () => {
    let mockOscillator: {
      type: string
      frequency: { value: number }
      connect: ReturnType<typeof vi.fn>
      start: ReturnType<typeof vi.fn>
      stop: ReturnType<typeof vi.fn>
      addEventListener: ReturnType<typeof vi.fn>
    }
    let mockGain: {
      gain: { value: number }
      connect: ReturnType<typeof vi.fn>
    }
    let mockAudioContext: {
      createOscillator: ReturnType<typeof vi.fn>
      createGain: ReturnType<typeof vi.fn>
      destination: unknown
      currentTime: number
    }

    beforeEach(() => {
      mockOscillator = {
        type: 'sine',
        frequency: { value: 440 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        addEventListener: vi.fn(),
      }
      mockGain = {
        gain: { value: 1 },
        connect: vi.fn(),
      }
      mockAudioContext = {
        createOscillator: vi.fn().mockReturnValue(mockOscillator),
        createGain: vi.fn().mockReturnValue(mockGain),
        destination: {},
        currentTime: 0,
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MockAudioContext = vi.fn(function (this: unknown): any { return mockAudioContext })
      Object.defineProperty(globalThis, 'AudioContext', {
        value: MockAudioContext,
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(globalThis, 'AudioContext', {
        value: undefined,
        writable: true,
        configurable: true,
      })
    })

    it('should play a beep sound when AudioContext is available', () => {
      playBeep()
      expect(mockAudioContext.createOscillator).toHaveBeenCalled()
      expect(mockAudioContext.createGain).toHaveBeenCalled()
      expect(mockOscillator.start).toHaveBeenCalled()
      expect(mockOscillator.stop).toHaveBeenCalled()
    })

    it('should not throw when AudioContext is not available', () => {
      Object.defineProperty(globalThis, 'AudioContext', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      expect(() => playBeep()).not.toThrow()
    })
  })

  describe('playTimerCompleteAlert', () => {
    beforeEach(() => {
      const mockOscillator = {
        type: 'sine',
        frequency: { value: 440 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        addEventListener: vi.fn(),
      }
      const mockGain = { gain: { value: 1 }, connect: vi.fn() }
      const mockCtx = {
        createOscillator: vi.fn().mockReturnValue(mockOscillator),
        createGain: vi.fn().mockReturnValue(mockGain),
        destination: {},
        currentTime: 0,
      }
      Object.defineProperty(globalThis, 'AudioContext', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: vi.fn(function (this: unknown): any { return mockCtx }),
        writable: true,
        configurable: true,
      })
      Object.defineProperty(navigator, 'vibrate', {
        value: vi.fn(),
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(globalThis, 'AudioContext', {
        value: undefined,
        writable: true,
        configurable: true,
      })
    })

    it('should not throw when called', () => {
      expect(() => playTimerCompleteAlert()).not.toThrow()
    })
  })
})
