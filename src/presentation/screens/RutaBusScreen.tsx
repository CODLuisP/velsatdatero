import React, {useEffect, useState} from 'react';
import {Text, View, ScrollView, Modal, TouchableOpacity, Dimensions} from 'react-native';
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
import {MapaScreen} from './MapaScreen'; // Importa tu componente de mapa

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

const {width, height} = Dimensions.get('window');

export const RutaBusScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [timeData, setTimeData] = useState<
    {coddetacontrol: string; tiempogps: number}[]
  >([]);
  const route = useRoute();

  // Estados para el modal del mapa
  const [modalVisible, setModalVisible] = useState(false);
  const [mapData, setMapData] = useState<{
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
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(8);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);

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

  // Función para mostrar el modal del mapa
  const handleShowMap = (
    deviceID: string,
    latitud: number,
    longitud: number,
    direccion: string,
  ) => {
    setMapData({
      deviceID,
      latitud,
      longitud,
      direccion,
      codigo,
      fechaini: parseInt(fechaini), // Convertir a number
      codruta,
      placa,
      timeData, // Incluir timeData
      timesControl: [], // Incluir timesControl vacío o con datos si los tienes
    });
    setModalVisible(true);
    setTimeLeft(8);

    // Contador regresivo
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setModalVisible(false);
          setTimeLeft(8);
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    setCountdownInterval(countdown);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setModalVisible(false);
    setTimeLeft(8);
  };

  // Limpiar el intervalo cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

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
                    handleShowMap(
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

      {/* Modal del Mapa */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              width: width * 0.95,
              height: height * 0.85,
              borderRadius: 15,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
            
            {/* Header del Modal */}
            <View
              style={{
                backgroundColor: '#113EB9',
                padding: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                📍 Ubicación - {mapData?.deviceID}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{color: 'white', marginRight: 10, fontSize: 14}}>
                  Cierra en: {timeLeft}s
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <IonIcon name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Contenido del Mapa */}
            <View style={{flex: 1}}>
              {mapData && (
                <MapaScreen
                  route={{
                    params: mapData
                  }}
                  navigation={{
                    goBack: closeModal, // Para que el botón "Volver" cierre el modal
                    canGoBack: () => true,
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};