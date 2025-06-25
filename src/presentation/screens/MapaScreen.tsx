import {useRoute, useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useMemo} from 'react';
import {Button, Text, View, StyleSheet, Pressable, Image} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {globalStyles} from '../theme/styles';
import {IonIcon} from '../components/shared/IonIcon';

const initialZoomRegion = {latitudeDelta: 0.0922, longitudeDelta: 0.0421};
const zoomedInLevel = 18; // Nivel de zoom aumentado

export const MapaScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const route = useRoute();

  const {
    deviceID,
    latitud,
    longitud,
    direccion,
    codigo,
    fechaini,
    codruta,
    placa,
    timeData,
    timesControl,
  } = useMemo(
    () =>
      route.params as {
        deviceID: string;
        latitud: number;
        longitud: number;
        direccion: string;
        codigo: string;
        fechaini: number;
        codruta: string;
        placa: string;
        timeData: {coddetacontrol: string; tiempogps: number}[];
        timesControl: {
          codigo: string;
          coddetallecontrol: string;
          timecontrol: number;
        }[];
      },
    [route.params],
  );

  const mapRef = useRef<MapView | null>(null);

  const handleReturnToRutaBus = () => {
    navigation.navigate('RUTA BUS', {
      codigo,
      fechaini,
      codruta,
      placa,
      timeData,
      timesControl,
    });
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        const currentZoom = camera.zoom ?? 15; // Nivel de zoom predeterminado si 'zoom' es undefined
        mapRef.current?.animateCamera({
          ...camera,
          zoom: currentZoom + 1, // Incrementa el nivel de zoom
        });
      });
    }
  };
  
  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        const currentZoom = camera.zoom ?? 15; // Nivel de zoom predeterminado si 'zoom' es undefined
        mapRef.current?.animateCamera({
          ...camera,
          zoom: currentZoom - 1, // Disminuye el nivel de zoom
        });
      });
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      const latitudeOffset = -0.0001;
      mapRef.current.animateCamera(
        {
          center: {latitude: latitud - latitudeOffset, longitude: longitud},
          zoom: zoomedInLevel,
        },
        {duration: 1000},
      );
    }
  }, [latitud, longitud]);

  return (
    <View style={{flex: 1}}>
      <Pressable
        style={globalStyles.returnButton}
        onPress={handleReturnToRutaBus}>
        <IonIcon
          name="arrow-back-circle-outline"
          size={24}
          color="#FFF"
          style={globalStyles.iconBack}
        />
        <Text style={globalStyles.returnButtonText}>Volver</Text>
      </Pressable>

      {/* Caja flotante que simula el Callout siempre visible */}
      <View style={globalStyles.infoBox}>
        <Text style={globalStyles.infoText}>{deviceID.toUpperCase()}</Text>
        <Text style={globalStyles.infoDir}>{direccion}</Text>
      </View>

      <MapView
        ref={mapRef}
        style={{flex: 1}}
        initialRegion={{
          latitude: latitud,
          longitude: longitud,
          ...initialZoomRegion,
        }}>
        <Marker coordinate={{latitude: latitud, longitude: longitud}} style={{width:50, height:50}}>
          <Image
            source={require('../files/IMG/bus.png')}
            style={{width: '90%', height: '90%'}} // Ajusta el tamaño deseado aquí
            resizeMode="contain"
          />
        </Marker>
      </MapView>

      {/* Botones de zoom */}
      <View style={globalStyles.zoomButtons}>
        <Pressable style={globalStyles.zoomButton} onPress={zoomIn}>
          <Text style={globalStyles.zoomText}>+</Text>
        </Pressable>
        <Pressable style={globalStyles.zoomButton} onPress={zoomOut}>
          <Text style={globalStyles.zoomText}>-</Text>
        </Pressable>
      </View>
    </View>
  );
};
