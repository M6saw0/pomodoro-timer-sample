import { useState, useCallback, useRef, useEffect } from 'react'
import type { TimerSequence, TimerState } from '../types/timer'

interface UseTimerSequenceReturn {
  state: TimerState
  currentStepIndex: number
  currentRepeat: number
  totalSteps: number
  remainingSeconds: number
  currentStep: TimerSequence['steps'][number]
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useTimerSequence(
  sequence: TimerSequence,
  onComplete?: () => void,
  onStepComplete?: (completedStepType: 'work' | 'break') => void,
): UseTimerSequenceReturn {
  const [state, setState] = useState<TimerState>('idle')
  const [stepIndex, setStepIndex] = useState(0)
  const [repeat, setRepeat] = useState(1)
  const [remainingSeconds, setRemainingSeconds] = useState(
    sequence.steps[0]?.durationSeconds ?? 0,
  )

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef<{
    stepIndex: number
    repeat: number
    stepStartTime: number
    stepDuration: number
    running: boolean
  }>({
    stepIndex: 0,
    repeat: 1,
    stepStartTime: 0,
    stepDuration: sequence.steps[0]?.durationSeconds ?? 0,
    running: false,
  })

  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const onStepCompleteRef = useRef(onStepComplete)
  useEffect(() => {
    onStepCompleteRef.current = onStepComplete
  }, [onStepComplete])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const tick = useCallback(() => {
    const s = stateRef.current
    if (!s.running) return

    const elapsed = Math.floor((Date.now() - s.stepStartTime) / 1000)
    const newRemaining = Math.max(0, s.stepDuration - elapsed)
    setRemainingSeconds(newRemaining)

    if (newRemaining > 0) return

    // Step completed — notify and advance to next
    const completedStepType = sequence.steps[s.stepIndex]?.type ?? 'work'
    const nextStepIdx = s.stepIndex + 1
    if (nextStepIdx < sequence.steps.length) {
      onStepCompleteRef.current?.(completedStepType)
      const nextDuration = sequence.steps[nextStepIdx]!.durationSeconds
      s.stepIndex = nextStepIdx
      s.stepStartTime = Date.now()
      s.stepDuration = nextDuration
      setStepIndex(nextStepIdx)
      setRemainingSeconds(nextDuration)
      return
    }

    // All steps done — check repeat
    const nextRepeat = s.repeat + 1
    if (nextRepeat <= sequence.repeatCount) {
      onStepCompleteRef.current?.(completedStepType)
      const nextDuration = sequence.steps[0]!.durationSeconds
      s.stepIndex = 0
      s.repeat = nextRepeat
      s.stepStartTime = Date.now()
      s.stepDuration = nextDuration
      setStepIndex(0)
      setRepeat(nextRepeat)
      setRemainingSeconds(nextDuration)
      return
    }

    // All repeats done — complete
    s.running = false
    clearTimer()
    setState('completed')
    onCompleteRef.current?.()
  }, [sequence, clearTimer])

  const startInterval = useCallback(() => {
    clearTimer()
    intervalRef.current = setInterval(tick, 200)
  }, [clearTimer, tick])

  const start = useCallback(() => {
    const firstDuration = sequence.steps[0]?.durationSeconds ?? 0
    stateRef.current = {
      stepIndex: 0,
      repeat: 1,
      stepStartTime: Date.now(),
      stepDuration: firstDuration,
      running: true,
    }
    setStepIndex(0)
    setRepeat(1)
    setRemainingSeconds(firstDuration)
    setState('running')
    startInterval()
  }, [sequence, startInterval])

  const pause = useCallback(() => {
    stateRef.current.running = false
    clearTimer()
    setState('paused')
    const elapsed = Math.floor(
      (Date.now() - stateRef.current.stepStartTime) / 1000,
    )
    const paused = Math.max(0, stateRef.current.stepDuration - elapsed)
    stateRef.current.stepDuration = paused
    setRemainingSeconds(paused)
  }, [clearTimer])

  const resume = useCallback(() => {
    stateRef.current.running = true
    stateRef.current.stepStartTime = Date.now()
    setState('running')
    startInterval()
  }, [startInterval])

  const reset = useCallback(() => {
    clearTimer()
    const firstDuration = sequence.steps[0]?.durationSeconds ?? 0
    stateRef.current = {
      stepIndex: 0,
      repeat: 1,
      stepStartTime: 0,
      stepDuration: firstDuration,
      running: false,
    }
    setState('idle')
    setStepIndex(0)
    setRepeat(1)
    setRemainingSeconds(firstDuration)
  }, [clearTimer, sequence])

  return {
    state,
    currentStepIndex: stepIndex,
    currentRepeat: repeat,
    totalSteps: sequence.steps.length,
    remainingSeconds,
    currentStep: sequence.steps[stepIndex] ?? sequence.steps[0]!,
    start,
    pause,
    resume,
    reset,
  }
}
