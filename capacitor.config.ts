import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.qwqlang465.ql",
  appName: "QL",
  webDir: "dist",
  server: {
    androidScheme: "https",
    hostname: "ql.localhost",
  },
};

export default config;
