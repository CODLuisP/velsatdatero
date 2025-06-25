import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { AppState, View } from 'react-native';
import { SideMenuNavigator } from './presentation/routes/SideMenuNavigator';
import { PaperProvider } from 'react-native-paper';
import KeepAwake from 'react-native-keep-awake';
import { AppProvider } from './context/VelocidadContext';
import { UsageMonitor } from './helpers/UsageMonitor';
import SystemNavigationBar from 'react-native-system-navigation-bar';

export const App = () => {
  UsageMonitor();

  useEffect(() => {
    KeepAwake.activate();
    SystemNavigationBar.immersive(); 

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        SystemNavigationBar.immersive(); 
      }
    });

    return () => {
      KeepAwake.deactivate();
      subscription.remove();
    };
  }, []);

  return (
  <AppProvider >
    <PaperProvider>
          <View style={{ flex: 1, marginHorizontal:0, backgroundColor: '#fff',paddingHorizontal:50 }}>

        <NavigationContainer>
          <SideMenuNavigator />
        </NavigationContainer>
      </View>
    </PaperProvider>
  </AppProvider>
  );
};
