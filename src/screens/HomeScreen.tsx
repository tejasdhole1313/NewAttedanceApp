import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ViewAttendanceScreen from './ViewAttendanceScreen'
import FaceMatchScreen from '../components/FaceMatchScreen'
import LiveCaptureScreen from '../components/LiveCaptureScreen'
import ReferenceImageScreen from '../components/ReferenceImageScreen'
import LiveMatchScreen from '../components/LiveMatchScreen'
import CustomCameraCapture from '../components/CustomCameraCapture'


const HomeScreen = () => {
  return (
    <View style={styles.container}>
  
      <FaceMatchScreen />
   
   

    </View>
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