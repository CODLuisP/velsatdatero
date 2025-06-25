import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import BusStopItem from './BusStopItem';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import RNRestart from 'react-native-restart';
import {useAppContext} from '../../context/VelocidadContext';
import moment from 'moment-timezone';

interface BusStop {
  id: string;
  name: string;
  description: string;
  arrivalTime: string;
  estimatedTime: string;
  actualTime?: string;
  duration: string;
  icon: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isTerminal?: boolean;
  isSkipped?: boolean;
  isIntermediate?: boolean;
  intermediateStartTime?: Date;
}

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

type DrawerParamList = {
  Control: undefined;
  RutaBus: {};
  Mapa: {};
};

const formatTime24Hours = (date = new Date()) => {
  return moment(date).tz('America/Lima').format('HH:mm:ss');
};

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

    const response = await fetch(
      'https://velsat.pe:8585/api/Datero/enviocontrol',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      },
    );

    if (response.ok) {
      const result = await response.json();

      return {success: true, data: result};
    } else {
      console.error(
        `Error en API para ${busStop.name}:`,
        response.status,
        response.statusText,
      );
      return {success: false, error: `HTTP ${response.status}`};
    }
  } catch (error) {
    return {success: false, error: error};
  }
};

const generateArrivalTimes = (fechaini: string, codruta: string) => {
  const [hours, minutes] = fechaini.split(':').map(Number);
  const baseTime = new Date();
  baseTime.setHours(hours, minutes, 0, 0);

  const times = [];

  let minutesToAdd;
  if (codruta === '5') {
    minutesToAdd = [1, 12, 45, 64, 85, 105, 137, 147, 157];
  } else if (codruta === '6') {
    minutesToAdd = [1, 5, 14, 44, 67, 95, 125, 155];
  } else {
    minutesToAdd = [2, 8, 13, 19, 25, 30];
  }

  for (let i = 0; i < minutesToAdd.length; i++) {
    const arrivalTime = new Date(
      baseTime.getTime() + minutesToAdd[i] * 60 * 1000,
    );
    const timeString = arrivalTime.toLocaleTimeString('es-ES', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    times.push(timeString);
  }

  return times;
};

const calculateDuration = (
  arrivalTime: string,
  isCompleted: boolean = false,
  actualTime?: string,
  isSkipped: boolean = false,
  isIntermediate: boolean = false,
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
      const minutes = Math.ceil(diffInSeconds / 60);
      return minutes < 0 ? `${minutes} min` : '0 min';
    } else {
      return '';
    }
  }

  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;

  if (isCompleted) {
    return minutes > 0 ? `+${minutes} min` : '0 min';
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
  radioGeocerca = 65,
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

  const {setModoVisualizacion} = useAppContext();

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

  const getInitialBusStops = (): BusStop[] => {
    if (codruta === '5') {
      return [
        {
          id: '1',
          name: 'INICIAL',
          description: 'Punto de Inicio',
          arrivalTime: arrivalTimes[0],
          estimatedTime: '',
          duration: '',
          icon: 'bus',
          latitude: -12.077085,
          longitude: -77.108064,
          isActive: true,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '2',
          name: 'VENEZUELA',
          description: 'Control 1',
          arrivalTime: arrivalTimes[1],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.06319,
          longitude: -77.10415,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },
        {
          id: '2.1',
          name: 'VEN / HAL',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.062379,
          longitude: -77.096021,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },
        {
          id: '2.3',
          name: 'UNI / DF',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.062146,
          longitude: -77.07882,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '2.5',
          name: 'BOL / AL',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.07094,
          longitude: -77.075734,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '2.7',
          name: 'BOL / SUCRE',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.071659,
          longitude: -77.061718,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '2.9',
          name: 'BOL / BRASIL',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.0751,
          longitude: -77.05392,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '3',
          name: 'GARZON',
          description: 'Control 2',
          arrivalTime: arrivalTimes[2],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.06907,
          longitude: -77.04709,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '3.3',
          name: '28 JULIO / AREQ',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.064619,
          longitude: -77.037364,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '3.9',
          name: '28 JULIO / AV GAL',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.063628,
          longitude: -77.032318,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '4',
          name: 'OBRERO',
          description: 'Control 3',
          arrivalTime: arrivalTimes[3],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.06398,
          longitude: -77.02488,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '4.3',
          name: 'PARI/ UNANUE',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.065711,
          longitude: -77.017458,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '4.9',
          name: 'MEX / AV AVIA',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.072096,
          longitude: -77.011584,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '5',
          name: 'AV SAN JUAN',
          description: 'Control 4',
          arrivalTime: arrivalTimes[4],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.07522,
          longitude: -77.00125,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },
        {
          id: '5.3',
          name: 'SAN LUIS / CND',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.082337,
          longitude: -76.997338,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '5.9',
          name: 'SAN LUIS / SBN',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.092801,
          longitude: -76.995811,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '6',
          name: 'MADRID',
          description: 'Control 5',
          arrivalTime: arrivalTimes[5],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.10763,
          longitude: -76.99253,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },
        {
          id: '6.3',
          name: 'CNI / CADIZ',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.118685,
          longitude: -76.989024,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '7',
          name: 'CT',
          description: 'Control 6',
          arrivalTime: arrivalTimes[6],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.16509,
          longitude: -76.97278,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '8',
          name: 'GRIFO',
          description: 'Control 7',
          arrivalTime: arrivalTimes[7],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.17234,
          longitude: -76.96509,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '9',
          name: 'SCORZA',
          description: 'Punto Final',
          arrivalTime: arrivalTimes[8],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.18101,
          longitude: -76.95618,

          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },
      ];
    } else if (codruta === '6') {
      return [
        {
          id: '1',
          name: 'INICIAL',
          description: 'Punto de Inicio',
          arrivalTime: arrivalTimes[0],
          estimatedTime: '',
          duration: '',
          icon: 'bus',
          latitude: -12.1829,
          longitude: -76.95582,
          isActive: true,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },
        {
          id: '2',
          name: 'PACIFICO',
          description: 'Control 1',
          arrivalTime: arrivalTimes[1],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.17579,
          longitude: -76.95759,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '3',
          name: 'CT',
          description: 'Control 2',
          arrivalTime: arrivalTimes[2],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.16516,
          longitude: -76.97264,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },
        {
          id: '3.1',
          name: 'LUZ DEL SUR',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.155989,
          longitude: -76.972501,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '3.3',
          name: 'ESTACION ATOCONGO',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.150574,
          longitude: -76.979767,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '3.5',
          name: 'ANDRES TINOCO',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.143559,
          longitude: -76.98515,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '3.7',
          name: 'CDI / BENAVIDES',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.129643,
          longitude: -76.981713,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '3.9',
          name: 'CDI / HIGUERETA',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.120704,
          longitude: -76.987844,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '4',
          name: 'MADRID',
          description: 'Control 3',
          arrivalTime: arrivalTimes[3],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.10821,
          longitude: -76.99248,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '4.3',
          name: 'AV SAN LUIS/ CM',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.097606,
          longitude: -76.995016,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '4.6',
          name: 'AV SAN LUIS / JP',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.086561,
          longitude: -76.996585,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '4.9',
          name: 'AV SAN LUIS / AV EA',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.078444,
          longitude: -76.999011,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '5',
          name: 'ARRIOLA',
          description: 'Control 4',
          arrivalTime: arrivalTimes[4],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.07728,
          longitude: -77.00983,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '5.5',
          name: 'AV MEX / HUA',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.073051,
          longitude: -77.014929,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '6',
          name: 'TRANSITO',
          description: 'Control 5',
          arrivalTime: arrivalTimes[5],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.06191,
          longitude: -77.01984,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '6.3',
          name: '28 DE JULIO / VE',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.063676,
          longitude: -77.033636,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '6.9',
          name: 'AV BRA / GC',
          description: 'Punto de Referencia',
          arrivalTime: '',
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.069139,
          longitude: -77.049006,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: true,
        },

        {
          id: '7',
          name: 'CORDOVA',
          description: 'Control 6',
          arrivalTime: arrivalTimes[6],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.07201,
          longitude: -77.06377,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },

        {
          id: '8',
          name: 'INSURGENTES',
          description: 'Punto Final',
          arrivalTime: arrivalTimes[7],
          estimatedTime: '',
          duration: '',
          icon: 'location',
          latitude: -12.07187,
          longitude: -77.10503,
          isActive: false,
          isCompleted: false,
          isSkipped: false,
          isIntermediate: false,
        },
      ];
    } else {
      return [];
    }
  };

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
    const initialStops = getInitialBusStops();
    return integrateLogurbData(initialStops);
  });

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
                console.log(
                  `Datos enviados exitosamente: ${completedStop.name}`,
                );
              } else if (result.isUnauthorized) {
                console.log(
                  `Dispositivo en modo solo lectura: ${completedStop.name}`,
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
    const initialStops = getInitialBusStops();
    const integratedStops = integrateLogurbData(initialStops);
    setBusStops(integratedStops);
  }, [codruta, logurb]);

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

        // Si horaLlegada no está en formato 24 horas, convertirla
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

        // resto del código permanece igual...
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
            console.log(
              `✅ Datos enviados exitosamente para parada completada: ${completedStop.name}`,
            );
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
    if (androidID !== androidIdLocal) {
      Alert.alert(
        'Dispositivo no autorizado',
        'Este dispositivo no tiene permisos para terminar rutas.',
        [{text: 'OK'}],
      );
      return;
    }

    const routeType =
      codruta === '5'
        ? '(A)'
        : codruta === '6'
        ? '(B)'
        : 'desconocida';

    Alert.alert(
      'Terminar Ruta',
      `¿Estás seguro de que quieres terminar la ruta ${routeType}? Esta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Terminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://velsat.pe:8585/api/Datero/endruta/${deviceID}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );

              if (response.ok) {
                RNRestart.Restart();
              } else {
                console.error(
                  'Error al terminar ruta:',
                  response.status,
                  response.statusText,
                );
                Alert.alert(
                  'Error',
                  'No se pudo terminar la ruta. Inténtalo de nuevo.',
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'Problema de conexión. Verifica tu internet.',
              );
            }
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

        {/* <View style={{marginTop: 20, padding: 10, backgroundColor: '#f0f0f0'}}>
          <Text style={{fontWeight: 'bold', marginBottom: 10}}>
            Datos de logurb (DEBUG):
          </Text>
          {logurb.map((item, index) => (
            <View
              key={index}
              style={{
                marginBottom: 10,
                padding: 5,
                backgroundColor: 'white',
              }}>
              <Text>Parada: {item.nom_control}</Text>
              <Text>Hora estimada: {item.hora_estimada}</Text>
              <Text>Hora llegada: {item.hora_llegada}</Text>
              <Text>Duración: {item.volado}</Text>
            </View>
          ))}
        </View> */}
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
