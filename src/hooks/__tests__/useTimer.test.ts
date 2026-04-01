import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from '../useTimer'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start in idle state', () => {
    const { result } = renderHook(() => useTimer(60))
    expect(result.current.state).toBe('idle')
    expect(result.current.remainingSeconds).toBe(60)
  })

  it('should transition to running state on start', () => {
    const { result } = renderHook(() => useTimer(60))
    act(() => {
      result.current.start()
    })
    expect(result.current.state).toBe('running')
  })

  it('should count down each second', () => {
    const { result } = renderHook(() => useTimer(60))
    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.remainingSeconds).toBe(57)
  })

  it('should pause the timer', () => {
    const { result } = renderHook(() => useTimer(60))
    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      result.current.pause()
    })
    expect(result.current.state).toBe('paused')
    const remainingAtPause = result.current.remainingSeconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.remainingSeconds).toBe(remainingAtPause)
  })

  it('should resume from paused state', () => {
    const { result } = renderHook(() => useTimer(60))
    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      result.current.pause()
    })
    act(() => {
      result.current.resume()
    })
    expect(result.current.state).toBe('running')
  })

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useTimer(60))
    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    act(() => {
      result.current.reset()
    })
    expect(result.current.state).toBe('idle')
    expect(result.current.remainingSeconds).toBe(60)
  })

  it('should call onComplete when timer reaches zero', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useTimer(3, onComplete))
    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.state).toBe('completed')
    expect(onComplete).toHaveBeenCalled()
  })

  it('should not go below zero', () => {
    const { result } = renderHook(() => useTimer(2))
    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(result.current.remainingSeconds).toBe(0)
  })

  it('should clean up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const { result, unmount } = renderHook(() => useTimer(60))
    act(() => {
      result.current.start()
    })
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
