import {useRoute, useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useMemo, useCallback} from 'react';
import {Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {globalStyles} from '../theme/styles';

// Tipos para el modal
interface ModalNavigation {
  goBack: () => void;
}

interface ModalRoute {
  params: {
    deviceID: string;
    latitud: number;
    longitud: number;
    direccion: string;
    codigo: string;
    fechaini: number;
    codruta: string;
    placa: string;
    timeData?: {coddetacontrol: string; tiempogps: number}[];
    timesControl?: {
      codigo: string;
      coddetallecontrol: string;
      timecontrol: number;
    }[];
  };
}

interface MapaScreenProps {
  route?: ModalRoute;
  navigation?: ModalNavigation | DrawerNavigationProp<any>;
}

export const MapaScreen: React.FC<MapaScreenProps> = (props) => {
  // Hooks de navegación como fallback
  const hookNavigation = useNavigation<DrawerNavigationProp<any>>();
  const hookRoute = useRoute();
  
  // Usar props si están disponibles, sino usar hooks
  const navigation = props?.navigation || hookNavigation;
  const route = props?.route || hookRoute;

  // Extraer parámetros de manera optimizada
  const {
    deviceID,
    latitud,
    longitud,
    direccion,
    codigo,
    fechaini,
    codruta,
    placa,
    timeData = [],
    timesControl = [],
  } = useMemo(() => {
    const params = route.params as ModalRoute['params'];
    return {
      deviceID: params?.deviceID || '',
      latitud: params?.latitud || 0,
      longitud: params?.longitud || 0,
      direccion: params?.direccion || '',
      codigo: params?.codigo || '',
      fechaini: params?.fechaini || 0,
      codruta: params?.codruta || '',
      placa: params?.placa || '',
      timeData: params?.timeData || [],
      timesControl: params?.timesControl || [],
    };
  }, [route.params]);

  const webViewRef = useRef<WebView>(null);

  // Detectar si es modal
  const isModal = Boolean(props?.navigation);

  // Inicializar mapa optimizado
  const initializeMap = useCallback(() => {
    if (!webViewRef.current || !latitud || !longitud) return;
    
    const message = JSON.stringify({
      type: 'init',
      lat: latitud,
      lng: longitud,
    });
    
    webViewRef.current.postMessage(message);
  }, [latitud, longitud]);

  // Actualizar posición del mapa
  const updateMapPosition = useCallback(() => {
    if (!webViewRef.current || !latitud || !longitud) return;
    
    const message = JSON.stringify({
      type: 'update',
      lat: latitud,
      lng: longitud,
    });
    
    webViewRef.current.postMessage(message);
  }, [latitud, longitud]);

  // Effect para actualizar posición cuando cambien las coordenadas
  useEffect(() => {
    updateMapPosition();
  }, [updateMapPosition]);

  // Manejar carga del WebView
  const onWebViewLoad = useCallback(() => {
    initializeMap();
  }, [initializeMap]);

  // Manejar errores del WebView
  const onWebViewError = useCallback((error: any) => {
    console.error('Error en WebView:', error);
  }, []);

  return (
    <View style={globalStyles.mapContainer}>
      {/* Información del vehículo */}
      <View style={[
        globalStyles.infoBox,
        isModal && globalStyles.infoBoxModal
      ]}>
        <Text style={globalStyles.infoText}>
          {deviceID.toUpperCase()}
        </Text>
        <Text style={globalStyles.infoDir}>
          {direccion}
        </Text>
      </View>

      {/* WebView del mapa */}
      <WebView
        ref={webViewRef}
        source={{uri: 'file:///android_asset/map.html'}}
        style={globalStyles.webView}
        onLoad={onWebViewLoad}
        onError={onWebViewError}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};