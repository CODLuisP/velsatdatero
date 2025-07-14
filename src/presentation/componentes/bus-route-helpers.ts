import {BusStop} from './busStop';

export const generateArrivalTimes = (
  fechaini: string,
  codruta: string,
): string[] => {
  const timeParts = fechaini.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;

  const baseTime = new Date();
  baseTime.setHours(hours, minutes, seconds, 0);

  const times: string[] = [];
  let minutesToAdd: number[];

  if (codruta === '5') {
    minutesToAdd = getDynamicMinutesForRoute5(hours, minutes, seconds);
  } else if (codruta === '6') {
    minutesToAdd = getDynamicMinutesForRoute6(hours, minutes, seconds);
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

const getDynamicMinutesForRoute5 = (
  hours: number,
  minutes: number,
  seconds: number = 0,
): number[] => {
  // Convertir la hora a formato de segundos totales para comparación más precisa
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Definir los rangos de tiempo y sus respectivos minutos para ruta 5 (en segundos)
  const timeRanges = [
    {
      start: 6 * 3600 + 0 * 60 + 0,
      end: 6 * 3600 + 7 * 60 + 59,
      minutes: [9, 36, 52, 68, 85, 115, 123],
    }, // 6:00:00 - 6:07:59
    {
      start: 6 * 3600 + 8 * 60 + 0,
      end: 6 * 3600 + 14 * 60 + 59,
      minutes: [10, 36, 53, 69, 87, 117, 125],
    }, // 6:08:00 - 6:14:59
    {
      start: 6 * 3600 + 15 * 60 + 0,
      end: 6 * 3600 + 21 * 60 + 59,
      minutes: [10, 37, 54, 70, 88, 118, 123],
    }, // 6:15:00 - 6:21:59
    {
      start: 6 * 3600 + 22 * 60 + 0,
      end: 6 * 3600 + 28 * 60 + 59,
      minutes: [10, 39, 56, 72, 90, 120, 130],
    }, // 6:22:00 - 6:28:59
    {
      start: 6 * 3600 + 29 * 60 + 0,
      end: 6 * 3600 + 35 * 60 + 59,
      minutes: [10, 41, 58, 74, 92, 122, 132],
    }, // 6:29:00 - 6:35:59
    {
      start: 6 * 3600 + 36 * 60 + 0,
      end: 6 * 3600 + 42 * 60 + 59,
      minutes: [11, 44, 60, 76, 93, 123, 133],
    }, // 6:36:00 - 6:42:59
    {
      start: 6 * 3600 + 43 * 60 + 0,
      end: 6 * 3600 + 43 * 60 + 59,
      minutes: [12, 45, 64, 85, 105, 137, 147],
    }, // 6:43:00 - 6:43:59
  ];

  // Buscar el rango de tiempo que corresponde
  for (const range of timeRanges) {
    if (totalSeconds >= range.start && totalSeconds <= range.end) {
      return range.minutes;
    }
  }

  // Si no está en ningún rango específico (después de 6:43:59 o antes de 6:00:00), usar los minutos constantes
  // Los últimos minutos de la tabla (6:43): [12, 45, 64, 85, 105, 137, 147]
  return [12, 45, 64, 85, 105, 137, 147];
};

// Función para obtener los minutos dinámicos de la ruta 6
const getDynamicMinutesForRoute6 = (
  hours: number,
  minutes: number,
  seconds: number = 0,
): number[] => {
  // Convertir la hora a formato de segundos totales para comparación más precisa
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Definir los rangos de tiempo y sus respectivos minutos (en segundos)
  const timeRanges = [
    {
      start: 4 * 3600 + 55 * 60 + 0,
      end: 5 * 3600 + 1 * 60 + 59,
      minutes: [4, 13, 32, 46, 56, 76, 96],
    }, // 4:55:00 - 5:01:59
    {
      start: 5 * 3600 + 2 * 60 + 0,
      end: 5 * 3600 + 8 * 60 + 59,
      minutes: [4, 13, 32, 46, 57, 77, 97],
    }, // 5:02:00 - 5:08:59
    {
      start: 5 * 3600 + 9 * 60 + 0,
      end: 5 * 3600 + 14 * 60 + 59,
      minutes: [4, 13, 33, 47, 57, 77, 97],
    }, // 5:09:00 - 5:14:59
    {
      start: 5 * 3600 + 15 * 60 + 0,
      end: 5 * 3600 + 19 * 60 + 59,
      minutes: [4, 13, 34, 48, 58, 78, 98],
    }, // 5:15:00 - 5:19:59
    {
      start: 5 * 3600 + 20 * 60 + 0,
      end: 5 * 3600 + 24 * 60 + 59,
      minutes: [4, 13, 34, 49, 60, 80, 100],
    }, // 5:20:00 - 5:24:59
    {
      start: 5 * 3600 + 25 * 60 + 0,
      end: 5 * 3600 + 29 * 60 + 59,
      minutes: [4, 13, 35, 50, 62, 82, 102],
    }, // 5:25:00 - 5:29:59
    {
      start: 5 * 3600 + 30 * 60 + 0,
      end: 5 * 3600 + 34 * 60 + 59,
      minutes: [4, 13, 35, 51, 62, 82, 102],
    }, // 5:30:00 - 5:34:59
    {
      start: 5 * 3600 + 35 * 60 + 0,
      end: 5 * 3600 + 39 * 60 + 59,
      minutes: [4, 13, 35, 51, 62, 83, 103],
    }, // 5:35:00 - 5:39:59
    {
      start: 5 * 3600 + 40 * 60 + 0,
      end: 5 * 3600 + 44 * 60 + 59,
      minutes: [4, 13, 36, 52, 62, 83, 103],
    }, // 5:40:00 - 5:44:59
    {
      start: 5 * 3600 + 45 * 60 + 0,
      end: 5 * 3600 + 49 * 60 + 59,
      minutes: [4, 13, 38, 53, 63, 84, 104],
    }, // 5:45:00 - 5:49:59
    {
      start: 5 * 3600 + 50 * 60 + 0,
      end: 5 * 3600 + 54 * 60 + 59,
      minutes: [5, 14, 38, 54, 64, 85, 105],
    }, // 5:50:00 - 5:54:59
    {
      start: 5 * 3600 + 55 * 60 + 0,
      end: 5 * 3600 + 59 * 60 + 59,
      minutes: [5, 15, 39, 55, 65, 87, 107],
    }, // 5:55:00 - 5:59:59
    {
      start: 6 * 3600 + 0 * 60 + 0,
      end: 6 * 3600 + 4 * 60 + 59,
      minutes: [5, 15, 40, 56, 66, 88, 108],
    }, // 6:00:00 - 6:04:59
    {
      start: 6 * 3600 + 5 * 60 + 0,
      end: 6 * 3600 + 9 * 60 + 59,
      minutes: [5, 15, 41, 58, 68, 90, 110],
    }, // 6:05:00 - 6:09:59
    {
      start: 6 * 3600 + 10 * 60 + 0,
      end: 6 * 3600 + 14 * 60 + 59,
      minutes: [5, 15, 41, 59, 69, 92, 112],
    }, // 6:10:00 - 6:14:59
    {
      start: 6 * 3600 + 15 * 60 + 0,
      end: 6 * 3600 + 19 * 60 + 59,
      minutes: [5, 15, 42, 60, 70, 94, 114],
    }, // 6:15:00 - 6:19:59
    {
      start: 6 * 3600 + 20 * 60 + 0,
      end: 6 * 3600 + 24 * 60 + 59,
      minutes: [5, 15, 43, 61, 71, 96, 116],
    }, // 6:20:00 - 6:24:59
    {
      start: 6 * 3600 + 25 * 60 + 0,
      end: 6 * 3600 + 29 * 60 + 59,
      minutes: [5, 15, 44, 63, 73, 98, 118],
    }, // 6:25:00 - 6:29:59
    {
      start: 6 * 3600 + 30 * 60 + 0,
      end: 6 * 3600 + 34 * 60 + 59,
      minutes: [5, 15, 45, 64, 74, 100, 120],
    }, // 6:30:00 - 6:34:59
    {
      start: 6 * 3600 + 35 * 60 + 0,
      end: 6 * 3600 + 39 * 60 + 59,
      minutes: [5, 15, 46, 66, 76, 102, 122],
    }, // 6:35:00 - 6:39:59
    {
      start: 6 * 3600 + 40 * 60 + 0,
      end: 6 * 3600 + 44 * 60 + 59,
      minutes: [5, 15, 47, 67, 78, 105, 125],
    }, // 6:40:00 - 6:44:59
    {
      start: 6 * 3600 + 45 * 60 + 0,
      end: 6 * 3600 + 49 * 60 + 59,
      minutes: [5, 15, 48, 68, 80, 107, 127],
    }, // 6:45:00 - 6:49:59
    {
      start: 6 * 3600 + 50 * 60 + 0,
      end: 6 * 3600 + 54 * 60 + 59,
      minutes: [5, 15, 48, 68, 82, 110, 130],
    }, // 6:50:00 - 6:54:59
    {
      start: 6 * 3600 + 55 * 60 + 0,
      end: 6 * 3600 + 59 * 60 + 59,
      minutes: [5, 15, 48, 68, 84, 112, 132],
    }, // 6:55:00 - 6:59:59
    {
      start: 7 * 3600 + 0 * 60 + 0,
      end: 7 * 3600 + 4 * 60 + 59,
      minutes: [5, 15, 48, 68, 85, 115, 135],
    }, // 7:00:00 - 7:04:59
    {
      start: 7 * 3600 + 5 * 60 + 0,
      end: 7 * 3600 + 9 * 60 + 59,
      minutes: [5, 15, 48, 68, 86, 116, 136],
    }, // 7:05:00 - 7:09:59
    {
      start: 7 * 3600 + 10 * 60 + 0,
      end: 7 * 3600 + 14 * 60 + 59,
      minutes: [5, 15, 48, 68, 87, 117, 137],
    }, // 7:10:00 - 7:14:59
    {
      start: 7 * 3600 + 15 * 60 + 0,
      end: 7 * 3600 + 19 * 60 + 59,
      minutes: [5, 15, 48, 68, 88, 118, 138],
    }, // 7:15:00 - 7:19:59
    {
      start: 7 * 3600 + 20 * 60 + 0,
      end: 7 * 3600 + 24 * 60 + 59,
      minutes: [5, 15, 48, 68, 88, 118, 138],
    }, // 7:20:00 - 7:24:59
    {
      start: 7 * 3600 + 25 * 60 + 0,
      end: 7 * 3600 + 25 * 60 + 59,
      minutes: [5, 15, 48, 72, 92, 122, 142],
    }, // 7:25:00 - 7:25:59
  ];

  for (const range of timeRanges) {
    if (totalSeconds >= range.start && totalSeconds <= range.end) {
      return range.minutes;
    }
  }

  // Si no está en ningún rango específico (después de 7:25:59), usar los minutos constantes
  // Los últimos minutos de la tabla (7:25): [5, 15, 48, 72, 92, 122, 142]
  return [5, 15, 48, 72, 92, 122, 142];
};

// Función auxiliar para formatear tiempo en formato 24 horas
const formatTime24h = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

// Función auxiliar para convertir formato 12h a 24h si es necesario
const convertTo24h = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return formatTime24h(hours, minutes);
};

export const getBusStopsData = (
  codruta: string,
  arrivalTimes: string[],
): BusStop[] => {
  if (codruta === '5') {
    return [
      {
        id: '1',
        name: 'VENEZUELA',
        description: 'Control 1',
        arrivalTime: arrivalTimes[0],
        estimatedTime: '',
        duration: '',
        icon: 'bus',
        latitude: -12.063352,
        longitude: -77.105005,
        isActive: true,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },

      {
        id: '1.1',
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
        id: '1.3',
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
        id: '1.5',
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
        id: '1.7',
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
        id: '1.9',
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
        id: '2',
        name: 'GARZON',
        description: 'Control 2',
        arrivalTime: arrivalTimes[1],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.069217,
        longitude: -77.047214,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },
      {
        id: '2.3',
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
        id: '2.9',
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
        id: '3',
        name: 'OBRERO',
        description: 'Control 3',
        arrivalTime: arrivalTimes[2],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.147526,
        longitude: -78.520503,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },

      {
        id: '3.3',
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
        id: '3.9',
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
        id: '4',
        name: 'AV SAN JUAN',
        description: 'Control 4',
        arrivalTime: arrivalTimes[3],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.075216,
        longitude: -77.001256,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },

      {
        id: '4.3',
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
        id: '4.9',
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
        id: '5',
        name: 'MADRID',
        description: 'Control 5',
        arrivalTime: arrivalTimes[4],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.107674,
        longitude: -76.992534,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },

      {
        id: '5.3',
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
        id: '6',
        name: 'CT',
        description: 'Control 6',
        arrivalTime: arrivalTimes[5],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.164936,
        longitude: -76.972806,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },
      {
        id: '7',
        name: 'GRIFO MILAGRO',
        description: 'Control final',
        arrivalTime: arrivalTimes[6],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.172350,
        longitude: -76.965037,
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
        name: 'PACIFICO',
        description: 'Control 1',
        arrivalTime: arrivalTimes[0],
        estimatedTime: '',
        duration: '',
        icon: 'bus',
        latitude: -12.175959,
        longitude: -76.957626,
        isActive: true,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },
      {
        id: '2',
        name: 'CT',
        description: 'Control 2',
        arrivalTime: arrivalTimes[1],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.165202,
        longitude: -76.97242,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },
      {
        id: '2.1',
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
        id: '2.3',
        name: 'ESTC ATOCONGO',
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
        id: '2.5',
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
        id: '2.7',
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
        id: '2.9',
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
        id: '3',
        name: 'MADRID',
        description: 'Control 3',
        arrivalTime: arrivalTimes[2],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.108237,
        longitude: -76.992485,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },

      {
        id: '3.3',
        name: 'AV SL / CLAUDE M',
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
        id: '3.6',
        name: 'AV SL / JAVIER P',
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
        id: '3.9',
        name: 'AV SL / EL AIRE',
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
        id: '4',
        name: 'ARRIOLA',
        description: 'Control 4',
        arrivalTime: arrivalTimes[3],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.077288,
        longitude: -77.009712,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },

      {
        id: '4.5',
        name: 'AV MEX / HUANUCO',
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
        id: '5',
        name: 'TRANSITO',
        description: 'Control 5',
        arrivalTime: arrivalTimes[4],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.061889,
        longitude: -77.019737,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },

      {
        id: '5.5',
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
        id: '5.8',
        name: 'AV BRA / CANTERAC',
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
        id: '6',
        name: 'BOLIVAR',
        description: 'Control 6',
        arrivalTime: arrivalTimes[5],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.071988,
        longitude: -77.063782,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
      },

      {
        id: '7',
        name: 'INSURGENTES',
        description: 'Control 7',
        arrivalTime: arrivalTimes[6],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -12.063117,
        longitude: -77.104271,
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
