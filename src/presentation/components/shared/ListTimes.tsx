import React from 'react';
import {Text, StyleSheet, Pressable, View} from 'react-native';
import {globalStyles} from '../../theme/styles';
import {IonIcon} from './IonIcon';

interface Props {
  value: string;
  geoact?: string;
  diff: number;
  isCurrent?: boolean;
  onPress?: () => void;
}

export const ListTimes = ({value, geoact, diff, isCurrent, onPress}: Props) => {
  return (
    <Pressable
      style={[globalStyles.containerTimes, isCurrent && styles.currentItem]}
      onPress={isCurrent ? undefined : onPress}>
      <Text
        style={[
          globalStyles.valueTimes,
          {fontSize: isCurrent ? 26 : 20},
          isCurrent && {color: '#fff'},
        ]}>
        {value}
      </Text>
      {!isCurrent && geoact && (
        <Text style={globalStyles.valueTimesControl}>{geoact}</Text>
      )}

      {!isCurrent && <Text style={globalStyles.valueTimesDiff}>{diff}</Text>}

      {!isCurrent && (
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 999, 
            padding: 6,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <IonIcon name="location" size={24} color="#003566" />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  currentItem: {
    backgroundColor: '#dc2626',
    fontSize: 80,
  },
});
