import type { AudioCategory, AudioPlayerState } from '../types'
import { MultimediaEventType } from '../types'
import { type EventBus } from '../core/event-bus'

export class AudioPlayer {
  private source: AudioBufferSourceNode | null = null
  private gainNode: GainNode
  private audioContext: AudioContext
  private buffer: AudioBuffer | null = null
  private _isPlaying = false
  private _isPaused = false
  private _startTime = 0
  private _pauseOffset = 0
  private _duration = 0
  private _volume = 1
  private _rate = 1
  private _loop = false
  private _key = ''
  private _category: AudioCategory = 'sfx'
  private eventBus: EventBus | null
  private endedHandler: (() => void) | null = null
  private fadeTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    audioContext: AudioContext,
    destination: AudioNode,
    eventBus?: EventBus,
  ) {
    this.audioContext = audioContext
    this.gainNode = audioContext.createGain()
    this.gainNode.connect(destination)
    this.eventBus = eventBus ?? null
  }

  get key(): string { return this._key }
  get category(): AudioCategory { return this._category }
  get isPlaying(): boolean { return this._isPlaying }
  get isPaused(): boolean { return this._isPaused }
  get volume(): number { return this._volume }
  get rate(): number { return this._rate }
  get loop(): boolean { return this._loop }

  get currentTime(): number {
    if (!this._isPlaying) return this._pauseOffset
    return this._pauseOffset + (this.audioContext.currentTime - this._startTime)
  }

  get duration(): number {
    return this._duration
  }

  getState(): AudioPlayerState {
    return {
      isPlaying: this._isPlaying,
      isPaused: this._isPaused,
      currentTime: this.currentTime,
      duration: this._duration,
      volume: this._volume,
      rate: this._rate,
    }
  }

  load(buffer: AudioBuffer, key: string, category: AudioCategory): void {
    this.stopInternal()
    this.buffer = buffer
    this._key = key
    this._category = category
    this._duration = buffer.duration
    this._pauseOffset = 0
  }

  play(
    loop = false,
    rate = 1,
    volume = 1,
    fadeInMs = 0,
    onEnded?: () => void,
  ): void {
    if (!this.buffer) return

    this.stopInternal()

    this._loop = loop
    this._rate = rate
    this._volume = volume
    this.endedHandler = onEnded ?? null

    this.source = this.audioContext.createBufferSource()
    this.source.buffer = this.buffer
    this.source.loop = loop
    this.source.playbackRate.value = rate
    this.source.connect(this.gainNode)

    if (fadeInMs > 0) {
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      this.gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime + fadeInMs / 1000,
      )
    } else {
      this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
    }

    this.source.onended = () => {
      if (!this._isPaused) {
        this._isPlaying = false
        this.eventBus?.emit(MultimediaEventType.AudioFinished, {
          key: this._key,
          category: this._category,
        })
        this.endedHandler?.()
      }
    }

    this.source.start(0, this._pauseOffset)
    this._isPlaying = true
    this._isPaused = false
    this._startTime = this.audioContext.currentTime

    this.eventBus?.emit(MultimediaEventType.AudioStarted, {
      key: this._key,
      category: this._category,
      duration: this._duration,
      loop,
    })
  }

  pause(): void {
    if (!this._isPlaying || this._isPaused) return

    this._pauseOffset += this.audioContext.currentTime - this._startTime
    this._isPaused = true
    this._isPlaying = false

    this.stopSource()
    this.eventBus?.emit(MultimediaEventType.AudioPaused, {
      key: this._key,
      currentTime: this._pauseOffset,
    })
  }

  resume(): void {
    if (!this._isPaused || !this.buffer) return

    this._isPaused = false
    this.play(this._loop, this._rate, this._volume, 0, this.endedHandler ?? undefined)

    this.eventBus?.emit(MultimediaEventType.AudioResumed, {
      key: this._key,
    })
  }

  stop(): void {
    this.stopInternal()
    this._pauseOffset = 0
    this.eventBus?.emit(MultimediaEventType.AudioStopped, {
      key: this._key,
    })
  }

  setVolume(value: number): void {
    this._volume = Math.max(0, Math.min(1, value))
    try {
      this.gainNode.gain.linearRampToValueAtTime(
        this._volume,
        this.audioContext.currentTime + 0.05,
      )
    } catch { /* context may be closed */ }
  }

  setRate(value: number): void {
    this._rate = Math.max(0.1, Math.min(3, value))
    if (this.source) {
      try {
        this.source.playbackRate.value = this._rate
      } catch { /* context may be closed */ }
    }
  }

  setLoop(value: boolean): void {
    this._loop = value
    if (this.source) {
      try {
        this.source.loop = value
      } catch { /* context may be closed */ }
    }
  }

  fadeOut(ms: number): Promise<void> {
    return new Promise((resolve) => {
      try {
        this.gainNode.gain.linearRampToValueAtTime(
          0,
          this.audioContext.currentTime + ms / 1000,
        )
      } catch { /* context may be closed */ }
      this.fadeTimer = setTimeout(() => {
        this.stop()
        resolve()
      }, ms)
    })
  }

  dispose(): void {
    this.stopInternal()
    this.buffer = null
    this.endedHandler = null
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer)
      this.fadeTimer = null
    }
    try {
      this.gainNode.disconnect()
    } catch { /* already disconnected */ }
  }

  private stopInternal(): void {
    this.stopSource()
    this._isPlaying = false
    this._isPaused = false
  }

  private stopSource(): void {
    if (this.source) {
      try {
        this.source.onended = null
        this.source.stop()
      } catch { /* already stopped */ }
      try {
        this.source.disconnect()
      } catch { /* already disconnected */ }
      this.source = null
    }
  }
}
