<script>
  import { signerAddress } from 'svelte-ethers-store'

  import blockchain from '$lib/blockchain.js'

  import Icon from '$components/Icon.svelte'

  // TODO replace by Container ?

</script>

<nav class="level manager-nav is-mobile mb-1">
  <div class="level-left">
    <div class="level-item">
      <div class="breadcrumb has-succeeds-separator my-0" aria-label="breadcrumbs">
        <ul>
          <slot />
        </ul>
      </div>
    </div>
  </div>
  <div class="level-right">
    <div class="level-item">
      <a class="button is-text is-small" href="/book"><Icon name="Book" class="mr-1" />Tickets book</a>
    </div>
    <div class="level-item">
      <a class="button is-text is-small" disabled={$signerAddress ? undefined : true} on:click={blockchain.disconnect}><Icon name="Logout" class="mr-1" /><span>Disconnect</span></a>
    </div>
  </div>
</nav>
