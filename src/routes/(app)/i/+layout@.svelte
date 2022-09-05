<script>
  import {
    defaultEvmStores as evm,
    connected, signerAddress, chainId, chainData, allChainsData
  } from 'svelte-ethers-store'

  import { Jazzicon } from 'svelte-ethers-store/components'

  import { formatAddress } from '$lib/utils'

  import AppContext from '$components/AppContext.svelte'
  import Icon from '$components/Icon.svelte'

</script>

<AppContext>

  <nav class="navbar is-transparent" role="navigation" aria-label="main navigation">

    <div class="navbar-brand" >
      <a target="_blank" class="navbar-item is-black" alt="Rouge Network" href="https://rouge.network/">
        <span class="icon is-large">
          <img src="/logo.svg" />
        </span>
      </a>
    </div>

    <div class="navbar-brand" >
      {#if $signerAddress}
        <div class="navbar-item">
          <span class="icon-text">
            <span class="icon"><Jazzicon address={$signerAddress} size={24} /></span>
            <small class="is-hidden-mobile icon-text">{formatAddress($signerAddress)}</small>
          </span>
        </div>
        <a class="navbar-item" alt="Rouge Ticket Wallet" href="/wallet">
          <Icon name="wallet" size="24" />
        </a>
      {/if}
      {#if $signerAddress && $chainId}
        <div class="navbar-item">
          <span class="tag is-hidden-touch">{$chainData.name}</span>
          <span class="tag is-hidden-desktop">{$chainData.shortName}</span>
        </div>
      {/if}
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
