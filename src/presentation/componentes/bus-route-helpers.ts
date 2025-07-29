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
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

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
      minutes: [10, 37, 54, 70, 88, 118, 128],
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

  for (const range of timeRanges) {
    if (totalSeconds >= range.start && totalSeconds <= range.end) {
      return range.minutes;
    }
  }

  return [12, 45, 64, 85, 105, 137, 147];
};

const getDynamicMinutesForRoute6 = (
  hours: number,
  minutes: number,
  seconds: number = 0,
): number[] => {
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

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

  return [5, 15, 48, 72, 92, 122, 142];
};

const formatTime24h = (hours: number, minutes: number): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
};

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
        name: 'METRO',
        description: 'Punto de inicio',
        arrivalTime: arrivalTimes[0],
        estimatedTime: '',
        duration: '',
        icon: 'bus',
        latitude: -7.148202,
        longitude: -78.524141,
        isActive: true,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
        radioGeocerca: 2,
      },

      {
        id: '1.1',
        name: 'PUNTO INTERMEDIO 1',
        description: 'Punto de control',
        arrivalTime: '',
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.146938,
        longitude: -78.521443,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 2,
      },
      {
        id: '1.3',
        name: 'PUNTO INTERMEDIO 2',
        description: 'Punto de control',
        arrivalTime: '',
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.145993,
        longitude: -78.518442,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 2,
      },

      {
        id: '1.5',
        name: 'LOS CIPRESES',
        description: 'Paradero 1',
        arrivalTime: arrivalTimes[1],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.149477,
        longitude: -78.512175,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 2,
      },

      {
        id: '1.6',
        name: 'PUNTO INTERMEDIO 3',
        description: 'Punto de control',
        arrivalTime: '',
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.147837,
        longitude: -78.510943,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 2,
      },

      {
        id: '1.7',
        name: 'PUNTO INTERMEDIO 4',
        description: 'Punto de control',
        arrivalTime: '',
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.146711,
        longitude: -78.508366,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 2,
      },

      {
        id: '2',
        name: 'UPN',
        description: 'Paradero 2',
        arrivalTime: arrivalTimes[2],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.15126,
        longitude: -78.506537,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
        radioGeocerca: 2,
      },
      {
        id: '2.3',
        name: 'PUNTO INTERMEDIO 5',
        description: 'Punto de control',
        arrivalTime: '',
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.153401,
        longitude: -78.506284,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 2,
      },

      {
        id: '2.9',
        name: 'PUNTO INTERMEDIO 6',
        description: 'Punto de control',
        arrivalTime: '',
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.157154,
        longitude: -78.506773,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 35,
      },
      {
        id: '3',
        name: 'GRIFO ROYAL',
        description: 'Paradero 3',
        arrivalTime: arrivalTimes[3],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.158861,
        longitude: -78.506288,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
        radioGeocerca: 35,
      },

      {
        id: '3.3',
        name: 'UNC',
        description: 'Paradero 4',
        arrivalTime: arrivalTimes[4],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.165555,
        longitude: -78.496362,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 35,
      },

      {
        id: '3.9',
        name: 'PUNTO INTERMEDIO 7',
        description: 'Punto de control',
        arrivalTime: '',
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.165102,
        longitude: -78.478852,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 35,
      },

      {
        id: '4',
        name: 'INCA',
        description: 'Punto final',
        arrivalTime: arrivalTimes[5],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.16487,
        longitude: -78.46942,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
        radioGeocerca: 50,
      },
    ];
  } else if (codruta === '6') {
    return [
      {
        id: '1',
        name: 'INKA',
        description: 'Punto de inicio',
        arrivalTime: arrivalTimes[0],
        estimatedTime: '',
        duration: '',
        icon: 'bus',
        latitude: -7.164772,
        longitude: -78.469434,
        isActive: true,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
        radioGeocerca: 35,
      },
      {
        id: '2',
        name: 'OVALO LEON',
        description: 'Paradero 1',
        arrivalTime: arrivalTimes[1],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.165315,
        longitude: -78.494983,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: false,
        radioGeocerca: 35,
      },
      {
        id: '2.1',
        name: 'PUNTO INTERMEDIO 1',
        description: 'Punto de control',
        arrivalTime: '',

        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.165588,
        longitude: -78.502314,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 35,
      },

      {
        id: '2.3',
        name: 'MAESTRO',
        description: 'Paradero 2',
        arrivalTime: arrivalTimes[2],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.161996,
        longitude: -78.504526,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 35,
      },

      {
        id: '2.5',
        name: 'GYM IMPERIO',
        description: 'Paradero 3',
        arrivalTime: arrivalTimes[3],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.158236,
        longitude: -78.506438,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 35,
      },

      {
        id: '2.7',
        name: 'OPEN',
        description: 'Paradero 3',
        arrivalTime: arrivalTimes[4],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.151312,
        longitude: -78.506442,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 35,
      },

      {
        id: '2.9',
        name: 'CASA DIEGO',
        description: 'Paradero 3',
        arrivalTime: arrivalTimes[5],
        estimatedTime: '',
        duration: '',
        icon: 'location',
        latitude: -7.151252,
        longitude: -78.501388,
        isActive: false,
        isCompleted: false,
        isSkipped: false,
        isIntermediate: true,
        radioGeocerca: 35,
      },
    ];
  } else {
    return [];
  }
};
