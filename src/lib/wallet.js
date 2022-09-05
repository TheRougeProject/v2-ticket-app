
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import gnosisModule from '@web3-onboard/gnosis'

// https://web3auth.io/ ?'

// https://www.npmjs.com/package/@web3-onboard/core

import { ethers, utils } from 'ethers'

import { dev } from '$app/env'

import { getSupportedChainIds } from '$lib/enums.js'

import { defaultEvmStores as evm, getChainDataByChainId } from 'svelte-ethers-store'
import registry from '$stores/registry.js'

import { metisBlack, arbitrum, arbitrumNova } from '$icons/strings.js'

// polyfill Buffer for Walletconnect
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

if (typeof window !== 'undefined') {
  //These two lines are required for Walletconnect...
  window['global'] = window;
  global.Buffer = Buffer
}

//That below is required for coinbase
//global.process = require('process')


export const wrapper = () => {
  let loadedChainId
  let onboard
  let currentWallet

  const overrides = {
    1337: {
      token: 'ETH',
      label: 'Localhost',
      rpcUrl: 'http://127.0.0.1:8545/'
    },
    588: { color: '#012033', icon: metisBlack },
    42170: { color: '#8a4100', icon: arbitrumNova },
    421613: { color: '#28a0f0', icon: arbitrum },
  }

  const getFingerPrint = wallet => {
    return JSON.stringify([
      wallet?.label,
      wallet?.chains[0].id,
      wallet?.accounts[0].address
    ])
  }

  const init = async () => {

    const injected = injectedModule()
    const gnosis = gnosisModule()

    // initialize the module with options
    const walletConnect = walletConnectModule({
      //bridge: 'YOUR_CUSTOM_BRIDGE_SERVER',
      //qrcodeModalOptions: {
      //mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar']
      //}
      // connectFirstChainId: true
    })

    const supportedChainIds = getSupportedChainIds(registry.get('includeTestnets'))

    const chains = supportedChainIds.map(id => {
      const rpcUrl = import.meta.env[`VITE_FALLBACK_PROVIDER_${id}`]
      const chainData = getChainDataByChainId(id)
      return {
        id: utils.hexStripZeros(utils.hexlify(id)),
        token: chainData.nativeCurrency?.symbol,
        label: chainData.name,
        rpcUrl,
        ...(overrides[id] || {})
      }
    })

    onboard = Onboard({
      wallets: [injected, gnosis, walletConnect],
      chains,
      accountCenter: {
        desktop: {
          position: 'bottomRight',
          enabled: true,
          minimal: true
        },
        mobile: {
          position: 'bottomRight',
          enabled: true,
          minimal: true
        }
      },
      appMetadata: {
        name: 'Rouge App',
        icon: 'https://rouge.network/logo.svg',
        //logo: icon,  side logo todo
        description: 'Create & manage events on Web3',
        explore: 'https://rouge.network/',
        recommendedInjectedWallets: [
          { name: 'MetaMask', url: 'https://metamask.io' },
          { name: 'Coinbase', url: 'https://wallet.coinbase.com/' }
        ]
      },
    })

    const { unsubscribe } = onboard.state.select('wallets').subscribe(wallets => {
      if (wallets.length < 1) {
        evm.disconnect()
        registry.set('invalidChain', null)
        //disconnect()
        return
      }
      if (currentWallet && currentWallet !== getFingerPrint(wallets[0])) {
        console.log('wallet has changed ', getFingerPrint(wallets[0]))
        evmConnect(wallets[0])
      }
    })

  }

  const evmConnect = async wallet => {
    console.log('setting wallet', wallet.provider)
    await evm.setProvider(wallet.provider, wallet.accounts[0].address)
    currentWallet = getFingerPrint(wallet)
    window.localStorage.setItem(
      `rge:defaultWallet:${wallet.chains[0].id}`,
      wallet.label
    )
  }

  const autoConnect = async chainId => {
    chainId = utils.hexStripZeros(utils.hexlify(chainId))
    if (!onboard) init()
    const defaultWallet = window.localStorage.getItem(`rge:defaultWallet:${chainId}`)
    if (defaultWallet) {
      const wallets = await onboard.connectWallet({
        autoSelect: { label: defaultWallet, disableModals: true }
      })
      evmConnect(wallets[0])
    }
  }

  const connect = async () => {
    if (!onboard) init()
    const wallets = await onboard.connectWallet()
    evmConnect(wallets[0])
  }

  const setChain = async chainId => {
    chainId = utils.hexStripZeros(utils.hexlify(chainId))
    if (!currentWallet) {
      if (!onboard) init()
      const wallets = await onboard.connectWallet()
      if (wallets[0].chains[0].id === chainId) {
        evmConnect(wallets[0])
        return
      }
      // force evmConnect on update
      currentWallet = 'none'
    }
    const success = await onboard.setChain({ chainId })
  }

  const disconnect = async () => {
    const { wallets } = onboard.state.get()
    return onboard.disconnectWallet({ label: wallets[0].label })
  }

  return {
    init,
    connect,
    autoConnect,
    setChain,
    disconnect
  }

}

const wallet = wrapper()

export default wallet
