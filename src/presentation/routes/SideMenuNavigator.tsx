import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';

import {Image, Linking, Text, TouchableOpacity, View} from 'react-native';
import {ControlScreen} from '../screens/ControlScreen';
import {RutaBusScreen} from '../screens/RutaBusScreen';
import {MapaScreen} from '../screens/MapaScreen';
import {Button} from 'react-native-paper';
import {IonIcon} from '../components/shared/IonIcon';
import {useEffect, useState, useMemo} from 'react';
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
          padding: 12,
          marginLeft: 10,
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={globalStyles.titleModo}>{modoVisualizacion}</Text>

          {modoVisualizacion === 'Modo Visualización' ? (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <IonIcon name="cellular-outline" size={25} color="#fff" />
              <View style={{marginLeft: 8}}>
                <BatteryIndicator level={batteryLevel} />
              </View>
                 <IonIcon
                name="earth-outline"
                size={20}
                color="#fff"
                style={{marginLeft: 8}}
              />
            </View>
          ) : (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <IonIcon
                name="earth-outline"
                size={20}
                color="#fff"
                style={{marginLeft: 8}}
              />
              <IonIcon
                name="ellular-outline"
                size={20}
                color="#fff"
                style={{marginLeft: 8}}
              />
              <View style={{marginLeft: 8}}>
                <BatteryIndicator level={batteryLevel} />
              </View>
            </View>
          )}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 20,
        }}>
        <IonIcon
          name="stopwatch-outline"
          color="#fff"
          size={32}
          style={{marginRight: 8}}
        />
        <Text style={{color: '#ffffff', fontSize: 28}}>{currentTime}</Text>
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
          headerTitleStyle: {
            marginLeft: -10,
            color: '#ffffff',
            fontSize: 22,
          },
          headerStyle: {
            backgroundColor: '#113EB9',
          },
          drawerType: 'slide',
          unmountOnBlur: false,
          headerLeft: () => (
            <IonIcon
              name="menu"
              color="#fff"
              size={40}
              style={{marginLeft: 10}}
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            />
          ),
          headerRight: () => <CurrentTime />,
        }}
      />
      <Drawer.Screen
        name="Mapa"
        component={MapaScreen}
        options={{
          headerShown: true,
          headerTitleStyle: {
            marginLeft: -5,
            color: '#ffffff',
            fontSize: 20,
          },
          headerStyle: {
            backgroundColor: '#113EB9',
          },
          headerLeft: () => null,
          drawerType: 'slide',
          unmountOnBlur: false,
        }}
      />
    </Drawer.Navigator>
  );
};

const CustomDrawerContent = React.memo((props: DrawerContentComponentProps) => {
  const {navigation} = props;

  const pdfUrl =
    'https://drive.google.com/file/d/1MnjCzv1_59SOsZPgo5HjALoPbESnFQsQ/view?usp=sharing';

  return (
    <DrawerContentScrollView
      contentContainerStyle={{flexGrow: 1, justifyContent: 'space-between'}}>
      <View
        style={{
          marginTop: -5,
          height: '100%',
          justifyContent: 'space-between',
          backgroundColor: '#001233',
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

        <View style={{padding: 5}}>
          <Button
            buttonColor="#FB7B0F"
            mode="contained"
            onPress={() => Linking.openURL(pdfUrl)}
            style={{
              borderRadius: 10,
              padding: 2,
              marginLeft: 10,
              marginRight: 10,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{marginRight: 10, color: '#FFF', fontWeight: 'bold'}}>
                Políticas de Privacidad
              </Text>
              <IonIcon name="shield-half-outline" size={20} color="#FFF" />
            </View>
          </Button>
        </View>
      </View>
    </DrawerContentScrollView>
  );
});
