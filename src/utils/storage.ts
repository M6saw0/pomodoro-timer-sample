import type { TimerSequence } from '../types/timer'

const STORAGE_KEY = 'pomodoro:sequence'

function isValidSequence(data: unknown): data is TimerSequence {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj['steps'])) return false
  if (typeof obj['repeatCount'] !== 'number') return false
  return obj['steps'].every(
    (step: unknown) =>
      typeof step === 'object' &&
      step !== null &&
      typeof (step as Record<string, unknown>)['label'] === 'string' &&
      typeof (step as Record<string, unknown>)['durationSeconds'] === 'number',
  )
}

export function saveSequence(sequence: TimerSequence): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sequence))
  } catch {
    // Storage might be unavailable (private mode, quota exceeded)
  }
}

export function loadSequence(): TimerSequence | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isValidSequence(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage might be unavailable
  }
}
