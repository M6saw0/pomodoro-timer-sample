/**
 * 統合テスト: App コンポーネントのユーザーフロー
 *
 * TimerSetup → TimerDisplay → TimerControls の連携を含む
 * 完全なユーザーフローを検証する。
 * - プリセット選択 → スタート → 一時停止 → 再開 → リセット
 * - localStorage への保存と復元
 * - 設定画面 ↔ タイマー実行画面の切り替え
 * - シーケンス完了後の画面表示
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from '../../App'
import { saveSequence, clearStorage } from '../../utils/storage'
import { SHORT_POMODORO, CLASSIC_POMODORO } from '../../types/timer'

function setupNavigatorMocks() {
  Object.defineProperty(navigator, 'wakeLock', {
    value: undefined,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(navigator, 'vibrate', {
    value: vi.fn(),
    writable: true,
    configurable: true,
  })
}

describe('App コンポーネント統合テスト', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearStorage()
    setupNavigatorMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    clearStorage()
  })

  describe('設定画面 ↔ タイマー画面の切り替え', () => {
    it('初期表示は設定画面（プリセット一覧が表示される）', () => {
      render(<App />)
      expect(screen.getByText(/クラシック/i)).toBeInTheDocument()
      expect(screen.getByText(/ショート/i)).toBeInTheDocument()
      expect(screen.getByText(/ロング/i)).toBeInTheDocument()
    })

    it('スタートボタンでタイマー画面へ切り替わる', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      // タイマー画面では一時停止ボタンが表示される
      expect(screen.getByRole('button', { name: /一時停止/i })).toBeInTheDocument()
      // 設定画面の要素は消える
      expect(screen.queryByText(/プリセット/i)).not.toBeInTheDocument()
    })

    it('リセットボタンで設定画面に戻る', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      fireEvent.click(screen.getByRole('button', { name: /リセット/i }))
      expect(screen.getByText(/クラシック/i)).toBeInTheDocument()
    })
  })

  describe('タイマーコントロールの状態遷移', () => {
    it('running 中は「一時停止」「リセット」ボタンが表示される', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      expect(screen.getByRole('button', { name: /一時停止/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /リセット/i })).toBeInTheDocument()
    })

    it('一時停止後は「再開」「リセット」ボタンが表示される', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      fireEvent.click(screen.getByRole('button', { name: /一時停止/i }))
      expect(screen.getByRole('button', { name: /再開/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /リセット/i })).toBeInTheDocument()
    })

    it('再開後は「一時停止」「リセット」ボタンに戻る', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      fireEvent.click(screen.getByRole('button', { name: /一時停止/i }))
      fireEvent.click(screen.getByRole('button', { name: /再開/i }))
      expect(screen.getByRole('button', { name: /一時停止/i })).toBeInTheDocument()
    })

    it('シーケンス完了後は「もう一度」ボタンが表示される', () => {
      const quickSequence = {
        steps: [{ label: '作業', durationSeconds: 2, type: 'work' as const }],
        repeatCount: 1,
      }
      // localStorage に短いシーケンスを保存してから App を起動
      saveSequence(quickSequence)
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(screen.getByRole('button', { name: /もう一度/i })).toBeInTheDocument()
    })

    it('「もう一度」をクリックすると設定画面に戻る', () => {
      const quickSequence = {
        steps: [{ label: '作業', durationSeconds: 2, type: 'work' as const }],
        repeatCount: 1,
      }
      saveSequence(quickSequence)
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      act(() => {
        vi.advanceTimersByTime(3000)
      })
      fireEvent.click(screen.getByRole('button', { name: /もう一度/i }))
      expect(screen.getByText(/クラシック/i)).toBeInTheDocument()
    })
  })

  describe('プリセット選択 → スタートフロー', () => {
    it('ショートプリセットを選択してスタートするとラベルに「作業」が表示される', () => {
      render(<App />)
      // ショートプリセットを選択
      fireEvent.click(screen.getByRole('button', { name: /ショート/i }))
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      expect(screen.getByText('作業')).toBeInTheDocument()
    })

    it('ラウンド表示が「ラウンド 1 / 4」から始まる', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      expect(screen.getByText(/ラウンド 1 \/ 4/i)).toBeInTheDocument()
    })

    it('タイマー表示が「タイマー 1 / 2」から始まる', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      expect(screen.getByText(/タイマー 1 \/ 2/i)).toBeInTheDocument()
    })

    it('リピート回数を変更してスタートするとラウンド表示に反映される', () => {
      render(<App />)
      // リピート回数入力フィールドを特定する（max=10のもの）
      const allSpinbuttons = screen.getAllByRole('spinbutton')
      const repeatInputEl = allSpinbuttons.find(
        (el) => (el as HTMLInputElement).max === '10',
      )
      expect(repeatInputEl).toBeDefined()
      fireEvent.change(repeatInputEl!, { target: { value: '3' } })
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      expect(screen.getByText(/ラウンド 1 \/ 3/i)).toBeInTheDocument()
    })
  })

  describe('localStorage 統合: 設定の保存と復元', () => {
    it('アプリ起動時に localStorage から設定が復元される', () => {
      // 事前に SHORT_POMODORO を保存
      saveSequence(SHORT_POMODORO)
      render(<App />)
      // ショートプリセットの秒数（15分）が表示されていることを確認
      expect(screen.getByDisplayValue('15')).toBeInTheDocument()
    })

    it('プリセット変更が localStorage に保存される', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /ショート/i }))

      // 再レンダリングして localStorage から復元
      const { unmount } = render(<App />)
      expect(screen.getAllByDisplayValue('15').length).toBeGreaterThan(0)
      unmount()
    })

    it('localStorage が空の場合はクラシックプリセットが初期値になる', () => {
      clearStorage()
      render(<App />)
      // クラシックの25分が表示される
      expect(screen.getByDisplayValue('25')).toBeInTheDocument()
    })

    it('無効な localStorage データがある場合もクラッシュせず起動する', () => {
      localStorage.setItem('pomodoro:sequence', 'invalid-json{{')
      expect(() => render(<App />)).not.toThrow()
      expect(screen.getByText(/クラシック/i)).toBeInTheDocument()
    })
  })

  describe('TimerDisplay の表示確認', () => {
    it('タイマー画面でタイマー時刻（MM:SS形式）が表示される', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      // タイマー時刻 data-testid="timer-time" が表示される
      const timerTime = screen.getByTestId('timer-time')
      expect(timerTime).toBeInTheDocument()
      expect(timerTime.textContent).toMatch(/^\d{2}:\d{2}$/)
    })

    it('作業ステップ中は「作業」ラベルが表示される', () => {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
      expect(screen.getByText('作業')).toBeInTheDocument()
    })
  })
})
