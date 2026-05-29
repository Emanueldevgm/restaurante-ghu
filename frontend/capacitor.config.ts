import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.restaurante.ghu',
  appName: 'Restaurante GHU',
  webDir: 'dist',
  server: {
    // Em produção, usa o URL da Vercel
    url: 'https://restaurante-ghu.vercel.app',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;