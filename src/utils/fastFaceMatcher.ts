import { FaceSDK, MatchFacesImage, MatchFacesRequest, ImageType } from '@regulaforensics/face-sdk';
import employees from '../data/employees.json';
import { imageCacheManager } from './imageCache';
import { performanceMonitor } from './performanceMonitor';


const faceSdk = FaceSDK.instance;
const MATCH_THRESHOLD = 0.85;
const MAX_PARALLEL_REQUESTS = 4; // Limit concurrent requests
const TIMEOUT_MS = 600; // Target 600ms processing time

interface Employee {
  name: string;
  image: string;
}

interface MatchResult {
  name: string;
  score: number;
  matched: boolean;
}

export class FastFaceMatcher {
  private static instance: FastFaceMatcher;
  private employeeCache: Map<string, string> = new Map();
  private isInitialized = false;

  static getInstance(): FastFaceMatcher {
    if (!FastFaceMatcher.instance) {
      FastFaceMatcher.instance = new FastFaceMatcher();
    }
    return FastFaceMatcher.instance;
  }

  private constructor() {
    this.preloadEmployeeImages();
  }

  private async preloadEmployeeImages() {
    console.log('Preloading employee images for faster matching...');
    const promises = employees.map(async (emp: Employee) => {
      try {
        const base64 = await imageCacheManager.fetchAndCacheImage(emp.image);
        if (base64) {
          this.employeeCache.set(emp.name, base64);
        }
      } catch (error) {
        console.warn(`Failed to preload image for ${emp.name}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log(`Preloaded ${this.employeeCache.size} employee images`);
    this.isInitialized = true;
  }

  private async processEmployeeBatch(
    employees: Employee[],
    liveImage: MatchFacesImage,
    onProgress?: (current: number, total: number) => void
  ): Promise<MatchResult | null> {
    const batchSize = Math.ceil(employees.length / MAX_PARALLEL_REQUESTS);
    let bestScore = 0;
    let matchedEmployee: string | null = null;

    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize);
      const batchPromises = batch.map(async (emp) => {
        try {
          // Get cached image or fetch if not cached
          let base64 = this.employeeCache.get(emp.name);
          if (!base64) {
            const fetched = await imageCacheManager.fetchAndCacheImage(emp.image);
            if (fetched !== null && fetched !== undefined) {
              base64 = fetched;
              this.employeeCache.set(emp.name, base64);
            }
          }

          if (!base64) return null;

          const printedImage = new MatchFacesImage(base64, ImageType.PRINTED);
          const request = new MatchFacesRequest([printedImage, liveImage]);
          
          const response = await faceSdk.matchFaces(request);
          const result = await faceSdk.splitComparedFaces(response.results, 0.75);
          const matched = result.matchedFaces[0];

          if (matched?.similarity > bestScore) {
            bestScore = matched.similarity;
            matchedEmployee = emp.name;
          }

          // Early termination if we find a good match
          if (matched?.similarity >= MATCH_THRESHOLD) {
            return {
              name: emp.name,
              score: matched.similarity,
              matched: true
            };
          }

          return null;
        } catch (error) {
          console.warn(`Error processing ${emp.name}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(batchPromises);
      
      // Check for early termination
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value?.matched) {
          onProgress?.(i + batch.length, employees.length);
          return result.value;
        }
      }

      onProgress?.(Math.min(i + batchSize, employees.length), employees.length);
    }

    return {
      name: matchedEmployee || 'Unknown',
      score: bestScore,
      matched: bestScore >= MATCH_THRESHOLD
    };
  }

  async matchFace(
    base64Live: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<MatchResult> {
    const startTime = Date.now();
    
    // Wait for initialization if needed
    if (!this.isInitialized) {
      console.log('Waiting for employee images to preload...');
      while (!this.isInitialized) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    const liveImage = new MatchFacesImage(base64Live, ImageType.LIVE);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<MatchResult>((resolve) => {
      setTimeout(() => {
        resolve({
          name: 'Timeout',
          score: 0,
          matched: false
        });
      }, TIMEOUT_MS);
    });

    // Create the matching promise
    const matchPromise = this.processEmployeeBatch(employees, liveImage, onProgress);

    // Race between timeout and matching
    const result = await Promise.race([matchPromise, timeoutPromise]);
    
    const processingTime = Date.now() - startTime;
    console.log(`Face matching completed in ${processingTime}ms`);

    // Record performance metrics
    const cacheStats = this.getCacheStats();
    const cacheHitRate = parseFloat(cacheStats.cacheHitRate);
    performanceMonitor.recordProcessingTime(
      processingTime,
      cacheHitRate,
      employees.length,
      result?.matched ?? false
    );

    return result as MatchResult;
  }

  getCacheStats() {
    return {
      cachedEmployees: this.employeeCache.size,
      totalEmployees: employees.length,
      cacheHitRate: (this.employeeCache.size / employees.length * 100).toFixed(1) + '%'
    };
  }

  clearCache() {
    this.employeeCache.clear();
    this.isInitialized = false;
    this.preloadEmployeeImages();
  }
}

export const fastFaceMatcher = FastFaceMatcher.getInstance(); 