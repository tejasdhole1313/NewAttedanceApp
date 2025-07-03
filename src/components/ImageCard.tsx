import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface Props {
  uri: string | null;
}
export default function ImageCard({ uri }: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={uri ? { uri } : require('../assets/portrait.png')}
        style={styles.image}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
});
