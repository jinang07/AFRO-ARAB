import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.afroarab.app',
  appName: 'Afro Arab',
  webDir: 'dist',
  server: {
    cleartext: true,
    androidScheme: 'http'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
