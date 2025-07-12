import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
const imageCache = new MMKV({
  id: 'image-cache',
  encryptionKey: 'image-cache-key'
});


const memoryCache = new Map<string, string>();

interface CacheEntry {
  base64: string;
  timestamp: number;
  url: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; 
const MAX_CACHE_SIZE = 50; 

export class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cache: Map<string, CacheEntry> = new Map();

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  private constructor() {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage() {
    try {
      const cachedData = imageCache.getString('cachedImages');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        this.cache = new Map(Object.entries(parsed));
        this.cleanExpiredEntries();
      }
    } catch (error) {
      console.warn('Failed to load image cache from storage:', error);
    }
  }

  private saveCacheToStorage() {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      imageCache.set('cachedImages', JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save image cache to storage:', error);
    }
  }

  private cleanExpiredEntries() {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    if (this.cache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp); 
      const toRemove = entries.slice(0, this.cache.size - MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }

    this.saveCacheToStorage();
  }

  async getCachedImage(url: string): Promise<string | null> {
    // Check memory cache first
    if (memoryCache.has(url)) {
      return memoryCache.get(url)!;
    }

    // Check persistent cache
    const entry = this.cache.get(url);
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      // Add to memory cache for faster access
      memoryCache.set(url, entry.base64);
      return entry.base64;
    }

    return null;
  }

  async cacheImage(url: string, base64: string): Promise<void> {
    const entry: CacheEntry = {
      base64,
      timestamp: Date.now(),
      url
    };

    // Add to both caches
    this.cache.set(url, entry);
    memoryCache.set(url, base64);

    // Clean expired entries and save
    this.cleanExpiredEntries();
  }

  async fetchAndCacheImage(url: string): Promise<string | null> {
    try {
      // Check if already cached
      const cached = await this.getCachedImage(url);
      if (cached) {
        console.log('Image found in cache:', url);
        return cached;
      }

      console.log('Fetching image from network:', url);
      
      // Fetch with cache-busting headers
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);

      if (base64) {
        await this.cacheImage(url, base64);
        console.log('Image cached successfully:', url);
      }

      return base64;
    } catch (error) {
      console.error('Failed to fetch and cache image:', url, error);
      return null;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result?.toString().split(',')[1];
        base64 ? resolve(base64) : reject('Failed to convert blob to base64');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  clearCache(): void {
    this.cache.clear();
    memoryCache.clear();
    imageCache.delete('cachedImages');
    console.log('Image cache cleared');
  }

  getCacheStats(): { memorySize: number; persistentSize: number } {
    return {
      memorySize: memoryCache.size,
      persistentSize: this.cache.size
    };
  }
}

// Export singleton instance
export const imageCacheManager = ImageCacheManager.getInstance(); 