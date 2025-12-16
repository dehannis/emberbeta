import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Talk.css'

const colorSchemes = [
  { name: 'blue', primary: '140, 200, 255', secondary: '100, 180, 255' }, // Light blue (default)
  { name: 'orange', primary: '255, 180, 120', secondary: '255, 150, 100' }, // Warm orange
  { name: 'green', primary: '150, 220, 150', secondary: '120, 200, 120' }, // Warm green
  { name: 'red', primary: '255, 140, 140', secondary: '255, 120, 120' }, // Warm red
  { name: 'yellow', primary: '255, 220, 140', secondary: '255, 200, 120' }, // Warm yellow
  { name: 'purple', primary: '220, 180, 255', secondary: '200, 160, 255' }, // Warm purple
  { name: 'white', primary: '255, 255, 255', secondary: '240, 240, 240' }, // White
  { name: 'klein', primary: '0, 47, 167', secondary: '0, 35, 150' }, // Yves Klein Blue
]

const Talk: React.FC = () => {
  const navigate = useNavigate()
  const [isEntering, setIsEntering] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const circleRef = useRef<HTMLDivElement>(null)
  const [exitAnchor, setExitAnchor] = useState<{ x: number; y: number } | null>(null)

  // --- Hume EVI voice chat (local proxy) ---
  type VoiceStatus = 'idle' | 'connecting' | 'live' | 'error'
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle')
  const [voiceError, setVoiceError] = useState<string>('')
  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const isSendingRef = useRef(false)

  const playbackQueueRef = useRef<Array<{ url: string; mime: string }>>([])
  const playingRef = useRef(false)

  const proxyWsUrl = useMemo(() => {
    const envUrl = (import.meta as any).env?.VITE_EVI_PROXY_WS as string | undefined
    if (envUrl && typeof envUrl === 'string') return envUrl
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.hostname || 'localhost'
    return `${proto}://${host}:8788/evi`
  }, [])
  
  // Initialize color index from localStorage or default to 0
  const getInitialColorIndex = () => {
    const savedColorIndex = localStorage.getItem('emberTalkOrbColor')
    if (savedColorIndex !== null) {
      const index = parseInt(savedColorIndex, 10)
      if (index >= 0 && index < colorSchemes.length) {
        return index
      }
    }
    return 0
  }
  
  const [colorIndex, setColorIndex] = useState(getInitialColorIndex)
  const isInitialMount = useRef(true)

  const currentColor = colorSchemes[colorIndex]
  const [showExitOverlay, setShowExitOverlay] = useState(false)

  // Check if coming from verification and set to light blue
  useEffect(() => {
    const fromVerification = sessionStorage.getItem('emberFromVerification')
    if (fromVerification === 'true') {
      sessionStorage.removeItem('emberFromVerification')
      setColorIndex(0) // Light blue
      localStorage.setItem('emberTalkOrbColor', '0') // Also save it
    }
  }, [])

  // Save color index to localStorage whenever it changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    localStorage.setItem('emberTalkOrbColor', colorIndex.toString())
  }, [colorIndex])

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleEndCall = () => {
    stopVoice()
    setShowExitOverlay(true)
  }

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowExitOverlay(true)
  }

  const handleSaveAndNext = () => {
    // For MVP: after a Talk session, create a new memory whose ABOUT defaults to today (Present).
    // TODO: Backend: replace with real recording + transcription pipeline + server-side storage.
    const todayISO = new Date().toISOString().slice(0, 10)
    const newId = `m-${Date.now()}`
    const newMemory = {
      id: newId,
      title: 'New memory',
      aboutDate: todayISO,
      recordedOn: todayISO,
      note: '',
      personId: 'me',
      visibility: 'shared',
      // audioUrl: TODO (recording URL)
    }

    try {
      const raw = localStorage.getItem('emberMemoriesV1')
      const parsed = raw ? JSON.parse(raw) : null
      const list = Array.isArray(parsed) ? parsed : []
      list.unshift(newMemory)
      localStorage.setItem('emberMemoriesV1', JSON.stringify(list))
    } catch {
      // ignore
    }

    // Tell Build to center this memory.
    sessionStorage.setItem('emberNewMemoryId', newId)
    navigate('/build')
  }

  const handleDeleteAndRerecord = () => {
    // Delete logic here
    navigate('/')
  }

  const handleCancel = () => {
    setShowExitOverlay(false)
  }

  const handleOrbClick = () => {
    // First click starts voice (required for mic permissions). Subsequent clicks keep your color-cycle behavior.
    if (voiceStatus === 'idle' || voiceStatus === 'error') {
      void startVoice()
      return
    }
    setColorIndex((prev) => (prev + 1) % colorSchemes.length)
  }

  const base64FromBytes = (bytes: Uint8Array) => {
    let binary = ''
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
    }
    return btoa(binary)
  }

  const bytesFromBase64 = (b64: string) => {
    const bin = atob(b64)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
  }

  const downsampleTo16k = (input: Float32Array, inputRate: number) => {
    const targetRate = 16000
    if (inputRate === targetRate) return input
    const ratio = inputRate / targetRate
    const outLen = Math.floor(input.length / ratio)
    const out = new Float32Array(outLen)
    for (let i = 0; i < outLen; i++) {
      const idx = i * ratio
      const idx0 = Math.floor(idx)
      const idx1 = Math.min(idx0 + 1, input.length - 1)
      const frac = idx - idx0
      out[i] = input[idx0] * (1 - frac) + input[idx1] * frac
    }
    return out
  }

  const floatToPcm16 = (f32: Float32Array) => {
    const out = new Int16Array(f32.length)
    for (let i = 0; i < f32.length; i++) {
      const v = Math.max(-1, Math.min(1, f32[i]))
      out[i] = v < 0 ? v * 0x8000 : v * 0x7fff
    }
    return new Uint8Array(out.buffer)
  }

  const enqueuePlayback = (bytes: Uint8Array) => {
    // Best-effort MIME detection (RIFF=WAV).
    const isRiff = bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    const mime = isRiff ? 'audio/wav' : 'application/octet-stream'
    // TS: BlobPart is typed narrowly; ensure we pass an actual ArrayBuffer (not ArrayBufferLike).
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
    const url = URL.createObjectURL(new Blob([ab], { type: mime }))
    playbackQueueRef.current.push({ url, mime })
    pumpPlayback()
  }

  const pumpPlayback = () => {
    if (playingRef.current) return
    const next = playbackQueueRef.current.shift()
    if (!next) return
    playingRef.current = true
    const audio = new Audio(next.url)
    audio.onended = () => {
      URL.revokeObjectURL(next.url)
      playingRef.current = false
      pumpPlayback()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(next.url)
      playingRef.current = false
      pumpPlayback()
    }
    void audio.play().catch(() => {
      // ignore
      URL.revokeObjectURL(next.url)
      playingRef.current = false
      pumpPlayback()
    })
  }

  const startVoice = async () => {
    setVoiceError('')
    setVoiceStatus('connecting')

    try {
      const ws = new WebSocket(proxyWsUrl)
      wsRef.current = ws

      ws.onopen = async () => {
        try {
          // Mic capture must be initiated after a user gesture (this click).
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          })
          mediaStreamRef.current = stream

          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          audioCtxRef.current = ctx

          const source = ctx.createMediaStreamSource(stream)
          const processor = ctx.createScriptProcessor(4096, 1, 1)
          processorRef.current = processor

          processor.onaudioprocess = (e) => {
            if (isMuted) return
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
            // Avoid piling up if the socket is backpressured.
            if (isSendingRef.current) return

            const ch0 = e.inputBuffer.getChannelData(0)
            const down = downsampleTo16k(ch0, ctx.sampleRate)
            const bytes = floatToPcm16(down)
            const b64 = base64FromBytes(bytes)

            // Hume EVI expects base64 audio chunks as `{ type: "audio_input", data: "<base64>" }`
            // Session audio settings (linear16/16k/mono) are configured server-side in the proxy.
            const msg = { type: 'audio_input', data: b64 }

            try {
              isSendingRef.current = true
              ws.send(JSON.stringify(msg))
            } finally {
              isSendingRef.current = false
            }
          }

          source.connect(processor)
          processor.connect(ctx.destination) // keeps processor alive

          setVoiceStatus('live')
        } catch (err) {
          setVoiceStatus('error')
          setVoiceError('Microphone permission failed (or no mic available).')
          try {
            ws.close()
          } catch {
            // ignore
          }
        }
      }

      ws.onmessage = (evt) => {
        // Forwarded Hume messages (or proxy status/errors)
        try {
          const parsed = JSON.parse(String(evt.data))
          if (parsed?.type === 'proxy_error') {
            setVoiceStatus('error')
            setVoiceError(parsed?.message || 'Proxy error')
            return
          }
          if (parsed?.type === 'proxy_status' && parsed?.status === 'connected') {
            // ignore (we mark live after mic starts)
            return
          }

          // Try to find an audio payload in common shapes.
          if (parsed?.type === 'audio_output' && typeof parsed?.data === 'string') {
            enqueuePlayback(bytesFromBase64(parsed.data))
          }
        } catch {
          // Non-JSON payloads are ignored for now.
        }
      }

      ws.onerror = () => {
        setVoiceStatus('error')
        setVoiceError('Failed to connect to local voice proxy. Is it running?')
      }

      ws.onclose = () => {
        if (voiceStatus !== 'idle') setVoiceStatus('idle')
      }
    } catch {
      setVoiceStatus('error')
      setVoiceError('Voice initialization failed.')
    }
  }

  const stopVoice = () => {
    try {
      processorRef.current?.disconnect()
    } catch {
      // ignore
    }
    processorRef.current = null

    try {
      audioCtxRef.current?.close()
    } catch {
      // ignore
    }
    audioCtxRef.current = null

    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    } catch {
      // ignore
    }
    mediaStreamRef.current = null

    try {
      wsRef.current?.close()
    } catch {
      // ignore
    }
    wsRef.current = null

    playbackQueueRef.current.splice(0, playbackQueueRef.current.length)
    playingRef.current = false
    setVoiceStatus('idle')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopVoice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Anchor exit overlay to the orb's true center (no hardcoded offsets).
  useEffect(() => {
    if (!showExitOverlay) return

    const measure = () => {
      const el = circleRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setExitAnchor({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }

    measure()
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
    }
  }, [showExitOverlay])

  return (
    <div className={`talk-container ${isEntering ? 'entering' : 'active'}`}>
      {/* Custom Header with intercepted clicks */}
      <header className="header">
        <span className="home-icon" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
          ○
        </span>
      </header>

      {/* Circle */}
      <div className="circle-wrapper">
        <div 
          className={`circle ${isMuted ? 'muted' : ''}`}
          ref={circleRef}
          onClick={handleOrbClick}
          style={{
            cursor: 'pointer',
            '--color-primary': currentColor.primary,
            '--color-secondary': currentColor.secondary,
          } as React.CSSProperties}
        />
      </div>

      {/* Controls */}
      <div className="talk-controls">
        <button 
          className={`control-btn ${isMuted ? 'active' : ''}`} 
          onClick={handleMuteToggle}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>
        
        <button 
          className="control-btn end-btn" 
          onClick={handleEndCall}
          aria-label="End call"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>
      </div>

      {/* Minimal voice status (local dev) */}
      {(voiceStatus === 'connecting' || voiceStatus === 'error') && (
        <div className="voice-hint" role={voiceStatus === 'error' ? 'alert' : undefined}>
          {voiceStatus === 'connecting' ? 'Connecting…' : (voiceError || 'Voice error')}
        </div>
      )}

      {/* Exit Overlay */}
      {showExitOverlay && (
        <div className="exit-overlay" onClick={handleCancel}>
          <div
            className="exit-overlay-content"
            onClick={(e) => e.stopPropagation()}
            style={
              exitAnchor
                ? {
                    left: `${exitAnchor.x}px`,
                    top: `${exitAnchor.y}px`,
                    transform: 'translate(-50%, -50%)',
                  }
                : undefined
            }
          >
            <div className="exit-overlay-buttons">
              <button 
                className="exit-btn save-btn" 
                onClick={handleSaveAndNext}
              >
                Save & Next
              </button>
              <button 
                className="exit-btn delete-btn" 
                onClick={handleDeleteAndRerecord}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Talk
