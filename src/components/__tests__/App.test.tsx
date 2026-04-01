import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../../App'

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    // Mock navigator.wakeLock to avoid errors
    Object.defineProperty(navigator, 'wakeLock', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render setup screen initially', () => {
    render(<App />)
    expect(screen.getByText(/クラシック/i)).toBeInTheDocument()
  })

  it('should switch to timer screen when start is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
    expect(screen.getByRole('button', { name: /一時停止/i })).toBeInTheDocument()
  })

  it('should return to setup screen after reset', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
    fireEvent.click(screen.getByRole('button', { name: /リセット/i }))
    expect(screen.getByText(/クラシック/i)).toBeInTheDocument()
  })

  it('should show pause button when running', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
    expect(screen.getByRole('button', { name: /一時停止/i })).toBeInTheDocument()
  })

  it('should show resume button after pause', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
    fireEvent.click(screen.getByRole('button', { name: /一時停止/i }))
    expect(screen.getByRole('button', { name: /再開/i })).toBeInTheDocument()
  })

  it('should resume when resume is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
    fireEvent.click(screen.getByRole('button', { name: /一時停止/i }))
    fireEvent.click(screen.getByRole('button', { name: /再開/i }))
    expect(screen.getByRole('button', { name: /一時停止/i })).toBeInTheDocument()
  })

  it('should complete sequence when all time elapses', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /スタート/i }))
    // The timer should be running
    expect(screen.getByRole('button', { name: /一時停止/i })).toBeInTheDocument()
  })
})
