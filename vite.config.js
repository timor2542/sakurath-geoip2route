import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { localGeoApi } from './server/local-geo-api.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), localGeoApi(env.IP2LOCATION_API_KEY)],
    server: { port: 5173 },
    build: { sourcemap: true }
  }
})
