interface PerformanceMetrics {
  processingTime: number;
  cacheHitRate: number;
  employeeCount: number;
  matched: boolean;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordProcessingTime(
    processingTime: number,
    cacheHitRate: number,
    employeeCount: number,
    matched: boolean
  ) {
    const metric: PerformanceMetrics = {
      processingTime,
      cacheHitRate,
      employeeCount,
      matched,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log performance for monitoring
    const avgTime = this.getAverageProcessingTime();
    const successRate = this.getSuccessRate();
    
    console.log(`Performance: ${processingTime}ms (avg: ${avgTime.toFixed(0)}ms, success: ${(successRate * 100).toFixed(1)}%)`);
    
    // Alert if performance is poor
    if (processingTime > 800) {
      console.warn(`Slow performance detected: ${processingTime}ms`);
    }
  }

  getAverageProcessingTime(): number {
    if (this.metrics.length === 0) return 0;
    const sum = this.metrics.reduce((acc, m) => acc + m.processingTime, 0);
    return sum / this.metrics.length;
  }

  getSuccessRate(): number {
    if (this.metrics.length === 0) return 0;
    const successful = this.metrics.filter(m => m.matched).length;
    return successful / this.metrics.length;
  }

  getRecentMetrics(count: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  getPerformanceStats() {
    const avgTime = this.getAverageProcessingTime();
    const successRate = this.getSuccessRate();
    const recentMetrics = this.getRecentMetrics(5);
    const recentAvg = recentMetrics.length > 0 
      ? recentMetrics.reduce((acc, m) => acc + m.processingTime, 0) / recentMetrics.length 
      : 0;

    return {
      averageProcessingTime: avgTime,
      recentAverageTime: recentAvg,
      successRate: successRate,
      totalRuns: this.metrics.length,
      target500ms: avgTime <= 500
    };
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 