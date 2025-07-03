import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { captureFrame } from '../utils/captureFrame';

type CustomCameraCaptureProps = {
  onCapture: (base64: string) => void;
  onCancel: () => void;
};

const CustomCameraCapture: React.FC<CustomCameraCaptureProps> = ({ onCapture, onCancel }) => {
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    try {
      const base64 = await captureFrame(cameraRef.current as Camera);
      onCapture(base64);
    } catch (e) {
      Alert.alert('Error', 'Failed to capture');
    }
  };

  if (device == null) return <Text>No camera found</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} isActive={true} photo />
      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <Text style={styles.captureText}> Capture</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}> Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  captureButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  captureText: { color: 'white', fontSize: 16 },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 10,
  },
  cancelText: { color: 'white', fontSize: 14 },
});

export default CustomCameraCapture;
