import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ayman.playtorrio',
  appName: 'PlayTorrio',
  webDir: 'public',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#120a1f',
      androidSplashResourceName: 'splash',
      showSpinner: true,
      spinnerColor: '#a855f7'
    }
  }
};

export default config;
