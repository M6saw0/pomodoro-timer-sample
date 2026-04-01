/**
 * 統合テスト: タイマーシーケンス管理
 *
 * useTimer + useTimerSequence の連携動作を検証する。
 * 単体テストでカバーされていない複合シナリオ（複数ステップの連続実行、
 * 一時停止後の再開 → 完了、リセット後の再スタートなど）を網羅する。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimerSequence } from '../../hooks/useTimerSequence'
import type { TimerSequence } from '../../types/timer'

// 短い秒数でテストできるシーケンス定義
const TWO_STEP_SEQUENCE: TimerSequence = {
  steps: [
    { label: '作業', durationSeconds: 5, type: 'work' },
    { label: '休憩', durationSeconds: 3, type: 'break' },
  ],
  repeatCount: 2,
}

const SINGLE_STEP_SEQUENCE: TimerSequence = {
  steps: [{ label: '作業', durationSeconds: 4, type: 'work' }],
  repeatCount: 1,
}

describe('タイマーシーケンス統合テスト', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('状態遷移: idle → running → paused → running → completed', () => {
    it('完全な状態遷移フローを経て completed になる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTimerSequence(TWO_STEP_SEQUENCE, onComplete),
      )

      // idle
      expect(result.current.state).toBe('idle')

      // → running
      act(() => result.current.start())
      expect(result.current.state).toBe('running')

      // → paused
      act(() => vi.advanceTimersByTime(2000))
      act(() => result.current.pause())
      expect(result.current.state).toBe('paused')

      // → running (再開)
      act(() => result.current.resume())
      expect(result.current.state).toBe('running')

      // → completed (全ステップ完了: 作業5s×2 + 休憩3s×2 = 16s、残り3s消費で完了)
      act(() => vi.advanceTimersByTime(17000))
      expect(result.current.state).toBe('completed')
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('一時停止中は時間が経過しても残り秒数が変わらない', () => {
      const { result } = renderHook(() => useTimerSequence(TWO_STEP_SEQUENCE))

      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(2000))
      act(() => result.current.pause())

      const remainingAtPause = result.current.remainingSeconds

      // 10秒経過させても残り秒数は変わらない
      act(() => vi.advanceTimersByTime(10000))
      expect(result.current.remainingSeconds).toBe(remainingAtPause)
    })

    it('一時停止 → 再開後、残りの時間だけ消費して次のステップへ進む', () => {
      const { result } = renderHook(() => useTimerSequence(TWO_STEP_SEQUENCE))

      act(() => result.current.start())
      // 作業ステップを4秒消費 (残り1秒)
      act(() => vi.advanceTimersByTime(4000))
      act(() => result.current.pause())
      expect(result.current.currentStepIndex).toBe(0)

      // 再開して残り1秒を消費 → 休憩ステップへ
      act(() => result.current.resume())
      act(() => vi.advanceTimersByTime(2000))
      expect(result.current.currentStepIndex).toBe(1)
      expect(result.current.currentStep.label).toBe('休憩')
    })
  })

  describe('複数ステップの連続実行フロー', () => {
    it('ステップ1完了後、自動でステップ2へ進む', () => {
      const { result } = renderHook(() => useTimerSequence(TWO_STEP_SEQUENCE))

      act(() => result.current.start())
      // 作業ステップ(5s)完了
      act(() => vi.advanceTimersByTime(6000))

      expect(result.current.currentStepIndex).toBe(1)
      expect(result.current.currentStep.label).toBe('休憩')
      expect(result.current.state).toBe('running')
    })

    it('全ステップ完了後、リピートカウントが増える', () => {
      const { result } = renderHook(() => useTimerSequence(TWO_STEP_SEQUENCE))

      act(() => result.current.start())
      // リピート1回目: 作業5s + 休憩3s = 8s
      act(() => vi.advanceTimersByTime(9000))

      expect(result.current.currentRepeat).toBe(2)
      expect(result.current.currentStepIndex).toBe(0)
      expect(result.current.currentStep.label).toBe('作業')
    })

    it('全リピート完了後に onComplete が呼ばれ、状態が completed になる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTimerSequence(TWO_STEP_SEQUENCE, onComplete),
      )

      act(() => result.current.start())
      // 2リピート × (5+3)s = 16s
      act(() => vi.advanceTimersByTime(17000))

      expect(result.current.state).toBe('completed')
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('onComplete は2回以上呼ばれない', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTimerSequence(TWO_STEP_SEQUENCE, onComplete),
      )

      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(20000)) // 十分に長く
      act(() => vi.advanceTimersByTime(10000)) // さらに時間経過

      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('リセット後の再スタート', () => {
    it('実行中にリセットすると idle に戻り、再スタートできる', () => {
      const { result } = renderHook(() => useTimerSequence(TWO_STEP_SEQUENCE))

      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(3000))
      act(() => result.current.reset())

      expect(result.current.state).toBe('idle')
      expect(result.current.currentStepIndex).toBe(0)
      expect(result.current.currentRepeat).toBe(1)
      expect(result.current.remainingSeconds).toBe(
        TWO_STEP_SEQUENCE.steps[0]!.durationSeconds,
      )

      // 再スタートできる
      act(() => result.current.start())
      expect(result.current.state).toBe('running')
    })

    it('一時停止中にリセットすると idle に戻る', () => {
      const { result } = renderHook(() => useTimerSequence(TWO_STEP_SEQUENCE))

      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(2000))
      act(() => result.current.pause())
      act(() => result.current.reset())

      expect(result.current.state).toBe('idle')
    })

    it('completed 後にリセットすると idle に戻り、再スタートできる', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() =>
        useTimerSequence(SINGLE_STEP_SEQUENCE, onComplete),
      )

      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(5000))
      expect(result.current.state).toBe('completed')

      act(() => result.current.reset())
      expect(result.current.state).toBe('idle')

      // 再スタートして onComplete が再び呼ばれる
      act(() => result.current.start())
      act(() => vi.advanceTimersByTime(5000))
      expect(result.current.state).toBe('completed')
      expect(onComplete).toHaveBeenCalledTimes(2)
    })
  })

  describe('プリセット切り替え時の動作', () => {
    it('異なるシーケンスで初期化した場合、正しいステップ情報が返る', () => {
      const longSequence: TimerSequence = {
        steps: [
          { label: '作業', durationSeconds: 50 * 60, type: 'work' },
          { label: '休憩', durationSeconds: 10 * 60, type: 'break' },
        ],
        repeatCount: 4,
      }
      const { result } = renderHook(() => useTimerSequence(longSequence))

      expect(result.current.currentStep.label).toBe('作業')
      expect(result.current.currentStep.durationSeconds).toBe(50 * 60)
      expect(result.current.totalSteps).toBe(2)
      expect(result.current.remainingSeconds).toBe(50 * 60)
    })
  })
})
