
import { ethers, utils, constants } from 'ethers'
import { nanoid } from 'nanoid'

import { invalidate } from "$app/navigation"

import { defaultEvmStores as evm, provider, signer, getChainDataByChainId} from 'svelte-ethers-store'

import Factory from '@rouge/contracts/Factory.json'
import Rouge from '@rouge/contracts/Rouge.json'

import IERC20 from '@rouge/contracts/IERC20.json'
import IERC721 from '@rouge/contracts/IERC721.json'
import IERC1155 from '@rouge/contracts/IERC1155.json'

import { Token } from '@rouge/contracts/Token'
import { setLogger } from '@rouge/contracts/rouge'

import { dev, browser } from '$app/environment'

import { getSupportedChainIds } from '$lib/enums.js'

//import wallet from '$lib/wallet.js'

import registry from '$stores/registry.js'
import project from '$stores/project.js'
import account from '$stores/account.js'

//import { explorer, formatEth, toWei, formatIpfsHash } from '$lib/utils'

//import notifier from '$lib/notifier'
//import pool from '$stores/pool.js'

const noop = () => {}

let factoryAddress // XXX remove ?
let singletonAddress // XXX remove ?

//evm.attachContract('factory', factoryAddress, Factory.abi)
//evm.attachContract('singleton', singletonAddress, Rouge.abi)

const createBlockchain = () => {
  const uid = nanoid()

  let wallet

  const isDev = () => {
    if (dev) return true
    return false
  }
  const isTest = () => {
    // if (import.meta.env.VITE_CHAIN_ID != '0x1') return true
    return false
  }

  const allifaces = {} // per address

  provider.subscribe(async $provider => {
    if (!$provider || !$provider._isProvider) return
    console.log('found new provider', $provider)
    // TODO bug on switching network ...
    //const wait = ms => new Promise(resolve => setTimeout(() => resolve(), ms))
    // await wait(6000)
    const { name, chainId } = await $provider.getNetwork()
    console.log('provider details', { name, chainId })
    if (!getSupportedChainIds(true).includes(chainId)) {
      // console.log('bad chain', chainId)
      registry.set('invalidChain', true)
    }
    factoryAddress = import.meta.env[`VITE_FACTORY_ADDRESS_${chainId}`]
    singletonAddress = import.meta.env[`VITE_SINGLETON_ADDRESS_${chainId}`]
    console.log({ factoryAddress, singletonAddress })
  })

  signer.subscribe(async $signer => {

    if (!$signer || !$signer._isSigner || !$signer._address) return
    console.log('logged as', $signer)
    const address = await $signer.getAddress()
    if (!address) return
    const { chainId } = await $signer.provider.getNetwork()
    if (!getSupportedChainIds(true).includes(chainId)) {
      return
    }
    project.init()
    return
    // project.purge()
    if ($signer) {
      console.log('new signer', $signer, evm.$contracts.factory)
      const events = await evm.$contracts.factory.queryFilter(
        evm.$contracts.factory.filters.ProxyCreation() // await $signer.getAddress())
      )
      for (const e of events) project.add({ ...e.args, ...(await e.getBlock() ) })
    }
  })


  // provider.subscribe( $provider => {
  //   if (browser && $provider) {
  //     // hot reload workaround
  //     if (dev && $provider.listenerCount() > 0) $provider.removeAllListeners()

  //     console.log('Subscribing to contracts logs with %s', uid, $provider, evm.$contracts)
  //     $provider.on({ address: nftAddress }, notifyEvent)
  //     $provider.on({ address: marketAddress }, notifyEvent)

  //     console.log('subscribers count %s', $provider.listenerCount())
  //   }
  // })

  // TODO subscribe chianID
  // if (parseInt(chainId, 16) !== parseInt(import.meta.env.VITE_CHAIN_ID)) {
  //   provider = null
  //   throw new Error(`wrong chainId ${parseInt(chainId, 16)}`)
  // }

  const connect = async chainId => {
    console.log('CONNECTING TO chain', chainId, wallet)
    if (!wallet) {
      // todo
    }
    if (!chainId) return wallet.connect()
    return wallet.setChain(chainId)
  }

  const autoConnect = async (chainId, attempt = 0) => {
    if (!wallet) {
      setTimeout(() => autoConnect(chainId, attempt + 1), 500)
      return
    }
    if (!chainId) {
      let defaultChain = registry.get('defaultChain')
      if (!defaultChain) return
      chainId = utils.isHexString(defaultChain) ? parseInt(defaultChain, 16) : defaultChain
      console.log('find default chain', chainId)
    }
    console.log('AUTO CONNECTING TO chain', chainId, wallet)
    return wallet.autoConnect(chainId)
  }

  const disconnect = () => wallet.disconnect()

  const handlers = {
    Transfer: (address, fragment, event) => {
      const { from, to, tokenId } = event
      account.invalidate(address, to)
      account.invalidate(address, from)
    },
    Acquired: (address, fragment, event) => {
      console.log('*** Acquired ***', address, fragment, event)
      project.refresh(address)
    },
    UpdateAuthorization: (address, fragment, event) => {
      console.log('*** UpdateAuthorization ***', address, fragment, event)
      project.refresh(address)
      // XXX . await ?
      invalidate(window.location.pathanme)
    },
  }

  const handleRougeEvent = address => async ({ topics, data, ...args }) => {
    // XXX what about deprecated event ? => dump in JSON ?
    const fragment = singleton(evm.$chainId).interface.getEvent(topics[0])
    console.log('event', address, fragment)
    if (!handlers[fragment.name]) return
    const event = singleton(evm.$chainId).interface.decodeEventLog(
      fragment, data, topics
    )
    //console.log('*****', fragment)
    return handlers[fragment.name](address, fragment, event)
  }

  const call = async ({
    key,
    method,
    estimateGas,
    params,
    onTx = noop,
    onReceipt = noop,
    onError = noop,
  }) => {
    try {
      console.log('calla', {key, params})
      const overrides = {}
      if (estimateGas && key) {
        const estimate = await estimateGas[key](...params)
        overrides.gasLimit = estimate.add(2000)
        console.log('estimate', key, estimate+'', overrides)
      }
      if (params.length > 0 && typeof params[params.length - 1] === 'object' && params[params.length - 1].value) {
        params[params.length - 1] = {
          ...params[params.length - 1],
          ...overrides
        }
      } else {
        params = [ ...params, overrides ]
      }
      console.log('callb', {method, params, overrides})
      const tx = await method(...params)
      onTx(tx)
      onReceipt(await tx.wait())
    } catch (e) {
      console.log('callt catch', { e, onError })
      onError(e)
    }
  }

  const createProjet = async ({
    URI,
    channels,
    auths = [],
    onTx,
    onReceipt,
    onError
  }) => {
    const saltNonce = await evm.$provider.getTransactionCount(evm.$signerAddress)
    console.log('createProjet', {URI, channels, saltNonce})
    const contract = singleton(evm.$chainId)
    const initCode = contract.interface.encodeFunctionData(
      "setup", [ evm.$signerAddress, URI, channels, auths ]
    )
    return factory(evm.$chainId).createProxyWithNonce({
      params: [ contract.address, initCode, saltNonce ],
      onTx,
      onReceipt,
      onError,
    })
  }

  const builder = jsonInterface => address => new Proxy({}, {
    get: function(target, key) {
      if (!evm.$provider) throw new Error(`no provider`)
      const contract = new ethers.Contract(
        address,
        jsonInterface.abi,
        evm.$provider
      )
      try {
        //if (/^(filters|queryFilter)$/.test(key)) return contract[key]
        // console.log('builder**key', key)
        const fragment = contract.interface.getFunction(key)
        // XXX ethers.utils.FunctionFragment.isFunctionFragment( object ) ??? boolean
        if (fragment.type !== 'function') throw new Error(`unknown function ${jsonInterface.contractName}.${key}`)
        if (/^pure|view$/.test(fragment.stateMutability)) return contract[key]
        return o => call({...o, key, method: contract.connect(evm.$signer)[key], estimateGas: contract.connect(evm.$signer).estimateGas})
      } catch(e) {
        return contract[key]
      }
    }
  })

  const erc20 = builder(IERC20)
  const erc721 = builder(IERC721)
  const erc1155 = builder(IERC1155)
  const rouge = builder(Rouge)

  const factory = chainId => builder(Factory)(import.meta.env[`VITE_FACTORY_ADDRESS_${chainId}`])
  const singleton = chainId => rouge(import.meta.env[`VITE_SINGLETON_ADDRESS_${chainId}`])

  const addChain = async chainId => {
    try {
      const data = getChainDataByChainId(chainId)
      chainId = utils.hexStripZeros(utils.hexlify(chainId))
      // console.log("data", chainId, data)
      await evm.$provider.provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId,
            chainName: data.name,
            nativeCurrency: data.nativeCurrency,
            rpcUrls: data.rpc,
            blockExplorerUrls: data.explorers.map(a => a.url)
          }
        ]
      })
      registry.set('invalidChain', null)
    } catch (e) {
      console.log("failed to add network", chainId, e)
    }
  }

  const switchChain = async chainId => {
    try {
      chainId = utils.hexStripZeros(utils.hexlify(chainId))
      await evm.$provider.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
      registry.set('invalidChain', null)
    } catch(e) {
      console.log("failed to switch to network", chainId, e)
    }
  }

  const initFallback = async chainId => {
    try {
      if (evm.$chainId && evm.$chainId == chainId) return

      console.log(`[${uid}] init fallback blockchain context. chainId = %s`, chainId)
      const provider = import.meta.env[`VITE_FALLBACK_PROVIDER_${chainId}`]

      console.log(`[${uid}] init fallback blockchain context. chainId = %s`, provider)
      if (provider) evm.setProvider( provider, null )

    } catch(e) {
      console.log('fallback connect error', e)
    }
  }

  const init = () => {
    if (!browser) return

    if (dev) {
      // TODO depending on prod or not + reporting
      // setLogger({ fatal: console.error, ...console })
    }

    // TODO autoconnect ?
    // evm.setProvider( fallbackProviders[registry.get('defaultChain')] )
    // if (evm.$connected) return
    // pool.init(handlers)
  }

  return {
    get wallet () { return wallet },
    set wallet (w) { wallet = w },
    get isDev () { return isDev() },
    get isTest () { return isTest() },
    init,
    initFallback,
    autoConnect,
    connect,
    //call,
    disconnect,
    createProjet,
    addChain,
    switchChain,
    factory,
    singleton,
    rouge,
    erc20,
    erc721,
    erc721,
    uid,
    handleRougeEvent
  }
}

const blockchain = createBlockchain()


// TODO support Tokens list + multi chains
// https://tokenlists.org/

export const getChainTokens = (chainId = 0, chainData = {}) => {
  const tokens = {}
  if (!chainId) return tokens

  const list = JSON.parse(import.meta.env[`VITE_ASSET_TOKENS_${chainId}`] || {})

  if (chainData.nativeCurrency?.symbol) {
    if (chainData.nativeCurrency.symbol === 'ETH') {
      chainData.nativeCurrency.formatSymbol = constants.EtherSymbol
    }
    tokens[chainData.nativeCurrency.symbol] = Token.native({
      ...chainData.nativeCurrency, chainId
    })
  }

  if (list.USDC) {
    tokens.USDC = Token.from({
      name: 'USDC',
      decimals: '6',
      symbol: 'USDC',
      address: list.USDC
    }, { chainId, type: 'ERC20' })
  }

  if (dev && list.UNI) {
    tokens.UNI = Token.from({
      name: 'UNI',
      decimals: '18',
      symbol: 'UNI',
      address: list.UNI || '0xFE701b1aEA13587Ca6169cd0A13e0d3503313F32'
    }, { chainId, type: 'ERC20' })
  }

  return tokens
}

export default blockchain
