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
  HubConnection,
} from '@microsoft/signalr';
import moment from 'moment-timezone';

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
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                if (!hasTriggeredExpiredRef.current) {
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
          hasTriggeredExpiredRef.current = true;
          onTimeExpired?.();
          onTimeChange?.(0);
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [initialSeconds, showTimer, onTimeChange, onTimeExpired]);

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
      return {
        backgroundColor: '#008000',
        iconColor: '#e9ecef',
        textColor: '#FFF',
        statusColor: '#FFF',
        icon: 'checkmark-circle-outline',
        status: 'LISTO PARA INICIAR',
      };
    }
    if (totalSeconds >= 300) {
      return {
        backgroundColor: '#bf0603',
        iconColor: '#fca5a5',
        textColor: '#FFF',
        statusColor: '#FFF',
        icon: 'time-outline',
        status: 'PREPARACIÓN',
      };
    } else if (totalSeconds >= 60) {
      return {
        backgroundColor: '#e85d04',
        iconColor: '#FFF',
        textColor: '#FFF',
        statusColor: '#FFF',
        icon: 'warning-outline',
        status: 'PRÓXIMAMENTE',
      };
    } else {
      return {
        backgroundColor: '#008000',
        iconColor: '#e9ecef',
        textColor: '#FFF',
        statusColor: '#FFF',
        icon: 'timer-outline',
        status: 'EN RUTA',
      };
    }
  };

  const alertStyle = getAlertStyle();

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const getTimeDisplay = () => {
    if (!isRutaActive) {
      return 'SIN DESPACHO';
    }
    if (!showTimer || totalSeconds === 0) {
      return '¡INICIADO!';
    }
    if (totalSeconds <= 50) {
      return `${totalSeconds}s`;
    }
    if (totalSeconds >= 3600) {
      return `${hours}h ${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')} min`;
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
                fontWeight: 'bold',
                opacity: 0.95,
              }}>
              {alertStyle.status}
            </Text>
          </View>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text
            style={{
              color: alertStyle.textColor,
              fontSize: totalSeconds <= 50 && showTimer ? 20 : (totalSeconds >= 3600 ? 15 : 18),
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
  const [textPlaca, setTextPlaca] = useState('');
  const [textUsuario, setTextUsuario] = useState('transporvilla');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [deviceIDs, setDeviceIDs] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<string[]>([]);
  const [, setAlertSeconds] = useState(60);
  const [isScreenActive, setIsScreenActive] = useState(true);

  const connectionRef = useRef<HubConnection | null>(null);
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

  const [imeiDialogVisible, setImeiDialogVisible] = useState(false);
  const [imeiPlacaInput, setImeiPlacaInput] = useState('');
  const [imeiAndroidId, setImeiAndroidId] = useState('');

  const calculateTimeDifference = useCallback(
    (fechaini: string | null): number => {
      if (!fechaini || typeof fechaini !== 'string' || !fechaini.includes(':')) {
        return 0;
      }

      let timeStr = fechaini.trim();
      if (timeStr.includes('T')) {
        timeStr = timeStr.split('T')[1];
      } else if (timeStr.includes(' ')) {
        const spaceParts = timeStr.split(' ');
        for (const part of spaceParts) {
          if (part.includes(':')) {
            timeStr = part;
            break;
          }
        }
      }

      const parts = timeStr.split(':').map(val => parseInt(val, 10));
      const targetHours = parts[0];
      const targetMinutes = parts[1];
      const targetSeconds = parts[2] && !isNaN(parts[2]) ? parts[2] : 0;

      if (isNaN(targetHours) || isNaN(targetMinutes)) {
        return 0;
      }

      const nowPeru = moment().tz('America/Lima');
      const currentHours = nowPeru.hours();
      const currentMinutes = nowPeru.minutes();
      const currentSeconds = nowPeru.seconds();

      const targetTotalSeconds = targetHours * 3600 + targetMinutes * 60 + targetSeconds;
      const currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

      const diffInSeconds = targetTotalSeconds - currentTotalSeconds;
      if (diffInSeconds <= 0) {
        return 0;
      }

      return diffInSeconds;
    },
    [],
  );

  const handleNavigation = useCallback(
    async (placaParam?: string | unknown) => {
      const targetPlaca = typeof placaParam === 'string' ? placaParam : textPlaca;
      const cleanPlaca = targetPlaca.trim();
      if (cleanPlaca === '') {
        setError('Se necesita llenar este campo');
        return;
      }

      setError('');
      setLoading(true);
      try {
        const placaUrl = `https://villa.velsat.pe:8443/api/Datero/urbano/${cleanPlaca}`;
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
        if (data?.isruta === '1') {
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
            placa: cleanPlaca,
            logurb: logData,
            fecreg: data.fecreg,
            codconductor: data.codconductor,
          });
          await AsyncStorage.setItem('placa', cleanPlaca);
        }
      } catch (err) {
        console.error('Error al consultar la API:', err);
        Alert.alert('Error', 'Ocurrió un error al procesar la solicitud');
      } finally {
        setLoading(false);
      }
    },
    [textPlaca, navigation],
  );

  const checkPlacaStatus = useCallback(
    async (placaToCheck: string) => {
      const cleanPlaca = placaToCheck.trim();
      if (!cleanPlaca) {
        setIsSignalRDataLoaded(true);
        setIsRutaActive(false);
        return;
      }

      try {
        const placaUrl = `https://villa.velsat.pe:8443/api/Datero/urbano/${cleanPlaca}`;
        const response = await fetch(placaUrl);

        if (response.ok && response.status !== 204) {
          const data = await response.json();
          const hasRoute = data?.isruta === '1';
          setIsRutaActive(hasRoute);
          setSignalRData({
            deviceID: cleanPlaca,
            fechaini: data?.fechaini ?? null,
            isruta: data?.isruta ?? '0',
          });

          if (hasRoute) {
            const timeDiff = calculateTimeDifference(data?.fechaini);
            setTimerDuration(timeDiff);
            setShowTimer(timeDiff > 0);
            if (timeDiff <= 0) {
              handleNavigation(cleanPlaca);
            }
          } else {
            setShowTimer(false);
            setTimerDuration(0);
          }
        } else {
          setIsRutaActive(false);
          setSignalRData(null);
          setShowTimer(false);
          setTimerDuration(0);
        }
      } catch (err) {
        console.error('[checkPlacaStatus] Error verificando estado de placa:', err);
        setIsRutaActive(false);
      } finally {
        setIsSignalRDataLoaded(true);
      }
    },
    [calculateTimeDifference, handleNavigation],
  );

  // Conexión SignalR
  useEffect(() => {
    let isMounted = true;

    const initializeSignalR = async () => {
      try {
        const newConnection = new HubConnectionBuilder()
          .withUrl('https://villa.velsat.pe:8443/urbanoHub', {
            transport: HttpTransportType.WebSockets,
            skipNegotiation: true,
          })
          .configureLogging(LogLevel.Warning)
          .build();

        newConnection.on('ActualizarDatosUrbano', data => {
          if (!isMounted) return;
          setSignalRData(data);
          setIsRutaActive(data.isruta === '1');
          setIsSignalRDataLoaded(true);

          if (data.isruta === '1') {
            const timeDiffSeconds = calculateTimeDifference(data.fechaini);
            setTimerDuration(timeDiffSeconds);
            setShowTimer(timeDiffSeconds > 0);
            if (timeDiffSeconds <= 0) {
              handleNavigation(data.deviceID || textPlaca);
            }
            setSignalRDataUpdateCount(prev => prev + 1);
          } else {
            setShowTimer(false);
            setTimerDuration(0);
          }
        });

        await newConnection.start();
        connectionRef.current = newConnection;

        if (textPlaca.trim() !== '') {
          newConnection
            .invoke('UnirGrupo', textPlaca.trim())
            .catch((err: any) => console.error('Error uniéndose al grupo:', err));
        }
      } catch (err) {
        console.error('Error conectando a SignalR:', err);
        if (isMounted) {
          setIsSignalRDataLoaded(true);
        }
      }
    };

    initializeSignalR();

    return () => {
      isMounted = false;
      setIsScreenActive(false);
      setShowTimer(false);
      setIsRutaActive(false);

      if (connectionRef.current) {
        if (connectionRef.current.state === HubConnectionState.Connected) {
          connectionRef.current.stop();
        }
        connectionRef.current = null;
      }
    };
  }, [calculateTimeDifference]);

  // Unirse a grupo de SignalR al cambiar la placa
  useEffect(() => {
    const cleanPlaca = textPlaca.trim();
    setIsRutaActive(false);
    setShowTimer(false);
    setTimerDuration(0);
    setSignalRData(null);

    if (cleanPlaca !== '') {
      checkPlacaStatus(cleanPlaca);
    } else {
      setIsSignalRDataLoaded(true);
    }

    if (
      connectionRef.current &&
      connectionRef.current.state === HubConnectionState.Connected &&
      cleanPlaca !== ''
    ) {
      connectionRef.current
        .invoke('UnirGrupo', cleanPlaca)
        .catch((err: any) => console.error('Error uniéndose al grupo:', err));
    }
  }, [textPlaca, checkPlacaStatus]);

  // Limpiar flag de navegación al iniciar
  useEffect(() => {
    const clearNavigationFlag = async () => {
      try {
        await AsyncStorage.removeItem('hasNavigatedBefore');
      } catch (err) {
        console.error('Error clearing navigation state:', err);
      }
    };
    clearNavigationFlag();
  }, []);

  // Foco de pantalla
  useFocusEffect(
    useCallback(() => {
      setIsScreenActive(true);

      const cleanPlaca = textPlaca.trim();
      if (cleanPlaca !== '') {
        checkPlacaStatus(cleanPlaca);
      }

      return () => {
        setIsScreenActive(false);
      };
    }, [textPlaca, checkPlacaStatus]),
  );

  const fetchDeviceIDs = useCallback(async () => {
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
    } catch (err) {
      console.error('Error fetching device IDs:', err);
    }
  }, []);

  // Cargar placa guardada e IDs al montar
  useEffect(() => {
    let isMounted = true;
    const loadSavedPlaca = async () => {
      try {
        const savedPlaca = await AsyncStorage.getItem('savedPlaca');
        if (savedPlaca && isMounted) {
          setTextPlaca(savedPlaca);
        }
      } catch (err) {
        console.error('Error loading saved placa:', err);
      }
    };
    loadSavedPlaca();
    fetchDeviceIDs();

    return () => {
      isMounted = false;
    };
  }, [fetchDeviceIDs]);

  const hideDialog = () => setDialogVisible(false);

  const handleTimeExpired = useCallback(() => {
    if (!isScreenActive) return;
    if (isRutaActive) {
      handleNavigation();
    }
  }, [isRutaActive, handleNavigation, isScreenActive]);

  const handleAsignarIMEI = async () => {
    try {
      const androidId = await DeviceInfo.getAndroidId();
      setImeiAndroidId(androidId);
      setImeiDialogVisible(true);
    } catch (err) {
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
    } catch (err) {
      console.error('Error en la asignación de IMEI:', err);
      Alert.alert('Error', 'Hubo un problema al enviar los datos.');
    }
  };

  const handleTextChange = (text: string) => {
    setTextPlaca(text);
    setIsRutaActive(false);
    setShowTimer(false);
    setTimerDuration(0);
    setSignalRData(null);
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
            {isSignalRDataLoaded && isScreenActive ? (
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
            <Text style={{color: '#00296b', fontSize: 12}}>© 2026 VELSAT SAC</Text>
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

        {/* Columna Derecha */}
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
              buttonColor={getButtonColor()}
              textColor="#212529"
              onPress={canNavigateManually ? () => handleNavigation() : undefined}
              disabled={!canNavigateManually}
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
                  {getButtonText()}
                </Text>
                {!loading && isRutaActive && !showTimer && (
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
