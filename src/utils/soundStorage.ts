import type { SoundSettings } from '../types/sound'
import { DEFAULT_SOUND_SETTINGS } from '../types/sound'

const STORAGE_KEY = 'pomodoro:soundSettings'

export function saveSoundSettings(settings: SoundSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage might be unavailable
  }
}

export function loadSoundSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_SOUND_SETTINGS
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SOUND_SETTINGS
    const obj = parsed as Record<string, unknown>
    if (
      typeof obj['workEndSoundId'] !== 'string' ||
      typeof obj['breakEndSoundId'] !== 'string' ||
      typeof obj['volume'] !== 'number'
    ) {
      return DEFAULT_SOUND_SETTINGS
    }
    return {
      workEndSoundId: obj['workEndSoundId'],
      breakEndSoundId: obj['breakEndSoundId'],
      volume: obj['volume'],
    }
  } catch {
    return DEFAULT_SOUND_SETTINGS
  }
}
