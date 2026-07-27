import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { AppState, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SideMenuNavigator } from './presentation/routes/SideMenuNavigator';
import { PaperProvider } from 'react-native-paper';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import { AppProvider } from './context/VelocidadContext';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { NotifierWrapper } from 'react-native-notifier';

export const App = () => {
  useKeepAwake();

  useEffect(() => {
    SystemNavigationBar.immersive();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        SystemNavigationBar.immersive();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);


  
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NotifierWrapper>
          <AppProvider>
            <PaperProvider>
              <View style={{ flex: 1, marginHorizontal: 0, backgroundColor: '#fff', paddingHorizontal: 50 }}>
                <NavigationContainer>
                  <SideMenuNavigator />
                </NavigationContainer>
              </View>
            </PaperProvider>
          </AppProvider>
        </NotifierWrapper>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};