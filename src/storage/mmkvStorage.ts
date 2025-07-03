import { MMKV } from 'react-native-mmkv';

export const mmkv = new MMKV();

export function saveAttendanceLocally(log: {
  userId: string;
  similarity: number;
  timestamp: string;
}) {
  const logs = getAttendanceLogsLocally();
  logs.unshift(log); // add newest on top
  mmkv.set('attendanceLogs', JSON.stringify(logs));
}

export function getAttendanceLogsLocally(): {
  userId: string;
  similarity: number;
  timestamp: string;
}[] {
  const data = mmkv.getString('attendanceLogs');
  return data ? JSON.parse(data) : [];
}
