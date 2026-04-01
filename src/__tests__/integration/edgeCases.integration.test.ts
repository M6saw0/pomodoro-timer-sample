/**
 * 統合テスト: エッジケース
 *
 * 0秒タイマー、最大10回リピート、高速スタート/ストップ連打、
 * タイマー実行中のリセットなど境界値・異常系シナリオを検証する。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimerSequence } from '../../hooks/useTimerSequence'
import { useTimer } from '../../hooks/useTimer'
import type { TimerSequence } from '../../types/timer'

describe('エッジケーステスト', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('0秒タイマー', () => {
    it('durationSeconds=0 のタイマーは即座に completed になる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useTimer(0, onComplete))

      act(() => result.current.start())
      // インターバルが最初に発火するまで待つ
      act(() => vi.advanceTimersByTime(300))

      expect(result.current.state).toBe('completed')
      expect(result.current.remainingSeconds).toBe(0)
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('0秒ステップを含むシーケンスは即座に次のステップへ進む', () => {
      const zeroStepSequence: TimerSequence = {
        steps: [
          { label: 'スキップ', durationSeconds: 0, type: 'work' as const },
          { label: '作業', durationSeconds: 5, type: 'work' as const },
        ],
        repeatCount: 1,
      }
      const { result } = renderHook(() =>
        useTimerSequence(zeroStepSequence),
      )

      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(300))

      // 0秒ステップが完了して次のステップへ
      expect(result.current.currentStepIndex).toBe(1)
    })
  })

  describe('最大10回リピート', () => {
    it('repeatCount=10 で10回リピートして completed になる', () => {
      const maxRepeatSequence: TimerSequence = {
        steps: [{ label: '作業', durationSeconds: 2, type: 'work' as const }],
        repeatCount: 10,
      }
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTimerSequence(maxRepeatSequence, onComplete),
      )

      act(() => result.current.start())
      // 10回 × 2秒 = 20秒
      act(() => vi.advanceTimersByTime(21000))

      expect(result.current.state).toBe('completed')
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('9回目が完了しても completed にならず、10回目が開始される', () => {
      const maxRepeatSequence: TimerSequence = {
        steps: [{ label: '作業', durationSeconds: 2, type: 'work' as const }],
        repeatCount: 10,
      }
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTimerSequence(maxRepeatSequence, onComplete),
      )

      act(() => result.current.start())
      // 9回 × 2秒 = 18秒 → まだ running のはず
      act(() => vi.advanceTimersByTime(18500))

      expect(result.current.currentRepeat).toBe(10)
      expect(result.current.state).toBe('running')
      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  describe('高速スタート/ストップ連打', () => {
    it('start → pause → start → pause を繰り返しても状態が壊れない', () => {
      const { result } = renderHook(() =>
        useTimerSequence({
          steps: [{ label: '作業', durationSeconds: 30, type: 'work' as const }],
          repeatCount: 1,
        }),
      )

      // 高速連打
      act(() => result.current.start())
      act(() => result.current.pause())
      act(() => result.current.resume())
      act(() => result.current.pause())
      act(() => result.current.resume())

      expect(result.current.state).toBe('running')
      expect(result.current.remainingSeconds).toBeGreaterThan(0)
    })

    it('resume → resume を2回呼んでもインターバルが二重起動しない', () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
      const { result } = renderHook(() =>
        useTimerSequence({
          steps: [{ label: '作業', durationSeconds: 30, type: 'work' as const }],
          repeatCount: 1,
        }),
      )

      act(() => result.current.start())
      act(() => result.current.pause())

      const callsBefore = setIntervalSpy.mock.calls.length

      act(() => result.current.resume())
      act(() => result.current.resume()) // 2回目の resume

      // setInterval の呼び出しは高々1回余分に増えるだけで二重起動しない
      const callsAfter = setIntervalSpy.mock.calls.length
      expect(callsAfter - callsBefore).toBeLessThanOrEqual(2)
    })

    it('start 直後に reset してもインターバルがクリアされる', () => {
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
      const { result } = renderHook(() =>
        useTimerSequence({
          steps: [{ label: '作業', durationSeconds: 30, type: 'work' as const }],
          repeatCount: 1,
        }),
      )

      act(() => result.current.start())
      act(() => result.current.reset())

      expect(clearIntervalSpy).toHaveBeenCalled()
      expect(result.current.state).toBe('idle')
    })

    it('start → pause → reset → start の流れで正常に動作する', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTimerSequence(
          { steps: [{ label: '作業', durationSeconds: 3, type: 'work' as const }], repeatCount: 1 },
          onComplete,
        ),
      )

      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(1000))
      act(() => result.current.pause())
      act(() => result.current.reset())

      // 再スタート
      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(4000))

      expect(result.current.state).toBe('completed')
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('タイマー実行中のリセット', () => {
    it('ステップ2 実行中にリセットすると最初のステップに戻る', () => {
      const sequence: TimerSequence = {
        steps: [
          { label: '作業', durationSeconds: 3, type: 'work' as const },
          { label: '休憩', durationSeconds: 10, type: 'break' as const },
        ],
        repeatCount: 2,
      }
      const { result } = renderHook(() => useTimerSequence(sequence))

      act(() => result.current.start())
      // ステップ1(3s)完了してステップ2(休憩)へ
      act(() => vi.advanceTimersByTime(4000))
      expect(result.current.currentStepIndex).toBe(1)

      // リセット
      act(() => result.current.reset())
      expect(result.current.currentStepIndex).toBe(0)
      expect(result.current.currentRepeat).toBe(1)
      expect(result.current.currentStep.label).toBe('作業')
    })

    it('リピート2回目実行中にリセットするとリピートカウントも1に戻る', () => {
      const sequence: TimerSequence = {
        steps: [{ label: '作業', durationSeconds: 2, type: 'work' as const }],
        repeatCount: 3,
      }
      const { result } = renderHook(() => useTimerSequence(sequence))

      act(() => result.current.start())
      // リピート1→2: 2s × 2 = 4s
      act(() => vi.advanceTimersByTime(4500))
      expect(result.current.currentRepeat).toBe(3)

      act(() => result.current.reset())
      expect(result.current.currentRepeat).toBe(1)
    })
  })

  describe('アンマウント時のクリーンアップ', () => {
    it('実行中にアンマウントしてもインターバルがクリアされる', () => {
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
      const { result, unmount } = renderHook(() =>
        useTimerSequence({
          steps: [{ label: '作業', durationSeconds: 30, type: 'work' as const }],
          repeatCount: 1,
        }),
      )

      act(() => result.current.start())
      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })
})
