import React, {useEffect, useState} from 'react';
import {Text, View, ScrollView} from 'react-native';
import {globalStyles} from '../theme/styles';
import {ListTimes} from '../components/shared/ListTimes';
import {useRoute} from '@react-navigation/native';
import {formatPlaca} from '../utils/ObtenerNombre';
import {processRightData} from '../utils/CalcularDiffs';
import {IonIcon} from '../components/shared/IonIcon';
import {
  calcularDistancias,
  calcularDistanciasVuelta,
} from '../utils/CalculoDistancia';
import App from '../componentes/Rastredor';
import Ionicons from 'react-native-vector-icons/Ionicons';

type DistanceResult = {
  deviceID: string;
  distance: number;
};

export const RutaBusScreen = () => {
  const route = useRoute();
  const {
    codigo,
    fechaini,
    codruta,
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

  if (error) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'red', textAlign: 'center'}}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.containerRuta}>
      <View style={globalStyles.containerLeftRuta}>
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
      </View>

      <View style={globalStyles.containerRightRuta}>
        {vehicleDistances.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
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
                />
              ));
            })()}
          </ScrollView>
        )}
      </View>
    </View>
  );
};
