import { writable } from 'svelte/store'

import { constants, utils } from 'ethers'
import { nanoid } from 'nanoid'

import { dev, browser } from '$app/environment'
import { signerAddress } from 'svelte-ethers-store'

// XXX secret per chain ?

const createStore = () => {
  const storageKey = () => `rge:deviceSeed`
  const { subscribe, set } = writable()

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
