import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import data from '../data/employees.json';

type Employee = { id: string; name: string; image: string };

export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    setEmployees(data as Employee[]);
  }, []);

  const onSelectEmployee = (employee: Employee) => {
    (navigation as any).navigate('LiveMatchScreen', { employee });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Employee to Verify</Text>
      <FlatList
        data={employees}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelectEmployee(item)} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    padding: 10,
  },
  image: { width: 120, height: 120, borderRadius: 10 },
  name: { marginTop: 10, fontWeight: '600' },
});
