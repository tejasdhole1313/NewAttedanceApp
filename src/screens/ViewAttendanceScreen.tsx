import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getAttendanceLogsLocally } from '../storage/mmkvStorage';
const ViewAttendanceScreen = () => {
  const data = getAttendanceLogsLocally();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Records</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.record}>
            <Text>User: {item.userId}</Text>
            <Text>Similarity: {(item.similarity * 100).toFixed(2)}%</Text>
            <Text>Date: {new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};
export default ViewAttendanceScreen;
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  record: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
  },
});
