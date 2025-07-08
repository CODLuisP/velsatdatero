type CarData = {
    latitude: number;
    longitude: number;
    speed: number;
  };
  
  /**
   * Calcula el tiempo en minutos que se tardan dos carros en encontrarse.
   * @param car1 Datos del primer carro (latitud, longitud y velocidad).
   * @param car2 Datos del segundo carro (latitud, longitud y velocidad).
   * @returns Tiempo en minutos que tardan en encontrarse.
   */
  export const calculateMeetingTime = (car1: CarData, car2: CarData): number => {
    const EARTH_RADIUS_KM = 6371;
  
    const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
  
    const lat1 = toRadians(car1.latitude);
    const lon1 = toRadians(car1.longitude);
    const lat2 = toRadians(car2.latitude);
    const lon2 = toRadians(car2.longitude);
  
    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;
  
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS_KM * c;
  
    // let relativeSpeed = Math.abs(car1.speed - car2.speed);
    let relativeSpeed = 12;

    if (distance < 0.1) {
      return 1;
    }
  
    const timeInHours = distance / relativeSpeed;
  
    const timeInMinutes = timeInHours * 60;
    return timeInMinutes;
  };