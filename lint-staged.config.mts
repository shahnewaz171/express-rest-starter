export default {
  '*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}': [
    'biome check --write --unsafe --no-errors-on-unmatched --files-ignore-unknown=true'
  ],
  '*.{css,html,yml,yaml}': [
    'biome check --write --no-errors-on-unmatched --files-ignore-unknown=true'
  ]
};
