import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform} from 'react-native';
import GeocercaChecker from '../components/shared/GeocercaComponent';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

const App: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const radio = 25;

  const geocerca1 = {
    latitude: -7.148317,
    longitude: -78.52411,
  };

  const geocerca2 = {
    latitude: -7.149477,
    longitude: -78.512175,
  };

  const geocerca3 = {
    latitude: -7.15126,
    longitude: -78.506537,
  };

  const geocerca4 = {
    latitude: -7.158861,
    longitude: -78.506288,
  };

  const geocerca5 = {
    latitude: -7.165704,
    longitude: -78.502338,
  };

  const geocerca6 = {
    latitude: -7.165555,
    longitude: -78.496362,
  };

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

  // Obtener ubicación inicial rápida
  const getInitialLocation = async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      setError('Permisos de ubicación denegados');
      setLoading(false);
      return;
    }

    // Primero obtenemos una ubicación rápida (menos precisa)
    Geolocation.getCurrentPosition(
      position => {
        try {
          const {coords, timestamp} = position;
          
          // Validar que las coordenadas sean válidas
          if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
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
        console.log('Ubicación rápida falló, intentando con GPS...');
        startPreciseTracking();
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      },
    );

    // Después iniciamos el seguimiento preciso
    setTimeout(() => {
      startPreciseTracking();
    }, 1000);
  };

  // Inicializar seguimiento preciso
  const startPreciseTracking = async () => {
    try {
      const watchId = Geolocation.watchPosition(
        position => {
          try {
            const {coords, timestamp} = position;
            
            // Validar que las coordenadas sean válidas
            if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
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

  // Formatear fecha y hora
  const formatDateTime = (timestamp: number): string => {
    try {
      return new Date(timestamp).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  // Formatear coordenadas con más decimales
  const formatCoordinate = (coord: number): string => {
    try {
      return coord.toFixed(6);
    } catch {
      return '0.000000';
    }
  };

  // Efecto para inicializar el seguimiento
  useEffect(() => {
    getInitialLocation();

    // Limpiar el watcher cuando el componente se desmonte
    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Función para renderizar el contenido de ubicación
  const renderLocationContent = () => {
    if (!location) return null;

    return (
      <>
        <View style={styles.locationContainer}>
          <View style={styles.coordinateCard}>
            <Text style={styles.cardTitle}>🌍 Coordenadas</Text>

            <View style={styles.coordRow}>
              <Text style={styles.coordLabel}>Latitud:</Text>
              <Text style={styles.coordValue}>
                {formatCoordinate(location.latitude)}°
              </Text>
            </View>

            <View style={styles.coordRow}>
              <Text style={styles.coordLabel}>Longitud:</Text>
              <Text style={styles.coordValue}>
                {formatCoordinate(location.longitude)}°
              </Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>📊 Detalles</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Precisión:</Text>
              <Text style={styles.detailValue}>
                ±{location.accuracy.toFixed(1)} metros
              </Text>
            </View>

            {location.altitude !== null && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Altitud:</Text>
                <Text style={styles.detailValue}>
                  {location.altitude.toFixed(1)} m
                </Text>
              </View>
            )}

            {location.speed !== null && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Velocidad:</Text>
                <Text style={styles.detailValue}>
                  {(location.speed * 3.6).toFixed(1)} km/h
                </Text>
              </View>
            )}

            {location.heading !== null &&
              location.speed !== null &&
              location.speed >= 0.277 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dirección:</Text>
                  <Text style={styles.detailValue}>
                    {location.heading.toFixed(0)}°
                  </Text>
                </View>
              )}
          </View>

          <View style={styles.timestampCard}>
            <Text style={styles.cardTitle}>🕐 Última Actualización</Text>
            <Text style={styles.timestampText}>
              {formatDateTime(location.timestamp)}
            </Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {loading ? 'Mejorando precisión...' : 'Actualizando en tiempo real'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.geocercasContainer}>
          <GeocercaChecker
            latitude={location.latitude}
            longitude={location.longitude}
            centroGeocerca={geocerca1}
            radioGeocerca={radio}
            titulo="METRO CAJAMARCA"
          />

          <GeocercaChecker
            latitude={location.latitude}
            longitude={location.longitude}
            centroGeocerca={geocerca2}
            radioGeocerca={radio}
            titulo="LOS CIPRESES"
          />

          <GeocercaChecker
            latitude={location.latitude}
            longitude={location.longitude}
            centroGeocerca={geocerca3}
            radioGeocerca={radio}
            titulo="UPN (SEMÁFORO)"
          />

          <GeocercaChecker
            latitude={location.latitude}
            longitude={location.longitude}
            centroGeocerca={geocerca4}
            radioGeocerca={radio}
            titulo="GRIFO ROYAL"
          />

          <GeocercaChecker
            latitude={location.latitude}
            longitude={location.longitude}
            centroGeocerca={geocerca5}
            radioGeocerca={radio}
            titulo="ÓVALO MUSICAL"
          />
          
          <GeocercaChecker
            latitude={location.latitude}
            longitude={location.longitude}
            centroGeocerca={geocerca6}
            radioGeocerca={radio}
            titulo="UNC"
          />
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />

      <View style={styles.header}>
        <Text style={styles.title}>Ubicación en Tiempo Real</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
            <Text style={styles.loadingSubtext}>
              {location ? 'Mejorando precisión...' : 'Conectando con GPS...'}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#1a659e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
    marginBottom: 80,
    marginTop: 20,
  },
  coordinateCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timestampCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusCard: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  coordLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  coordValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timestampText: {
    fontSize: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
});

export default App;