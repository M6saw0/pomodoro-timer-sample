export type TimerState = 'idle' | 'running' | 'paused' | 'completed'

export interface TimerStep {
  label: string
  durationSeconds: number
  type: 'work' | 'break'
}

export interface TimerSequence {
  steps: TimerStep[]
  repeatCount: number
}

export const CLASSIC_POMODORO: TimerSequence = {
  steps: [
    { label: '作業', durationSeconds: 25 * 60, type: 'work' },
    { label: '休憩', durationSeconds: 5 * 60, type: 'break' },
  ],
  repeatCount: 4,
}

export const SHORT_POMODORO: TimerSequence = {
  steps: [
    { label: '作業', durationSeconds: 15 * 60, type: 'work' },
    { label: '休憩', durationSeconds: 3 * 60, type: 'break' },
  ],
  repeatCount: 4,
}

export const LONG_POMODORO: TimerSequence = {
  steps: [
    { label: '作業', durationSeconds: 50 * 60, type: 'work' },
    { label: '休憩', durationSeconds: 10 * 60, type: 'break' },
  ],
  repeatCount: 4,
}
