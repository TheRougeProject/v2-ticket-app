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
      <a class="navbar-item is-black" alt="Rouge Ticket" href="/book">
        <span class="icon is-large mr-2">
          <img src="/logo.svg" />
        </span>
        <strong class="is-hidden-mobile mr-2">Rouge Ticket</strong>
        <span class="tag is-white">beta</span>
      </a>
    </div>

    <div class="navbar-brand" >
      {#if $signerAddress}
        <div class="navbar-item pr-0">
          <span class="icon-text">
            <span class="icon"><Jazzicon address={$signerAddress} size={24} /></span>
            <small class="is-hidden-mobile">{formatAddress($signerAddress)}</small>
          </span>
        </div>
      {/if}
      {#if $signerAddress && $chainId}
        <div class="navbar-item">
          <span class="tag is-hidden-touch">{$chainData.name}</span>
          <span class="tag is-hidden-desktop">{$chainData.shortName}</span>
        </div>
      {/if}
    </div>
  </nav>

  <slot />

</AppContext>

<style lang="scss">

  @import "../../../scss/_variables.scss";
  @import "bulma/sass/utilities/_all";

  :global(body) {
    background-color: $grey-standalone;
  }

  :global(.version a) {
      color: #888 !important;
  }

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

      a:hover {
        color: currentColor;
      }

    }

  }

  .navbar-item .is-large img {
    max-height: none;
  }

</style>
