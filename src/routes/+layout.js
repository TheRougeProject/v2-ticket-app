
import { browser } from '$app/env'

import blockchain from '$lib/blockchain.js'

const initBrowser = async () => {

  const wallet = await import('$lib/wallet.js')
  blockchain.wallet = wallet.default
  await blockchain.init()

  console.log('wallet & blockchain ready...')

}

if (browser) initBrowser()
