import path from 'path'

import npm from './package.json'
import meta from './meta.js'

import { sveltekit } from '@sveltejs/kit/vite'

const vite = {
  plugins: [sveltekit()],
  // exclude: ['dayjs'],
  define: {
    __APP_NAME__: JSON.stringify(npm.name),
    __APP_VERSION__: JSON.stringify(npm.version),
    __META_NAME__: JSON.stringify(meta.name),
    __META_TITLE__: JSON.stringify(meta.title),
    __META_DESCRIPTION__: JSON.stringify(meta.description),
    __META_SHORT_DESCRIPTION__: JSON.stringify(meta.shortDescription || meta.description),
    __META_IMAGE__: JSON.stringify(meta.image),
    __META_URL__: JSON.stringify(meta.url),
  },
  ssr: {
        //
  },
  server: {
    // port: 3000,
  },
  resolve: {
    alias: {
      '$components': path.resolve('./src/components'),
      '$stores': path.resolve('./src/stores'),
      '$icons': path.resolve('./src/icons')
    }
  }
}

export default vite
