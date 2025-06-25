import Icon from 'react-native-vector-icons/Ionicons';
import { StyleProp, TextStyle, ViewStyle, GestureResponderEvent } from 'react-native';


interface Props {
  size?: number;
  name: string;
  color?: string;
  style?: StyleProp<ViewStyle | TextStyle>;
  onPress?: (event: GestureResponderEvent) => void; 
}

export const IonIcon = ({name, size, color = '#000000', style, onPress}: Props) => {
  return <Icon name={name} size={size} color={color} style={style} onPress={onPress} />;
};
