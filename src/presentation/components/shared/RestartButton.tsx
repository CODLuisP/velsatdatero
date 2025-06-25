import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import RNRestart from 'react-native-restart';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RestartButton = () => {
  const handleRestart = () => {
    RNRestart.Restart();
  };

  return (
    <TouchableOpacity onPress={handleRestart}>
      <View style={styles.rectangle}>
        <Ionicons name="power" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.textInside}>Reiniciar</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rectangle: {
    backgroundColor: '#d62839', 
    width: 140,
    height: 45,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  textInside: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RestartButton;
