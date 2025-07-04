// ReferenceImageScreen.tsx
import React, { useState } from 'react';
import { View, Button, Image, Alert, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { MatchFacesImage, ImageType } from '@regulaforensics/face-sdk';

export default function ReferenceImageScreen({ navigation }: any) {
  const [uiImage1, setUiImage1] = useState<string | null>(null);
  const [image1, setImage1] = useState<MatchFacesImage | null>(null);

  const pickReferenceImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true, selectionLimit: 1 },
      (res) => {
        const base64 = res.assets?.[0]?.base64;
        if (base64) {
          const image = new MatchFacesImage(base64, ImageType.PRINTED);
          setImage1(image);
          setUiImage1(`data:image/png;base64,${base64}`);
        }
      }
    );
  };

  const proceedToVerify = () => {
    if (!image1) {
      Alert.alert('Please select a reference image first.');
      return;
    }
    navigation.navigate('LiveCaptureScreen', { referenceImage: image1 });
  };

  return (
    <View style={styles.container}>
      <Image
        source={uiImage1 ? { uri: uiImage1 } : require('./images/portrait.png')}
        style={styles.image}
      />
      <Button title="Select Reference Image" onPress={pickReferenceImage} />
      <Button title="Proceed to Capture & Verify" onPress={proceedToVerify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  image: { width: 150, height: 150, borderWidth: 1, borderRadius: 10 },
});
