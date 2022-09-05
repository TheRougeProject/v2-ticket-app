import sveltePreprocess from 'svelte-preprocess'

import adapter from '@sveltejs/adapter-static'

const config = {
  preprocess: sveltePreprocess({}),
  kit: {
    prerender: {
      onError: 'continue', // | ((details: RequestDetails) => void | never);
      default: true
    },
    adapter: adapter({
      pages: '.build',
      assets: '.build',
      fallback: '200.html'
    })
  }
}

export default config
