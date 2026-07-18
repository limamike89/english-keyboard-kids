import type { ImageResourceDefinition } from '../types'

type ImageRegistry = Map<string, ImageResourceDefinition>

const ASSETS_BASE = '/assets/images'

export class ImageResources {
  private registry: ImageRegistry = new Map()
  private initialized = false

  initialize(baseUrl = ASSETS_BASE): void {
    if (this.initialized) return

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    for (const letter of letters) {
      this.registry.set(`letter-${letter.toLowerCase()}`, {
        key: `letter-${letter.toLowerCase()}`,
        path: `${baseUrl}/letters/${letter.toLowerCase()}.svg`,
      })
    }

    for (let i = 0; i <= 20; i++) {
      this.registry.set(`number-${i}`, {
        key: `number-${i}`,
        path: `${baseUrl}/numbers/${i}.svg`,
      })
    }

    this.registry.set('avatar-default', {
      key: 'avatar-default',
      path: `${baseUrl}/avatars/default.svg`,
    })

    const badges = ['star', 'streak-5', 'streak-10', 'perfect', 'speed', 'participation']
    for (const badge of badges) {
      this.registry.set(`badge-${badge}`, {
        key: `badge-${badge}`,
        path: `${baseUrl}/badges/${badge}.svg`,
      })
    }

    this.initialized = true
  }

  get(key: string): ImageResourceDefinition | undefined {
    return this.registry.get(key)
  }

  has(key: string): boolean {
    return this.registry.has(key)
  }

  getAll(): ImageResourceDefinition[] {
    return Array.from(this.registry.values())
  }

  registerCustom(def: ImageResourceDefinition): void {
    this.registry.set(def.key, def)
  }

  reset(): void {
    this.registry.clear()
    this.initialized = false
  }
}

export const imageResources = new ImageResources()
