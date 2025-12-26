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
  wheelThresholdPx?: number
  wheelGestureIdleMs?: number
}

export function useSwipeRouter(handlers: SwipeHandlers, opts?: SwipeRouterOptions) {
  const thresholdPx = opts?.thresholdPx ?? 42
  const maxTapMovePx = opts?.maxTapMovePx ?? 10
  const lockAxisAfterPx = opts?.lockAxisAfterPx ?? 14
  const wheelThresholdPx = opts?.wheelThresholdPx ?? 80
  const wheelGestureIdleMs = opts?.wheelGestureIdleMs ?? 160

  const startRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const axisRef = useRef<Axis | null>(null)
  const movedRef = useRef(false)

  const wheelAccRef = useRef<{ x: number; y: number } | null>(null)
  const wheelAxisRef = useRef<Axis | null>(null)
  const wheelTriggeredInGestureRef = useRef(false)
  const wheelIdleTimerRef = useRef<number | null>(null)

  const shouldIgnoreWheelTarget = (target: EventTarget | null) => {
    if (!target) return false
    const el = target as HTMLElement
    if (!el?.closest) return false

    if (el.closest('[data-swipe-router-ignore="true"]')) return true

    const tag = el.tagName?.toLowerCase?.() ?? ''
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'option') return true
    if (el.isContentEditable) return true

    return false
  }

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

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      // Avoid treating pinch-zoom as swipe on trackpads.
      if ((e as any).ctrlKey) return
      if (shouldIgnoreWheelTarget(e.target)) return

      // We treat a "gesture" as a burst of wheel events. Within a gesture,
      // allow at most one navigation step.
      if (wheelTriggeredInGestureRef.current) {
        if (wheelIdleTimerRef.current) window.clearTimeout(wheelIdleTimerRef.current)
        wheelIdleTimerRef.current = window.setTimeout(() => {
          wheelAccRef.current = null
          wheelAxisRef.current = null
          wheelTriggeredInGestureRef.current = false
          wheelIdleTimerRef.current = null
        }, wheelGestureIdleMs)
        return
      }

      const dx = e.deltaX ?? 0
      const dy = e.deltaY ?? 0
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)
      if (adx < 1 && ady < 1) return

      if (wheelIdleTimerRef.current) window.clearTimeout(wheelIdleTimerRef.current)
      wheelIdleTimerRef.current = window.setTimeout(() => {
        wheelAccRef.current = null
        wheelAxisRef.current = null
        wheelTriggeredInGestureRef.current = false
        wheelIdleTimerRef.current = null
      }, wheelGestureIdleMs)

      const acc = wheelAccRef.current ?? { x: 0, y: 0 }
      acc.x += dx
      acc.y += dy
      wheelAccRef.current = acc

      if (!wheelAxisRef.current) {
        if (Math.abs(acc.x) > lockAxisAfterPx || Math.abs(acc.y) > lockAxisAfterPx) {
          wheelAxisRef.current = Math.abs(acc.x) >= Math.abs(acc.y) ? 'x' : 'y'
        }
      }

      const axis: Axis = wheelAxisRef.current ?? (Math.abs(acc.x) >= Math.abs(acc.y) ? 'x' : 'y')

      if (axis === 'x') {
        if (acc.x <= -wheelThresholdPx) {
          handlers.onSwipeLeft()
          wheelAccRef.current = null
          wheelAxisRef.current = null
          wheelTriggeredInGestureRef.current = true
        } else if (acc.x >= wheelThresholdPx) {
          handlers.onSwipeRight()
          wheelAccRef.current = null
          wheelAxisRef.current = null
          wheelTriggeredInGestureRef.current = true
        }
      } else {
        if (acc.y <= -wheelThresholdPx) {
          handlers.onSwipeUp?.()
          wheelAccRef.current = null
          wheelAxisRef.current = null
          wheelTriggeredInGestureRef.current = true
        } else if (acc.y >= wheelThresholdPx) {
          handlers.onSwipeDown()
          wheelAccRef.current = null
          wheelAxisRef.current = null
          wheelTriggeredInGestureRef.current = true
        }
      }
    },
    [handlers, lockAxisAfterPx, wheelGestureIdleMs, wheelThresholdPx],
  )

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onWheel,
  }
}


