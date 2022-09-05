<script>

  import {
    connected, signerAddress, chainData
  } from 'svelte-ethers-store'

  import { Jazzicon } from 'svelte-ethers-store/components'

  import Head from '$components/Head.svelte'
  import AppContext from '$components/AppContext.svelte'

  import { dev } from '$app/env'
  import { formatAddress } from '$lib/utils'

  import Icon from '$components/Icon.svelte'
  import blockchain from '$lib/blockchain.js'

</script>

<Head />

<AppContext>

  <nav class="navbar is-transparent" role="navigation" aria-label="main navigation">

    <div class="navbar-brand" >
      <a target="_blank" class="navbar-item is-black" alt="Rouge Network" href="https://rouge.network/">
        <span class="icon is-large">
          <img width="30" height="30" src="/logo.svg" />
        </span>
      </a>
    </div>

    <div class="navbar-brand is-hidden-mobile is-justify-content-center">
      <a class="navbar-item" alt="Rouge dApp Home" href="/">
        <strong>Rouge Ticket</strong>
        <span class="tag is-white ml-1">beta</span>
      </a>
    </div>

    <div class="navbar-brand is-justify-content-flex-end">
      {#if $connected}
        <div class="navbar-item">
          <span class="icon-text">
            <span class="icon"><Jazzicon address={$signerAddress} size={24} /></span>
            <small class="is-hidden-mobile">{formatAddress($signerAddress)}</small>
          </span>
        </div>
        <a class="navbar-item" alt="Rouge Ticket Wallet" href="/wallet">
          <Icon name="wallet" size="24" />
        </a>
        <div class="navbar-item">
          <span class="tag is-white is-hidden-touch">{$chainData.name}</span>
          <span class="tag is-white is-hidden-desktop">{$chainData.shortName}</span>
        </div>
      {:else}
        <div class="navbar-item">
          <a class="button is-white is-inverted is-responsive" on:click={() => blockchain.connect()}>
            Connect Wallet
          </a>
        </div>
      {/if}
      <a class="navbar-item is-hidden-tablet mr-4" alt="Rouge Ticket Home" href="/">
        <Icon name="Home" />
      </a>
    </div>

    <!--
         <a class="navbar-item">
         Report an issue
         </a>
    -->
  </nav>


  <main>
    <div class="container is-fullhd">
      <div class="container is-fluid">
        <slot/>
      </div>
    </div>
  </main>

  <div class="footer">
    <div class="container">

      <nav class="flex is-flex-wrap-wrap is-justify-content-space-between">
        <div class="is-flex-grow-1 has-text-centered">
          <div>
            <a target="_blank" href="https://rouge.network/">Rouge</a>
          </div>
        </div>
        <div class="is-flex-grow-1 has-text-centered">
          <div>
            <a target="_blank" href="https://discord.gg/aUeSjsN8Tx">Discord</a>
          </div>
        </div>
        <div class="is-flex-grow-1 has-text-centered">
          <div>
            <a target="_blank" href="https://github.com/TheRougeProject">GitHub</a>
          </div>
        </div>
        {#if dev}
          <div class="is-flex-grow-1 has-text-centered">
            <div>
              <a href="/explorer/">Explorer</a>
            </div>
          </div>
          <div class="is-flex-grow-1 has-text-centered">
            <div>
              <a target="_blank" href="/theme/">Theme</a>
            </div>
          </div>
          <div class="is-flex-grow-1 has-text-centered">
            <div>
              <a target="_blank" href="/i/scan/">Ticket check</a>
            </div>
          </div>
        {/if}
      </nav>

    </div>

  </div>

</AppContext>


<style lang="scss">

@import "../../scss/_variables.scss";
@import "bulma/sass/utilities/_all";

main {
  min-height: calc(100vh - 5rem);
  background-color: $primary;
  @include mobile {
    background-color: transparent;

  }
}

.container.is-fluid {
  @include mobile {
    padding-left: 0;
    padding-right: 0;
  }

}

nav {
  display: flex;
  align-items: stretch;

  color: #fff;
  a {
    color: #fff;
  }

  .navbar-brand {
    flex: 1;
    align-items: stretch;

    .navbar-item {
      padding-top: 0;
      padding-bottom: 0;
      padding-left: 0;
      padding-right: 0;
      color: #fff;
      strong {
        color: #fff;
      }
    }

    &.is-justify-content-flex-end {
      .navbar-item {
        margin-right: 0.75em;
      }
      // same as logo
      margin-right: -0.25rem;
    }

  }

}


.footer {
  background-color: $primary;
  color: #fff;

  nav > div {
    width: 60px;
  }

  a {
    color: #fff;
  }
}


</style>
