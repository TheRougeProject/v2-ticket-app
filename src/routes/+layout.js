
import { browser } from '$app/environment'

import blockchain from '$lib/blockchain.js'

// default prerender
export const prerender = false

const initBrowser = async () => {

  const wallet = await import('$lib/wallet.js')
  blockchain.wallet = wallet.default
  await blockchain.init()

  console.log('wallet & blockchain ready...')

}

if (browser) initBrowser()
