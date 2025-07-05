import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { FaceSDK, LivenessType, LivenessStatus, CameraPosition, RecordingProcess, MatchFacesImage, MatchFacesRequest, ImageType } from '@regulaforensics/face-sdk';
import employees from '../data/employees.json';
import { captureFrame } from '../utils/captureFrame';
import CacheStatus from './CacheStatus';

const CustomCameraCapture = () => {
  const device = useCameraDevice('back');
  const { requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupSuccess, setPopupSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    (async () => {
      const granted = await requestPermission();
      if (!granted) Alert.alert('Camera permission denied');
    })();
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const takePicture = async () => {
    if (isProcessing || !isReady || !cameraRef.current) return;

    setIsProcessing(true);
    setStatus('Capturing...');

    try {
      const base64 = await captureFrame(cameraRef as React.RefObject<Camera>);
      setStatus('Processing image...');
      await matchWithDatabase(base64);
    } catch (err: any) {
      console.error('Capture error:', err);
      const errorMessage = err?.message || 'Failed to capture image';
      showTemporaryMessage(errorMessage, false);
      setStatus('Ready');
      return;
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(',')[1];
          base64 ? resolve(base64) : reject('Failed to convert');
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.log('Error loading image:', err);
      return null;
    }
  };

  const matchWithDatabase = async (base64Live: string) => {
    const liveImage = new MatchFacesImage(base64Live, ImageType.LIVE);
    let bestMatchName = '';
    let bestScore = 0;

    setStatus('Matching against database...');

    for (const emp of employees) {
      const refBase64 = await convertToBase64(emp.image);
      if (!refBase64) continue;

      const refImage = new MatchFacesImage(refBase64, ImageType.PRINTED);
      const request = new MatchFacesRequest([refImage, liveImage]);

      try {
        const response = await FaceSDK.instance.matchFaces(request);
        const result = await FaceSDK.instance.splitComparedFaces(response.results, 0.75);
        const matched = result.matchedFaces[0];

        if (matched?.similarity > bestScore) {
          bestScore = matched.similarity;
          bestMatchName = emp.name;
        }

        if (matched?.similarity >= 0.85) {
          const timeString = currentTime.toLocaleTimeString();
          const dateString = currentTime.toLocaleDateString();
          showTemporaryMessage(`✅ Match Found\n${emp.name}\nTime: ${timeString}\nDate: ${dateString}\nSimilarity: ${(matched.similarity * 100).toFixed(2)}%`, true);
          setStatus('Match successful');
          return;
        }
      } catch (e) {
        console.warn('Match error:', e);
      }
    }

    showTemporaryMessage(`❌ No Match Found\nBest: ${bestMatchName || 'N/A'} (${(bestScore * 100).toFixed(2)}%)`, false);
    setStatus('Ready');
  };

  const showTemporaryMessage = (message: string, success: boolean) => {
    setPopupMessage(message);
    setPopupSuccess(success);
    setShowPopup(true);
    setStatus('Start');

    setTimeout(() => {
      setShowPopup(false);
      setStatus('Start');
      setIsProcessing(false);
    }, 2000);
  };

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center' }}>No camera device found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setIsReady(true)}
      />

      <View style={styles.overlay}>
        <View style={styles.topControls}>
          <Text style={styles.statusText}>Status: {status}</Text>
        </View>

        <View style={styles.bottomContainer}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator color="limegreen" size="large" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.captureIcon}></Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.popupContainer,
            { backgroundColor: popupSuccess ? '#E0F7EC' : '#FDECEA' }
          ]}>
            <Text style={[
              styles.popupTitle,
              { color: popupSuccess ? '#007E33' : '#D32F2F' }
            ]}>
              {popupSuccess ? '✅ Match Success' : '❌ Match Failed'}
            </Text>
            <Text style={[
              styles.popupMessage,
              { color: popupSuccess ? '#007E33' : '#D32F2F' }
            ]}>
              {popupMessage}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  captureIcon: {
    fontSize: 28,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default CustomCameraCapture;

