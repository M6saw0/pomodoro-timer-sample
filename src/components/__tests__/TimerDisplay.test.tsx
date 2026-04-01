import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimerDisplay } from '../TimerDisplay'

describe('TimerDisplay', () => {
  it('should display time in MM:SS format', () => {
    render(
      <TimerDisplay
        remainingSeconds={1500}
        totalSeconds={1500}
        label="作業"
        stepType="work"
        isRunning={false}
        currentStep={1}
        totalSteps={2}
        currentRepeat={1}
        totalRepeats={4}
      />,
    )
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('should display the step label', () => {
    render(
      <TimerDisplay
        remainingSeconds={300}
        totalSeconds={300}
        label="休憩"
        stepType="break"
        isRunning={false}
        currentStep={2}
        totalSteps={2}
        currentRepeat={2}
        totalRepeats={4}
      />,
    )
    expect(screen.getByText('休憩')).toBeInTheDocument()
  })

  it('should display round information', () => {
    render(
      <TimerDisplay
        remainingSeconds={1500}
        totalSeconds={1500}
        label="作業"
        stepType="work"
        isRunning={false}
        currentStep={1}
        totalSteps={2}
        currentRepeat={3}
        totalRepeats={4}
      />,
    )
    expect(screen.getByText(/3.*4/)).toBeInTheDocument()
  })

  it('should display step progress', () => {
    render(
      <TimerDisplay
        remainingSeconds={1500}
        totalSeconds={1500}
        label="作業"
        stepType="work"
        isRunning={false}
        currentStep={1}
        totalSteps={4}
        currentRepeat={1}
        totalRepeats={4}
      />,
    )
    expect(screen.getByText(/タイマー 1 \/ 4/)).toBeInTheDocument()
  })

  it('should format single digit seconds correctly', () => {
    render(
      <TimerDisplay
        remainingSeconds={65}
        totalSeconds={1500}
        label="作業"
        stepType="work"
        isRunning={false}
        currentStep={1}
        totalSteps={1}
        currentRepeat={1}
        totalRepeats={1}
      />,
    )
    expect(screen.getByText('01:05')).toBeInTheDocument()
  })
})
