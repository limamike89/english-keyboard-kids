import type { AudioCategory, MultimediaConfig, VolumeState } from '../types'
import { MultimediaEventType } from '../types'
import { type EventBus } from '../core/event-bus'

export class VolumeController {
  private state: VolumeState
  private eventBus: EventBus | null = null
  private gainNodes = new Map<AudioCategory, GainNode | null>()
  private masterGain: GainNode | null = null
  private audioContext: AudioContext | null = null

  constructor(config: MultimediaConfig, eventBus?: EventBus) {
    this.state = {
      master: config.masterVolume,
      music: config.musicVolume,
      sfx: config.sfxVolume,
      voice: config.voiceVolume,
      ui: config.uiVolume,
      muted: config.silentMode,
      mutedCategories: new Set(),
    }
    this.eventBus = eventBus ?? null
  }

  setAudioContext(ctx: AudioContext): void {
    this.audioContext = ctx
    this.masterGain = ctx.createGain()
    this.masterGain.gain.value = this.state.muted ? 0 : this.state.master
    this.masterGain.connect(ctx.destination)

    const categories: AudioCategory[] = ['music', 'sfx', 'voice', 'ui']
    for (const cat of categories) {
      const gain = ctx.createGain()
      gain.gain.value = this.getCategoryVolume(cat)
      gain.connect(this.masterGain)
      this.gainNodes.set(cat, gain)
    }
  }

  getMasterGain(): GainNode | null {
    return this.masterGain
  }

  getCategoryGain(category: AudioCategory): GainNode | null {
    return this.gainNodes.get(category) ?? null
  }

  getMasterVolume(): number {
    return this.state.master
  }

  getCategoryVolume(category: AudioCategory): number {
    const base = this.state[category]
    return this.state.mutedCategories.has(category) ? 0 : base
  }

  setMasterVolume(value: number): void {
    this.state.master = Math.max(0, Math.min(1, value))
    if (!this.state.muted && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.state.master,
        this.audioContext!.currentTime + 0.05,
      )
    }
    this.eventBus?.emit(MultimediaEventType.VolumeChanged, {
      category: 'master',
      value: this.state.master,
    })
  }

  setCategoryVolume(category: AudioCategory, value: number): void {
    this.state[category] = Math.max(0, Math.min(1, value))
    const gain = this.gainNodes.get(category)
    if (gain && this.audioContext) {
      gain.gain.linearRampToValueAtTime(
        this.state.mutedCategories.has(category) ? 0 : this.state[category],
        this.audioContext.currentTime + 0.05,
      )
    }
    this.eventBus?.emit(MultimediaEventType.VolumeChanged, { category, value: this.state[category] })
  }

  mute(category?: AudioCategory): void {
    if (category) {
      this.state.mutedCategories.add(category)
      const gain = this.gainNodes.get(category)
      if (gain && this.audioContext) {
        gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05)
      }
    } else {
      this.state.muted = true
      if (this.masterGain && this.audioContext) {
        this.masterGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05)
      }
    }
    this.eventBus?.emit(MultimediaEventType.MuteChanged, {
      category: category ?? 'master',
      muted: true,
    })
  }

  unmute(category?: AudioCategory): void {
    if (category) {
      this.state.mutedCategories.delete(category)
      const gain = this.gainNodes.get(category)
      if (gain && this.audioContext) {
        gain.gain.linearRampToValueAtTime(
          this.state[category],
          this.audioContext.currentTime + 0.05,
        )
      }
    } else {
      this.state.muted = false
      if (this.masterGain && this.audioContext) {
        this.masterGain.gain.linearRampToValueAtTime(
          this.state.master,
          this.audioContext.currentTime + 0.05,
        )
      }
    }
    this.eventBus?.emit(MultimediaEventType.MuteChanged, {
      category: category ?? 'master',
      muted: false,
    })
  }

  isMuted(category?: AudioCategory): boolean {
    if (category) return this.state.mutedCategories.has(category)
    return this.state.muted
  }

  getState(): VolumeState {
    return { ...this.state, mutedCategories: new Set(this.state.mutedCategories) }
  }

  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus
  }

  dispose(): void {
    this.masterGain = null
    this.gainNodes.clear()
    this.audioContext = null
  }
}
