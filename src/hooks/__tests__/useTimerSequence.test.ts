import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimerSequence } from '../useTimerSequence'
import type { TimerSequence } from '../../types/timer'

const SIMPLE_SEQUENCE: TimerSequence = {
  steps: [
    { label: '作業', durationSeconds: 5 },
    { label: '休憩', durationSeconds: 3 },
  ],
  repeatCount: 2,
}

describe('useTimerSequence', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with first step', () => {
    const { result } = renderHook(() => useTimerSequence(SIMPLE_SEQUENCE))
    expect(result.current.currentStepIndex).toBe(0)
    expect(result.current.currentRepeat).toBe(1)
    expect(result.current.currentStep.label).toBe('作業')
    expect(result.current.state).toBe('idle')
  })

  it('should show total steps count', () => {
    const { result } = renderHook(() => useTimerSequence(SIMPLE_SEQUENCE))
    expect(result.current.totalSteps).toBe(2)
  })

  it('should advance to next step after current step completes', () => {
    const { result } = renderHook(() => useTimerSequence(SIMPLE_SEQUENCE))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(6000))
    expect(result.current.currentStepIndex).toBe(1)
    expect(result.current.currentStep.label).toBe('休憩')
  })

  it('should increment repeat count after completing all steps', () => {
    const { result } = renderHook(() => useTimerSequence(SIMPLE_SEQUENCE))
    act(() => result.current.start())
    // Complete first repeat: 作業(5s) + 休憩(3s) = 8s
    act(() => vi.advanceTimersByTime(9000))
    expect(result.current.currentRepeat).toBe(2)
    expect(result.current.currentStepIndex).toBe(0)
  })

  it('should mark as completed after all repeats', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useTimerSequence(SIMPLE_SEQUENCE, onComplete),
    )
    act(() => result.current.start())
    // Complete all: 2 repeats × (5+3)s = 16s
    act(() => vi.advanceTimersByTime(17000))
    expect(result.current.state).toBe('completed')
    expect(onComplete).toHaveBeenCalled()
  })

  it('should pause the sequence', () => {
    const { result } = renderHook(() => useTimerSequence(SIMPLE_SEQUENCE))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(2000))
    act(() => result.current.pause())
    expect(result.current.state).toBe('paused')
    const remainingAtPause = result.current.remainingSeconds
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.remainingSeconds).toBe(remainingAtPause)
  })

  it('should resume after pause', () => {
    const { result } = renderHook(() => useTimerSequence(SIMPLE_SEQUENCE))
    act(() => result.current.start())
    act(() => result.current.pause())
    act(() => result.current.resume())
    expect(result.current.state).toBe('running')
  })

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useTimerSequence(SIMPLE_SEQUENCE))
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(7000))
    act(() => result.current.reset())
    expect(result.current.currentStepIndex).toBe(0)
    expect(result.current.currentRepeat).toBe(1)
    expect(result.current.state).toBe('idle')
  })

  it('should handle single step sequence', () => {
    const singleStep: TimerSequence = {
      steps: [{ label: '作業', durationSeconds: 3 }],
      repeatCount: 1,
    }
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useTimerSequence(singleStep, onComplete),
    )
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(4000))
    expect(result.current.state).toBe('completed')
    expect(onComplete).toHaveBeenCalled()
  })

  it('should expose remaining seconds for current step', () => {
    const { result } = renderHook(() => useTimerSequence(SIMPLE_SEQUENCE))
    expect(result.current.remainingSeconds).toBe(5)
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.remainingSeconds).toBeLessThanOrEqual(3)
  })
})
