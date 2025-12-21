import { useCallback, useRef } from 'react'

type Axis = 'x' | 'y'

export interface SwipeHandlers {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onSwipeUp?: () => void
  onSwipeDown: () => void
}

export interface SwipeRouterOptions {
  thresholdPx?: number
  maxTapMovePx?: number
  lockAxisAfterPx?: number
}

export function useSwipeRouter(handlers: SwipeHandlers, opts?: SwipeRouterOptions) {
  const thresholdPx = opts?.thresholdPx ?? 42
  const maxTapMovePx = opts?.maxTapMovePx ?? 10
  const lockAxisAfterPx = opts?.lockAxisAfterPx ?? 14

  const startRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const axisRef = useRef<Axis | null>(null)
  const movedRef = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only track primary pointer (finger / mouse)
    if ('isPrimary' in e && !e.isPrimary) return
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() }
    axisRef.current = null
    movedRef.current = false
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current) return
      const dx = e.clientX - startRef.current.x
      const dy = e.clientY - startRef.current.y
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)

      const movedEnough = adx > maxTapMovePx || ady > maxTapMovePx
      if (movedEnough) movedRef.current = true

      // Lock axis after some travel so horizontal/vertical do not fight.
      if (!axisRef.current && (adx > lockAxisAfterPx || ady > lockAxisAfterPx)) {
        axisRef.current = adx >= ady ? 'x' : 'y'
      }
    },
    [lockAxisAfterPx, maxTapMovePx],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current) return
      const dx = e.clientX - startRef.current.x
      const dy = e.clientY - startRef.current.y
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)
      const axis: Axis = axisRef.current ?? (adx >= ady ? 'x' : 'y')

      // If it was essentially a tap, ignore.
      if (!movedRef.current) {
        startRef.current = null
        axisRef.current = null
        return
      }

      if (axis === 'x') {
        if (dx <= -thresholdPx) handlers.onSwipeLeft()
        else if (dx >= thresholdPx) handlers.onSwipeRight()
      } else {
        if (dy <= -thresholdPx) handlers.onSwipeUp?.()
        else if (dy >= thresholdPx) handlers.onSwipeDown()
      }

      startRef.current = null
      axisRef.current = null
      movedRef.current = false
    },
    [handlers, thresholdPx],
  )

  const onPointerCancel = useCallback(() => {
    startRef.current = null
    axisRef.current = null
    movedRef.current = false
  }, [])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}


