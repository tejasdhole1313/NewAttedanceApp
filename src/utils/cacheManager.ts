import { imageCacheManager } from './imageCache';
import { fastFaceMatcher } from './fastFaceMatcher';

export class CacheManager {
  static async getCacheStats() {
    const imageStats = imageCacheManager.getCacheStats();
    const faceMatcherStats = fastFaceMatcher.getCacheStats();
    
    return { 
      memorySize: imageStats.memorySize, 
      persistentSize: imageStats.persistentSize,
      cachedEmployees: faceMatcherStats.cachedEmployees,
      totalEmployees: faceMatcherStats.totalEmployees,
      cacheHitRate: faceMatcherStats.cacheHitRate
    };
  }

  static async clearCache() {
    imageCacheManager.clearCache();
    fastFaceMatcher.clearCache();
    console.log('All caches cleared successfully');
  }

  static async preloadImages(urls: string[]) {
    console.log('Preloading images for faster access...');
    const results = await Promise.allSettled(
      urls.map(url => imageCacheManager.fetchAndCacheImage(url))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return { successful, failed };
  }

  static async getCacheInfo() {
    const stats = await this.getCacheStats();
    return {
      memoryCacheSize: stats.memorySize,
      persistentCacheSize: stats.persistentSize,
      totalCached: stats.memorySize + stats.persistentSize,
      cachedEmployees: stats.cachedEmployees,
      totalEmployees: stats.totalEmployees,
      cacheHitRate: stats.cacheHitRate
    };
  }

  static async optimizeForSpeed() {
    console.log('Optimizing cache for 600ms processing...');
    
    await fastFaceMatcher.clearCache(); 
    
   
    const commonImages = [
      'https://example.com/portrait.png',
      'https://example.com/placeholder.jpg'
    ];
    
    await this.preloadImages(commonImages);
    
    console.log('Cache optimization completed');
  }
}

export default CacheManager; 