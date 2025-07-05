export class CacheManager {
  static async getCacheStats() {
    return { memorySize: 0, persistentSize: 0 };
  }

  static async clearCache() {
    console.log('Cache cleared (no caching system active)');
  }

  static async preloadImages(urls: string[]) {
    console.log('Preloading images... (no caching system active)');
    return { successful: 0, failed: 0 };
  }

  static async getCacheInfo() {
    return {
      memoryCacheSize: 0,
      persistentCacheSize: 0,
      totalCached: 0
    };
  }
}

export default CacheManager; 