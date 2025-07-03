import { Camera } from 'react-native-vision-camera';

export const captureFrame = async (camera: Camera): Promise<string> => {
  const photo = await camera.takePhoto({});
  const { default: RNFS } = await import('react-native-fs');
  const path = photo.path;
  const base64 = await RNFS.readFile(path, 'base64');
  return base64;
}
