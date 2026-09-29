import type { UserConfig } from 'vite'
import { nitro } from 'nitro/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'

import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/

export default {
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    nitro(),
    tanstackStart(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  base: '/', // default -> placing for explicity
} satisfies UserConfig

// Replaced defineConfig instantiation with UserConfig type satisfaction
// why: cleaner, more intuitive