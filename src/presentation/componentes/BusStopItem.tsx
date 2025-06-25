import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {isPointWithinRadius} from 'geolib';
import {IonIcon} from '../components/shared/IonIcon';
import moment from 'moment';

interface BusStopItemProps {
  id: string;
  name: string;
  description: string;
  arrivalTime: string;
  estimatedTime: string;
  actualTime?: string;
  duration: string;
  icon: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isTerminal?: boolean;
  isIntermediate?: boolean;
  // Props para geocerca - coordenadas de la parada
  latitude: number;
  longitude: number;
  // Ubicación actual del bus
  currentLatitude: number;
  currentLongitude: number;
  radioGeocerca: number;
  onStopCompleted?: (stopId: string, horaLlegada: string) => void;
}

const BusStopItem: React.FC<BusStopItemProps> = ({
  id,
  name,
  description,
  arrivalTime,
  estimatedTime,
  actualTime,
  duration,
  icon,
  isActive = false,
  isCompleted = false,
  isTerminal = false,
  isIntermediate = false,
  latitude,
  longitude,
  currentLatitude,
  currentLongitude,
  radioGeocerca,
  onStopCompleted,
}) => {
  const [dentroGeocerca, setDentroGeocerca] = useState(false);
  const [horaIngreso, setHoraIngreso] = useState<string | null>(null);
  const [llego, setLlego] = useState(isCompleted);

  useEffect(() => {
    if (!isActive || llego) return;

    const estaDentro = isPointWithinRadius(
      {latitude: currentLatitude, longitude: currentLongitude},
      {latitude, longitude},
      radioGeocerca,
    );

    if (estaDentro && !dentroGeocerca) {
      const ahora = new Date();
const horaLlegada = moment().tz('America/Lima').format('HH:mm:ss');
      setHoraIngreso(horaLlegada);
      setLlego(true);
      setDentroGeocerca(true);

      if (onStopCompleted) {
        onStopCompleted(id, horaLlegada);
      }
    } else if (!estaDentro && dentroGeocerca && !llego) {
      setDentroGeocerca(false);
      setHoraIngreso(null);
    }
  }, [
    currentLatitude,
    currentLongitude,
    latitude,
    longitude,
    radioGeocerca,
    isActive,
    llego,
    dentroGeocerca,
    id,
    onStopCompleted,
  ]);

  const renderTimeColumns = () => {
    if (isActive) {
      return (
        <>
          <View style={styles.timeColumn}>
            <Text style={[styles.timeValue, styles.activeTimeValue]}>
              {arrivalTime}
            </Text>
          </View>

          <View
            style={[styles.verticalDivider, styles.activeVerticalDivider]}
          />

          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>{duration}</Text>
          </View>
        </>
      );
    } else if (isCompleted || llego) {
      return (
        <>
          <View style={styles.timeColumn}>
            <Text style={styles.timeValue}>{arrivalTime}</Text>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.timeColumn}>
            <Text style={styles.timeValue}>{horaIngreso || actualTime}</Text>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.durationContainer}>
            <Text
              style={[
                styles.durationText,
                duration.includes('+') && styles.delayText,
              ]}>
              {duration}
            </Text>
          </View>
        </>
      );
    } else {
      return (
        <>
          <View style={styles.timeColumn}>
            <Text style={styles.timeValue}>{arrivalTime}</Text>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        </>
      );
    }
  };

  const currentIsCompleted = isCompleted || llego;

  return (
    <View
      style={[
        styles.stopContainer,
        isIntermediate && isCompleted
          ? styles.intermediateStopContainer
          : currentIsCompleted && styles.completedStopContainer,
        isActive && styles.activeStopContainer,
      ]}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconCircle,
            isActive
              ? styles.activeIconCircle
              : isIntermediate && currentIsCompleted
              ? styles.intermediateCompletedIconCircle
              : currentIsCompleted
              ? styles.completedIconCircle
              : null,
          ]}>
          <IonIcon
            name={icon}
            size={isActive ? 24 : 20}
            color={
              isActive
                ? '#fff'
                : currentIsCompleted
                ? '#fff'
                : isTerminal
                ? '#666'
                : '#666'
            }
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.stopInfo}>
          <Text
            style={[
              styles.stopName,
              isActive && styles.activeStopName,
              currentIsCompleted && styles.completedStopName,
              isIntermediate &&
                currentIsCompleted &&
                styles.intermediateCompletedStopName,
            ]}>
            {name}
          </Text>

          <Text
            style={[
              styles.stopDescription,
              isActive && styles.activeStopDescription,
              currentIsCompleted && styles.completedStopDescription,
            ]}>
            {description}
          </Text>
        </View>

        <View
          style={[
            styles.verticalDivider,
            isActive && styles.activeVerticalDivider,
          ]}
        />

        {renderTimeColumns()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stopContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 5,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeStopContainer: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: 8,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  completedStopContainer: {
    backgroundColor: '#f1f8e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  iconContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconCircle: {
    backgroundColor: '#f44336',
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#f44336',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  completedIconCircle: {
    backgroundColor: '#4caf50',
  },
  terminalIconCircle: {
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 0,
  },
  activeStopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d32f2f',
    letterSpacing: 0.5,
  },
  completedStopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  stopDescription: {
    fontSize: 14,
    color: '#666',
  },
  activeStopDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#c62828',
  },
  completedStopDescription: {
    fontSize: 14,
    color: '#212529',
  },
  verticalDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  activeVerticalDivider: {
    backgroundColor: '#f44336',
    width: 2,
  },
  timeColumn: {
    alignItems: 'center',
    minWidth: 50,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activeTimeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d32f2f',
    textShadowColor: 'rgba(212, 47, 47, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  activeTag: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    shadowColor: '#f44336',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTagText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  durationContainer: {
    alignItems: 'center',
    marginLeft: 8,
    minWidth: 50,
  },
  durationText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  delayText: {
    color: '#f44336',
    fontWeight: '600',
  },
  intermediateStopContainer: {
    backgroundColor: '#e9c46a',
  },
  intermediateCompletedIconCircle: {
    backgroundColor: '#fb8500',
  },

  intermediateCompletedStopName: {
    color: '#023047',
  },
});

export default BusStopItem;
