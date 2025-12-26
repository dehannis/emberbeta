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
  const isMutedRef = useRef(false)
  const circleRef = useRef<HTMLDivElement>(null)
  const orbWrapRef = useRef<HTMLDivElement>(null)
  const [exitAnchor, setExitAnchor] = useState<{ x: number; y: number } | null>(null)

  // --- Hume EVI voice chat (local proxy) ---
  type VoiceStatus = 'idle' | 'connecting' | 'live' | 'error'
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle')
  const [voiceError, setVoiceError] = useState<string>('')
  const [isEmberSpeaking, setIsEmberSpeaking] = useState(false)
  const isEmberSpeakingRef = useRef(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [needsAudioGesture, setNeedsAudioGesture] = useState(false)
  const didAutoGreetRef = useRef(false)
  const didEmberSpeakOnceRef = useRef(false)
  const didRequestMicRef = useRef(false)
  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const isSendingRef = useRef(false)
  const micAnalyserRef = useRef<AnalyserNode | null>(null)
  const micRafRef = useRef<number | null>(null)

  const playbackQueueRef = useRef<Array<{ wav: ArrayBuffer }>>([])
  const playingRef = useRef(false)
  const playbackAudioCtxRef = useRef<AudioContext | null>(null)
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null)
  const emberRafRef = useRef<number | null>(null)
  const emberLevelSmoothedRef = useRef(0)

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

  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  useEffect(() => {
    isEmberSpeakingRef.current = isEmberSpeaking
  }, [isEmberSpeaking])

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
    // Note: Build page no longer exists on this branch, so route back to Remember.
    navigate('/remember')
  }

  const handleDeleteAndRerecord = () => {
    // Delete logic here
    navigate('/')
  }

  const handleCancel = () => {
    setShowExitOverlay(false)
  }

  const handleOrbClick = () => {
    // Always cycle the orb color on click.
    setColorIndex((prev) => (prev + 1) % colorSchemes.length)

    // Also use early clicks to request mic permission (so we can show listening bars).
    if (!mediaStreamRef.current) {
      void startMicCapture()
    }
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
    // Keep raw WAV bytes so we can play + analyse through WebAudio reliably.
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
    playbackQueueRef.current.push({ wav: ab })
    void pumpPlayback()
  }

  const ensurePlaybackCtx = () => {
    let ctx = playbackAudioCtxRef.current
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      playbackAudioCtxRef.current = ctx
    }
    return ctx
  }

  const pumpPlayback = async () => {
    if (playingRef.current) return
    const next = playbackQueueRef.current.shift()
    if (!next) return

    const ctx = ensurePlaybackCtx()
    try {
      await ctx.resume()
      setNeedsAudioGesture(false)
    } catch {
      // Autoplay blocked; wait for a user gesture, keep the chunk queued.
      playbackQueueRef.current.unshift(next)
      setNeedsAudioGesture(true)
      return
    }

    playingRef.current = true
    isEmberSpeakingRef.current = true
    didEmberSpeakOnceRef.current = true
    setIsEmberSpeaking(true)

    const wrap = orbWrapRef.current
    if (wrap) {
      wrap.style.setProperty('--ember-level', '0')
      // Baseline “speaking” glow so the UI is animated even if analyser fails.
      wrap.style.setProperty('--ember-alpha', '0.12')
      wrap.style.setProperty('--ember-alpha2', '0.08')
      wrap.style.setProperty('--ember-scale', '1.03')
    }

    // Decode WAV chunk into PCM buffer
    let audioBuffer: AudioBuffer | null = null
    try {
      audioBuffer = await ctx.decodeAudioData(next.wav.slice(0))
    } catch {
      // If decode fails, skip this chunk.
      playingRef.current = false
      if (playbackQueueRef.current.length === 0) {
        isEmberSpeakingRef.current = false
        setIsEmberSpeaking(false)
      }
      void pumpPlayback()
      return
    }

    // Shared analyser for voice-matched glow
    let analyser = playbackAnalyserRef.current
    if (!analyser) {
      analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      playbackAnalyserRef.current = analyser
      analyser.connect(ctx.destination)
    }

    const src = ctx.createBufferSource()
    src.buffer = audioBuffer
    src.connect(analyser)

    const data = new Uint8Array(analyser.fftSize)
    const tick = () => {
      const w = orbWrapRef.current
      const a = playbackAnalyserRef.current
      if (!w || !a) {
        emberRafRef.current = requestAnimationFrame(tick)
        return
      }
      if (!playingRef.current || !isEmberSpeakingRef.current) {
        w.style.setProperty('--ember-level', '0')
        w.style.setProperty('--ember-alpha', '0')
        w.style.setProperty('--ember-alpha2', '0')
        w.style.setProperty('--ember-scale', '1')
        w.style.setProperty('--dot1y', '0px')
        w.style.setProperty('--dot2y', '0px')
        w.style.setProperty('--dot3y', '0px')
        w.style.setProperty('--dot1o', '0.18')
        w.style.setProperty('--dot2o', '0.18')
        w.style.setProperty('--dot3o', '0.18')
        emberLevelSmoothedRef.current = 0
        emberRafRef.current = null
        return
      }

      a.getByteTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / data.length)
      const level = Math.max(0, Math.min(1, rms * 3.2))
      w.style.setProperty('--ember-level', level.toFixed(3))
      const alpha = Math.max(0, Math.min(0.42, 0.08 + level * 0.34))
      w.style.setProperty('--ember-alpha', alpha.toFixed(3))
      w.style.setProperty('--ember-alpha2', Math.max(0, Math.min(0.32, alpha * 0.72)).toFixed(3))

      // Speech-inflection dots: move/brighten based on Ember voice energy (with smoothing).
      const prev = emberLevelSmoothedRef.current
      const attack = 0.45
      const release = 0.12
      const smooth = prev + (level - prev) * (level > prev ? attack : release)
      emberLevelSmoothedRef.current = smooth

      // Also pulse the orb itself (subtle) based on smoothed Ember inflection.
      w.style.setProperty('--ember-scale', (1 + smooth * 0.09).toFixed(3))

      const y1 = -3 - smooth * 13
      const y2 = -2 - smooth * 11
      const y3 = -3 - smooth * 12
      const o1 = 0.22 + smooth * 0.70
      const o2 = 0.18 + smooth * 0.60
      const o3 = 0.20 + smooth * 0.66
      w.style.setProperty('--dot1y', `${y1.toFixed(2)}px`)
      w.style.setProperty('--dot2y', `${y2.toFixed(2)}px`)
      w.style.setProperty('--dot3y', `${y3.toFixed(2)}px`)
      w.style.setProperty('--dot1o', Math.min(0.85, o1).toFixed(3))
      w.style.setProperty('--dot2o', Math.min(0.75, o2).toFixed(3))
      w.style.setProperty('--dot3o', Math.min(0.80, o3).toFixed(3))
      emberRafRef.current = requestAnimationFrame(tick)
    }

    if (emberRafRef.current == null) emberRafRef.current = requestAnimationFrame(tick)

    const finish = () => {
      playingRef.current = false
      try {
        src.disconnect()
      } catch {
        // ignore
      }
      if (playbackQueueRef.current.length === 0) {
        isEmberSpeakingRef.current = false
        setIsEmberSpeaking(false)
      }
      void pumpPlayback()
    }

    src.onended = finish

    try {
      src.start()
    } catch {
      finish()
    }
  }

  const sendAutoGreeting = () => {
    if (didAutoGreetRef.current) return
    didAutoGreetRef.current = true
    try {
      wsRef.current?.send(
        JSON.stringify({
          type: 'user_input',
          text: 'Hey. I’m here with you. What’s on your mind?',
        }),
      )
    } catch {
      // ignore
    }
  }

  const startMicCapture = async () => {
    if (didRequestMicRef.current) return
    didRequestMicRef.current = true
    setMicPermission('unknown')

    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      // If the socket isn't open yet, we'll try again later (effect below).
      didRequestMicRef.current = false
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      mediaStreamRef.current = stream
      setIsMicOn(true)
      setMicPermission('granted')

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.75
      micAnalyserRef.current = analyser
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) return
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
        if (isSendingRef.current) return

        const ch0 = e.inputBuffer.getChannelData(0)
        const down = downsampleTo16k(ch0, ctx.sampleRate)
        const bytes = floatToPcm16(down)
        const b64 = base64FromBytes(bytes)
        const msg = { type: 'audio_input', data: b64 }

        try {
          isSendingRef.current = true
          wsRef.current.send(JSON.stringify(msg))
        } finally {
          isSendingRef.current = false
        }
      }

      source.connect(processor)
      source.connect(analyser)
      processor.connect(ctx.destination) // keeps processor alive

      const data = new Uint8Array(analyser.fftSize)
      const freq = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        const wrap = orbWrapRef.current
        if (!wrap || !micAnalyserRef.current) {
          micRafRef.current = requestAnimationFrame(tick)
          return
        }

        if (isMutedRef.current) {
          wrap.style.setProperty('--mic-level', '0')
          wrap.style.setProperty('--mic-alpha', '0')
          wrap.style.setProperty('--mic-alpha2', '0')
          wrap.style.setProperty('--mic-scale', '1')
          wrap.style.setProperty('--bar1', '0.25')
          wrap.style.setProperty('--bar2', '0.25')
          wrap.style.setProperty('--bar3', '0.25')
          wrap.style.setProperty('--bar4', '0.25')
          wrap.style.setProperty('--bar5', '0.25')
        } else {
          micAnalyserRef.current.getByteTimeDomainData(data)
          micAnalyserRef.current.getByteFrequencyData(freq)
          let sum = 0
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128
            sum += v * v
          }
          const rms = Math.sqrt(sum / data.length)
          const level = Math.max(0, Math.min(1, rms * 2.2))
          wrap.style.setProperty('--mic-level', level.toFixed(3))
          const alpha = Math.max(0, Math.min(0.40, 0.08 + level * 0.30))
          const scale = 1 + level * 0.28
          wrap.style.setProperty('--mic-alpha', alpha.toFixed(3))
          wrap.style.setProperty('--mic-alpha2', Math.max(0, Math.min(0.30, alpha * 0.72)).toFixed(3))
          wrap.style.setProperty('--mic-scale', scale.toFixed(3))

          const band = (from: number, to: number) => {
            let s = 0
            let c = 0
            for (let i = from; i < to; i++) {
              s += freq[i] ?? 0
              c++
            }
            const avg = c ? s / c : 0
            return Math.max(0, Math.min(1, avg / 255))
          }
          const n = freq.length
          const b1 = band(0, Math.floor(n * 0.08))
          const b2 = band(Math.floor(n * 0.08), Math.floor(n * 0.18))
          const b3 = band(Math.floor(n * 0.18), Math.floor(n * 0.32))
          const b4 = band(Math.floor(n * 0.32), Math.floor(n * 0.55))
          const b5 = band(Math.floor(n * 0.55), Math.floor(n * 0.85))
          const map = (x: number) => 0.22 + x * 1.65
          wrap.style.setProperty('--bar1', map(b1).toFixed(3))
          wrap.style.setProperty('--bar2', map(b2).toFixed(3))
          wrap.style.setProperty('--bar3', map(b3).toFixed(3))
          wrap.style.setProperty('--bar4', map(b4).toFixed(3))
          wrap.style.setProperty('--bar5', map(b5).toFixed(3))
        }
        micRafRef.current = requestAnimationFrame(tick)
      }
      micRafRef.current = requestAnimationFrame(tick)
    } catch {
      didRequestMicRef.current = false
      setMicPermission('denied')
      setVoiceError('Microphone blocked. Please allow mic access in the browser prompt or site settings.')
    }
  }

  const connectVoice = (opts: { startMic: boolean }) => {
    setVoiceError('')
    setVoiceStatus('connecting')

    try {
      const ws = new WebSocket(proxyWsUrl)
      wsRef.current = ws

      ws.onopen = async () => {
        // Connection is live even if we haven't started mic capture yet.
        setVoiceStatus('live')
        sendAutoGreeting()

        if (opts.startMic) {
          void startMicCapture()
        }
      }

      ws.onmessage = (evt) => {
        try {
          const parsed = JSON.parse(String(evt.data))
          if (parsed?.type === 'proxy_error') {
            setVoiceStatus('error')
            setVoiceError(parsed?.message || 'Proxy error')
            return
          }
          if (parsed?.type === 'proxy_status') return
          if (parsed?.type === 'audio_output' && typeof parsed?.data === 'string') {
            enqueuePlayback(bytesFromBase64(parsed.data))
          }
        } catch {
          // ignore
        }
      }

      ws.onerror = () => {
        setVoiceStatus('error')
        setVoiceError('Failed to connect to local voice proxy. Is it running?')
      }

      ws.onclose = () => {
        setVoiceStatus('idle')
      }
    } catch {
      setVoiceStatus('error')
      setVoiceError('Voice initialization failed.')
    }
  }

  const stopVoice = () => {
    if (emberRafRef.current != null) {
      cancelAnimationFrame(emberRafRef.current)
      emberRafRef.current = null
    }
    playbackAnalyserRef.current = null
    try {
      orbWrapRef.current?.style.setProperty('--ember-level', '0')
      orbWrapRef.current?.style.setProperty('--ember-alpha', '0')
      orbWrapRef.current?.style.setProperty('--ember-alpha2', '0')
      orbWrapRef.current?.style.setProperty('--ember-scale', '1')
    } catch {
      // ignore
    }

    if (micRafRef.current != null) {
      cancelAnimationFrame(micRafRef.current)
      micRafRef.current = null
    }
    micAnalyserRef.current = null
    try {
      orbWrapRef.current?.style.setProperty('--mic-level', '0')
      orbWrapRef.current?.style.setProperty('--mic-alpha', '0')
      orbWrapRef.current?.style.setProperty('--mic-alpha2', '0')
      orbWrapRef.current?.style.setProperty('--mic-scale', '1')
    } catch {
      // ignore
    }

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
      playbackAudioCtxRef.current?.close()
    } catch {
      // ignore
    }
    playbackAudioCtxRef.current = null
    playbackAnalyserRef.current = null

    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    } catch {
      // ignore
    }
    mediaStreamRef.current = null
    setIsMicOn(false)
    setMicPermission('unknown')

    try {
      wsRef.current?.close()
    } catch {
      // ignore
    }
    wsRef.current = null

    playbackQueueRef.current.splice(0, playbackQueueRef.current.length)
    playingRef.current = false
    isEmberSpeakingRef.current = false
    setIsEmberSpeaking(false)
    setVoiceStatus('idle')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopVoice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-connect and have Ember speak immediately on entry.
  useEffect(() => {
    // Start with Ember speaking first (no “Listening” state yet).
    connectVoice({ startMic: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // After Ember has spoken once and finished the opening line, request mic permission and start listening.
  useEffect(() => {
    if (needsAudioGesture) return
    if (voiceStatus !== 'live') return
    if (mediaStreamRef.current) return
    if (!didEmberSpeakOnceRef.current) return
    if (isEmberSpeaking) return
    void startMicCapture()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceStatus, isEmberSpeaking, needsAudioGesture])

  // If autoplay is blocked, resume audio on the next user gesture and continue playback.
  useEffect(() => {
    if (!needsAudioGesture) return
    const onGesture = () => {
      try {
        void ensurePlaybackCtx().resume().finally(() => {
          setNeedsAudioGesture(false)
          void pumpPlayback()
        })
      } catch {
        // ignore
      }
    }
    window.addEventListener('pointerdown', onGesture, { once: true })
    return () => window.removeEventListener('pointerdown', onGesture)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsAudioGesture])

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
          className={[
            'ember-orb',
            voiceStatus === 'connecting' ? 'connecting' : '',
            voiceStatus === 'live' ? 'live' : '',
            isMicOn && !isMuted ? 'listening' : '',
            isMuted ? 'muted' : '',
            isEmberSpeaking ? 'speaking' : '',
          ].filter(Boolean).join(' ')}
          ref={orbWrapRef}
          style={
            {
              '--color-primary': currentColor.primary,
              '--color-secondary': currentColor.secondary,
              '--mic-level': '0',
              '--ember-level': '0',
              '--mic-alpha': '0',
              '--mic-alpha2': '0',
              '--ember-alpha': '0',
              '--ember-alpha2': '0',
              '--mic-scale': '1',
              '--ember-scale': '1',
              '--dot1y': '0px',
              '--dot2y': '0px',
              '--dot3y': '0px',
              '--dot1o': '0.18',
              '--dot2o': '0.18',
              '--dot3o': '0.18',
              '--bar1': '0.35',
              '--bar2': '0.35',
              '--bar3': '0.35',
              '--bar4': '0.35',
              '--bar5': '0.35',
            } as React.CSSProperties
          }
        >
          <div className="ember-ring mic" aria-hidden="true" />
          <div className="ember-ring speak" aria-hidden="true" />
          <div className="ember-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="ember-bars" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div
            className={`circle ${isMuted ? 'muted' : ''}`}
            ref={circleRef}
            onClick={handleOrbClick}
            style={{ cursor: 'pointer' } as React.CSSProperties}
          />
        </div>

        <div className="talk-state" aria-live="polite">
          {voiceStatus === 'connecting' && 'Connecting'}
          {voiceStatus === 'error' && (voiceError || 'Voice error')}
          {voiceStatus === 'live' && needsAudioGesture && 'Tap to enable sound'}
          {voiceStatus === 'live' && !needsAudioGesture && !isEmberSpeaking && isMicOn && !isMuted && 'Listening'}
          {voiceStatus === 'live' && !needsAudioGesture && !isEmberSpeaking && !isMicOn && micPermission === 'denied' && 'Mic blocked'}
        </div>
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

      {/* (moved) voice status is now rendered under the orb as `.talk-state` */}

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
