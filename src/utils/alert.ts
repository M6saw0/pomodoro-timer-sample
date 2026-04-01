export function vibrate(pattern: number[]): void {
  if (typeof navigator.vibrate !== 'function') return
  navigator.vibrate(pattern)
}

export function playBeep(frequency = 880, durationMs = 200, volume = 0.3): void {
  const AudioCtx = (globalThis as Record<string, unknown>)['AudioContext'] as
    | typeof AudioContext
    | undefined
  if (!AudioCtx) return

  try {
    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gainNode.gain.value = volume

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + durationMs / 1000)
    oscillator.addEventListener('ended', () => void ctx.close())
  } catch {
    // Audio not available — silently skip
  }
}

export function playTimerCompleteAlert(): void {
  playBeep(880, 200)
  vibrate([200, 100, 200])
}
