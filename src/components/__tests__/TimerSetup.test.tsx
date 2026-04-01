import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimerSetup } from '../TimerSetup'
import { CLASSIC_POMODORO } from '../../types/timer'

describe('TimerSetup', () => {
  it('should render preset options', () => {
    render(<TimerSetup sequence={CLASSIC_POMODORO} onStart={vi.fn()} onSequenceChange={vi.fn()} />)
    expect(screen.getByText(/クラシック/i)).toBeInTheDocument()
    expect(screen.getByText(/ショート/i)).toBeInTheDocument()
    expect(screen.getByText(/ロング/i)).toBeInTheDocument()
  })

  it('should call onStart when start is clicked', async () => {
    const onStart = vi.fn()
    render(<TimerSetup sequence={CLASSIC_POMODORO} onStart={onStart} onSequenceChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /スタート/i }))
    expect(onStart).toHaveBeenCalled()
  })

  it('should call onSequenceChange when preset is selected', async () => {
    const onSequenceChange = vi.fn()
    render(
      <TimerSetup
        sequence={CLASSIC_POMODORO}
        onStart={vi.fn()}
        onSequenceChange={onSequenceChange}
      />,
    )
    await userEvent.click(screen.getByText(/ショート/i))
    expect(onSequenceChange).toHaveBeenCalled()
  })

  it('should display current repeat count', () => {
    render(
      <TimerSetup sequence={CLASSIC_POMODORO} onStart={vi.fn()} onSequenceChange={vi.fn()} />,
    )
    expect(screen.getByDisplayValue('4')).toBeInTheDocument()
  })

  it('should call onSequenceChange when repeat count changes', () => {
    const onSequenceChange = vi.fn()
    render(
      <TimerSetup
        sequence={CLASSIC_POMODORO}
        onStart={vi.fn()}
        onSequenceChange={onSequenceChange}
      />,
    )
    const input = screen.getByDisplayValue('4')
    fireEvent.change(input, { target: { value: '3' } })
    expect(onSequenceChange).toHaveBeenCalled()
  })

  it('should call onSequenceChange when step label changes', () => {
    const onSequenceChange = vi.fn()
    render(
      <TimerSetup
        sequence={CLASSIC_POMODORO}
        onStart={vi.fn()}
        onSequenceChange={onSequenceChange}
      />,
    )
    const labelInput = screen.getByDisplayValue('作業')
    fireEvent.change(labelInput, { target: { value: '集中' } })
    expect(onSequenceChange).toHaveBeenCalled()
  })

  it('should call onSequenceChange when step duration changes', () => {
    const onSequenceChange = vi.fn()
    render(
      <TimerSetup
        sequence={CLASSIC_POMODORO}
        onStart={vi.fn()}
        onSequenceChange={onSequenceChange}
      />,
    )
    // Duration input shows "25" for the first step (25 minutes)
    const durationInput = screen.getByDisplayValue('25')
    fireEvent.focus(durationInput)
    fireEvent.change(durationInput, { target: { value: '30' } })
    expect(onSequenceChange).toHaveBeenCalled()
  })

  it('should ignore invalid duration input', () => {
    const onSequenceChange = vi.fn()
    render(
      <TimerSetup
        sequence={CLASSIC_POMODORO}
        onStart={vi.fn()}
        onSequenceChange={onSequenceChange}
      />,
    )
    const durationInput = screen.getByDisplayValue('25')
    fireEvent.focus(durationInput)
    fireEvent.change(durationInput, { target: { value: '0' } })
    expect(onSequenceChange).not.toHaveBeenCalled()
  })

  it('should ignore invalid repeat count', () => {
    const onSequenceChange = vi.fn()
    render(
      <TimerSetup
        sequence={CLASSIC_POMODORO}
        onStart={vi.fn()}
        onSequenceChange={onSequenceChange}
      />,
    )
    const input = screen.getByDisplayValue('4')
    fireEvent.change(input, { target: { value: '' } })
    expect(onSequenceChange).not.toHaveBeenCalled()
  })
})
