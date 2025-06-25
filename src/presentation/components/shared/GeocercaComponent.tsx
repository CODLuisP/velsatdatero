import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {isPointWithinRadius} from 'geolib';

type LatLng = {
  latitude: number;
  longitude: number;
};

type Props = {
  latitude: number;
  longitude: number;
  centroGeocerca: LatLng;
  radioGeocerca: number;
  titulo: string; 
};

const GeocercaChecker: React.FC<Props> = ({
  latitude,
  longitude,
  centroGeocerca,
  radioGeocerca,
  titulo,
}) => {
  const [dentroGeocerca, setDentroGeocerca] = useState(false);
  const [horaIngreso, setHoraIngreso] = useState<string | null>(null);
  const [llego, setLlego] = useState(false);  // <-- nuevo estado para bloqueo

  useEffect(() => {
    if (llego) return; // si ya llegó, no hacer nada más

    const estaDentro = isPointWithinRadius(
      { latitude, longitude },
      centroGeocerca,
      radioGeocerca
    );

    if (estaDentro && !dentroGeocerca) {
      const ahora = new Date();
      setHoraIngreso(ahora.toLocaleTimeString());
      setLlego(true); // marcar que ya llegó, para no actualizar más
      setDentroGeocerca(true);
    } else if (!estaDentro && dentroGeocerca) {
      // Sólo actualizar estado si no llegó antes
      setDentroGeocerca(false);
      setHoraIngreso(null);
    }
  }, [latitude, longitude, centroGeocerca, radioGeocerca, llego, dentroGeocerca]);

  // render igual
  return (
    <View
      style={{
        padding: 10,
        backgroundColor: dentroGeocerca ? '#e0ffe0' : '#ffe0e0',
        borderColor: dentroGeocerca ? 'green' : 'red',
        borderWidth: 1,
        borderRadius: 6,
        marginTop: 8,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{titulo}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: dentroGeocerca ? 'green' : 'red',
          marginBottom: 4,
        }}
      >
        {dentroGeocerca ? '✅ Dentro de la geocerca' : '❌ Fuera de la geocerca'}
      </Text>
      <Text style={{ fontSize: 12 }}>
        {horaIngreso ? `Fecha y hora de ingreso: ${horaIngreso}` : 'Fecha aún no llega'}
      </Text>
    </View>
  );
};


export default GeocercaChecker;
