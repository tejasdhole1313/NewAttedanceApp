// @ts-ignore
import axios from 'axios';
import { saveAttendanceLocally, getAttendanceLogsLocally } from '../storage/mmkvStorage';
import { Platform } from 'react-native';

// Use emulator or local IP
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api' // for Android emulator
    : 'http://192.168.1.100:3000/api'; // replace with your machine's IP

export async function markAttendance(data: {
  userId: string;
  similarity: number;
  timestamp: string;
}) {
  try {
    await axios.post(`${BASE_URL}/attendance`, data);
  } catch (err) {
    console.warn('Server not reachable, saving locally only');
  } finally {
    saveAttendanceLocally(data);
  }
}

export async function fetchAttendanceLogs() {
  try {
    const response = await axios.get(`${BASE_URL}/attendance`);
    return response.data;
  } catch (error) {
    console.warn('Fetching local logs due to server error');
    return getAttendanceLogsLocally();
  }
}
