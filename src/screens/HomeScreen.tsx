import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ViewAttendanceScreen from './ViewAttendanceScreen'
import FaceMatchScreen from '../components/FaceMatchScreen'
import CustomCameraCapture from '../components/CustomCameraCapture'


const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
  
      <FaceMatchScreen />
   
   

    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})