import {useRoute, useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useMemo} from 'react';
import {Text, View, Pressable, Image} from 'react-native';
import {WebView} from 'react-native-webview';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {globalStyles} from '../theme/styles';
import {IonIcon} from '../components/shared/IonIcon';

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

  const webViewRef = useRef<WebView>(null);

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

   const onWebViewLoad = () => {
    // Inicializar el mapa cuando se carga
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'init',
        lat: latitud,
        lng: longitud,
      })
    );
  };

    useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'update',
          lat: latitud,
          lng: longitud,
        })
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

      <WebView
        ref={webViewRef}
        source={{uri: 'file:///android_asset/map.html'}}
        style={{flex: 1}}
        onLoad={onWebViewLoad}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="compatibility"
      />
    </View>
  );
};