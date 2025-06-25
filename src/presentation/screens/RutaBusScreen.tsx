import React, {useEffect, useState} from 'react';
import {Text, View, ScrollView} from 'react-native';
import {globalStyles} from '../theme/styles';
import {ListTimes} from '../components/shared/ListTimes';
import {useRoute, useNavigation} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {formatPlaca} from '../utils/ObtenerNombre';
import {processRightData} from '../utils/CalcularDiffs';
import {IonIcon} from '../components/shared/IonIcon';
import {
  calcularDistancias,
  calcularDistanciasVuelta,
} from '../utils/CalculoDistancia';

import App from '../componentes/Rastredor';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ControlData {
  nombre: string;
}

type DistanceResult = {
  deviceID: string;
  distance: number;
};

type DrawerParamList = {
  Control: undefined;
  Mapa: {
    deviceID: string;
    latitud: number;
    longitud: number;
    direccion: string;
    codigo: string;
    fechaini: string;
    codruta: string;
    placa: string;
  };
  RutaBus: {
    codigo: string;
    fechaini: string;
    fechafin: string | null;
    codruta: string;
    isruta: string;
    deviceID: string;
    androidID: string;
    codconductor: string;
    fecreg: string;
    placa: string;
    logurb?: {
      codasig: string;
      deviceid: string;
      nom_control: string;
      hora_estimada: string;
      hora_llegada: string;
      volado: string;
      fecha: string;
    }[];
  };
};

export const RutaBusScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [timeData, setTimeData] = useState<
    {coddetacontrol: string; tiempogps: number}[]
  >([]);
  const route = useRoute();

  const {
    codigo,
    fechaini,
    fechafin,
    codruta,
    isruta,
    deviceID,
    androidID,
    placa,
    logurb,
    codconductor,
    fecreg,
  } = route.params as {
    codigo: string;
    fechaini: string;
    fechafin: string;
    codruta: string;
    isruta: string;
    androidID: string;
    deviceID: string;
    placa: string;
    codconductor: string;
    fecreg: string;
    logurb: {
      codasig: string;
      deviceid: string;
      nom_control: string;
      hora_estimada: string;
      hora_llegada: string;
      volado: string;
      fecha: string;
    }[];
  };

  const [error, setError] = useState<string | null>(null);

  const [vehicleDistances, setVehicleDistances] = useState<any[]>([]);

  const rutaId = parseInt(codruta, 10);

  const obtenerDistancias = async () => {
    let distances: DistanceResult[] = [];

    if (rutaId === 6) {
      distances = await calcularDistanciasVuelta(rutaId);
    } else if (rutaId === 5) {
      distances = await calcularDistancias(rutaId);
    } else {
      console.warn(
        'rutaId no coincide con 5 o 6, no se realizará ningún cálculo.',
      );
    }
    if (distances.length === 0) {
      console.warn('La API devolvió un arreglo vacío.');
    }
    setVehicleDistances(distances);
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      await obtenerDistancias();
    };

    obtenerDatos();

    const intervalId = setInterval(obtenerDistancias, 20000);

    return () => clearInterval(intervalId);
  }, [rutaId]);

  const handleNavigation = (
    deviceID: string,
    latitud: number,
    longitud: number,
    direccion: string,
  ) => {
    navigation.navigate('Mapa', {
      deviceID,
      latitud,
      longitud,
      direccion,
      codigo,
      fechaini,
      codruta,
      placa,
    });
  };

  if (error) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'red', textAlign: 'center'}}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.containerRuta}>
      <ScrollView
        style={globalStyles.containerLeftRuta}
        contentContainerStyle={{paddingBottom: 0}}>
        <App
          codruta={codruta}
          logurb={logurb}
          codasig={codigo}
          fechaini={fechaini}
          androidID={androidID}
          deviceID={deviceID}
          codconductor={codconductor}
          fecreg={fecreg}
        />
        {/* 
        <Text>{codconductor}</Text>
        <Text>{fecreg}</Text> */}

        {/* {logurb.map((item, index) => (
    <View key={index} style={{ marginBottom: 20 }}>
  
      <Text>codasig: {item.codasig}</Text>
      <Text>deviceid: {item.deviceid}</Text>
      <Text>nom_control: {item.nom_control}</Text>
      <Text>hora_estimada: {item.hora_estimada}</Text>
      <Text>hora_llegada: {item.hora_llegada}</Text>
      <Text>volado: {item.volado}</Text>
      <Text>fecha: {item.fecha}</Text>
    </View>
  ))} */}

        {/* 
  <Text>Fecha Ini: {fechaini}</Text>
  <Text>CODruta: {codruta}</Text>
  <Text>AndroidID: {androidID}</Text> */}
      </ScrollView>

      <View style={globalStyles.containerRightRuta}>
        {vehicleDistances.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f8f9fa',
              padding: 0,
            }}>
            <View
              style={{
                backgroundColor: '#fff',
                padding: 32,
                borderRadius: 0,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                height: '100%',
              }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#fff3e0',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                <Ionicons name="bus" size={32} color="#ff9800" />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#212529',
                  textAlign: 'center',
                  marginBottom: 8,
                }}>
                No hay buses disponibles
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#6c757d',
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                Intenta nuevamente más tarde o contacta al administrador
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignContent: 'center',
              justifyContent: 'center',
            }}>
            {(() => {
              const placaIndex = vehicleDistances.findIndex(
                vehicle =>
                  vehicle.deviceID.toLowerCase() === placa.toLowerCase(),
              );

              if (placaIndex === -1) {
                return (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#fff3cd',
                    }}>
                    <View
                      style={{
                        width: '100%',
                        overflow: 'hidden',
                        shadowColor: '#000',
                      }}>
                      {/* Contenido */}
                      <View
                        style={{
                          backgroundColor: '#fff3cd',
                          alignItems: 'center',
                          padding: 20,
                        }}>
                        <View
                          style={{
                            backgroundColor: '#ffeeba',
                            padding: 12,
                            marginBottom: 10,
                            borderRadius: 50,
                          }}>
                          <IonIcon
                            name="warning-outline"
                            size={28}
                            color="#856404"
                          />
                        </View>
                        <Text
                          style={{
                            color: '#856404',
                            fontSize: 16,
                            textAlign: 'center',
                          }}>
                          La placa ingresada no fue encontrada en ninguna ruta.
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }

              const start = Math.max(0, placaIndex - 3);
              const end = Math.min(vehicleDistances.length, placaIndex + 3);

              const visibleVehicles = vehicleDistances.slice(start, end);
              const processedVehicles = processRightData(
                visibleVehicles,
                placa,
              );

              return processedVehicles.map((vehicle, index) => (
                <ListTimes
                  key={`${vehicle.deviceID}-${index}`}
                  value={formatPlaca(vehicle.deviceID)}
                  isCurrent={
                    vehicle.deviceID.toLowerCase() === placa.toLowerCase()
                  }
                  diff={vehicle.diff === 0 ? 1 : vehicle.diff}
                  onPress={() =>
                    handleNavigation(
                      vehicle.deviceID,
                      vehicle.lastValidLatitude,
                      vehicle.lastValidLongitude,
                      vehicle.direccion,
                    )
                  }
                />
              ));
            })()}
          </ScrollView>
        )}
      </View>
    </View>
  );
};
