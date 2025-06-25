import { getDistance } from 'geolib';
import * as turf from '@turf/turf';


interface Vehicle {
  deviceID: string;
  lastValidLatitude: number;
  lastValidLongitude: number;
  lastValidSpeed: number;
  direccion: string;
}

const geocercaOne = turf.polygon([[
  [-77.119612, -12.063256], 
  [-77.10320485760168, -12.062187483161281], 
  [-77.103686, -12.085317],
  [-77.123571, -12.074871], 
  [-77.119612, -12.063256], 
]]);

const geocercaTwo = turf.polygon([[
  [-77.064769, -12.063818],
  [-77.037979, -12.062651], 
  [-77.048257, -12.078347],
  [-77.074629, -12.077401], 
  [-77.064769, -12.063818], 
]]);

//NUEVA
const geocercaThree = turf.polygon([[ 
  [-77.080662, -12.059805],
  [-77.073899, -12.059043], 
  [-77.07386, -12.074222],
  [-77.080858, -12.074126], 
  [-77.080662, -12.059805], 
]]);

export const verificarVehiculosEnGeocerca = async (rutaId: number) => {
  try {
    const response = await fetch(`https://velsat.pe:8585/api/Datero/ruta/${rutaId}`
);
    if (!response.ok) {
      throw new Error('Error al obtener datos de la API');
    }

    const vehicles: Vehicle[] = await response.json();

    const resultados = vehicles.map(vehicle => {
      const vehiclePoint = turf.point([vehicle.lastValidLongitude, vehicle.lastValidLatitude]);


      const isInsideGeocercaOne = turf.booleanPointInPolygon(vehiclePoint, geocercaOne);

      const isInsideGeocercaTwo = turf.booleanPointInPolygon(vehiclePoint, geocercaTwo);

      const isInsideGeocercaThree = turf.booleanPointInPolygon(vehiclePoint, geocercaThree); // ← NUEVA

      return {
        deviceID: vehicle.deviceID,
        isInsideGeocercaOne, 
        isInsideGeocercaTwo,  
        isInsideGeocercaThree    
      };
    });

    return resultados; 
  } catch (error) {
    console.error('Error al verificar vehículos en la geocerca:', error);
    return [];
  }
};


export const calcularDistancias = async (rutaId: number) => {
  const puntoINTERMEDIO_ONE = { latitude: -12.063198, longitude: -77.104613 };
  const puntoINTERMEDIO_TWO = { latitude: -12.064717, longitude: -77.040597 };
  const puntoINTERMEDIO_THREE = { latitude: -12.07055, longitude: -77.077941};

  const fixedPoint = { latitude: -12.182918, longitude: -76.955801 };

  try {
   
    const geofenceResults = await verificarVehiculosEnGeocerca(rutaId);

    const response = await fetch(`https://velsat.pe:8585/api/Datero/ruta/${rutaId}`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de la API');
    }

    const vehicles: Vehicle[] = await response.json();

    const distances = vehicles.map((vehicle) => {
      const vehicleLocation = {
        latitude: vehicle.lastValidLatitude,
        longitude: vehicle.lastValidLongitude,
      };

    
      const isInsideGeocercaOne = geofenceResults.some(
        (result) => result.deviceID === vehicle.deviceID && result.isInsideGeocercaOne
      );

      const isInsideGeocercaTwo = geofenceResults.some(
        (result) => result.deviceID === vehicle.deviceID && result.isInsideGeocercaTwo
      );

      const isInsideGeocercaThree = geofenceResults.some(
        (result) => result.deviceID === vehicle.deviceID && result.isInsideGeocercaThree
      );

      let totalDistance = 0;

 
      if (isInsideGeocercaOne) {
        const distanceToIntermediate = getDistance(vehicleLocation, puntoINTERMEDIO_ONE) / 1000;
        const distanceToFixed = getDistance(puntoINTERMEDIO_ONE, fixedPoint) / 1000;
        totalDistance = distanceToIntermediate + distanceToFixed;
      } else if (isInsideGeocercaTwo) {
        const distanceToIntermediate = getDistance(vehicleLocation, puntoINTERMEDIO_TWO) / 1000;
        const distanceToFixed = getDistance(puntoINTERMEDIO_TWO, fixedPoint) / 1000;
        totalDistance = distanceToIntermediate + distanceToFixed;
      } else if (isInsideGeocercaThree) {
        const distanceToIntermediate = getDistance(vehicleLocation, puntoINTERMEDIO_THREE) / 1000;
        const distanceToFixed = getDistance(puntoINTERMEDIO_THREE, fixedPoint) / 1000;
        totalDistance = distanceToIntermediate + distanceToFixed;
      } else {
        totalDistance = getDistance(vehicleLocation, fixedPoint) / 1000;
      }

      return {
        deviceID: vehicle.deviceID,
        distance: parseFloat(totalDistance.toFixed(2)),
        lastValidLatitude: vehicle.lastValidLatitude,
        lastValidLongitude: vehicle.lastValidLongitude,
        lastValidSpeed: vehicle.lastValidSpeed,
        direccion: vehicle.direccion,
      };
    });

    distances.sort((a, b) => a.distance - b.distance);

    return distances;
  } catch (error) {
    console.error('Error al calcular distancias:', error);
    return [];
  }
};


export const calcularDistanciasVuelta = async (rutaId: number) => {
  const fixedPointVuelta = { latitude: -12.072085, longitude: -77.114060 };


  try {
    const response = await fetch(`https://velsat.pe:8585/api/Datero/ruta/${rutaId}`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de la API');
    }
    
    const vehicles: Vehicle[] = await response.json();

    const distances = vehicles.map(vehicle => {
      const vehicleLocation = {
        latitude: vehicle.lastValidLatitude,
        longitude: vehicle.lastValidLongitude
      };

      const distance = getDistance(fixedPointVuelta, vehicleLocation) / 1000; 
      return {
        deviceID: vehicle.deviceID,
        distance: parseFloat(distance.toFixed(2)),
        lastValidLatitude: vehicle.lastValidLatitude,
        lastValidLongitude: vehicle.lastValidLongitude,
        lastValidSpeed: vehicle.lastValidSpeed,
        direccion: vehicle.direccion,
      };
    });

    distances.sort((a, b) => a.distance - b.distance);

    return distances;
  } catch (error) {
    console.error('Error al obtener datos de la API:', error);
    return [];
  }
};




// export const verificarPuntoEnGeocerca = async () => {
//     const point = turf.point([-77.104613, -12.063198]); 

//     const geocercaOne = turf.polygon([[
//       [-77.1112909105577, -12.06270505028138], 
//       [-77.10320485760168, -12.062187483161281], 
//       [-77.10441892728863, -12.077893496555674],
//       [-77.11039890338853, -12.076280118080746], 
//       [-77.1112909105577, -12.06270505028138], 
//     ]]);

//       const isInside = turf.booleanPointInPolygon(point, geocercaOne);
      
//       return isInside;

// }
