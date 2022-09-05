<script>
  import { onMount, onDestroy } from 'svelte'

  import { getChainDataByChainId, signerAddress, chainId } from 'svelte-ethers-store'

  import Icon from '$components/Icon.svelte'
  import NFT from '$components/NFT.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'

  import blockchain from '$lib/blockchain.js'

  import project from '$stores/project.js'
  import nft from '$stores/nft.js'

  export let address
  export let loading = true

  $: p = $project[address] || {}

  $: nfts = $nft.keys ? $nft.keys.filter(key => key.split(':')[0] === address && $nft[key].owner === $signerAddress) : []

  const remove = () => project.rmBearer(address)

  export const load = async () => {
    loading = true
    const project = blockchain.rouge(address)
    // auto discovery potential NFT
    const events = await project.queryFilter(project.filters.Transfer(null, $signerAddress), 0)
    for (const e of events) {
      const owner = await project.ownerOf(e.args.tokenId)
      if (owner === $signerAddress) {
        nft.add(`${address}:${e.args.tokenId}`)
      }
    }
    // can be too fast so add some buffer
    setTimeout(() => {loading = false}, 500)
  }

  onMount(load)

</script>

{#if nfts.length === 0 && !loading}

  <div class="columns is-mobile is-centered">
    <div class="column is-half">
      <EmptyState svg="/no-records.svg">
        <h3 class="subtitle"><strong>No ticket found!</strong></h3>
        <button on:click={remove} class="button is-primary">Remove event from wallet</button>
      </EmptyState>
    </div>
  </div>

{:else}

  <div class="columns is-multiline">
    {#each nfts.map(key => key.split(':')) as [ address, tokenId ]}
      <div class="column is-4">
        <NFT {address} {tokenId} noowner={true}/>
      </div>
    {/each}
    {#if loading}
      <div class="column is-4">
        <div class="box"><span class="box loader mx-auto"></span></div>
      </div>
    {/if}
  </div>

{/if}
