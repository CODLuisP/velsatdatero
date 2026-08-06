import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView
} from '@react-navigation/drawer';

import {Image, Text, TouchableOpacity, View} from 'react-native';
import {ControlScreen} from '../screens/ControlScreen';
import {RutaBusScreen} from '../screens/RutaBusScreen';
import {IonIcon} from '../components/shared/IonIcon';
import {useEffect, useState} from 'react';
import {globalStyles} from '../theme/styles';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import React from 'react';
import {useAppContext} from '../../context/VelocidadContext';
import DeviceInfo from 'react-native-device-info';

const Drawer = createDrawerNavigator();

const CurrentTime = React.memo(() => {
  const [currentTime, setCurrentTime] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(0);

  const {velocidad, modoVisualizacion} = useAppContext();

  useEffect(() => {
    const getBatteryLevel = async () => {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        setBatteryLevel(Math.round(level * 100)); // Convertir a porcentaje
      } catch (error) {
        console.log('Error getting battery level:', error);
      }
    };

    getBatteryLevel();

    // Actualizar cada 30 segundos
    const interval = setInterval(getBatteryLevel, 30000);

    return () => clearInterval(interval);
  }, []);

  const getBatteryColor = (level: any) => {
    if (level > 50) return '#4CAF50'; // Verde
    if (level > 20) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  const BatteryIndicator = ({level}: any) => (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <View
        style={{
          width: 20,
          height: 12,
          borderWidth: 1,
          borderColor: '#fff',
          borderRadius: 2,
          backgroundColor: 'transparent',
          marginRight: 2,
        }}>
        <View
          style={{
            width: `${level}%`,
            height: '100%',
            backgroundColor: getBatteryColor(level),
            borderRadius: 1,
          }}
        />
      </View>
      <View
        style={{
          width: 2,
          height: 6,
          backgroundColor: '#fff',
          borderRadius: 1,
        }}
      />
      <Text style={{color: '#fff', fontSize: 12, marginLeft: 4}}>{level}%</Text>
    </View>
  );

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-PE', {
          timeZone: 'America/Lima',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        justifyContent: 'space-between',
        width: '100%',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 0,
          paddingHorizontal: 5,
          marginLeft: 5,
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={globalStyles.titleModo}>{modoVisualizacion}</Text>

          <View style={{marginLeft: 8}}>
            <BatteryIndicator level={batteryLevel} />
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 10,
        }}>
        <IonIcon
          name="stopwatch-outline"
          color="#fff"
          size={28}
          style={{marginRight: 6}}
        />
        <Text style={{color: '#ffffff', fontSize: 24, fontWeight: '600'}}>{currentTime}</Text>
      </View>
    </View>
  );
});

export const SideMenuNavigator = () => {
  const navigation = useNavigation();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveBackgroundColor: '#113EB9',
        drawerActiveTintColor: '#FFFFFF',
        drawerInactiveTintColor: '#113EB9',
        drawerItemStyle: {
          borderRadius: 10,
          paddingHorizontal: 20,
        },
        headerTintColor: '#fff',
      }}>
      <Drawer.Screen
        name="Control"
        component={ControlScreen}
        options={{headerShown: false, drawerType: 'slide'}}
      />
      <Drawer.Screen
        name="RUTA BUS"
        component={RutaBusScreen}
        options={{
          headerShown: true,
          headerStatusBarHeight: 0,
          headerTitleStyle: {
            marginLeft: 5,
            color: '#ffffff',
            fontSize: 20,
          },
          headerStyle: {
            backgroundColor: '#113EB9',
            height: 50,
          },
          drawerType: 'slide',
          headerLeft: () => (
            <IonIcon
              name="menu"
              color="#fff"
              size={32}
              style={{marginLeft: 10}}
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            />
          ),
          headerRight: () => <CurrentTime />,
        }}
      />
    </Drawer.Navigator>
  );
};

const CustomDrawerContent = React.memo((props: DrawerContentComponentProps) => {
  const {navigation} = props;

  return (
    <DrawerContentScrollView
      contentContainerStyle={{flexGrow: 1, justifyContent: 'space-between',          backgroundColor: '#FFF',
}}>
      <View
        style={{
         
          height: '100%',
          justifyContent: 'space-between',
        }}>
        <View style={{marginTop: 20}}>
          <Text style={globalStyles.tituloSide}>BIENVENIDO A</Text>
        </View>
        <Image
          source={require('../files/IMG/velsat.png')}
          style={{
            height: 105,
            width: 105,
            marginTop: 10,
            marginBottom: 10,
            alignSelf: 'center',
            borderRadius: 10,
          }}
        />
        <DrawerContentScrollView>
          <TouchableOpacity
            onPress={() => navigation.navigate('Control')}
            style={{
              backgroundColor: '#113EB9',
              borderRadius: 10,
              padding: 12,
              marginHorizontal: 10,
              marginVertical: 5,
              alignItems: 'center',
            }}>
            <Text style={{color: '#fff', fontSize: 14}}>INICIO</Text>
          </TouchableOpacity>
        </DrawerContentScrollView>

        <View style={globalStyles.containerControlText}>
          <Text style={globalStyles.version}>Versión 2.0</Text>
          <Text style={globalStyles.location}>Lima - Perú</Text>
          <Text style={globalStyles.copyright}>© 2025 VELSAT SAC</Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
});
