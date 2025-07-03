import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import * as RNFS from 'react-native-fs';
import { FaceSDK, MatchFacesImage, MatchFacesRequest, InitConfig, LivenessSkipStep, ImageType, LivenessStatus, LivenessConfig } from '@regulaforensics/face-sdk';
import CustomCameraCapture from './CustomCameraCapture';
const faceSdk = FaceSDK.instance;
export default function FaceMatchScreen() {
  const [status, setStatus] = useState('Initializing...');
  const [livenessStatus, setLivenessStatus] = useState('null');
  const [similarityStatus, setSimilarityStatus] = useState('null');
  const [image1, setImage1] = useState<MatchFacesImage | null>(null);
  const [image2, setImage2] = useState<MatchFacesImage | null>(null);
  const [uiImage1, setUiImage1] = useState<string | null>(null);
  const [uiImage2, setUiImage2] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturePosition, setCapturePosition] = useState<number | null>(null); // 1 or 2

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setStatus('Initializing...');
    const license = await loadAssetIfExists('regula.license');
    const config = license ? new InitConfig(license) : undefined;

    const [success, error] = await faceSdk.initialize({ config });
    if (!success && error) {
      setStatus(error.message);
      return;
    }
    setStatus('Ready');
  };

  const loadAssetIfExists = async (path: string): Promise<string | null> => {
    if (Platform.OS === 'ios') path = `${RNFS.MainBundlePath}/${path}`;
    const readFile = Platform.OS === 'ios' ? RNFS.readFile : RNFS.readFileRes;
    try {
      return await readFile(path, 'base64');
    } catch {
      return null;
    }
  };

  const setFaceImage = (base64: string, type: number, position: number) => {
    const mfImage = new MatchFacesImage(base64, type);
    const uri = `data:image/png;base64,${base64}`;

    if (position === 1) {
      setImage1(mfImage);
      setUiImage1(uri);
      setLivenessStatus('null');
    } else {
      setImage2(mfImage);
      setUiImage2(uri);
    }
  };

  const pickImage = (position: number) => {
    Alert.alert('Select Image', '', [
      {
        text: 'Gallery',
        onPress: () => {
          launchImageLibrary(
            { mediaType: 'photo', includeBase64: true, selectionLimit: 1 },
            (res) => {
              const base64 = res.assets?.[0]?.base64;
              if (base64) {
                setFaceImage(base64, ImageType.PRINTED, position);
              }
            }
          );
        },
      },
      {
        text: 'Camera',
        onPress: () => {
          setCapturePosition(position);
          setShowCamera(true);
        },
      },
    ]);
  };
  const startLiveness = async () => {
    const response = await faceSdk.startLiveness({
      config: new LivenessConfig({
        skipStep: [LivenessSkipStep.ONBOARDING_STEP],
      }),
      notificationCompletion: (notif) => console.log('LivenessStatus:', notif.status),
    });

    if (!response.image) return;

    setFaceImage(response.image, ImageType.LIVE, 1);
    setLivenessStatus(response.liveness === LivenessStatus.PASSED ? 'passed' : 'unknown');
  };

  const matchFaces = async () => {
    if (!image1 || !image2) {
      setStatus('Both images required!');
      return;
    }

    setStatus('Processing...');
    const request = new MatchFacesRequest([image1, image2]);
    const response = await faceSdk.matchFaces(request);
    const result = await faceSdk.splitComparedFaces(response.results, 0.75);
    const match = result.matchedFaces;

    if (match.length > 0) {
      const similarity = match[0].similarity;
      const percent = (similarity * 100).toFixed(2) + '%';
      setSimilarityStatus(percent);

      if (similarity > 0.85) {
        Alert.alert('Face Verified', `Attendance marked!\nSimilarity: ${percent}`);
      } else {
        Alert.alert('Verification Failed', 'Faces do not match.');
      }
    } else {
      setSimilarityStatus('failed');
    }

    setStatus('Ready');
  };

  const clearResults = () => {
    setStatus('Ready');
    setSimilarityStatus('null');
    setLivenessStatus('null');
    setImage1(null);
    setImage2(null);
    setUiImage1(null);
    setUiImage2(null);
  };

  if (showCamera && capturePosition !== null) {
    return (
      <CustomCameraCapture
        onCapture={(base64: string) => {
          setFaceImage(base64, ImageType.LIVE, capturePosition);
          setShowCamera(false);
        }}
        onCancel={() => setShowCamera(false)}
      />
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Face Attendance</Text>
      <Text>Status: {status}</Text>
      <View style={styles.imageRow}>
        <Image
          source={uiImage1 ? { uri: uiImage1 } : require('./images/portrait.png')}
          style={styles.image}
        />
        <Image
          source={uiImage2 ? { uri: uiImage2 } : require('./images/portrait.png')}
          style={styles.image}
        />
      </View>
      <Text>Liveness: {livenessStatus}</Text>
      <Text>Similarity: {similarityStatus}</Text>
      <View style={styles.buttonGroup}>
        <Button title="Pick Image 1" onPress={() => pickImage(1)} />
        <Button title="Pick Image 2" onPress={() => pickImage(2)} />
        <Button title="Start Liveness" onPress={startLiveness} />
        <Button title="Match Faces" onPress={matchFaces} />
        <Button title="Clear" onPress={clearResults} />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 15,
    marginVertical: 10,
  },
  image: {
    width: 140,
    height: 140,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  buttonGroup: {
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
});
