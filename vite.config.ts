import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";

/**
 * The TV's browser engine has not been inspected yet. Keep the production
 * bundle conservative and produce a legacy SystemJS build for browsers that
 * do not understand native JavaScript modules. The actual target will be
 * tightened or relaxed once we have device-side measurements.
 */
export default defineConfig({
  plugins: [
    legacy({
      targets: ["chrome >= 56"],
      renderLegacyChunks: true,
      polyfills: true,
      modernPolyfills: false
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true
  },
  build: {
    target: "es2015",
    sourcemap: true,
    modulePreload: false
  }
});
