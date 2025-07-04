import { Camera } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

export const captureFrame = async (camera: Camera): Promise<string> => {
  try {
    const photo = await camera.takePhoto({});
    const path = photo.path;
    const base64 = await RNFS.readFile(path, 'base64');
    return base64;
  } catch (err) {
    console.error('Failed to capture or read image', err);
    throw err;
  }
};
