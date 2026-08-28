import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smarthome.app',
  appName: 'Smart Home App',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#1E1E2F'
    }
  }
};

export default config;
