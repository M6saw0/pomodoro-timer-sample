import { useState, useCallback, useRef } from 'react'
import { TimerDisplay } from './components/TimerDisplay'
import { TimerControls } from './components/TimerControls'
import { TimerSetup } from './components/TimerSetup'
import { SoundSettings } from './components/SoundSettings'
import { useTimerSequence } from './hooks/useTimerSequence'
import { useWakeLock } from './hooks/useWakeLock'
import { playSoundRepeated, vibrate } from './utils/sounds'
import { saveSequence, loadSequence } from './utils/storage'
import { saveSoundSettings, loadSoundSettings } from './utils/soundStorage'
import { CLASSIC_POMODORO, type TimerSequence } from './types/timer'
import type { SoundSettings as SoundSettingsType } from './types/sound'
import './App.css'

const STEP_ALERT_REPEAT_COUNT = 3
const STEP_ALERT_INTERVAL_MS = 1500
const COMPLETE_ALERT_REPEAT_COUNT = 5
const COMPLETE_ALERT_INTERVAL_MS = 1200

type Screen = 'setup' | 'timer'

function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [sequence, setSequence] = useState<TimerSequence>(
    () => loadSequence() ?? CLASSIC_POMODORO,
  )
  const [soundSettings, setSoundSettings] = useState<SoundSettingsType>(loadSoundSettings)

  const { requestWakeLock, releaseWakeLock } = useWakeLock()
  const alertCancelRef = useRef<{ cancel: () => void } | null>(null)

  const cancelOngoingAlert = useCallback(() => {
    alertCancelRef.current?.cancel()
    alertCancelRef.current = null
  }, [])

  const handleSequenceComplete = useCallback(() => {
    cancelOngoingAlert()
    alertCancelRef.current = playSoundRepeated(
      soundSettings.workEndSoundId,
      soundSettings.volume,
      COMPLETE_ALERT_REPEAT_COUNT,
      COMPLETE_ALERT_INTERVAL_MS,
    )
    vibrate([200, 100, 200, 100, 300])
    void releaseWakeLock()
  }, [releaseWakeLock, soundSettings, cancelOngoingAlert])

  const handleStepComplete = useCallback(
    (completedStepType: 'work' | 'break') => {
      cancelOngoingAlert()
      const soundId =
        completedStepType === 'work'
          ? soundSettings.workEndSoundId
          : soundSettings.breakEndSoundId
      alertCancelRef.current = playSoundRepeated(
        soundId,
        soundSettings.volume,
        STEP_ALERT_REPEAT_COUNT,
        STEP_ALERT_INTERVAL_MS,
      )
      vibrate([200, 100, 200])
    },
    [soundSettings, cancelOngoingAlert],
  )

  const timerSeq = useTimerSequence(sequence, handleSequenceComplete, handleStepComplete)

  const isWorkStep = timerSeq.currentStep.type === 'work'
  const bgClass = screen === 'timer' ? (isWorkStep ? 'bg-work' : 'bg-break') : ''

  const handleStart = useCallback(() => {
    setScreen('timer')
    timerSeq.start()
    void requestWakeLock()
  }, [timerSeq, requestWakeLock])

  const handlePause = useCallback(() => {
    cancelOngoingAlert()
    timerSeq.pause()
    void releaseWakeLock()
  }, [timerSeq, releaseWakeLock, cancelOngoingAlert])

  const handleResume = useCallback(() => {
    timerSeq.resume()
    void requestWakeLock()
  }, [timerSeq, requestWakeLock])

  const handleReset = useCallback(() => {
    cancelOngoingAlert()
    timerSeq.reset()
    void releaseWakeLock()
    setScreen('setup')
  }, [timerSeq, releaseWakeLock, cancelOngoingAlert])

  const handleSequenceChange = useCallback(
    (newSeq: TimerSequence) => {
      setSequence(newSeq)
      saveSequence(newSeq)
    },
    [],
  )

  const handleSoundSettingsChange = useCallback(
    (newSettings: SoundSettingsType) => {
      setSoundSettings(newSettings)
      saveSoundSettings(newSettings)
    },
    [],
  )

  return (
    <div className={`app ${bgClass}`}>
      <main className="app-main">
        {screen === 'setup' ? (
          <>
            <TimerSetup
              sequence={sequence}
              onStart={handleStart}
              onSequenceChange={handleSequenceChange}
            />
            <div style={{ marginTop: 24 }}>
              <SoundSettings
                settings={soundSettings}
                onChange={handleSoundSettingsChange}
              />
            </div>
          </>
        ) : (
          <>
            <TimerDisplay
              remainingSeconds={timerSeq.remainingSeconds}
              totalSeconds={timerSeq.currentStep.durationSeconds}
              label={timerSeq.currentStep.label}
              stepType={timerSeq.currentStep.type}
              isRunning={timerSeq.state === 'running'}
              currentStep={timerSeq.currentStepIndex + 1}
              totalSteps={timerSeq.totalSteps}
              currentRepeat={timerSeq.currentRepeat}
              totalRepeats={sequence.repeatCount}
            />
            <TimerControls
              state={timerSeq.state}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onReset={handleReset}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App
