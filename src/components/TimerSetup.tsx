import { useState } from 'react'
import type { TimerSequence, TimerStep } from '../types/timer'
import { CLASSIC_POMODORO, SHORT_POMODORO, LONG_POMODORO } from '../types/timer'

interface TimerSetupProps {
  sequence: TimerSequence
  onStart: () => void
  onSequenceChange: (sequence: TimerSequence) => void
}

const PRESETS = [
  { label: 'クラシック', time: '25/5', sequence: CLASSIC_POMODORO },
  { label: 'ショート', time: '15/3', sequence: SHORT_POMODORO },
  { label: 'ロング', time: '50/10', sequence: LONG_POMODORO },
]

const DEFAULT_WORK_STEP: TimerStep = { label: '作業', durationSeconds: 25 * 60, type: 'work' }
const DEFAULT_BREAK_STEP: TimerStep = { label: '休憩', durationSeconds: 5 * 60, type: 'break' }

function isActivePreset(sequence: TimerSequence, preset: TimerSequence): boolean {
  if (sequence.steps.length !== preset.steps.length) return false
  if (sequence.repeatCount !== preset.repeatCount) return false
  return sequence.steps.every(
    (s, i) =>
      s.label === preset.steps[i].label &&
      s.durationSeconds === preset.steps[i].durationSeconds &&
      s.type === preset.steps[i].type,
  )
}

export function TimerSetup({ sequence, onStart, onSequenceChange }: TimerSetupProps) {
  const [editingDuration, setEditingDuration] = useState<Record<number, string>>({})

  const handleRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (isNaN(val) || val < 1 || val > 10) return
    onSequenceChange({ ...sequence, repeatCount: val })
  }

  const handleDurationChange = (index: number, value: string) => {
    setEditingDuration((prev) => ({ ...prev, [index]: value }))
    const mins = parseInt(value, 10)
    if (!isNaN(mins) && mins >= 1 && mins <= 99) {
      onSequenceChange({
        ...sequence,
        steps: sequence.steps.map((s, idx) =>
          idx === index ? { ...s, durationSeconds: mins * 60 } : s,
        ),
      })
    }
  }

  const handleDurationBlur = (index: number) => {
    setEditingDuration((prev) => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  const handleAddStep = (type: 'work' | 'break') => {
    const newStep = type === 'work' ? { ...DEFAULT_WORK_STEP } : { ...DEFAULT_BREAK_STEP }
    onSequenceChange({
      ...sequence,
      steps: [...sequence.steps, newStep],
    })
  }

  const handleRemoveStep = (index: number) => {
    if (sequence.steps.length <= 1) return
    onSequenceChange({
      ...sequence,
      steps: sequence.steps.filter((_, idx) => idx !== index),
    })
  }

  const handleTypeToggle = (index: number) => {
    onSequenceChange({
      ...sequence,
      steps: sequence.steps.map((s, idx) =>
        idx === index
          ? { ...s, type: s.type === 'work' ? 'break' : 'work' }
          : s,
      ),
    })
  }

  return (
    <div className="timer-setup">
      <h1 className="setup-title">Pomodoro Timer</h1>

      <section className="setup-section">
        <h2 className="section-heading">プリセット</h2>
        <div className="presets-grid">
          {PRESETS.map(({ label, time, sequence: preset }) => {
            const active = isActivePreset(sequence, preset)
            return (
              <button
                key={label}
                className={`preset-card ${active ? 'preset-card--active' : ''}`}
                onClick={() => onSequenceChange(preset)}
              >
                <span className="preset-card-time">{time}</span>
                <span className="preset-card-label">{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="setup-section">
        <h2 className="section-heading">タイマー構成</h2>
        <div className="steps-list">
          {sequence.steps.map((step, i) => (
            <div key={i} className="step-card">
              <button
                className={`step-type-badge ${step.type === 'work' ? 'step-type-badge--work' : 'step-type-badge--break'}`}
                onClick={() => handleTypeToggle(i)}
                title="タイプを切り替え"
              >
                {step.type === 'work' ? '作業' : '休憩'}
              </button>
              <input
                className="step-label-input"
                value={step.label}
                placeholder="ラベル"
                onChange={(e) =>
                  onSequenceChange({
                    ...sequence,
                    steps: sequence.steps.map((s, idx) =>
                      idx === i ? { ...s, label: e.target.value } : s,
                    ),
                  })
                }
              />
              <div className="step-duration-wrapper">
                <input
                  type="text"
                  inputMode="numeric"
                  className="step-duration-input"
                  value={editingDuration[i] ?? String(Math.floor(step.durationSeconds / 60))}
                  onChange={(e) => handleDurationChange(i, e.target.value)}
                  onFocus={() =>
                    setEditingDuration((prev) => ({
                      ...prev,
                      [i]: String(Math.floor(step.durationSeconds / 60)),
                    }))
                  }
                  onBlur={() => handleDurationBlur(i)}
                />
                <span className="step-duration-unit">分</span>
              </div>
              {sequence.steps.length > 1 && (
                <button
                  className="step-remove-btn"
                  onClick={() => handleRemoveStep(i)}
                  aria-label={`${step.label} を削除`}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="step-add-buttons">
          <button className="step-add-btn step-add-btn--work" onClick={() => handleAddStep('work')}>
            + 作業を追加
          </button>
          <button className="step-add-btn step-add-btn--break" onClick={() => handleAddStep('break')}>
            + 休憩を追加
          </button>
        </div>
      </section>

      <section className="setup-section">
        <div className="repeat-row">
          <span className="section-heading" style={{ marginBottom: 0 }}>リピート</span>
          <div className="repeat-control">
            <input
              type="number"
              className="repeat-input"
              min={1}
              max={10}
              value={sequence.repeatCount}
              onChange={handleRepeatChange}
            />
            <span className="repeat-unit">回</span>
          </div>
        </div>
      </section>

      <button className="start-btn" onClick={onStart}>
        スタート
      </button>
    </div>
  )
}
