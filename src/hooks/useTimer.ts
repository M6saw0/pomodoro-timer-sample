import { useState, useRef, useCallback, useEffect } from 'react'
import type { TimerState } from '../types/timer'

interface UseTimerReturn {
  state: TimerState
  remainingSeconds: number
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export function useTimer(
  durationSeconds: number,
  onComplete?: () => void,
): UseTimerReturn {
  const [state, setState] = useState<TimerState>('idle')
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const remainingAtPauseRef = useRef<number>(durationSeconds)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  const startTicking = useCallback(
    (fromSeconds: number) => {
      startTimeRef.current = Date.now()
      remainingAtPauseRef.current = fromSeconds

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const newRemaining = Math.max(0, remainingAtPauseRef.current - elapsed)

        setRemainingSeconds(newRemaining)

        if (newRemaining === 0) {
          clearTimer()
          setState('completed')
          onCompleteRef.current?.()
        }
      }, 200)
    },
    [clearTimer],
  )

  const start = useCallback(() => {
    setState('running')
    setRemainingSeconds(durationSeconds)
    startTicking(durationSeconds)
  }, [durationSeconds, startTicking])

  const pause = useCallback(() => {
    clearTimer()
    setState('paused')
    setRemainingSeconds((prev) => {
      remainingAtPauseRef.current = prev
      return prev
    })
  }, [clearTimer])

  const resume = useCallback(() => {
    setState('running')
    startTicking(remainingAtPauseRef.current)
  }, [startTicking])

  const reset = useCallback(() => {
    clearTimer()
    setState('idle')
    setRemainingSeconds(durationSeconds)
    remainingAtPauseRef.current = durationSeconds
  }, [clearTimer, durationSeconds])

  return { state, remainingSeconds, start, pause, resume, reset }
}
