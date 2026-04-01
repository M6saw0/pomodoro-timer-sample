type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth'

interface NoteConfig {
  frequency: number
  startTime: number
  duration: number
  type: OscillatorType
  gainStart: number
  gainEnd: number
}

function createAudioContext(): AudioContext | null {
  const AudioCtx = (globalThis as Record<string, unknown>)['AudioContext'] as
    | typeof AudioContext
    | undefined
  if (!AudioCtx) return null
  try {
    return new AudioCtx()
  } catch {
    return null
  }
}

function playNotes(notes: readonly NoteConfig[], volume: number): void {
  const ctx = createAudioContext()
  if (!ctx) return

  const masterGain = ctx.createGain()
  masterGain.gain.value = volume
  masterGain.connect(ctx.destination)

  let maxEnd = 0

  for (const note of notes) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = note.type
    osc.frequency.value = note.frequency

    const start = ctx.currentTime + note.startTime
    const end = start + note.duration

    gain.gain.setValueAtTime(note.gainStart, start)
    gain.gain.linearRampToValueAtTime(note.gainEnd, end)

    osc.connect(gain)
    gain.connect(masterGain)

    osc.start(start)
    osc.stop(end)

    if (end > maxEnd) maxEnd = end
  }

  setTimeout(() => void ctx.close(), (maxEnd - ctx.currentTime) * 1000 + 200)
}

function bell(volume: number): void {
  playNotes(
    [
      { frequency: 830, startTime: 0, duration: 0.4, type: 'sine', gainStart: 0.6, gainEnd: 0 },
      { frequency: 1245, startTime: 0, duration: 0.3, type: 'sine', gainStart: 0.2, gainEnd: 0 },
      { frequency: 830, startTime: 0.5, duration: 0.4, type: 'sine', gainStart: 0.5, gainEnd: 0 },
      { frequency: 1245, startTime: 0.5, duration: 0.3, type: 'sine', gainStart: 0.15, gainEnd: 0 },
    ],
    volume,
  )
}

function chime(volume: number): void {
  playNotes(
    [
      { frequency: 523, startTime: 0, duration: 0.5, type: 'sine', gainStart: 0.4, gainEnd: 0 },
      { frequency: 659, startTime: 0.15, duration: 0.5, type: 'sine', gainStart: 0.35, gainEnd: 0 },
      { frequency: 784, startTime: 0.3, duration: 0.6, type: 'sine', gainStart: 0.3, gainEnd: 0 },
      { frequency: 1047, startTime: 0.45, duration: 0.7, type: 'sine', gainStart: 0.25, gainEnd: 0 },
    ],
    volume,
  )
}

function radar(volume: number): void {
  const notes: NoteConfig[] = []
  for (let i = 0; i < 3; i++) {
    notes.push({
      frequency: 1200,
      startTime: i * 0.25,
      duration: 0.12,
      type: 'sine',
      gainStart: 0.5,
      gainEnd: 0,
    })
  }
  playNotes(notes, volume)
}

function ripple(volume: number): void {
  const freqs = [440, 554, 659, 880, 1109]
  const notes: NoteConfig[] = freqs.map((f, i) => ({
    frequency: f,
    startTime: i * 0.08,
    duration: 0.35,
    type: 'sine' as OscillatorType,
    gainStart: 0.35,
    gainEnd: 0,
  }))
  playNotes(notes, volume)
}

function crystal(volume: number): void {
  playNotes(
    [
      { frequency: 1760, startTime: 0, duration: 0.15, type: 'sine', gainStart: 0.3, gainEnd: 0 },
      { frequency: 2093, startTime: 0.1, duration: 0.15, type: 'sine', gainStart: 0.25, gainEnd: 0 },
      { frequency: 2637, startTime: 0.2, duration: 0.4, type: 'sine', gainStart: 0.3, gainEnd: 0 },
      { frequency: 3520, startTime: 0.25, duration: 0.5, type: 'triangle', gainStart: 0.1, gainEnd: 0 },
    ],
    volume,
  )
}

function cosmic(volume: number): void {
  playNotes(
    [
      { frequency: 220, startTime: 0, duration: 1.0, type: 'sine', gainStart: 0.3, gainEnd: 0 },
      { frequency: 330, startTime: 0.1, duration: 0.8, type: 'sine', gainStart: 0.2, gainEnd: 0 },
      { frequency: 440, startTime: 0.3, duration: 0.7, type: 'triangle', gainStart: 0.15, gainEnd: 0 },
      { frequency: 660, startTime: 0.5, duration: 0.6, type: 'sine', gainStart: 0.15, gainEnd: 0 },
      { frequency: 880, startTime: 0.7, duration: 0.5, type: 'sine', gainStart: 0.1, gainEnd: 0 },
    ],
    volume,
  )
}

function beacon(volume: number): void {
  playNotes(
    [
      { frequency: 880, startTime: 0, duration: 0.15, type: 'square', gainStart: 0.2, gainEnd: 0 },
      { frequency: 880, startTime: 0.25, duration: 0.15, type: 'square', gainStart: 0.2, gainEnd: 0 },
      { frequency: 1175, startTime: 0.5, duration: 0.3, type: 'square', gainStart: 0.25, gainEnd: 0 },
    ],
    volume,
  )
}

function melody(volume: number): void {
  const notes: [number, number][] = [
    [523, 0],
    [587, 0.15],
    [659, 0.3],
    [784, 0.45],
    [1047, 0.65],
  ]
  playNotes(
    notes.map(([freq, start]) => ({
      frequency: freq,
      startTime: start,
      duration: 0.25,
      type: 'sine' as OscillatorType,
      gainStart: 0.35,
      gainEnd: 0,
    })),
    volume,
  )
}

const SOUND_MAP: Record<string, (volume: number) => void> = {
  bell,
  chime,
  radar,
  ripple,
  crystal,
  cosmic,
  beacon,
  melody,
}

export function playSound(soundId: string, volume: number): void {
  const fn = SOUND_MAP[soundId]
  if (fn) fn(volume)
}

/**
 * 音を指定回数、間隔を空けて繰り返し再生する。
 * タイマーIDを返すので、必要に応じてキャンセルできる。
 */
export function playSoundRepeated(
  soundId: string,
  volume: number,
  repeatCount: number,
  intervalMs: number,
): { cancel: () => void } {
  if (soundId === 'none' || repeatCount <= 0) return { cancel: () => {} }

  playSound(soundId, volume)

  let played = 1
  const timers: ReturnType<typeof setTimeout>[] = []

  for (let i = 1; i < repeatCount; i++) {
    const timer = setTimeout(() => {
      playSound(soundId, volume)
      played = i + 1
    }, intervalMs * i)
    timers.push(timer)
  }

  return {
    cancel: () => {
      for (const t of timers) clearTimeout(t)
    },
  }
}

export function vibrate(pattern: number[]): void {
  if (typeof navigator.vibrate !== 'function') return
  navigator.vibrate(pattern)
}
