import {NativeModules} from 'react-native';

const {AppRestart} = NativeModules as {
  AppRestart: {restart(): void};
};

export function restart(): void {
  AppRestart.restart();
}
