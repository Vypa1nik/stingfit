interface RestAlertOptions {
  soundEnabled: boolean
  vibrationEnabled: boolean
}

type AudioContextConstructor = new () => AudioContext

let restAudioContext: AudioContext | null = null

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') {
    return null
  }

  const candidates = window as unknown as { AudioContext?: AudioContextConstructor; webkitAudioContext?: AudioContextConstructor }
  return candidates.AudioContext ?? candidates.webkitAudioContext ?? null
}

function getOrCreateAudioContext() {
  const AudioContextCtor = getAudioContextConstructor()
  if (!AudioContextCtor) {
    return null
  }

  restAudioContext ??= new AudioContextCtor()
  return restAudioContext
}

export function armRestAlertAudio() {
  const audioContext = getOrCreateAudioContext()
  if (!audioContext || audioContext.state !== 'suspended') {
    return
  }

  void audioContext.resume().catch(() => {
    // Browsers can reject resume() until a user gesture is accepted. The next tap retries.
  })
}

function playRestBeep() {
  const audioContext = getOrCreateAudioContext()
  if (!audioContext) {
    return
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume().catch(() => undefined)
  }

  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const startAt = audioContext.currentTime
  const stopAt = startAt + 0.18

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(880, startAt)
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, stopAt)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(startAt)
  oscillator.stop(stopAt)
}

export function triggerRestCompleteAlert({ soundEnabled, vibrationEnabled }: RestAlertOptions) {
  if (vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([200, 100, 200])
  }

  if (soundEnabled) {
    playRestBeep()
  }
}
