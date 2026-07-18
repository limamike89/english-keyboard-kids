import { ResourceManager } from '../core/resource-manager'

export class ImageManager {
  private resourceManager: ResourceManager

  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager
  }

  async getImage(key: string): Promise<HTMLImageElement | null> {
    return this.resourceManager.loadImage(key)
  }

  getPath(key: string): string | null {
    return this.resourceManager.getImagePath(key)
  }

  hasImage(key: string): boolean {
    return this.resourceManager.hasImage(key)
  }

  createImageElement(key: string): HTMLImageElement | null {
    const path = this.getPath(key)
    if (!path) return null

    const img = new Image()
    img.src = path
    img.alt = key
    return img
  }

  preloadImages(keys: string[]): Promise<(HTMLImageElement | null)[]> {
    return Promise.all(keys.map((key) => this.getImage(key)))
  }
}
