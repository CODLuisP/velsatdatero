declare module 'react-native-system-navigation-bar' {
  const SystemNavigationBar: {
    immersive: () => void;
    leanBack: () => void;
    stickyImmersive: () => void;
    setBarMode: (style: 'light' | 'dark', bar?: 'navigation' | 'status' | 'both') => void;
    fullScreen: (enable: boolean) => void;
    lowProfile: () => void;
  };
  export default SystemNavigationBar;
}
