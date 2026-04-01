import type { TimerState } from '../types/timer'

interface TimerControlsProps {
  state: TimerState
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
}

const buttonBase =
  'min-h-[44px] px-6 py-3 rounded-full font-semibold text-white transition-all active:scale-95'

export function TimerControls({
  state,
  onStart,
  onPause,
  onResume,
  onReset,
}: TimerControlsProps) {
  if (state === 'idle') {
    return (
      <div className="timer-controls">
        <button
          className={`${buttonBase} h-16 text-xl bg-red-500 hover:bg-red-600 px-10`}
          onClick={onStart}
        >
          スタート
        </button>
      </div>
    )
  }

  if (state === 'running') {
    return (
      <div className="timer-controls flex gap-4">
        <button className={`${buttonBase} bg-yellow-500 hover:bg-yellow-600`} onClick={onPause}>
          一時停止
        </button>
        <button className={`${buttonBase} bg-gray-500 hover:bg-gray-600`} onClick={onReset}>
          リセット
        </button>
      </div>
    )
  }

  if (state === 'paused') {
    return (
      <div className="timer-controls flex gap-4">
        <button className={`${buttonBase} bg-green-500 hover:bg-green-600`} onClick={onResume}>
          再開
        </button>
        <button className={`${buttonBase} bg-gray-500 hover:bg-gray-600`} onClick={onReset}>
          リセット
        </button>
      </div>
    )
  }

  // completed
  return (
    <div className="timer-controls flex gap-4">
      <button className={`${buttonBase} bg-red-500 hover:bg-red-600`} onClick={onReset}>
        もう一度
      </button>
    </div>
  )
}
