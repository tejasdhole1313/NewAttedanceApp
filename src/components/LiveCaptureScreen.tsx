// LiveCaptureScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { MatchFacesImage, MatchFacesRequest, FaceSDK } from '@regulaforensics/face-sdk';
import { captureFrame } from '../utils/captureFrame';


// Removed duplicate and incorrect handleCapture definition.
// The correct handleCapture is defined later in the file.

const faceSdk = FaceSDK.instance;

export default function LiveCaptureScreen({ route, navigation }: any) {
  const { referenceImage } = route.params;
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');
  const [status, setStatus] = useState('');

  const handleCapture = async () => {
    try {
      const base64 = await captureFrame(cameraRef.current!);
      const liveImage = new MatchFacesImage(base64, 0); // 0 = LIVE

      setStatus('Verifying...');

      const request = new MatchFacesRequest([referenceImage, liveImage]);
      const response = await faceSdk.matchFaces(request);
      const result = await faceSdk.splitComparedFaces(response.results, 0.75);
      const match = result.matchedFaces;

      if (match.length > 0 && match[0].similarity > 0.85) {
        const percent = (match[0].similarity * 100).toFixed(2);
        Alert.alert('Face Verified ✅', `Similarity: ${percent}%`);
      } else {
        Alert.alert('Verification Failed ❌', 'Faces do not match.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to capture or match.');
    }
  };

  if (!device) return <Text>No camera found</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={true} photo />
      <View style={styles.controls}>
        <Text style={styles.status}>{status}</Text>
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <Text style={{ color: 'white' }}>Capture & Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: 'white' }}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  status: { marginBottom: 10, color: 'white', fontWeight: 'bold' },
  captureButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 10,
  },
});
