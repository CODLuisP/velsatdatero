import { useEffect, useRef } from 'react';
import { Alert, BackHandler } from 'react-native';

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000; // 4 horas
const FIVE_MINUTES_MS = 5 * 60 * 1000;    // 5 minutos

export function UsageMonitor() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const showAlert = () => {
      Alert.alert(
        '¿Sigues ahí?',
        'Por favor confirma si sigues usando la app.',
        [
          {
            text: 'Cancelar',
            onPress: () => {
              BackHandler.exitApp();
            },
            style: 'destructive',
          },
          {
            text: 'Confirmar',
            onPress: () => {
              resetTimer();
            },
            style: 'default',
          },
        ],
        { cancelable: false }
      );

      // Si no responde en 5 minutos, cerrar app
      alertTimeoutRef.current = setTimeout(() => {
        BackHandler.exitApp();
      }, FIVE_MINUTES_MS);
    };

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        showAlert();
      }, FOUR_HOURS_MS);
    };

    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);
}
