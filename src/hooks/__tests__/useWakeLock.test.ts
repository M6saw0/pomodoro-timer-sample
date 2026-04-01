import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWakeLock } from '../useWakeLock'

const createMockSentinel = () => ({
  released: false,
  type: 'screen' as const,
  release: vi.fn().mockResolvedValue(undefined),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})

describe('useWakeLock', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when Wake Lock API is not supported', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'wakeLock', {
        value: undefined,
        writable: true,
        configurable: true,
      })
    })

    it('should report as not supported', () => {
      const { result } = renderHook(() => useWakeLock())
      expect(result.current.isSupported).toBe(false)
    })

    it('should not throw when requesting wake lock', async () => {
      const { result } = renderHook(() => useWakeLock())
      await act(async () => {
        await result.current.requestWakeLock()
      })
      expect(result.current.isActive).toBe(false)
    })
  })

  describe('when Wake Lock API is supported', () => {
    let mockSentinel: ReturnType<typeof createMockSentinel>

    beforeEach(() => {
      mockSentinel = createMockSentinel()
      Object.defineProperty(navigator, 'wakeLock', {
        value: {
          request: vi.fn().mockResolvedValue(mockSentinel),
        },
        writable: true,
        configurable: true,
      })
    })

    it('should report as supported', () => {
      const { result } = renderHook(() => useWakeLock())
      expect(result.current.isSupported).toBe(true)
    })

    it('should acquire wake lock', async () => {
      const { result } = renderHook(() => useWakeLock())
      await act(async () => {
        await result.current.requestWakeLock()
      })
      expect(result.current.isActive).toBe(true)
    })

    it('should release wake lock', async () => {
      const { result } = renderHook(() => useWakeLock())
      await act(async () => {
        await result.current.requestWakeLock()
      })
      await act(async () => {
        await result.current.releaseWakeLock()
      })
      expect(result.current.isActive).toBe(false)
      expect(mockSentinel.release).toHaveBeenCalled()
    })

    it('should handle request failure gracefully', async () => {
      Object.defineProperty(navigator, 'wakeLock', {
        value: {
          request: vi.fn().mockRejectedValue(new Error('Battery low')),
        },
        writable: true,
        configurable: true,
      })
      const { result } = renderHook(() => useWakeLock())
      await act(async () => {
        await result.current.requestWakeLock()
      })
      expect(result.current.isActive).toBe(false)
    })

    it('should handle release failure gracefully', async () => {
      mockSentinel.release.mockRejectedValue(new Error('Already released'))
      const { result } = renderHook(() => useWakeLock())
      await act(async () => {
        await result.current.requestWakeLock()
      })
      await act(async () => {
        await result.current.releaseWakeLock()
      })
      // Should not throw
      expect(true).toBe(true)
    })

    it('should do nothing when releasing without an active lock', async () => {
      const { result } = renderHook(() => useWakeLock())
      await act(async () => {
        await result.current.releaseWakeLock()
      })
      expect(result.current.isActive).toBe(false)
    })
  })
})
