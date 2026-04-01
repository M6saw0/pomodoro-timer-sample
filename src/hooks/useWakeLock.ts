import { useState, useCallback, useEffect, useRef } from 'react'

interface UseWakeLockReturn {
  isSupported: boolean
  isActive: boolean
  requestWakeLock: () => Promise<void>
  releaseWakeLock: () => Promise<void>
}

export function useWakeLock(): UseWakeLockReturn {
  const isSupported = 'wakeLock' in navigator && navigator.wakeLock != null
  const [isActive, setIsActive] = useState(false)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return
    try {
      const sentinel = await navigator.wakeLock.request('screen')
      sentinelRef.current = sentinel
      setIsActive(true)
    } catch {
      // Battery low or API unavailable — degrade gracefully
    }
  }, [isSupported])

  const releaseWakeLock = useCallback(async () => {
    if (sentinelRef.current === null) return
    try {
      await sentinelRef.current.release()
      sentinelRef.current = null
      setIsActive(false)
    } catch {
      // Release may fail if already released
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive) {
        await requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, requestWakeLock])

  return { isSupported, isActive, requestWakeLock, releaseWakeLock }
}
