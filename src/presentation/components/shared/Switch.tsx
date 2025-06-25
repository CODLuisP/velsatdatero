import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Switch } from 'react-native-paper'; // O usa el Switch nativo

const SwitchButton = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View >
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isEnabled ? '#4CAF50' : '#F44336' }]} 
        onPress={toggleSwitch}
      >
        <Text style={styles.buttonText}>{isEnabled ? 'Encendido' : 'Apagado'}</Text>
        <Switch
          value={isEnabled}
          onValueChange={toggleSwitch}
          thumbColor={isEnabled ? '#e0e1dd' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#767577' }}
          style={styles.switch}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    width: 150, // Ancho fijo
    justifyContent: 'space-between', // Espacio entre texto y switch
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }], // Aumenta el tamaño del Switch
  },
});

export default SwitchButton;
