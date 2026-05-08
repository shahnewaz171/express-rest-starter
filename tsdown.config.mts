import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    server: './src/server.ts'
    // add more services if needed:
    // worker: './src/worker.ts',
  },
  outDir: './dist',
  sourcemap: true,
  clean: true,
  minify: false,
  dts: false,
  treeshake: true
});
