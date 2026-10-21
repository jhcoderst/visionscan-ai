import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jhcoderst.visionscanai',
  appName: 'VisionScan AI',
  webDir: 'public',
  bundledWebRuntime: false,
  server: {
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['CAMERA']
    }
  }
};

export default config;
