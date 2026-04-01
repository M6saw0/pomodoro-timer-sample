import { useState } from 'react'
import type { SoundSettings as SoundSettingsType } from '../types/sound'
import { SOUND_PRESETS } from '../types/sound'
import { playSound } from '../utils/sounds'

interface SoundSettingsProps {
  settings: SoundSettingsType
  onChange: (settings: SoundSettingsType) => void
}

function SoundSelector({
  label,
  selectedId,
  volume,
  onSelect,
}: {
  label: string
  selectedId: string
  volume: number
  onSelect: (id: string) => void
}) {
  const [playingId, setPlayingId] = useState<string | null>(null)

  const handlePreview = (id: string) => {
    if (id === 'none') return
    setPlayingId(id)
    playSound(id, volume)
    setTimeout(() => setPlayingId(null), 1200)
  }

  return (
    <div className="sound-selector">
      <div className="sound-selector-label">{label}</div>
      <div className="sound-list">
        {SOUND_PRESETS.map((preset) => {
          const isActive = selectedId === preset.id
          const isPlaying = playingId === preset.id
          return (
            <div
              key={preset.id}
              role="button"
              tabIndex={0}
              className={`sound-item ${isActive ? 'sound-item--active' : ''} ${isPlaying ? 'sound-item--playing' : ''}`}
              onClick={() => {
                onSelect(preset.id)
                handlePreview(preset.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(preset.id)
                  handlePreview(preset.id)
                }
              }}
            >
              <span className="sound-item-name">{preset.label}</span>
              {isActive && <span className="sound-item-check">&#10003;</span>}
              {!isActive && preset.id !== 'none' && (
                <button
                  className="sound-item-preview"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePreview(preset.id)
                  }}
                  aria-label={`${preset.label} を試聴`}
                >
                  &#9654;
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SoundSettings({ settings, onChange }: SoundSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...settings, volume: parseFloat(e.target.value) })
  }

  return (
    <section className="setup-section sound-settings-section">
      <button
        className="sound-settings-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="section-heading" style={{ marginBottom: 0 }}>
          サウンド設定
        </span>
        <span className={`sound-settings-chevron ${isOpen ? 'sound-settings-chevron--open' : ''}`}>
          &#9662;
        </span>
      </button>

      {isOpen && (
        <div className="sound-settings-body">
          <div className="sound-volume-row">
            <span className="sound-volume-label">音量</span>
            <input
              type="range"
              className="sound-volume-slider"
              min={0}
              max={1}
              step={0.1}
              value={settings.volume}
              onChange={handleVolumeChange}
            />
            <span className="sound-volume-value">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>

          <SoundSelector
            label="作業終了の音"
            selectedId={settings.workEndSoundId}
            volume={settings.volume}
            onSelect={(id) => onChange({ ...settings, workEndSoundId: id })}
          />

          <SoundSelector
            label="休憩終了の音"
            selectedId={settings.breakEndSoundId}
            volume={settings.volume}
            onSelect={(id) => onChange({ ...settings, breakEndSoundId: id })}
          />
        </div>
      )}
    </section>
  )
}
