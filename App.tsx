import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomCameraCapture from './src/components/CustomCameraCapture';
import FaceMatchScreen from './src/components/FaceMatchScreen';
const Stack = createNativeStackNavigator();
const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
    
        <Stack.Screen name="Home" component={CustomCameraCapture} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
