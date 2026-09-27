import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackStart(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  base: '/', // default -> placing for explicity
})
