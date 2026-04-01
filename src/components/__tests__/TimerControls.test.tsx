import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimerControls } from '../TimerControls'

describe('TimerControls', () => {
  it('should show Start button when idle', () => {
    render(
      <TimerControls
        state="idle"
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onReset={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /スタート/i })).toBeInTheDocument()
  })

  it('should show Pause and Reset buttons when running', () => {
    render(
      <TimerControls
        state="running"
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onReset={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /一時停止/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /リセット/i })).toBeInTheDocument()
  })

  it('should show Resume and Reset buttons when paused', () => {
    render(
      <TimerControls
        state="paused"
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onReset={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /再開/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /リセット/i })).toBeInTheDocument()
  })

  it('should call onStart when Start button clicked', async () => {
    const onStart = vi.fn()
    render(
      <TimerControls
        state="idle"
        onStart={onStart}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onReset={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /スタート/i }))
    expect(onStart).toHaveBeenCalled()
  })

  it('should call onPause when Pause button clicked', async () => {
    const onPause = vi.fn()
    render(
      <TimerControls
        state="running"
        onStart={vi.fn()}
        onPause={onPause}
        onResume={vi.fn()}
        onReset={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /一時停止/i }))
    expect(onPause).toHaveBeenCalled()
  })

  it('should call onReset when Reset button clicked', async () => {
    const onReset = vi.fn()
    render(
      <TimerControls
        state="running"
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onReset={onReset}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /リセット/i }))
    expect(onReset).toHaveBeenCalled()
  })

  it('should have minimum touch target size on primary button', () => {
    render(
      <TimerControls
        state="idle"
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onReset={vi.fn()}
      />,
    )
    const btn = screen.getByRole('button', { name: /スタート/i })
    expect(btn.className).toMatch(/min-h|h-/)
  })

  it('should show restart button when completed', () => {
    render(
      <TimerControls
        state="completed"
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onReset={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /もう一度/i })).toBeInTheDocument()
  })
})
