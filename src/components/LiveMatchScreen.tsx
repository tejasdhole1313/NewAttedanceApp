import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { MatchFacesImage, MatchFacesRequest, FaceSDK, ImageType } from '@regulaforensics/face-sdk';
import { captureFrame } from '../utils/captureFrame';

const faceSdk = FaceSDK.instance;

export default function LiveMatchScreen({ route, navigation }: any) {
  const { employee } = route.params;
  const [status, setStatus] = useState('Ready');
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');

  const handleCapture = async () => {
    try {
      setStatus('Capturing...');
      const base64Live = await captureFrame(cameraRef.current!);
      const image2 = new MatchFacesImage(base64Live, ImageType.LIVE);

      // Load reference image from employee JSON
      const response = await fetch(employee.image);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Ref = reader.result?.toString().split(',')[1];
        if (!base64Ref) {
          Alert.alert('Error', 'Failed to load reference image');
          setStatus('Ready');
          return;
        }

        const image1 = new MatchFacesImage(base64Ref, ImageType.PRINTED);
        const request = new MatchFacesRequest([image1, image2]);

        setStatus('Matching...');
        const matchResp = await faceSdk.matchFaces(request);
        const result = await faceSdk.splitComparedFaces(matchResp.results, 0.75);
        const match = result.matchedFaces;

        if (match.length > 0 && match[0].similarity > 0.85) {
          const percent = (match[0].similarity * 100).toFixed(2);
          Alert.alert('✅ Match Successful', `Similarity: ${percent}%`);
        } else {
          Alert.alert(' Match Failed', 'Face does not match');
        }

        setStatus('Ready');
      };

      reader.onerror = () => {
        Alert.alert('Error', 'Failed to read reference image');
        setStatus('Ready');
      };

      reader.readAsDataURL(blob);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong during capture or match.');
      setStatus('Ready');
    }
  };

  if (!device) return <Text>No camera found</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={true} photo />
      <View style={styles.controls}>
        <Text style={styles.status}>{status}</Text>
        <TouchableOpacity style={styles.button} onPress={handleCapture}>
          <Text style={{ color: 'white' }}>Capture & Match</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
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
  status: {
    marginBottom: 10,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  back: {
    backgroundColor: '#ff3b30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
