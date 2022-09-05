<script>

  import {
    defaultEvmStores as evm,
    connected, signerAddress, chainId, chainData, getChainDataByChainId
  } from 'svelte-ethers-store'

  import { Jazzicon } from 'svelte-ethers-store/components'

  import { formatAddress } from '$lib/utils'
  import { supportedChainIds } from '$lib/enums.js'

  import Modal from '$components/Modal.svelte'

  import blockchain from '$lib/blockchain.js'

  export let active

  let modal

</script>

<Modal bind:this={modal} bind:active={active} noCloseButton={true} topIsRounded={true} on:close={() => modal.close()}>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Connection status</p>
      <button class="delete" aria-label="close" on:click={modal.close}></button>
    </header>
    <section class="modal-card-body">
      <span class="icon-text">
        <span>Connected with account</span>
        <span class="icon"><Jazzicon address={$signerAddress} size={24} /></span>
        <small>{$signerAddress}&nbsp;</small>
        <span>on network <span class="tag is-primary">{$chainData.name}</span></span>
      </span>

      <hr />
      <p class="has-text-centered is-size-7 mb-3">Looking for another supported networks? Switch to or add automatically a network (may not work for all wallet)...</p>

      <p class="is-flex is-flex-wrap-wrap is-justify-content-space-evenly">
        {#each supportedChainIds.filter(i => i !== $chainId) as id}
        <a on:click={() => modal.close() && blockchain.switchChain(id)} class="button is-small is-primary is-outlined">Switch to network {getChainDataByChainId(id).name}</a>
        {/each}
        {#each supportedChainIds.filter(i => i !== $chainId) as id}
        <a on:click={() => modal.close() && blockchain.addChain(id)} class="button is-small is-primary is-outlined">Add network {getChainDataByChainId(id).name}</a>
        {/each}
      </p>

    </section>
    <footer class="modal-card-foot">
      <a class="button is-black" on:click={modal.close}>Cancel</a>
      <a class="button is-primary" on:click={() => {blockchain.disconnect(); modal.close()}}>Disconnect</a>
    </footer>
  </div>
</Modal>
