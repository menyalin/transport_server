export class TtlMap<K, V> {
  private cache: Map<K, { value: V; expiryTime: number }>
  private cacheTTL: number
  private timer: NodeJS.Timeout | null

  constructor(cacheTTL: number = 10000) {
    this.cache = new Map<K, { value: V; expiryTime: number }>()
    this.cacheTTL = cacheTTL
    this.timer = null
    this.startCleanup()
  }

  set(key: K, value: V): this {
    const expiryTime = Date.now() + this.cacheTTL
    this.cache.set(key, { value, expiryTime })
    return this
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined
    if (Date.now() > item.expiryTime) {
      this.cache.delete(key)
      return undefined
    }
    return item.value
  }

  has(key: K): boolean {
    const item = this.cache.get(key)
    if (item && Date.now() <= item.expiryTime) {
      return true
    } else {
      this.cache.delete(key) // Удаляем просроченный элемент
      return false
    }
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.stopCleanup()
    this.cache.clear()
  }

  size(): number {
    let count = 0
    const now = Date.now()
    for (const [key, { expiryTime }] of this.cache) {
      if (now <= expiryTime) {
        count++
      } else {
        this.cache.delete(key) // Удаляем просроченные элементы
      }
    }
    return count
  }

  private startCleanup(): void {
    this.timer = setInterval(() => {
      const now = Date.now()
      for (const [key, { expiryTime }] of this.cache) {
        if (now > expiryTime) {
          this.cache.delete(key)
        }
      }
    }, 10000)
  }
  public dispose(): void {
    this.stopCleanup()
  }

  private stopCleanup(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
