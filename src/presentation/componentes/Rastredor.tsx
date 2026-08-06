import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform} from 'react-native';
import BusRouteScreen from './BusRouteScreen';
import {IonIcon} from '../components/shared/IonIcon';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
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

interface RastreadorType {
  codruta: string;
  logurb: ControlData[];
  codasig: string;
  fechaini: string;
  androidID: string;
  deviceID: string;
  fecreg: string;
  codconductor: string;
}

const App: React.FC<RastreadorType> = ({
  codruta,
  logurb,
  codasig,
  fechaini,
  androidID,
  deviceID,
  codconductor,
  fecreg,
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message:
              'Esta aplicación necesita acceso a tu ubicación para mostrar tu posición actual.',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getInitialLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      setError('Permisos de ubicación denegados');
      setLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        try {
          const {coords, timestamp} = position;

          if (
            coords &&
            typeof coords.latitude === 'number' &&
            typeof coords.longitude === 'number'
          ) {
            const newLocation: LocationData = {
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy || 0,
              altitude: coords.altitude || null,
              heading: coords.heading || null,
              speed: coords.speed || null,
              timestamp: timestamp || Date.now(),
            };

            setLocation(newLocation);
            setLoading(false);
            setError(null);
          } else {
            throw new Error('Coordenadas inválidas');
          }
        } catch (err) {
          console.error('Error procesando ubicación:', err);
          startPreciseTracking();
        }
      },
      error => {
        startPreciseTracking();
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      },
    );

    setTimeout(() => {
      startPreciseTracking();
    }, 1000);
  };

  const startPreciseTracking = async () => {
    try {
      const watchId = Geolocation.watchPosition(
        position => {
          try {
            const {coords, timestamp} = position;

            if (
              coords &&
              typeof coords.latitude === 'number' &&
              typeof coords.longitude === 'number'
            ) {
              const newLocation: LocationData = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy || 0,
                altitude: coords.altitude || null,
                heading: coords.heading || null,
                speed: coords.speed || null,
                timestamp: timestamp || Date.now(),
              };

              setLocation(newLocation);
              setLoading(false);
              setError(null);
            }
          } catch (err) {
            console.error('Error procesando ubicación precisa:', err);
          }
        },
        error => {
          console.error('Error de ubicación:', error);
          if (!location) {
            setError(`Error: ${error.message || 'Error desconocido'}`);
            setLoading(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
          distanceFilter: 2,
        },
      );

      setWatchId(watchId);
    } catch (err) {
      console.error('Error iniciando seguimiento:', err);
      setError('Error iniciando seguimiento de ubicación');
      setLoading(false);
    }
  };

  useEffect(() => {
    getInitialLocation();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const renderLocationContent = () => {
    if (!location) return null;

    return (
      <>
        <View style={styles.geocercasContainer}>
          <BusRouteScreen
            key={codruta}
            currentLatitude={location.latitude}
            currentLongitude={location.longitude}
            codruta={codruta}
            codasig={codasig}
            logurb={logurb}
            fechaini={fechaini}
            androidID={androidID}
            deviceID={deviceID}
            codconductor={codconductor}
            fecreg={fecreg}
            scrollViewRef={scrollViewRef}
          />
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <ScrollView
        ref={scrollViewRef} //Autoscroll
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.locationIconCircle}>
              <IonIcon name="location-sharp" size={38} color="#003f88" />
            </View>

            <ActivityIndicator
              size="large"
              color="#003f88"
              style={styles.activityIndicator}
            />

            <Text style={styles.loadingText}>
              {location
                ? 'Mejorando precisión...'
                : 'Obteniendo ubicación...'}
            </Text>

            <Text style={styles.loadingSubtext}>
              {location
                ? 'Calibrando GPS para mayor exactitud'
                : 'Conectando con satélites GPS'}
            </Text>

            <View style={styles.gpsStatusContainer}>
              <View style={styles.gpsStatusDot} />
              <Text style={styles.gpsStatusText}>GPS Activo</Text>
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {renderLocationContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingVertical: 0,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 350,
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    marginTop: 0,
  },
  locationIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#e8eef5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#003f88',
    marginBottom: 20,
  },
  activityIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#003f88',
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 6,
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 20,
  },
  gpsStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8eef5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#003f88',
  },
  gpsStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#003f88',
    marginRight: 8,
  },
  gpsStatusText: {
    fontSize: 13,
    color: '#003f88',
    fontWeight: '600',
  },

  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '500',
  },
  locationContainer: {
    gap: 15,
  },
  geocercasContainer: {
    flex: 1,
  },
});

export default App;
