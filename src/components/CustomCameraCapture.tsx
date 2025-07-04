import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { captureFrame } from '../utils/captureFrame';
type CustomCameraCaptureProps = {
  onCapture: (base64: string) => void;
  onCancel: () => void;
};
const CustomCameraCapture: React.FC<CustomCameraCaptureProps> = ({ onCapture, onCancel }) => {
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'authorized' || permission === 'granted');
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

  if (device == null || !hasPermission) return <Text>Loading camera...</Text>;
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={true}
        photo={true}
      />
      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <Text style={styles.captureText}>Capture</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
 
  },
  captureButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#32CD32',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  captureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  cancelText: {
    color: 'white',
    fontSize: 14,
  },
});
export default CustomCameraCapture;
