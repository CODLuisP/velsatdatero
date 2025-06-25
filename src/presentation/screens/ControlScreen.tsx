import React, {useEffect, useState} from 'react';
import {
  Alert,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {Button, Dialog, Portal, Text, TextInput} from 'react-native-paper';
import {globalStyles} from '../theme/styles';
import {IonIcon} from '../components/shared/IonIcon';
import {useNavigation} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppContext} from '../../context/VelocidadContext';
import RestartButton from '../components/shared/RestartButton';
import DeviceInfo from 'react-native-device-info';

type DrawerParamList = {
  Control: undefined;
  'RUTA BUS': {
    codigo: string;
    fechaini: string;
    fechafin: string;
    codruta: string;
    isruta: string;
    deviceID: string;
    androidID: string;
    fecreg:string;
    codconductor:string;
    placa: string;
    logurb?: {
      codasig: string;
      deviceid: string;
      nom_control: string;
      hora_estimada: string;
      hora_llegada: string;
      volado: string;
      fecha: string;
    }[];
  };
};

type AutoCompleteComponentProps = {};

export const ControlScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [textPlaca, setTextPlaca] = React.useState('');
  const [textUsuario, setTextUsuario] = React.useState('transporvilla');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState('');

  const [deviceIDs, setDeviceIDs] = useState<string[]>([]);

  const [filteredData, setFilteredData] = useState<string[]>([]);

  const { setVelocidad } = useAppContext();


  const pdfUrl =
    'https://docs.google.com/document/d/12qnoT9BXVNt6CiheZcqhiJleG_pV1JU50EUu9jNT4zg/edit?usp=sharing';
  const hideDialog = () => setDialogVisible(false);

  const [imeiDialogVisible, setImeiDialogVisible] = useState(false);
  const [imeiPlacaInput, setImeiPlacaInput] = useState('');
  const [imeiAndroidId, setImeiAndroidId] = useState('');

  const handleAsignarIMEI = async () => {
    try {
      const androidId = await DeviceInfo.getAndroidId();
      setImeiAndroidId(androidId);
      setImeiDialogVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener el ID del dispositivo');
    }
  };

const enviarAsignacionIMEI = async () => {
    if (!imeiPlacaInput || !imeiAndroidId) {
      Alert.alert('Error', 'Placa o Android ID no válidos.');
      return;
    }

    const payload = {
      placa: imeiPlacaInput.trim(),
      androidID: imeiAndroidId,
    };

    try {
      const response = await fetch(
        'https://velsat.pe:8585/api/Datero/asignar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      const mensaje = data?.mensaje?.toLowerCase() ?? '';

      if (mensaje.includes('ya tiene un id asignado')) {
        Alert.alert('Advertencia', data.mensaje);
      } else if (mensaje.includes('no existe en la tabla')) {
        Alert.alert('Error', data.mensaje);
      } else if (mensaje.includes('id asignado correctamente')) {
        Alert.alert('Éxito', data.mensaje);
        setImeiDialogVisible(false);
        setImeiPlacaInput('');
      } else {
        Alert.alert('Respuesta desconocida', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error en la asignación de IMEI:', error);
      Alert.alert('Error', 'Hubo un problema al enviar los datos.');
    }
  };

  useEffect(() => {
    const loadSavedPlaca = async () => {
      try {
        const savedPlaca = await AsyncStorage.getItem('savedPlaca');
        if (savedPlaca) {
          setTextPlaca(savedPlaca);
        }
      } catch (error) {
        console.error('Error loading saved placa:', error);
      }
    };

    loadSavedPlaca();
    fetchDeviceIDs();
  }, []);

  const handleNavigation = async () => {
    if (textPlaca.trim() === '') {
      setError('Se necesita llenar este campo');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const androidId = await DeviceInfo.getAndroidId();
      console.log('ANDROID_ID:', androidId);

      const placaUrl = `https://velsat.pe:8585/api/Datero/urbano/${textPlaca}`;
      const response = await fetch(placaUrl);

      if (response.status === 204) {
        Alert.alert('Aviso', 'Unidad sin despacho');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 404) {
          setDialogMessage(
            'La placa ingresada por el usuario es incorrecta, vuelva a intentarlo.',
          );
        } else {
          setDialogMessage('Error al consultar la API');
        }
        setDialogVisible(true);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data?.isruta == '1') {
        const codigo = data.codigo.toString();

        const logUrl = `https://velsat.pe:8585/api/Datero/logurb/${codigo}`;
        const logResponse = await fetch(logUrl);
        let logData: any[] = [];

        if (logResponse.ok) {
          logData = await logResponse.json();
          console.warn('No se pudo obtener logurb data');
        }

        navigation.navigate('RUTA BUS', {
          codigo: codigo,
          fechaini: data.fechaini,
          fechafin: data.fechafin,
          codruta: data.codruta,
          deviceID: data.deviceID,
          isruta: data.isruta,
          androidID: data.androidID,
          placa: textPlaca,
          logurb: logData,
          fecreg:data.fecreg,
          codconductor:data.codconductor,
        });

        await AsyncStorage.setItem('placa', textPlaca);
      } else {
        Alert.alert('Aviso', 'Unidad sin despacho');
      }
    } catch (error) {
      console.error('Error al consultar la API:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceIDs = async () => {
    try {
      const response = await fetch(
        'https://velsat.pe:8585/api/Datero/devices/transporvilla',
      );
      if (!response.ok) {
        throw new Error('Error al obtener los device IDs');
      }
      const data = await response.json();
      const ids = data.map((item: {deviceID: string}) => item.deviceID);
      setDeviceIDs(ids);
    } catch (error) {
      console.error('Error fetching device IDs:', error);
    }
  };

  const handleTextChange = (text: string) => {
    setTextPlaca(text);
    if (text.length > 0) {
      const filtered = deviceIDs.filter(deviceID =>
        deviceID.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  };

  const handleSelect = async (deviceID: string) => {
    setTextPlaca(deviceID);
    setFilteredData([]);

    await AsyncStorage.setItem('savedPlaca', deviceID);
  };

  return (
    <View style={globalStyles.container}>
      <Portal>
        <Dialog
          visible={imeiDialogVisible}
          onDismiss={() => setImeiDialogVisible(false)}
          style={styles.dialogContainer}>
          <Dialog.Title style={styles.dialogTitle}>Asignar IMEI</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <View style={styles.androidIdContainer}>
              <Text style={styles.androidIdLabel}>Android ID:</Text>
              <Text style={styles.androidIdValue}>{imeiAndroidId}</Text>
            </View>
            <TextInput
              label="Placa"
              value={imeiPlacaInput}
              onChangeText={setImeiPlacaInput}
              mode="outlined"
              style={styles.textInput}
              theme={{
                colors: {
                  primary: '#003566',
                  outline: '#003566',
                },
              }}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => setImeiDialogVisible(false)}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonText}>
              Cancelar
            </Button>
            <Button
              onPress={enviarAsignacionIMEI}
              mode="contained"
              style={styles.confirmButton}
              labelStyle={styles.confirmButtonText}>
              Enviar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={{flexDirection: 'row', flex: 1}}>
        <View
          style={{
            width: '44%',
            justifyContent: 'space-between',
            paddingBottom: 5,
            paddingRight: 10,
          }}>
          <View style={{marginTop: 20}}>
            <Text style={globalStyles.tituloSide}>BIENVENIDO A</Text>
          </View>

          <Image
            source={require('../files/IMG/velsat.png')}
            style={{
              height: 105,
              width: 105,
              marginTop: 10,
              marginBottom: 10,
              alignSelf: 'center',
              borderRadius: 10,
            }}
          />

          <Button
            mode="contained"
            style={{
              marginTop: 8,
              borderRadius: 0,
              padding: 5,
              backgroundColor: '#113EB9',
              marginLeft: 10,
              marginRight: 10,
            }}
            labelStyle={{
              color: 'white',
            }}
            onPress={() => console.log('Pressed')}>
            Control
          </Button>

          <View style={globalStyles.containerControlText}>
            <Text style={globalStyles.version}>Versión 2.1</Text>
            <Text style={globalStyles.location}>Lima - Perú</Text>
            <Text style={globalStyles.copyright}>© 2025 VELSAT SAC</Text>
          </View>

          <View style={{padding: 5}}>
            <Button
              buttonColor="#FB7B0F"
              mode="contained"
              onPress={handleAsignarIMEI}
              style={{
                borderRadius: 0,
                padding: 2,
                marginLeft: 10,
                marginRight: 10,
              }}>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{marginRight: 10, color: '#FFF', fontWeight: 'bold'}}>
                  Asignar IMEI
                </Text>
                <IonIcon name="barcode" size={20} color="#fff" />
              </View>
            </Button>
          </View>
        </View>

        <View
          style={{
            width: 1,
            height: '100%',
            backgroundColor: '#e0e1dd',
          }}
        />

        <View
          style={{
            width: '56%',
            justifyContent: 'space-between',
            padding: 10,
            paddingLeft: 15,
            paddingRight: 10,
          }}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
                alignItems: 'center',
                gap: 12,
                paddingTop: 10,
                paddingBottom: 10,
                justifyContent: 'center',
                marginBottom: 8,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  color: '#003f88',
                  fontWeight: '800',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                DATOS GENERALES
              </Text>
              <IonIcon
                size={22}
                name="bus"
                color="#003f88"
                style={{
                  backgroundColor: 'rgba(0, 63, 136, 0.1)',
                  borderRadius: 20,
                  padding: 8,
                }}
              />
            </View>

            <View style={globalStyles.control}>
              <Text
                style={{
                  color: '#003566',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                Placa Vehicular :
              </Text>
              <TextInput
                value={textPlaca}
                onChangeText={handleTextChange}
                mode="outlined"
                outlineColor="#0d47a1"
                activeOutlineColor="#0d47a1"
                style={{backgroundColor: '#f8f9fa', height: 40}}
                textColor="#212529"
              />
              {error ? (
                <Text style={{color: 'red', marginTop: 0}}>{error}</Text>
              ) : null}

              {filteredData.length > 0 && (
                <FlatList
                  data={filteredData}
                  keyExtractor={item => item}
                  renderItem={({item}) => (
                    <TouchableOpacity onPress={() => handleSelect(item)}>
                      <Text style={styles.suggestion}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsContainer}
                />
              )}

              <Text
                style={{
                  color: '#003566',
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginTop: 10,
                }}>
                Usuario:
              </Text>
              <TextInput
                value={textUsuario}
                onChangeText={setTextUsuario}
                mode="outlined"
                editable={false}
                outlineColor="#0d47a1"
                activeOutlineColor="#0d47a1"
                style={{backgroundColor: '#dee2e6', height: 40}}
                textColor="#212529"
              />
            </View>
          </View>

          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
            <Button
              mode="contained"
              buttonColor={loading ? '#e6a000' : '#ffb703'} // Color más oscuro cuando carga
              textColor="#212529"
              onPress={!loading ? handleNavigation : undefined}
              style={{
                borderRadius: 0,
                paddingVertical: 2,
                paddingHorizontal: 12,
                width: 200,
                justifyContent: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {loading && (
                  <ActivityIndicator color="#212529" style={{marginRight: 5}} />
                )}
                <Text
                  style={{color: '#212529', fontWeight: 'bold', fontSize: 16}}>
                  {loading ? 'Cargando...' : 'Mostrar Ruta'}
                </Text>
                {!loading && (
                  <IonIcon
                    name="map"
                    color="#212529"
                    size={20}
                    style={{marginLeft: 5}}
                  />
                )}
              </View>
            </Button>

            <View style={{marginLeft: 10}}>
              <RestartButton />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#0d47a1',
    padding: 10,
    borderRadius: 5,
  },
  suggestionsContainer: {
    backgroundColor: '#f0f0f0',
    marginTop: 5,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#0d3b66',
    backgroundColor: '#ced4da',
  },

  dialogContainer: {
    alignSelf: 'center',
    width: '70%',
    borderRadius: 0,
    backgroundColor: '#ffffff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  dialogTitle: {
    color: '#003566',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 4,
  },
  dialogContent: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  androidIdContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 0,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#003566',
  },
  androidIdLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 0,
  },
  androidIdValue: {
    fontSize: 16,
    color: '#003566',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  textInput: {
    backgroundColor: '#ffffff',
    marginTop: 0,
  },
  dialogActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    backgroundColor: '#c1121f',
    borderRadius: 8,
  },
    cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#003566',
    borderRadius: 8,
    elevation: 2,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
