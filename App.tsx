import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FaceMatchScreen from './src/components/FaceMatchScreen';
import ViewAttendanceScreen from './src/screens/ViewAttendanceScreen';
import HomeScreen from './src/screens/HomeScreen.tsx';
import EmployeeListScreen from './src/components/EmployeeListScreen';
import CustomCameraCapture from './src/components/CustomCameraCapture';
import LiveCaptureScreen from './src/components/LiveCaptureScreen.tsx';
import ReferenceImageScreen from './src/components/ReferenceImageScreen.tsx';

import LiveMatchScreen from './src/components/LiveMatchScreen.tsx';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FaceMatch" component={FaceMatchScreen as React.ComponentType<any>} />
        <Stack.Screen name="ViewAttendance" component={ViewAttendanceScreen} />
        <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
        <Stack.Screen name="CustomCameraCapture" component={CustomCameraCapture as React.ComponentType<any>} />
        <Stack.Screen name="LiveCapture" component={LiveCaptureScreen as React.ComponentType<any>} />
        <Stack.Screen name="ReferenceImage" component={ReferenceImageScreen as React.ComponentType<any>} />
        <Stack.Screen name="LiveMatch" component={LiveMatchScreen as React.ComponentType<any>} />
          




      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
