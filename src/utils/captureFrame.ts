// utils/captureFrame.ts
import { Camera } from 'react-native-vision-camera';
import * as FS from 'react-native-fs';

export const captureFrame = async (cameraRef: React.RefObject<Camera>): Promise<string> => {
  if (!cameraRef.current) throw new Error('Camera not ready');
  
  try {
    console.log('Taking photo...');
    const photo = await cameraRef.current.takePhoto({
      flash: 'off',
    });

    console.log('Photo captured:', photo);
    if (!photo || !photo.path) {
      throw new Error('Photo capture failed - no path returned');
    }

    console.log('Photo path:', photo.path);
    // Use the path directly without adding 'file://' prefix
    const exists = await FS.exists(photo.path);
    console.log('File exists:', exists);
    if (!exists) {
      throw new Error('Photo file not found');
    }

    console.log('Reading file...');
    const base64 = await FS.readFile(photo.path, 'base64');
    console.log('Base64 length:', base64?.length || 0);
    if (!base64) {
      throw new Error('Failed to read photo file');
    }

    return base64;
  } catch (error: any) {
    console.error('Capture frame error:', error);
    throw new Error(`Failed to capture image: ${error?.message || 'Unknown error'}`);
  }
};

