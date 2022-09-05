<script>
  import {
    defaultEvmStores as evm,
    connected, signerAddress, chainId, chainData, allChainsData
  } from 'svelte-ethers-store'

  import { Jazzicon } from 'svelte-ethers-store/components'

  import { formatAddress } from '$lib/utils'
  import blockchain from '$lib/blockchain.js'

  import AppContext from '$components/AppContext.svelte'
  import Icon from '$components/Icon.svelte'

</script>

<AppContext>

  <nav class="navbar " role="navigation" aria-label="main navigation">

    <div class="navbar-brand" >
      <a target="_blank" class="navbar-item is-black" alt="Rouge Network" href="https://rouge.network/">
        <span class="icon is-large">
          <img width="30" height="30" src="/logo.svg" />
        </span>
      </a>
    </div>

    <div class="navbar-brand is-hidden-mobile is-justify-content-center">
      <a class="navbar-item" alt="Rouge Ticket Home" href="/">
        <strong>Rouge Ticket</strong>
        <span class="tag is-white ml-1">beta</span>
      </a>
    </div>

    <div class="navbar-brand is-justify-content-flex-end">
      {#if $signerAddress}
        <div class="navbar-item">
          <span class="icon-text">
            <span class="icon"><Jazzicon address={$signerAddress} size={24} /></span>
            <small class="is-hidden-mobile icon-text">{formatAddress($signerAddress)}</small>
          </span>
        </div>
      <div class="navbar-item">
        <span class="tag is-hidden-touch">{$chainData.name}</span>
        <span class="tag is-hidden-desktop">{$chainData.shortName}</span>
      </div>
      {:else}
        <div class="navbar-item">
          <a class="button is-white is-inverted is-responsive" on:click={() => blockchain.connect()}>
            Connect Wallet
          </a>
        </div>
      {/if}
      <a class="navbar-item is-hidden-tablet" alt="Rouge dApp Home" href="/">
        <Icon name="Home" />
      </a>
    </div>

  </nav>

  <div class="container is-max-desktop">
    <div class="container is-fluid">
      <div class="box mt-6">

        <slot />

      </div>
    </div>
  </div>

</AppContext>


<style lang="scss">

@import "../../../scss/_variables.scss";
@import "bulma/sass/utilities/_all";

.container.is-max-desktop {
  @include mobile {
    padding-top: 3.5rem;
  }
  @include tablet {
    padding: 4rem;
  }
}

.navbar {
    background-color: $grey-standalone;
}

nav {
  display: flex;
  align-items: stretch;
  background-color: transparent;

  .navbar-brand {
    flex: 1;
    justify-content: left;

    &:last-child {
      justify-content: right;
    }
  }

}

:global(html) {
  background-color: $grey-standalone;
}

</style>
