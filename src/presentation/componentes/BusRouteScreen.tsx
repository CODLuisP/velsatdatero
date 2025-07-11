'use client';
import type React from 'react';
import {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  Alert,
  TouchableOpacity,
  Button,
} from 'react-native';
import BusStopItem from './BusStopItem';
import type {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import RNRestart from 'react-native-restart';
import {useAppContext} from '../../context/VelocidadContext';
import moment from 'moment-timezone';
import NetInfo from '@react-native-community/netinfo';
import type {BusStop} from './busStop';
import {generateArrivalTimes, getBusStopsData} from './bus-route-helpers';
import {Notifier, Easing} from 'react-native-notifier';

type CustomNotificationProps = {
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
};

const CustomNotification = ({
  title,
  description,
  type = 'info',
}: CustomNotificationProps) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50'; // Verde para éxito
      case 'error':
        return '#dc3545'; // Rojo para error
      case 'info':
      default:
        return '#00509d'; // Azul para información general, coincidiendo con el tema
    }
  };

  const notificationStyles = StyleSheet.create({
    container: {
      backgroundColor: getBackgroundColor(), // Fondo dinámico
      padding: 10,
      alignSelf: 'center',
      width: '91%',
      alignItems: 'center',
      shadowColor: '#000', // Sombra para profundidad
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
      color: '#fff', // Texto blanco para mejor contraste
    },
    description: {
      textAlign: 'center',
      color: '#fff', // Texto blanco
    },
  });
  return (
    <View style={notificationStyles.container}>
      {title && <Text style={notificationStyles.title}>{title}</Text>}
      {description && <Text style={notificationStyles.description}>{description}</Text>}
    </View>
  );
};

export const mostrarNotificacion = (
  titulo: string = 'Test',
  descripcion: string = 'Mensaje de prueba',
  type: 'success' | 'error' | 'info' = 'info',
  onHidden?: () => void,
) => {
  Notifier.showNotification({
    Component: props => <CustomNotification {...props} type={type} />,
    title: titulo,
    description: descripcion,
    duration: 3000, // La notificación se mostrará por 5 segundos
    onHidden: onHidden,
  });
};

interface ControlData {
  codasig: string;
  deviceid: string;
  nom_control: string;
  hora_estimada: string;
  hora_llegada: string;
  volado: string;
  fecha: string;
}

interface BusRouteScreenProps {
  currentLatitude: number;
  currentLongitude: number;
  radioGeocerca?: number;
  codruta: string;
  codasig: string;
  logurb: ControlData[];
  fechaini: string;
  androidID: string;
  deviceID: string;
  fecreg: string;
  codconductor: string;
}

// Nueva interfaz para datos en cola
interface QueuedData {
  id: string;
  timestamp: number;
  busStop: BusStop;
  apiParams: {
    codasig: string;
    androidID: string;
    androidIdLocal: string;
    deviceID: string;
    fechaini: string;
    codconductor: string;
    fecreg: string;
    codruta: string;
  };
  retryCount: number;
  maxRetries: number;
}

type DrawerParamList = {
  Control: undefined;
  RutaBus: {};
  Mapa: {};
};

// Clase para manejar la cola offline
class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueuedData[] = [];
  private isProcessing = false;
  private maxRetries = 5;
  private retryInterval = 30000; // 30 segundos
  private processingTimer: NodeJS.Timeout | null = null;

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  // Agregar datos a la cola
  addToQueue(busStop: BusStop, apiParams: any): void {
    const queuedItem: QueuedData = {
      id: `${apiParams.deviceID}_${busStop.name}_${Date.now()}`,
      timestamp: Date.now(),
      busStop: {...busStop},
      apiParams: {...apiParams},
      retryCount: 0,
      maxRetries: this.maxRetries,
    };
    this.queue.push(queuedItem);
    console.log(`📥 Dato agregado a la cola offline: ${busStop.name}`, {
      queueSize: this.queue.length,
      itemId: queuedItem.id,
    });
    // Intentar procesar inmediatamente
    this.processQueue();
  }

  // Procesar la cola
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    // Verificar conectividad
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('🌐 Sin conexión a internet, esperando...');
      this.scheduleNextProcessing();
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 Procesando cola offline (${this.queue.length} elementos)`);

    const itemsToProcess = [...this.queue];
    for (let i = itemsToProcess.length - 1; i >= 0; i--) {
      const item = itemsToProcess[i];
      try {
        const result = await this.sendToAPI(item);
        if (result.success) {
          // Éxito: remover de la cola
          this.removeFromQueue(item.id);
          console.log(
            `✅ Dato enviado exitosamente desde cola: ${item.busStop.name}`,
          );
        } else {
          // Error: incrementar contador de reintentos
          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
            // Máximo de reintentos alcanzado
            console.log(
              `❌ Máximo de reintentos alcanzado para: ${item.busStop.name}`,
            );
            this.removeFromQueue(item.id);
            // Opcional: notificar al usuario sobre el fallo permanente
            Alert.alert(
              'Error de Sincronización',
              `No se pudo sincronizar el registro de ${item.busStop.name} después de ${item.maxRetries} intentos.`,
              [{text: 'OK'}],
            );
          } else {
            console.log(
              `🔄 Reintento ${item.retryCount}/${item.maxRetries} para: ${item.busStop.name}`,
            );
          }
        }
      } catch (error) {
        console.error(
          `💥 Error procesando elemento de cola: ${item.busStop.name}`,
          error,
        );
        item.retryCount++;
        if (item.retryCount >= item.maxRetries) {
          this.removeFromQueue(item.id);
        }
      }
    }

    this.isProcessing = false;
    if (this.queue.length > 0) {
      this.scheduleNextProcessing();
    }
  }

  private async sendToAPI(
    item: QueuedData,
  ): Promise<{success: boolean; error?: any}> {
    const {busStop, apiParams} = item;
    try {
      if (apiParams.androidID !== apiParams.androidIdLocal) {
        return {
          success: false,
          error: 'Dispositivo no autorizado',
        };
      }

      const now = new Date();
      const peruOffset = -5 * 60;
      const localOffset = now.getTimezoneOffset();
      const peruTime = new Date(
        now.getTime() + (localOffset + peruOffset) * 60 * 1000,
      );

      const year = peruTime.getFullYear();
      const month = String(peruTime.getMonth() + 1).padStart(2, '0');
      const day = String(peruTime.getDate()).padStart(2, '0');
      const hours = String(peruTime.getHours()).padStart(2, '0');
      const minutes = String(peruTime.getMinutes()).padStart(2, '0');
      const seconds = String(peruTime.getSeconds()).padStart(2, '0');
      const milliseconds = String(peruTime.getMilliseconds()).padStart(3, '0');
      const fechaActual = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;

      const datos = {
        codasig: apiParams.codasig,
        deviceid: apiParams.deviceID,
        codconductor: apiParams.codconductor,
        codruta: apiParams.codruta,
        nom_control: busStop.name,
        hora_registro: apiParams.fecreg,
        hora_inicio: apiParams.fechaini,
        hora_estimada: busStop.arrivalTime,
        hora_llegada: busStop.actualTime || busStop.estimatedTime,
        volado: busStop.duration,
        fecha: fechaActual,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        'https://villa.velsat.pe:8443/api/Datero/enviocontrol',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datos),
          signal: controller.signal,
        },
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        return {success: true};
      } else {
        console.error(
          `Error en API para ${busStop.name}:`,
          response.status,
          response.statusText,
        );
        return {success: false, error: `HTTP ${response.status}`};
      }
    } catch (error) {
      console.error(`Error de red para ${busStop.name}:`, error);
      return {success: false, error: error};
    }
  }

  // Remover elemento de la cola
  private removeFromQueue(itemId: string): void {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(item => item.id !== itemId);
    if (this.queue.length < initialLength) {
      console.log(`🗑️ Elemento removido de la cola: ${itemId}`);
    }
  }

  // Programar siguiente procesamiento
  private scheduleNextProcessing(): void {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
    }
    this.processingTimer = setTimeout(() => {
      this.processQueue();
    }, this.retryInterval);
  }

  // Obtener estadísticas de la cola
  getQueueStats(): {total: number; pending: number; failed: number} {
    const pending = this.queue.filter(
      item => item.retryCount < item.maxRetries,
    ).length;
    const failed = this.queue.filter(
      item => item.retryCount >= item.maxRetries,
    ).length;
    return {
      total: this.queue.length,
      pending,
      failed,
    };
  }

  // Limpiar cola (para testing o reset)
  clearQueue(): void {
    this.queue = [];
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }
    console.log('🧹 Cola offline limpiada');
  }
}

const formatTime24Hours = (date = new Date()) => {
  return moment(date).tz('America/Lima').format('HH:mm:ss');
};

// Función modificada para usar la cola offline
const enviarDatosAPI = async (
  busStop: BusStop,
  codasig: string,
  androidID: string,
  androidIdLocal: string,
  deviceID: string,
  fechaini: string,
  codconductor: string,
  fecreg: string,
  codruta: string,
) => {
  try {
    if (androidID !== androidIdLocal) {
      return {
        success: false,
        error: 'Dispositivo no autorizado',
        isUnauthorized: true,
      };
    }

    const now = new Date();
    const peruOffset = -5 * 60;
    const localOffset = now.getTimezoneOffset();
    const peruTime = new Date(
      now.getTime() + (localOffset + peruOffset) * 60 * 1000,
    );

    const year = peruTime.getFullYear();
    const month = String(peruTime.getMonth() + 1).padStart(2, '0');
    const day = String(peruTime.getDate()).padStart(2, '0');
    const hours = String(peruTime.getHours()).padStart(2, '0');
    const minutes = String(peruTime.getMinutes()).padStart(2, '0');
    const seconds = String(peruTime.getSeconds()).padStart(2, '0');
    const milliseconds = String(peruTime.getMilliseconds()).padStart(3, '0');
    const fechaActual = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;

    const datos = {
      codasig: codasig,
      deviceid: deviceID,
      codconductor: codconductor,
      codruta: codruta,
      nom_control: busStop.name,
      hora_registro: fecreg,
      hora_inicio: fechaini,
      hora_estimada: busStop.arrivalTime,
      hora_llegada: busStop.actualTime || busStop.estimatedTime,
      volado: busStop.duration,
      fecha: fechaActual,
    };

    // Verificar conectividad antes de intentar
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log(`🌐 Sin conexión, agregando a cola offline: ${busStop.name}`);
      // Agregar a cola offline
      const offlineQueue = OfflineQueue.getInstance();
      offlineQueue.addToQueue(busStop, {
        codasig,
        androidID,
        androidIdLocal,
        deviceID,
        fechaini,
        codconductor,
        fecreg,
        codruta,
      });
      return {
        success: true, // Consideramos éxito porque se guardó en cola
        queued: true,
        message: 'Guardado en cola offline',
      };
    }

    // Implementar timeout manual con AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

    const response = await fetch(
      'https://villa.velsat.pe:8443/api/Datero/enviocontrol',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      console.log(
        `✅ Datos enviados exitosamente en tiempo real: ${busStop.name}`,
      );
      return {success: true, data: result};
    } else {
      console.error(
        `❌ Error HTTP para ${busStop.name}:`,
        response.status,
        response.statusText,
      );
      // Agregar a cola offline por error HTTP
      const offlineQueue = OfflineQueue.getInstance();
      offlineQueue.addToQueue(busStop, {
        codasig,
        androidID,
        androidIdLocal,
        deviceID,
        fechaini,
        codconductor,
        fecreg,
        codruta,
      });
      return {
        success: true, // Consideramos éxito porque se guardó en cola
        queued: true,
        message: `Error HTTP ${response.status}, guardado en cola offline`,
      };
    }
  } catch (error) {
    console.error(`💥 Error de red para ${busStop.name}:`, error);
    // Agregar a cola offline por error de red
    const offlineQueue = OfflineQueue.getInstance();
    offlineQueue.addToQueue(busStop, {
      codasig,
      androidID,
      androidIdLocal,
      deviceID,
      fechaini,
      codconductor,
      fecreg,
      codruta,
    });
    return {
      success: true, // Consideramos éxito porque se guardó en cola
      queued: true,
      message: 'Error de red, guardado en cola offline',
    };
  }
};


const calculateDuration = (
  arrivalTime: string,
  isCompleted = false,
  actualTime?: string,
  isSkipped = false,
  isIntermediate = false,
  intermediateStartTime?: Date,
) => {
  if (isIntermediate && intermediateStartTime) {
    const now = new Date();
    const elapsedSeconds = Math.floor(
      (now.getTime() - intermediateStartTime.getTime()) / 1000,
    );
    if (isCompleted) {
      return `Completado`;
    } else if (isSkipped) {
      return 'Tiempo agotado, no pasó';
    } else {
      return ``;
    }
  }
  if (isIntermediate) {
    return '';
  }

  const now = new Date();
  const [hours, mins] = arrivalTime.split(':').map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, mins, 0, 0);

  if (scheduledTime < now && now.getHours() - scheduledTime.getHours() > 12) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  let diffInSeconds;
  if (isSkipped) {
    return 'No pasó por el paradero';
  }

  if (isCompleted && actualTime) {
    const [actualHours, actualMins, actualSecs = 0] = actualTime
      .split(':')
      .map(Number);
    const actualDateTime = new Date();
    actualDateTime.setHours(actualHours, actualMins, actualSecs, 0);

    if (
      actualDateTime < scheduledTime &&
      scheduledTime.getHours() - actualDateTime.getHours() > 12
    ) {
      actualDateTime.setDate(actualDateTime.getDate() + 1);
    }
    diffInSeconds = Math.floor(
      (actualDateTime.getTime() - scheduledTime.getTime()) / 1000,
    );
  } else {
    diffInSeconds = Math.floor(
      (now.getTime() - scheduledTime.getTime()) / 1000,
    );
  }

  if (diffInSeconds < 0) {
    if (isCompleted) {
      const minutes = Math.floor(Math.abs(diffInSeconds) / 60);
      const seconds = Math.abs(diffInSeconds) % 60;
      
      // CAMBIO AQUÍ: Incluir segundos cuando está completado
      if (minutes > 0 && seconds > 0) {
        return `-${minutes}min ${seconds}seg`;
      } else if (minutes > 0) {
        return `-${minutes}min`;
      } else if (seconds > 0) {
        return `-${seconds}seg`;
      } else {
        return '0seg';
      }
    } else {
      return '';
    }
  }

  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;

  if (isCompleted) {
    // CAMBIO AQUÍ: Incluir segundos cuando está completado
    if (minutes > 0 && seconds > 0) {
      return `+${minutes}min ${seconds}seg`;
    } else if (minutes > 0) {
      return `+${minutes}min`;
    } else if (seconds > 0) {
      return `+${seconds}seg`;
    } else {
      return '0seg';
    }
  } else {
    if (minutes > 0) {
      return `+${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `+0:${seconds.toString().padStart(2, '0')}`;
    }
  }
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const BusRouteScreen: React.FC<BusRouteScreenProps> = ({
  currentLatitude,
  currentLongitude,
  radioGeocerca = 35,
  codruta,
  codasig,
  logurb,
  fechaini,
  androidID,
  deviceID,
  codconductor,
  fecreg,
}) => {
  const arrivalTimes = generateArrivalTimes(fechaini, codruta);
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [androidIdLocal, setAndroidIdLocal] = useState<string>('');
  const [queueStats, setQueueStats] = useState({
    total: 0,
    pending: 0,
    failed: 0,
  });
  const {setModoVisualizacion} = useAppContext();

  // State to prevent multiple termination attempts
  const [isTerminating, setIsTerminating] = useState(false);
  // State to prevent repeated unauthorized alerts for auto-termination
  const [
    hasUnauthorizedAutoTerminateAlertBeenShown,
    setHasUnauthorizedAutoTerminateAlertBeenShown,
  ] = useState(false);

  useEffect(() => {
    const getAndroidId = async () => {
      try {
        const id = await DeviceInfo.getAndroidId();
        setAndroidIdLocal(id);
      } catch (error) {
        setAndroidIdLocal('Error al obtener ID');
      }
    };
    getAndroidId();
  }, []);

  useEffect(() => {
    if (androidIdLocal && androidID) {
      if (androidID === androidIdLocal) {
        setModoVisualizacion('');
      } else {
        setModoVisualizacion('Modo Visualización');
      }
    }
  }, [androidIdLocal, androidID, setModoVisualizacion]);

  // Efecto para monitorear la cola offline
  useEffect(() => {
    const interval = setInterval(() => {
      const offlineQueue = OfflineQueue.getInstance();
      const stats = offlineQueue.getQueueStats();
      setQueueStats(stats);
      // Intentar procesar la cola cada minuto
      offlineQueue.processQueue();
    }, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, []);

  // Efecto para procesar cola cuando se recupera la conexión
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('🌐 Conexión restaurada, procesando cola offline...');
        const offlineQueue = OfflineQueue.getInstance();
        offlineQueue.processQueue();
      }
    });
    return () => unsubscribe();
  }, []);

  const integrateLogurbData = (initialStops: BusStop[]): BusStop[] => {
    if (!logurb || logurb.length === 0) {
      return initialStops;
    }

    const updatedStops = [...initialStops];
    logurb.forEach((logItem, logIndex) => {
      const stopIndex = updatedStops.findIndex(
        stop => stop.name === logItem.nom_control,
      );

      if (stopIndex !== -1) {
        const stop = updatedStops[stopIndex];
        updatedStops[stopIndex] = {
          ...stop,
          arrivalTime: stop.isIntermediate ? '' : logItem.hora_estimada,
          estimatedTime: logItem.hora_llegada,
          duration: stop.isIntermediate ? '' : logItem.volado,
          isActive: false,
          isCompleted: logItem.volado !== 'No pasó por el paradero',
          isSkipped: logItem.volado === 'No pasó por el paradero',
          actualTime:
            logItem.volado !== 'No pasó por el paradero'
              ? logItem.hora_llegada
              : undefined,
        };
        console.log(`📊 Parada actualizada: ${logItem.nom_control}`, {
          isCompleted: updatedStops[stopIndex].isCompleted,
          isSkipped: updatedStops[stopIndex].isSkipped,
          duration: updatedStops[stopIndex].duration,
          isIntermediate: updatedStops[stopIndex].isIntermediate,
        });
      } else {
        console.warn(
          `No se encontró parada con nombre: ${logItem.nom_control}`,
        );
      }
    });

    let maxLogurbIndex = -1;
    logurb.forEach(logItem => {
      const stopIndex = updatedStops.findIndex(
        stop => stop.name === logItem.nom_control,
      );
      if (stopIndex !== -1 && stopIndex > maxLogurbIndex) {
        maxLogurbIndex = stopIndex;
      }
    });

    let nextActiveIndex = -1;
    if (maxLogurbIndex !== -1) {
      nextActiveIndex = updatedStops.findIndex(
        (stop, index) =>
          index > maxLogurbIndex && !stop.isCompleted && !stop.isSkipped,
      );
    }

    if (nextActiveIndex === -1) {
      nextActiveIndex = updatedStops.findIndex(
        stop => !stop.isCompleted && !stop.isSkipped,
      );
    }

    if (nextActiveIndex !== -1) {
      updatedStops.forEach((stop, index) => {
        updatedStops[index] = {
          ...stop,
          isActive: index === nextActiveIndex,
          intermediateStartTime:
            index === nextActiveIndex && stop.isIntermediate
              ? new Date()
              : stop.intermediateStartTime,
        };
      });
    } else {
      console.log('No hay paradas disponibles para activar');
    }

    console.log('✨ Integración de logurb completada');
    return updatedStops;
  };

  const [busStops, setBusStops] = useState<BusStop[]>(() => {
    const initialStops = getBusStopsData(codruta, arrivalTimes);
    return integrateLogurbData(initialStops);
  });

  // New function for automatic route termination
  const autoTerminateRoute = useCallback(async () => {
    if (isTerminating) {
      console.log('Already terminating, skipping autoTerminateRoute call.');
      return;
    }
    setIsTerminating(true); // Set terminating flag immediately

    if (androidID !== androidIdLocal) {
      if (!hasUnauthorizedAutoTerminateAlertBeenShown) {
        Alert.alert(
          'Dispositivo no autorizado',
          'Este dispositivo no tiene permisos para terminar rutas automáticamente.',
          [{text: 'OK'}],
        );
        setHasUnauthorizedAutoTerminateAlertBeenShown(true); // Mark alert as shown
      }
      setIsTerminating(false); // Reset terminating flag if unauthorized
      return;
    }

    // Reset the unauthorized alert flag if authorization is now good
    if (hasUnauthorizedAutoTerminateAlertBeenShown) {
      setHasUnauthorizedAutoTerminateAlertBeenShown(false);
    }

    const offlineQueue = OfflineQueue.getInstance();
    const currentQueueStats = offlineQueue.getQueueStats();
    if (currentQueueStats.total > 0) {
      console.log(
        `🚫 No se puede terminar la ruta automáticamente: ${currentQueueStats.pending} elementos pendientes en la cola offline.`,
      );
      setIsTerminating(false); // Reset terminating flag if queue is not empty
      return;
    }

    try {
      const response = await fetch(
        `https://villa.velsat.pe:8443/api/Datero/endruta/${deviceID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        offlineQueue.clearQueue(); // Clear offline queue before restarting
        mostrarNotificacion(
          'Ruta Terminada',
          'Su ruta se ha terminado exitosamente.',
          'success', // Tipo de notificación de éxito
          () => RNRestart.Restart(), // Reiniciar directamente cuando la notificación se oculte
        );
      } else {
        console.error(
          'Error al terminar ruta automáticamente:',
          response.status,
          response.statusText,
        );
        mostrarNotificacion(
          'Error',
          'Aún no se terminó la ruta automáticamente.',
          'error', // Tipo de notificación de error
        );
        setIsTerminating(false); // Reset terminating flag on API error
      }
    } catch (error) {
      console.error(
        'Problema de conexión al terminar ruta automáticamente:',
        error,
      );
      mostrarNotificacion(
        'Error de Conexión',
        'Problema de conexión al terminar la ruta. Verifica tu internet.',
        'error', // Tipo de notificación de error
      );
      setIsTerminating(false); // Reset terminating flag on network error
    }
    // No resetear isTerminating aquí en el finally, ya que RNRestart.Restart() unmontará el componente.
    // Si hay un error, se resetea en los bloques catch/else.
  }, [
    androidID,
    androidIdLocal,
    deviceID,
    isTerminating,
    hasUnauthorizedAutoTerminateAlertBeenShown,
  ]);

  // Efecto para disparar la terminación automática
  useEffect(() => {
    const lastStop = busStops[busStops.length - 1];
    if (
      lastStop &&
      lastStop.isCompleted &&
      queueStats.total === 0 &&
      !isTerminating // Asegurarse de que no haya un proceso de terminación en curso
    ) {
      console.log(
        '🎉 Última parada completada y cola vacía. Iniciando terminación automática...',
      );
      autoTerminateRoute();
    }
  }, [busStops, queueStats.total, autoTerminateRoute, isTerminating]);

  const detectAnyNearbyStop = () => {
    if (currentLatitude === 0 || currentLongitude === 0 || !androidIdLocal) {
      return;
    }

    setBusStops(prevStops => {
      const updatedStops = [...prevStops];
      let hasChanges = false;

      updatedStops.forEach((stop, index) => {
        if (!stop.isCompleted && !stop.isSkipped) {
          const distance = calculateDistance(
            currentLatitude,
            currentLongitude,
            stop.latitude,
            stop.longitude,
          );

          if (distance <= radioGeocerca) {
            const now = new Date();
            const horaLlegada = moment().tz('America/Lima').format('HH:mm:ss');
            const finalDuration = stop.isIntermediate
              ? stop.intermediateStartTime
                ? calculateDuration(
                    '',
                    true,
                    horaLlegada,
                    false,
                    true,
                    stop.intermediateStartTime,
                  )
                : 'Completado'
              : calculateDuration(
                  stop.arrivalTime,
                  true,
                  horaLlegada,
                  false,
                  stop.isIntermediate,
                );

            const completedStop = {
              ...stop,
              isCompleted: true,
              isActive: false,
              actualTime: horaLlegada,
              duration: finalDuration,
            };
            updatedStops[index] = completedStop;
            hasChanges = true;

            enviarDatosAPI(
              completedStop,
              codasig,
              androidID,
              androidIdLocal,
              deviceID,
              fechaini,
              codconductor,
              fecreg,
              codruta,
            ).then(result => {
              if (result.success) {
                if (result.queued) {
                  console.log(
                    `📤 Dato guardado en cola offline: ${completedStop.name} - ${result.message}`,
                  );
                } else {
                  console.log(
                    `✅ Datos enviados exitosamente: ${completedStop.name}`,
                  );
                }
              } else if (result.isUnauthorized) {
                console.log(
                  `🔒 Dispositivo en modo solo lectura: ${completedStop.name}`,
                );
              } else {
                console.error(
                  `❌ Error enviando datos: ${completedStop.name}`,
                  result.error,
                );
              }
            });

            updatedStops.forEach((s, i) => {
              updatedStops[i] = {...s, isActive: false};
            });

            const nextStopIndex = updatedStops.findIndex(
              (s, i) => i > index && !s.isCompleted && !s.isSkipped,
            );

            if (nextStopIndex !== -1) {
              updatedStops[nextStopIndex] = {
                ...updatedStops[nextStopIndex],
                isActive: true,
                intermediateStartTime: updatedStops[nextStopIndex]
                  .isIntermediate
                  ? new Date()
                  : undefined,
              };
            } else {
              console.log('🏁 No hay más paradas disponibles');
            }
          }
        }
      });
      return hasChanges ? updatedStops : prevStops;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBusStops(prevStops => {
        return prevStops.map(stop => {
          if (stop.isActive && !stop.isCompleted && !stop.isSkipped) {
            if (stop.isIntermediate && stop.intermediateStartTime) {
              return {
                ...stop,
                duration: calculateDuration(
                  '',
                  false,
                  undefined,
                  false,
                  true,
                  stop.intermediateStartTime,
                ),
              };
            }
            if (!stop.isIntermediate) {
              const newDuration = calculateDuration(
                stop.arrivalTime,
                false,
                undefined,
                false,
                stop.isIntermediate,
              );
              return {
                ...stop,
                duration: newDuration,
              };
            }
          }
          return stop;
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentLatitude !== 0 && currentLongitude !== 0 && androidIdLocal) {
      detectAnyNearbyStop();
    }
  }, [
    currentLatitude,
    currentLongitude,
    androidIdLocal,
    radioGeocerca,
    codasig,
    androidID,
  ]);

  useEffect(() => {
    // Re-initialize busStops when codruta or logurb change
    const initialStops = getBusStopsData(codruta, arrivalTimes);
    const integratedStops = integrateLogurbData(initialStops);
    setBusStops(integratedStops);
  }, [codruta, logurb, fechaini]); // Added fechaini as it affects arrivalTimes

  const handleStopCompleted = (
    completedStopId: string,
    horaLlegada: string,
  ) => {
    setBusStops(prevStops => {
      const updatedStops = [...prevStops];
      const completedIndex = updatedStops.findIndex(
        stop => stop.id === completedStopId,
      );

      if (completedIndex !== -1) {
        const stop = updatedStops[completedIndex];
        // If horaLlegada is not in 24-hour format, convert it
        const horaLlegada24 =
          horaLlegada.includes('m.') ||
          horaLlegada.includes('AM') ||
          horaLlegada.includes('PM')
            ? moment(horaLlegada, ['h:mm:ss A', 'h:mm:ss a'])
                .tz('America/Lima')
                .format('HH:mm:ss')
            : horaLlegada;

        const finalDuration = stop.isIntermediate
          ? stop.intermediateStartTime
            ? calculateDuration(
                '',
                true,
                horaLlegada24,
                false,
                true,
                stop.intermediateStartTime,
              )
            : 'Completado'
          : calculateDuration(
              stop.arrivalTime,
              true,
              horaLlegada24,
              false,
              stop.isIntermediate,
            );

        const completedStop = {
          ...stop,
          isCompleted: true,
          isActive: false,
          actualTime: horaLlegada24,
          duration: finalDuration,
        };
        updatedStops[completedIndex] = completedStop;

        // Send data with offline queue system
        enviarDatosAPI(
          completedStop,
          codasig,
          androidID,
          androidIdLocal,
          deviceID,
          fechaini,
          codconductor,
          fecreg,
          codruta,
        ).then(result => {
          if (result.success) {
            if (result.queued) {
              console.log(
                `📤 Parada completada manualmente guardada en cola offline: ${completedStop.name} - ${result.message}`,
              );
            } else {
              console.log(
                `✅ Datos enviados exitosamente para parada completada: ${completedStop.name}`,
              );
            }
          } else if (result.isUnauthorized) {
            console.log(
              `🔒 Dispositivo en modo solo lectura - Parada completada: ${completedStop.name}`,
            );
          } else {
            console.error(
              `❌ Error enviando datos para parada completada: ${completedStop.name}`,
              result.error,
            );
          }
        });

        updatedStops.forEach((s, i) => {
          updatedStops[i] = {...s, isActive: false};
        });

        const nextStopIndex = updatedStops.findIndex(
          (s, i) => i > completedIndex && !s.isCompleted && !s.isSkipped,
        );

        if (nextStopIndex !== -1) {
          updatedStops[nextStopIndex] = {
            ...updatedStops[nextStopIndex],
            isActive: true,
            intermediateStartTime: updatedStops[nextStopIndex].isIntermediate
              ? new Date()
              : undefined,
          };
        }

        const logMessage = stop.isIntermediate
          ? `Punto intermedio ${completedStop.name} registrado a las ${horaLlegada24}`
          : `Parada ${completedStop.name} completada a las ${horaLlegada24} con duración: ${finalDuration}`;
      }
      return updatedStops;
    });
  };

  const handleTerminarRuta = async () => {
    if (isTerminating) { // Evitar múltiples llamadas si ya se está terminando
      console.log('Already terminating, skipping manual termination call.');
      return;
    }
    setIsTerminating(true); // Establecer la bandera de terminación

    if (androidID !== androidIdLocal) {
      Alert.alert(
        'Dispositivo no autorizado',
        'Este dispositivo no tiene permisos para terminar rutas.',
        [{text: 'OK'}],
      );
      setIsTerminating(false); // Resetear la bandera si no está autorizado
      return;
    }

    const routeType =
      codruta === '5' ? '(A)' : codruta === '6' ? '(B)' : 'desconocida';

    Alert.alert(
      'Terminar Ruta',
      `¿Estás seguro de que quieres terminar la ruta ${routeType}? Esta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setIsTerminating(false), // Resetear la bandera si se cancela
        },
        {
          text: 'Terminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://villa.velsat.pe:8443/api/Datero/endruta/${deviceID}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );

              if (response.ok) {
                // Limpiar cola offline antes de reiniciar
                const offlineQueue = OfflineQueue.getInstance();
                offlineQueue.clearQueue();
                mostrarNotificacion(
                  'Ruta Terminada',
                  'Su ruta se ha terminado exitosamente.',
                  'success', // Tipo de notificación de éxito
                  () => RNRestart.Restart(), // Reiniciar directamente cuando la notificación se oculte
                );
              } else {
                console.error(
                  'Error al terminar ruta:',
                  response.status,
                  response.statusText,
                );
                mostrarNotificacion(
                  'Error',
                  'No se pudo terminar la ruta. Inténtalo de nuevo.',
                  'error', // Tipo de notificación de error
                );
                setIsTerminating(false); // Resetear la bandera en caso de error de API
              }
            } catch (error) {
              mostrarNotificacion(
                'Error',
                'Problema de conexión. Verifica tu internet.',
                'error', // Tipo de notificación de error
              );
              setIsTerminating(false); // Resetear la bandera en caso de error de red
            }
            // No resetear isTerminating aquí, ya que RNRestart.Restart() unmontará el componente.
            // Si hay un error, se resetea en los bloques catch/else.
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoText}>
            {codruta === '5'
              ? `RUTA W 7504 | LA PERLA - SAN JUAN (A) HS: ${fechaini}`
              : codruta === '6'
              ? `RUTA W 7504 | SAN JUAN - LA PERLA (B) HS: ${fechaini}`
              : `Ruta ${codruta}`}
          </Text>
          {queueStats.total > 0 && (
            <Text style={styles.queueInfoText}>
              📤 Cola offline: {queueStats.pending} pendientes
            </Text>
          )}
        </View>
        {busStops.map((stop, index) => (
          <View key={stop.id}>
            <BusStopItem
              id={stop.id}
              name={stop.name}
              description={stop.description}
              arrivalTime={stop.arrivalTime}
              estimatedTime={stop.estimatedTime}
              actualTime={stop.actualTime}
              duration={stop.duration}
              icon={stop.icon}
              isActive={stop.isActive}
              isCompleted={stop.isCompleted}
              isTerminal={stop.isTerminal}
              isIntermediate={stop.isIntermediate}
              latitude={stop.latitude}
              longitude={stop.longitude}
              currentLatitude={currentLatitude}
              currentLongitude={currentLongitude}
              radioGeocerca={radioGeocerca}
              onStopCompleted={handleStopCompleted}
            />
            {index < busStops.length - 1 && (
              <View
                style={[
                  styles.connector,
                  stop.isCompleted && styles.completedConnector,
                  stop.isSkipped && styles.skippedConnector,
                ]}
              />
            )}
          </View>
        ))}
        <View style={styles.endRouteContainer}>
          <TouchableOpacity
            style={styles.endRouteButton}
            onPress={handleTerminarRuta}
            activeOpacity={0.8}>
            <Text style={styles.endRouteButtonText}>Terminar Ruta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 2,
    paddingTop: 0,
    marginBottom: 0,
  },
  routeInfoContainer: {
    backgroundColor: '#00509d',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  routeInfoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  queueInfoText: {
    color: '#ffeb3b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  connector: {
    width: 1,
    height: 8,
    backgroundColor: '#00509d',
    marginLeft: 25,
    marginVertical: 0,
  },
  completedConnector: {
    backgroundColor: '#4caf50',
  },
  skippedConnector: {
    backgroundColor: '#ff9800',
  },
  endRouteContainer: {
    paddingVertical: 5,
    alignItems: 'center',
  },
  endRouteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 40,
    paddingVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 200,
    alignItems: 'center',
    width: '100%',
  },
  endRouteButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
});

export default BusRouteScreen;