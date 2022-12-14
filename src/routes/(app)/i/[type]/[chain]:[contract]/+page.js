import { redirect } from '@sveltejs/kit'
import { allChainsData } from 'svelte-ethers-store'

export const prerender = false

export const load = async ({ params, ...args }) => {

  if (!/^\d+$/.test(params.chain)) {
    const search = allChainsData.filter(o => o.shortName === params.chain)
    if (search.length !== 1) {
      console.log('unknown chain')
      throw redirect(400, '/')
    }
    params.chain = search[0].chainId
  }

  return {
    type: params.type,
    chain: parseInt(params.chain),
    contract: params.contract
  }
}

