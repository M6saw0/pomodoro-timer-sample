export interface SoundPreset {
  id: string
  label: string
  description: string
}

export interface SoundSettings {
  workEndSoundId: string
  breakEndSoundId: string
  volume: number
}

export const SOUND_PRESETS: readonly SoundPreset[] = [
  { id: 'none', label: 'なし', description: '音を鳴らさない' },
  { id: 'bell', label: 'ベル', description: '澄んだベル音' },
  { id: 'chime', label: 'チャイム', description: '柔らかなチャイム' },
  { id: 'radar', label: 'レーダー', description: 'パルス状の通知音' },
  { id: 'ripple', label: 'リプル', description: '波紋のような連続音' },
  { id: 'crystal', label: 'クリスタル', description: '透明感のある高音' },
  { id: 'cosmic', label: 'コスミック', description: '宇宙的な響き' },
  { id: 'beacon', label: 'ビーコン', description: '力強い信号音' },
  { id: 'melody', label: 'メロディ', description: '短いフレーズ' },
] as const

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  workEndSoundId: 'bell',
  breakEndSoundId: 'chime',
  volume: 0.5,
}
