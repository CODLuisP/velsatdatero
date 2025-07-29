'use client';

import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  Alert,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {Button, Dialog, Portal, Text, TextInput} from 'react-native-paper';
import {globalStyles} from '../theme/styles';
import {IonIcon} from '../components/shared/IonIcon';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {DrawerNavigationProp} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RestartButton from '../components/shared/RestartButton';
import DeviceInfo from 'react-native-device-info';

import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
  HttpTransportType,
} from '@microsoft/signalr';

type DrawerParamList = {
  Control: undefined;
  'RUTA BUS': {
    codigo: string;
    fechaini: string;
    fechafin: string;
    codruta: string;
    isruta: string;
    deviceID: string;
    androidID: string;
    fecreg: string;
    codconductor: string;
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

interface ControlAlertProps {
  initialSeconds: number;
  onTimeExpired?: () => void;
  onTimeChange?: (seconds: number) => void;
  showTimer: boolean;
  isRutaActive: boolean;
}

const ControlAlert: React.FC<ControlAlertProps> = ({
  initialSeconds,
  onTimeExpired,
  onTimeChange,
  showTimer,
  isRutaActive,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredExpiredRef = useRef(false); 


  useEffect(() => {
    console.log(
      `[ControlAlert Effect] Render with initialSeconds: ${initialSeconds}, showTimer: ${showTimer}, hasTriggeredExpiredRef.current: ${hasTriggeredExpiredRef.current}`,
    );

    setTotalSeconds(initialSeconds);
    onTimeChange?.(initialSeconds);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (initialSeconds > 0) {
      hasTriggeredExpiredRef.current = false;
    }

    if (showTimer) {
      if (initialSeconds > 0) {
        if (!hasTriggeredExpiredRef.current) {
          intervalRef.current = setInterval(() => {
            setTotalSeconds(prevSeconds => {
              const newSeconds = prevSeconds - 1;
              onTimeChange?.(newSeconds);
              if (newSeconds <= 0) {
                console.log(
                  '[ControlAlert Effect] Countdown finished. Clearing interval.',
                );
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                if (!hasTriggeredExpiredRef.current) {
                  // Prevent double call
                  hasTriggeredExpiredRef.current = true;
                  onTimeExpired?.();
                }
                return 0;
              }
              return newSeconds;
            });
          }, 1000);
        }
      } else {
        if (!hasTriggeredExpiredRef.current) {
          console.log(
            '[ControlAlert Effect] initialSeconds es 0 y showTimer es true. Disparando onTimeExpired inmediatamente.',
          );
          hasTriggeredExpiredRef.current = true;
          onTimeExpired?.();
          onTimeChange?.(0);
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        console.log('[ControlAlert Effect Cleanup] Clearing interval.');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [initialSeconds, showTimer, onTimeChange, onTimeExpired]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const getAlertStyle = () => {
    if (!isRutaActive) {
      return {
        backgroundColor: '#343a40',
        iconColor: '#adb5bd',
        textColor: '#FFF',
        statusColor: '#FFF',
        icon: 'close-circle-outline',
        status: 'SIN DESPACHO',
      };
    }
    if (!showTimer) {
      // Ya pasó la hora, ir directo o listo para iniciar
      return {
        backgroundColor: 'rgba(34, 197, 94, 0.9)',
        iconColor: '#e9ecef',
        textColor: '#FFF',
        statusColor: '#FFF',
        icon: 'checkmark-circle-outline',
        status: 'LISTO PARA INICIAR',
      };
    }
    if (totalSeconds >= 300) {
      // 5 minutos o más - ROJO
      return {
        backgroundColor: '#d62828',
        iconColor: '#fca5a5',
        textColor: '#FFF',
        statusColor: '#FFF',
        icon: 'time-outline',
        status: 'PREPARACIÓN',
      };
    } else if (totalSeconds >= 60) {
      // 1 minuto a 5 minutos - AMARILLO
      return {
        backgroundColor: 'rgba(245, 158, 11,1)',
        iconColor: '#fcd34d',
        textColor: '#212529',
        statusColor: '#212529',
        icon: 'warning-outline',
        status: 'PRÓXIMAMENTE',
      };
    }
    // Menos de 59 segundos - VERDE con countdown
    else
      return {
        backgroundColor: '#008000',
        iconColor: '#e9ecef',
        textColor: '#FFF',
        statusColor: '#FFF',
        icon: 'timer-outline',
        status: 'EN RUTA',
      };
  };

  const alertStyle = getAlertStyle();

  const getTimeDisplay = () => {
    if (!isRutaActive) {
      return 'SIN DESPACHO';
    }
    if (!showTimer) {
      return '¡INICIADO!';
    }
    if (totalSeconds <= 50 && totalSeconds > 0) {
      return `${totalSeconds}s`;
    } else if (totalSeconds === 0) {
      return '¡INICIADO!';
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const getMainText = () => {
    if (!isRutaActive) {
      return 'Unidad sin despacho';
    }
    if (!showTimer) {
      return 'Control listo para iniciar';
    }
    if (totalSeconds === 0) {
      return 'Control iniciado';
    } else if (totalSeconds <= 50) {
      return 'Iniciando control en';
    } else {
      return 'Tu control empezará en';
    }
  };

  return (
    <View
      style={{
        backgroundColor: alertStyle.backgroundColor,
        paddingVertical: 20,
        paddingHorizontal: 18,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: alertStyle.statusColor,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        minHeight: 75,
        marginLeft: 10,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <IonIcon
            name={alertStyle.icon}
            size={26}
            color={alertStyle.iconColor}
          />
          <View style={{marginLeft: 12, flex: 1}}>
            <Text
              style={{
                color: alertStyle.textColor,
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 4,
              }}>
              {getMainText()}
            </Text>
            <Text
              style={{
                color: alertStyle.statusColor,
                fontSize: 12,
                fontWeight: '500',
                opacity: 0.9,
              }}>
              {alertStyle.status}
            </Text>
          </View>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text
            style={{
              color: alertStyle.textColor,
              fontSize: totalSeconds <= 50 && showTimer ? 20 : 18,
              fontWeight: '700',
              fontFamily: 'monospace',
            }}>
            {getTimeDisplay()}
          </Text>
          {totalSeconds > 0 && totalSeconds <= 50 && showTimer && (
            <Text
              style={{
                color: alertStyle.statusColor,
                fontSize: 10,
                fontWeight: '600',
                marginTop: 2,
              }}>
              CONTADOR
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export const ControlScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [textPlaca, setTextPlaca] = React.useState('');
  const [textUsuario, setTextUsuario] = React.useState('transporvilla');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState('');
  const [deviceIDs, setDeviceIDs] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<string[]>([]);
  const [alertSeconds, setAlertSeconds] = useState(60); 
  const [isScreenActive, setIsScreenActive] = useState(true);

  const [connection, setConnection] = useState<any>(null);
  const [signalRData, setSignalRData] = useState<{
    deviceID: string;
    fechaini: string | null; 
    isruta: string;
  } | null>(null);
  const [timerDuration, setTimerDuration] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [isRutaActive, setIsRutaActive] = useState(false);
  const [signalRDataUpdateCount, setSignalRDataUpdateCount] = useState(0); 
  const [isSignalRDataLoaded, setIsSignalRDataLoaded] = useState(false); 

  const calculateTimeDifference = useCallback(
    (fechaini: string | null): number => {
      // fechaini can be null
      if (
        !fechaini ||
        typeof fechaini !== 'string' ||
        !fechaini.includes(':')
      ) {
        console.log(
          `[calculateTimeDifference] fechaini es nulo o inválido: ${fechaini}. Retornando 0 segundos.`,
        );
        return 0; 
      }

      const now = new Date();
      const [targetHours, targetMinutes] = fechaini.split(':').map(Number);

      const targetDateToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        targetHours,
        targetMinutes,
        0,
        0,
      );

      const diffInMilliseconds = targetDateToday.getTime() - now.getTime();

      console.log(
        `[calculateTimeDifference] Hora actual: ${now.toLocaleTimeString()}`,
      );
      console.log(
        `[calculateTimeDifference] Hora objetivo (fechaini): ${fechaini}`,
      );
      console.log(
        `[calculateTimeDifference] Diferencia en milisegundos (targetDateToday - now): ${diffInMilliseconds}`,
      );


      if (diffInMilliseconds <= 0) {
        console.log(
          `[calculateTimeDifference] La hora objetivo ya pasó o es la actual. Retornando 0 segundos.`,
        );
        return 0;
      }


      const diffInSeconds = Math.ceil(diffInMilliseconds / 1000);

      console.log(
        `[calculateTimeDifference] La hora objetivo está en el futuro. Diferencia calculada (segundos): ${diffInSeconds}`,
      );
      return diffInSeconds;
    },
    [],
  );


  const handleNavigation = useCallback(async () => {
    console.log('[handleNavigation] Intentando navegar...');
    if (textPlaca.trim() === '') {
      setError('Se necesita llenar este campo');
      console.log('[handleNavigation] Error: Placa vacía.');
      return;
    }
 
    setError('');
    setLoading(true);
    try {
      const androidId = await DeviceInfo.getAndroidId();
      console.log('ANDROID_ID:', androidId);
      const placaUrl = `https://villa.velsat.pe:8443/api/Datero/urbano/${textPlaca}`;
      const response = await fetch(placaUrl);
      if (response.status === 204) {
        setLoading(false);
        return;
      }
      if (!response.ok) {
        if (response.status === 404) {
          setDialogMessage(
            'La placa ingresada por el usuario es incorrecta, vuelva a intentarlo.',
          );
        } else {
          setDialogMessage('Error al consultar la API');
        }
        setDialogVisible(true);
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (data?.isruta == '1') {
        const codigo = data.codigo.toString();
        const logUrl = `https://villa.velsat.pe:8443/api/Datero/logurb/${codigo}`;
        const logResponse = await fetch(logUrl);
        let logData: any[] = [];
        if (logResponse.ok) {
          logData = await logResponse.json();
        }
        navigation.navigate('RUTA BUS', {
          codigo: codigo,
          fechaini: data.fechaini,
          fechafin: data.fechafin,
          codruta: data.codruta,
          deviceID: data.deviceID,
          isruta: data.isruta,
          androidID: data.androidID,
          placa: textPlaca,
          logurb: logData,
          fecreg: data.fecreg,
          codconductor: data.codconductor,
        });
        await AsyncStorage.setItem('placa', textPlaca);
        console.log('[handleNavigation] Navegación exitosa a RUTA BUS.');
      } else {
        console.log("[handleNavigation] Aviso: isruta no es '1'.");
      }
    } catch (error) {
      console.error('Error al consultar la API:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  }, [textPlaca, isRutaActive, navigation]); 

  // Inicializar SignalR
  useEffect(() => {
    const initializeSignalR = async () => {
      try {
        const newConnection = new HubConnectionBuilder()
          .withUrl('https://villa.velsat.pe:8443/urbanoHub', {
            transport: HttpTransportType.WebSockets,
            skipNegotiation: true,
          })
          .configureLogging(LogLevel.Information)
          .build();

        newConnection.on('ActualizarDatosUrbano', data => {
          console.log('Datos recibidos de SignalR:', data);
          setSignalRData(data); 
          setIsRutaActive(data.isruta === '1');

          const timeDiffSeconds = calculateTimeDifference(data.fechaini);
          console.log(
            `[SignalR Handler] Diferencia de tiempo calculada (segundos): ${timeDiffSeconds}`,
          );

          setShowTimer(true);
          setTimerDuration(timeDiffSeconds);
          setSignalRDataUpdateCount(prev => prev + 1); 
          setIsSignalRDataLoaded(true); 

          console.log(
            '[SignalR Handler] Cronómetro configurado. La navegación se activará al expirar el cronómetro.',
          );
        });

        // Conectar
        await newConnection.start();
        console.log('✅ Conectado al Hub SignalR');
        setConnection(newConnection);
      } catch (error) {
        console.error('❌ Error conectando a SignalR:', error);
        setIsSignalRDataLoaded(true); // En caso de error, también marcar como cargado para no quedarse en loading
      }
    };
    initializeSignalR();

    // Cleanup mejorado
    return () => {
      console.log('[SignalR Cleanup] Limpiando conexión y estados');
      setIsScreenActive(false); // AGREGAR
      setShowTimer(false); // AGREGAR
      setIsRutaActive(false); // AGREGAR

      if (connection && connection.state === HubConnectionState.Connected) {
        connection.stop();
      }
    };
  }, [calculateTimeDifference]);

  // Unirse al grupo de SignalR cuando cambie la placa
  useEffect(() => {
    if (
      connection &&
      connection.state === HubConnectionState.Connected &&
      textPlaca.trim() !== ''
    ) {
      console.log(`Uniéndose al grupo: ${textPlaca}`);
      connection
        .invoke('UnirGrupo', textPlaca.trim())
        .catch((error: any) =>
          console.error('Error uniéndose al grupo:', error),
        );
    }
  }, [connection, textPlaca]);

  // Limpiar el flag de navegación al iniciar la app (para asegurar que la navegación automática funcione correctamente)
  useEffect(() => {
    const clearNavigationFlag = async () => {
      try {
        await AsyncStorage.removeItem('hasNavigatedBefore');
      } catch (error) {
        console.error('Error clearing navigation state:', error);
      }
    };
    clearNavigationFlag();
  }, []);

  // Detectar cuando la pantalla recibe foco para re-evaluar el cronómetro si es necesario
  useFocusEffect(
    React.useCallback(() => {
      // Cuando la pantalla recibe foco
      setIsScreenActive(true);

      // Solo re-evaluar si showTimer es true y hay datos de SignalR
      if (showTimer && signalRData) {
        console.log(
          '[useFocusEffect] Pantalla enfocada y showTimer es true. Re-evaluando tiempo y actualizando timerDuration.',
        );
        const timeDiffSeconds = calculateTimeDifference(signalRData.fechaini);
        setTimerDuration(timeDiffSeconds);
        setSignalRDataUpdateCount(prev => prev + 1);
      } else {
        console.log(
          '[useFocusEffect] Pantalla enfocada pero showTimer es false o no hay signalRData. No se re-evalúa el tiempo.',
        );
      }

      // Función de cleanup cuando la pantalla pierde el foco
      return () => {
        console.log(
          '[useFocusEffect Cleanup] Pantalla perdiendo foco. Desactivando componente.',
        );
        setIsScreenActive(false);
      };
    }, [showTimer, signalRData, calculateTimeDifference]),
  );

  const hideDialog = () => setDialogVisible(false);
  const [imeiDialogVisible, setImeiDialogVisible] = useState(false);
  const [imeiPlacaInput, setImeiPlacaInput] = useState('');
  const [imeiAndroidId, setImeiAndroidId] = useState('');

  // Función que se llama cuando el cronómetro en ControlAlert llega a cero
  const handleTimeExpired = useCallback(() => {
    console.log(
      '[handleTimeExpired] Cronómetro en ControlAlert ha llegado a cero.',
    );

    // AGREGAR ESTA VERIFICACIÓN
    if (!isScreenActive) {
      console.log(
        '[handleTimeExpired] Pantalla no activa. Cancelando navegación.',
      );
      return;
    }

    if (isRutaActive) {
      console.log(
        '[handleTimeExpired] isRutaActive es true. Llamando a handleNavigation.',
      );
      handleNavigation();
    } else {
      console.log('[handleTimeExpired] isRutaActive es false. No se navega.');
    }
  }, [isRutaActive, handleNavigation, isScreenActive]); 

  const handleAsignarIMEI = async () => {
    try {
      const androidId = await DeviceInfo.getAndroidId();
      setImeiAndroidId(androidId);
      setImeiDialogVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener el ID del dispositivo');
    }
  };

  const enviarAsignacionIMEI = async () => {
    if (!imeiPlacaInput || !imeiAndroidId) {
      Alert.alert('Error', 'Placa o Android ID no válidos.');
      return;
    }

    const payload = {
      placa: imeiPlacaInput.trim(),
      androidID: imeiAndroidId,
    };

    try {
      const response = await fetch(
        'https://villa.velsat.pe:8443/api/Datero/asignar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      const mensaje = data?.mensaje?.toLowerCase() ?? '';
      if (mensaje.includes('ya tiene un id asignado')) {
        Alert.alert('Advertencia', data.mensaje);
      } else if (mensaje.includes('no existe en la tabla')) {
        Alert.alert('Error', data.mensaje);
      } else if (mensaje.includes('id asignado correctamente')) {
        Alert.alert('Éxito', data.mensaje);
        setImeiDialogVisible(false);
        setImeiPlacaInput('');
      } else {
        Alert.alert('Respuesta desconocida', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error en la asignación de IMEI:', error);
      Alert.alert('Error', 'Hubo un problema al enviar los datos.');
    }
  };

  useEffect(() => {
    const loadSavedPlaca = async () => {
      try {
        const savedPlaca = await AsyncStorage.getItem('savedPlaca');
        if (savedPlaca) {
          setTextPlaca(savedPlaca);
        }
      } catch (error) {
        console.error('Error loading saved placa:', error);
      }
    };
    loadSavedPlaca();
    fetchDeviceIDs();
  }, []);

  const fetchDeviceIDs = async () => {
    try {
      const response = await fetch(
        'https://villa.velsat.pe:8443/api/Datero/devices/transporvilla',
      );
      if (!response.ok) {
        throw new Error('Error al obtener los device IDs');
      }
      const data = await response.json();
      const ids = data.map((item: {deviceID: string}) => item.deviceID);
      setDeviceIDs(ids);
    } catch (error) {
      console.error('Error fetching device IDs:', error);
    }
  };

  const handleTextChange = (text: string) => {
    setTextPlaca(text);
    if (text.length > 0) {
      const filtered = deviceIDs.filter(deviceID =>
        deviceID.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  };

  const handleSelect = async (deviceID: string) => {
    setTextPlaca(deviceID);
    setFilteredData([]);
    await AsyncStorage.setItem('savedPlaca', deviceID);
  };


  const canNavigateManually = isRutaActive && !showTimer && !loading;

  const getButtonColor = () => {
    if (loading) return '#00296b'; 
    if (!isRutaActive) return '#6c757d'; 
    if (showTimer) return '#ffc107';
    return '#ffb703';
  };

  const getButtonText = () => {
    if (loading) return 'Cargando...';
    if (!isRutaActive) return 'Sin Despacho';
    if (showTimer) return 'Esperando..'; 
    return 'Mostrar Ruta';
  };

  console.log(
    `[ControlScreen Render] Passing to ControlAlert: timerDuration=${timerDuration}, showTimer=${showTimer}, isRutaActive=${isRutaActive}, key=${signalRDataUpdateCount}, isSignalRDataLoaded=${isSignalRDataLoaded}`,
  );

  return (
    <View style={globalStyles.container}>
      <Portal>
        <Dialog
          visible={imeiDialogVisible}
          onDismiss={() => setImeiDialogVisible(false)}
          style={styles.dialogContainer}>
          <Dialog.Title style={styles.dialogTitle}>Asignar IMEI</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <View style={styles.androidIdContainer}>
              <Text style={styles.androidIdLabel}>Android ID:</Text>
              <Text style={styles.androidIdValue}>{imeiAndroidId}</Text>
            </View>
            <TextInput
              label="Placa"
              value={imeiPlacaInput}
              onChangeText={setImeiPlacaInput}
              mode="outlined"
              style={styles.textInput}
              theme={{
                colors: {
                  primary: '#003566',
                  outline: '#003566',
                },
              }}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => setImeiDialogVisible(false)}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonText}>
              Cancelar
            </Button>
            <Button
              onPress={enviarAsignacionIMEI}
              mode="contained"
              style={styles.confirmButton}
              labelStyle={styles.confirmButtonText}>
              Enviar
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={dialogVisible}
          onDismiss={hideDialog}
          style={styles.dialogContainer}>
          <Dialog.Title style={styles.dialogTitle}>Aviso</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogMessage}>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={hideDialog}
              mode="contained"
              style={styles.confirmButton}>
              Entendido
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={{flexDirection: 'row', flex: 1}}>
        <View
          style={{
            width: '44%',
            justifyContent: 'space-between',
            paddingBottom: 5,
            paddingRight: 10,
            backgroundColor: '#e9ecef',
          }}>
          <View style={{marginTop: 20}}>
            <Text
              style={{
                color: '#00296b',
                fontSize: 18,
                fontWeight: 'bold',
                alignSelf: 'center',
              }}>
              BIENVENIDO A
            </Text>
          </View>
          <Image
            source={require('../files/IMG/velsat.png')}
            style={{
              height: 105,
              width: 105,
              marginTop: 0,
              marginBottom: 0,
              alignSelf: 'center',
              borderRadius: 10,
            }}
          />
          {/* Alerta de Control con datos de SignalR */}
          <View style={{marginVertical: 15}}>
            {isSignalRDataLoaded && isScreenActive ? ( // AGREGAR && isScreenActive
              <ControlAlert
                key={signalRDataUpdateCount}
                initialSeconds={timerDuration}
                onTimeExpired={handleTimeExpired}
                onTimeChange={setAlertSeconds}
                showTimer={showTimer}
                isRutaActive={isRutaActive}
              />
            ) : (
              <View
                style={{
                  height: 75,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="large" color="#00296b" />
                <Text style={{color: '#00296b', marginTop: 10}}>
                  {!isSignalRDataLoaded
                    ? 'Cargando datos de despacho...'
                    : 'Pantalla inactiva'}
                </Text>
              </View>
            )}
          </View>
          <View style={globalStyles.containerControlText}>
            <Text style={{color: '#00296b', fontSize: 12}}>Lima - Perú</Text>
            <Text style={{color: '#00296b', fontSize: 12}}>© 2025 VELSAT SAC</Text>
          </View>
          <View style={{padding: 5}}>
            <Button
              buttonColor="#FB7B0F"
              mode="contained"
              onPress={handleAsignarIMEI}
              style={{
                borderRadius: 0,
                padding: 2,
                marginLeft: 10,
                marginRight: 10,
              }}>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginRight: 10, color: '#FFF', fontWeight: 'bold'}}>
                  Asignar IMEI
                </Text>
                <IonIcon name="barcode" size={20} color="#fff" />
              </View>
            </Button>
          </View>
        </View>
        <View
          style={{
            width: 0.5,
            height: '100%',
            backgroundColor: '#00509d',
          }}
        />
        <View
          style={{
            width: '56%',
            justifyContent: 'space-between',
            padding: 10,
            paddingLeft: 15,
            paddingRight: 10,
            backgroundColor: '#fff',
          }}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                gap: 12,
                paddingTop: 10,
                paddingBottom: 10,
                justifyContent: 'center',
                marginBottom: 8,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  color: '#00296b',
                  fontWeight: '800',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                DATOS GENERALES
              </Text>
              <IonIcon
                size={22}
                name="bus"
                color="#00296b"
                style={{
                  borderRadius: 20,
                  padding: 8,
                }}
              />
            </View>
            <View style={globalStyles.control}>
              <Text
                style={{
                  color: '#00296b',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                PLACA VEHICULAR:
              </Text>
              <TextInput
                value={textPlaca}
                onChangeText={handleTextChange}
                mode="outlined"
                outlineColor="#0d47a1"
                activeOutlineColor="#0d47a1"
                style={{backgroundColor: '#f8f9fa', height: 40}}
                textColor="#212529"
              />
              {error ? (
                <Text style={{color: 'red', marginTop: 0}}>{error}</Text>
              ) : null}
              {filteredData.length > 0 && (
                <FlatList
                  data={filteredData}
                  keyExtractor={item => item}
                  renderItem={({item}) => (
                    <TouchableOpacity onPress={() => handleSelect(item)}>
                      <Text style={styles.suggestion}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsContainer}
                />
              )}
              <Text
                style={{
                  color: '#00296b',
                  fontSize: 14,
                  fontWeight: 'bold',
                  marginTop: 10,
                }}>
                USUARIO:
              </Text>
              <TextInput
                value={textUsuario}
                onChangeText={setTextUsuario}
                mode="outlined"
                editable={false}
                outlineColor="#0d47a1"
                activeOutlineColor="#0d47a1"
                style={{backgroundColor: '#dee2e6', height: 40}}
                textColor="#212529"
              />
            </View>
          </View>
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
            <Button
              mode="contained"
              buttonColor={getButtonColor()} // Usa la función para el color
              textColor="#212529"
              onPress={canNavigateManually ? handleNavigation : undefined} // Habilita/deshabilita el onPress
              disabled={!canNavigateManually} // Habilita/deshabilita el botón
              style={{
                borderRadius: 0,
                paddingVertical: 2,
                paddingHorizontal: 12,
                width: 200,
                justifyContent: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {loading && (
                  <ActivityIndicator color="#212529" style={{marginRight: 5}} />
                )}
                <Text style={{color: '#00296b', fontWeight: 'bold', fontSize: 16}}>
                  {getButtonText()} {/* Usa la función para el texto */}
                </Text>
                {!loading &&
                  isRutaActive &&
                  !showTimer && ( // Muestra el icono solo cuando está listo para navegar
                    <IonIcon
                      name="map"
                      color="#212529"
                      size={20}
                      style={{marginLeft: 5}}
                    />
                  )}
              </View>
            </Button>
            <View style={{marginLeft: 10}}>
              <RestartButton />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#0d47a1',
    padding: 10,
    borderRadius: 5,
  },
  suggestionsContainer: {
    backgroundColor: '#f0f0f0',
    marginTop: 5,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#0d3b66',
    backgroundColor: '#ced4da',
  },
  dialogContainer: {
    alignSelf: 'center',
    width: '70%',
    borderRadius: 0,
    backgroundColor: '#ffffff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  dialogTitle: {
    color: '#003566',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 4,
  },
  dialogContent: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  androidIdContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 0,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#003566',
  },
  androidIdLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 0,
  },
  androidIdValue: {
    fontSize: 16,
    color: '#003566',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  textInput: {
    backgroundColor: '#ffffff',
    marginTop: 0,
  },
  dialogActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    backgroundColor: '#c1121f',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#003566',
    borderRadius: 8,
    elevation: 2,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dialogMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
