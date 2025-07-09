import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CacheManager from '../utils/cacheManager';
interface CacheInfo {
  memoryCacheSize: number;
  persistentCacheSize: number;
  totalCached: number;
}
const CacheStatus: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const updateCacheInfo = async () => {
    try {
      const info = await CacheManager.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Failed to get cache info:', error);
    }
  };
  const handleClearCache = async () => {
    try {
      await CacheManager.clearCache();
      await updateCacheInfo();
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };
  useEffect(() => {
    updateCacheInfo();
  }, []);

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.toggleText}></Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cache Status</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsVisible(false)}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {cacheInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Memory Cache: {cacheInfo.memoryCacheSize} images
          </Text>
          <Text style={styles.infoText}>
            Persistent Cache: {cacheInfo.persistentCacheSize} images
          </Text>
          <Text style={styles.infoText}>
            Total Cached: {cacheInfo.totalCached} images
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={updateCacheInfo}
        >
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCache}
        >
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    color: 'white',
    fontSize: 16,
  },
  infoContainer: {
    marginBottom: 8,
  },
  infoText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  clearButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  toggleButton: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  toggleText: {
    fontSize: 16,
  },
});

export default CacheStatus; 