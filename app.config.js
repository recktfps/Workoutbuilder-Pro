export default {
  name: "WorkoutBuilder Pro",
  slug: "workoutbuilder-pro",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  scheme: "workoutbuilder",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0F0F1E"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.workoutbuilder.pro",
    infoPlist: {
      UIBackgroundModes: ["fetch"]
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0F0F1E"
    },
    package: "com.workoutbuilder.pro"
  },
  plugins: [
    "expo-router",
    [
      "expo-sqlite",
      {
        enableFTS: true
      }
    ],
    "expo-asset",
    "expo-font"
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "your-project-id"
    }
  }
};

