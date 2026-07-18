import { vi } from 'vitest'

class MockAudioNode {
  connect = vi.fn(() => this)
  disconnect = vi.fn()
}

class MockAudioParam {
  value = 0
  setValueAtTime = vi.fn(() => this)
  linearRampToValueAtTime = vi.fn(() => this)
  cancelScheduledValues = vi.fn()
}

class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam()
}

class MockBufferSourceNode extends MockAudioNode {
  buffer = null
  loop = false
  playbackRate = { value: 1 }
  start = vi.fn()
  stop = vi.fn()
  onended: (() => void) | null = null
}

class MockAudioBuffer {
  duration = 1
  length = 44100
  sampleRate = 44100
  numberOfChannels = 1
  getChannelData = vi.fn(() => new Float32Array(44100))
  copyFromChannel = vi.fn()
  copyToChannel = vi.fn()
}

class MockAudioContext {
  state = 'running'
  currentTime = 0
  destination = new MockAudioNode()
  createGain = vi.fn(() => new MockGainNode())
  createBufferSource = vi.fn(() => new MockBufferSourceNode())
  decodeAudioData = vi.fn().mockResolvedValue(new MockAudioBuffer())
  resume = vi.fn().mockResolvedValue(undefined)
  close = vi.fn().mockResolvedValue(undefined)
}

vi.stubGlobal('AudioContext', MockAudioContext)
vi.stubGlobal('webkitAudioContext', MockAudioContext)

globalThis.fetch = vi.fn().mockResolvedValue({
  ok: false,
  status: 404,
  statusText: 'Not Found',
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  blob: vi.fn().mockResolvedValue(new Blob()),
})

if (typeof window !== 'undefined') {
  const voiceList = [
    { name: 'Test Voice', lang: 'en-US', localService: true, default: true },
    { name: 'Voz de Prueba', lang: 'es-ES', localService: true, default: false },
  ]

  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => voiceList),
      speaking: false,
      paused: false,
      addEventListener: vi.fn(),
    },
    writable: true,
    configurable: true,
  })
}
