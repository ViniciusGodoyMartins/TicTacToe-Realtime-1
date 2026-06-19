import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Jogo da Velha",
  slug: "tictactoe-realtime",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash.png",
    backgroundColor: "#0a0a0f"
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.yourname.tictactoe"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0a0a0f"
    },
    package: "com.yourname.tictactoe"
  },
  plugins: [
    "expo-router"
  ],
  scheme: "tictactoe"
});
