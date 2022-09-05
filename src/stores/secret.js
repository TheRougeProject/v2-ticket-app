import { writable } from 'svelte/store'

import { constants, utils } from 'ethers'
import { nanoid } from 'nanoid'

import { dev, browser } from '$app/env'
import { signerAddress } from 'svelte-ethers-store'


// todo secret per chay

const createStore = () => {
  const storageKey = () => `rge:deviceSeed`
  const { subscribe, set, update } = writable()

  // special dev only mode secret is no secret at all
  if (dev) {
    signerAddress.subscribe(address => {
      if (!address) return
      set(utils.id(address))
    })
  }

  const init = async () => {
    let deviceSeed
    if (browser) {
      deviceSeed = localStorage.getItem(storageKey())
      if (!deviceSeed) {
        deviceSeed = utils.id(nanoid())
        localStorage.setItem(storageKey(), deviceSeed)
      }
      set(utils.id(deviceSeed))
    }

    // TODO other more sophisticated secret options
    // secret = localseed | or encrypted(password).
    // encryption by device ID or passphrase/browser-passworder

  }

  init()

  return {
    subscribe,
  }

}

const store = createStore()

export default store
