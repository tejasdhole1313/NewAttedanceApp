import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, ScrollView, Platform, Button, TouchableOpacity } from 'react-native';
import * as RNFS from 'react-native-fs';
import { FaceSDK, MatchFacesImage, MatchFacesRequest, InitConfig, ImageType, LivenessSkipStep, RecordingProcess, LivenessType, CameraPosition } from '@regulaforensics/face-sdk';
import CustomCameraCapture from './CustomCameraCapture';
import employees from '../data/employees.json';
const faceSdk = FaceSDK.instance;
const MATCH_THRESHOLD = 0.85;
export default function FaceMatchScreen() {
  const [status, setStatus] = useState('Initializing...');
  const [uiImage2, setUiImage2] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturePosition, setCapturePosition] = useState<number | null>(null);
  const [bestMatch, setBestMatch] = useState<{ name: string; score: number; matched: boolean } | null>(null);
  useEffect(() => {
    faceSdk.startLiveness({
      config: {
        cameraSwitchEnabled: true,
        livenessType: LivenessType.ACTIVE,
        closeButtonEnabled: true,
        torchButtonEnabled: true,
        vibrateOnSteps: true,
        copyright: true,
        cameraPositionIOS: CameraPosition.FRONT,
        cameraPositionAndroid: CameraPosition.FRONT,
        locationTrackingEnabled: true,
        attemptsCount: 3,
        recordingProcess: RecordingProcess.ASYNCHRONOUS_UPLOAD,
        skipStep: [LivenessSkipStep.ONBOARDING_STEP, LivenessSkipStep.SUCCESS_STEP]
      }
    })
  }, []);

  const initializeSDK = async () => {
    const license = await loadAssetIfExists('regula.license');
    const config = license ? new InitConfig(license) : undefined;
    const [success, error] = await faceSdk.initialize({ config });
    setStatus(success ? 'Ready' : error?.message || 'Init failed');
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

  const handleCapture = async (base64Live: string) => {
    setStatus('Processing captured image...');
    setUiImage2(`data:image/png;base64,${base64Live}`);
    setBestMatch(null);
    const liveImage = new MatchFacesImage(base64Live, ImageType.LIVE);
    let bestScore = 0;
    let matchedEmployee: string | null = null;
    let matchFound = false;
    const timeoutId = setTimeout(() => {
      if (!matchFound) {
        setBestMatch({ name: 'Unknown', score: bestScore, matched: false });
        Alert.alert('Timeout', 'No match found within 10 seconds. Please try again with better lighting or positioning.');
        setStatus('Ready');
      }
    }, 10000); 
    setStatus('Matching against employee database...');

    for (const emp of employees) {
      const refBase64 = await convertToBase64(emp.image);
      if (!refBase64) continue;

      const printedImage = new MatchFacesImage(refBase64, ImageType.PRINTED);
      const request = new MatchFacesRequest([printedImage, liveImage]);

      try {
        const response = await faceSdk.matchFaces(request);
        const result = await faceSdk.splitComparedFaces(response.results, 0.75);
        const matched = result.matchedFaces[0];

        if (matched?.similarity > bestScore) {
          bestScore = matched.similarity;
          matchedEmployee = emp.name;
        }

        if (matched?.similarity >= MATCH_THRESHOLD) {
          matchFound = true;
          clearTimeout(timeoutId);
          const percent = (matched.similarity * 100).toFixed(2);
          setBestMatch({ name: matchedEmployee ?? '', score: matched.similarity, matched: true });
          Alert.alert('✅ Match Found!', `${matchedEmployee ?? ''}\nSimilarity: ${percent}%\n\nEmployee verified successfully!`);
          setStatus('Match successful');
          return;
        }
      } catch (e) {
        console.log(`Error comparing ${emp.name}:`, e);
      }
    }

    clearTimeout(timeoutId);

    if (!matchFound) {
      setBestMatch({ name: 'Unknown', score: bestScore, matched: false });
      Alert.alert(' No Match Found', `No matching employee found.\nBest similarity: ${(bestScore * 100).toFixed(2)}%\n\nPlease ensure:\n• Good lighting\n• Face clearly visible\n• No obstructions`);
    }

    setStatus('Ready');
  };
  const clearAll = () => {
    setUiImage2(null);
    setBestMatch(null);
    setStatus('Ready');
    
  };

  if (showCamera && capturePosition !== null) {
    return (
      <CustomCameraCapture />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}> Face Match Verification</Text>
      <Text>Status: {status}</Text>

      <View style={styles.imageSection}>
        <Text style={styles.label}>Live Capture</Text>
        <Image
          source={uiImage2 ? { uri: uiImage2 } : require('./images/portrait.png')}
          style={styles.image}
        />
      </View>
      {bestMatch && (
        <View
          style={[
            styles.resultBox,
            { backgroundColor: bestMatch.matched ? '#E0F7EC' : '#FDECEA' },
          ]}
        >
          <Text style={[styles.matchText, { color: bestMatch.matched ? '#007E33' : '#D32F2F' }]}>
            {bestMatch.matched ? '✅ Matched:' : ' Not Matched:'}{' '}
            <Text style={styles.matchName}>{bestMatch.name}</Text>
          </Text>
          <Text style={[styles.matchPercent, { color: bestMatch.matched ? '#007E33' : '#D32F2F' }]}>
            Similarity: {(bestMatch.score * 100).toFixed(2)}%
          </Text>
        </View>
      )}

<View style={styles.buttonGroup}>
  <TouchableOpacity
    style={styles.startButton}
    onPress={() => {
      setCapturePosition(2);
      setShowCamera(true);
      setStatus('Opening camera...');
      setUiImage2(null);
      setBestMatch(null);
    
    }}
  >
    <Text style={styles.buttonText}> Start Face Capture</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.clearButton}
    onPress={clearAll}
  >
    <Text style={styles.buttonText}> Clear All</Text>
  </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageSection: {
    marginVertical: 15,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    borderStyle: 'solid',
  },
  resultBox: {
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  matchText: {
    fontSize: 16,
    fontWeight: '600',
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchPercent: {
    fontSize: 15,
    marginTop: 5,
  },
  buttonGroup: {
    marginTop: 20,
    width: '100%',
    gap: 10,
    justifyContent: 'space-around',
  },
  startButton: {
    backgroundColor: '#28a745', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 150,
    elevation: 3,
  },
  clearButton: {
    backgroundColor: '#FF3B30', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
  },
});
