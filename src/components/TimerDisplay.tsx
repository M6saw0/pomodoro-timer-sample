import { CountdownCircleTimer } from 'react-countdown-circle-timer'

interface TimerDisplayProps {
  remainingSeconds: number
  totalSeconds: number
  label: string
  stepType: 'work' | 'break'
  isRunning: boolean
  currentStep: number
  totalSteps: number
  currentRepeat: number
  totalRepeats: number
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const WORK_COLOR = '#e05252'
const BREAK_COLOR = '#10b981'

function getStepColor(stepType: 'work' | 'break'): string {
  if (stepType === 'break') return BREAK_COLOR
  return WORK_COLOR
}

export function TimerDisplay({
  remainingSeconds,
  totalSeconds,
  label,
  stepType,
  isRunning,
  currentStep,
  totalSteps,
  currentRepeat,
  totalRepeats,
}: TimerDisplayProps) {
  const color = getStepColor(stepType)

  return (
    <div className="timer-display" aria-live="polite">
      <div className="timer-label">{label}</div>
      <CountdownCircleTimer
        key={`${label}-${totalSeconds}`}
        isPlaying={isRunning}
        duration={totalSeconds}
        initialRemainingTime={remainingSeconds}
        colors={color as `#${string}`}
        strokeWidth={8}
        size={240}
      >
        {() => (
          <div className="timer-time" data-testid="timer-time">
            {formatTime(remainingSeconds)}
          </div>
        )}
      </CountdownCircleTimer>
      <div className="timer-progress">
        <span className="timer-round">
          ラウンド {currentRepeat} / {totalRepeats}
        </span>
        <span className="timer-step">
          タイマー {currentStep} / {totalSteps}
        </span>
      </div>
    </div>
  )
}
