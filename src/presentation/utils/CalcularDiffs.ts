
import { calculateMeetingTime } from './CalcularTiempo';

interface LogData {
    deviceID: string;
    lastValidLatitude: number;
    lastValidLongitude: number;
    lastValidSpeed: number;
    direccion: string;
    diff: number;
  }

export const processRightData = (rightData: LogData[], placa: string): LogData[] => {
  const dataRightRef = [...rightData];
  const targetIndex = dataRightRef.findIndex(item => item.deviceID === placa);

  if (targetIndex !== -1) {
    dataRightRef[targetIndex].diff = 0;

    for (let i = targetIndex - 1; i >= 0; i--) {
      const currentCar = {
        latitude: dataRightRef[i].lastValidLatitude,
        longitude: dataRightRef[i].lastValidLongitude,
        speed: dataRightRef[i].lastValidSpeed,
      };

      const nextCar = {
        latitude: dataRightRef[i + 1].lastValidLatitude,
        longitude: dataRightRef[i + 1].lastValidLongitude,
        speed: dataRightRef[i + 1].lastValidSpeed,
      };

      const meetingTime = calculateMeetingTime(currentCar, nextCar);
      dataRightRef[i].diff = Math.round(meetingTime);
    }

    for (let i = targetIndex + 1; i < dataRightRef.length; i++) {
      const currentCar = {
        latitude: dataRightRef[i].lastValidLatitude,
        longitude: dataRightRef[i].lastValidLongitude,
        speed: dataRightRef[i].lastValidSpeed,
      };

      const previousCar = {
        latitude: dataRightRef[i - 1].lastValidLatitude,
        longitude: dataRightRef[i - 1].lastValidLongitude,
        speed: dataRightRef[i - 1].lastValidSpeed,
      };

      const meetingTime = calculateMeetingTime(currentCar, previousCar);
      dataRightRef[i].diff = Math.round(meetingTime);
    }
  }

  return dataRightRef;
};
