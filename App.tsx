import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FaceMatchScreen from './src/components/FaceMatchScreen';
import ViewAttendanceScreen from './src/screens/ViewAttendanceScreen';
import HomeScreen from './src/screens/HomeScreen.tsx';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FaceMatch" component={FaceMatchScreen as React.ComponentType<any>} />
        <Stack.Screen name="ViewAttendance" component={ViewAttendanceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
