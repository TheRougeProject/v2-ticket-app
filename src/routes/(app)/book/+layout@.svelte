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
      <a class="navbar-item is-black" alt="Rouge Ticket" href="/book">
        <span class="icon is-large mr-2">
          <img src="/logo.svg" />
        </span>
        <strong class="is-hidden-mobile mr-2">Rouge Ticket</strong>
        <span class="tag is-white">beta</span>
      </a>
    </div>

    <div class="navbar-brand is-justify-content-flex-end">
      {#if $signerAddress}
        <div class="navbar-item pr-0">
          <span class="icon-text">
            <span class="icon"><Jazzicon address={$signerAddress} size={24} /></span>
            <small class="is-hidden-mobile">{formatAddress($signerAddress)}</small>
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
    </div>
  </nav>

  <div class="container is-max-desktop">
    <div class="container is-fluid">

      <nav class="level is-mobile mt-5 mb-2">
        <div class="level-left">
        </div>
        <div class="level-right">
          <div class="level-item">
            <a class="button is-text is-small" href="/"><Icon name="List" class="mr-1" />Event manager</a>
          </div>
          <div class="level-item">
            <a class="button is-text is-small" href="/rewards"><Icon class="mr-1" name="Award" />Rouge Journey</a>
          </div>
        </div>
      </nav>

      <div class="box ">

        <slot />

      </div>
    </div>
  </div>

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
