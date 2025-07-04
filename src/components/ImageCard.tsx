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
    borderColor: 'black',
    borderRadius: 10,
    padding: 5,
    width:500,
    height:500,
  },
  image: {
    width: 500,
    height: 500,
    borderRadius: 8,
  },
});
