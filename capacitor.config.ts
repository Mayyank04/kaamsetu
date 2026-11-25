/**
 * KAAMSETU — Capacitor Configuration for Android & iOS
 * Connects native mobile shells to the authoritative Next.js SSR deployment,
 * preserving Supabase SSR cookies, /api/* endpoints, and real-time voice/translation services,
 * with bundled offline shell fallback in ./mobile.
 */
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kaamsetu-neon.vercel.app";

const config = {
  appId: "in.kaamsetu.platform",
  appName: "KAAMSETU",
  webDir: "mobile",
  server: {
    url: appUrl,
    cleartext: appUrl.startsWith("http://localhost"),
    errorPath: "index.html",
    allowNavigation: [
      "kaamsetu-neon.vercel.app",
      "*.supabase.co",
    ],
  },
  android: {
    backgroundColor: "#F7F5F0",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    backgroundColor: "#F7F5F0",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "kaamsetu",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#153E35",
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: "#153E35",
      style: "LIGHT",
    },
  },
};

export default config;
