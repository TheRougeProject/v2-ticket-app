<script>
  import { onMount } from 'svelte'

  import {
    connected, signerAddress, chainData
  } from 'svelte-ethers-store'

  import { Jazzicon } from 'svelte-ethers-store/components'

  import Head from '$components/Head.svelte'
  import AppContext from '$components/AppContext.svelte'

  import { dev } from '$app/environment'
  import { formatAddress } from '$lib/utils'

  import Icon from '$components/Icon.svelte'
  import blockchain from '$lib/blockchain.js'

  onMount(async () => {
    if (!$signerAddress) blockchain.autoConnect()
  })

</script>

<Head />

<AppContext>

  <nav class="navbar is-transparent" role="navigation" aria-label="main navigation">

    <div class="navbar-brand" >
      <a class="navbar-item is-black" alt="Rouge Ticket" href="/">
        <span class="icon is-large mx-2">
          <img src="/logo.svg" />
        </span>
        <strong class="is-hidden-mobile mr-2">Rouge Ticket</strong>
        <span class="tag is-white">beta</span>
      </a>
    </div>

    <div class="navbar-brand is-justify-content-flex-end">
      {#if $connected}
        <div class="navbar-item pr-0">
          <span class="icon-text">
            <span class="icon"><Jazzicon address={$signerAddress} size={24} /></span>
            <small class="is-hidden-mobile">{formatAddress($signerAddress)}</small>
          </span>
        </div>
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
    <div class="container is-max-desktop">

      <nav class="flex is-flex-wrap-wrap is-justify-content-center is-size-7">
        <div class="xis-flex-grow-1 has-text-centered">
          <span class="icon-text">
            <a target="_blank" href="https://rouge.network/"><span class="icon">
              <img  src="/rouge.svg" />
            </span></a>&nbsp;
            <a target="_blank" href="https://rouge.network/">The Rouge Project</a>&nbsp;
          </span>
        </div>
        <div class="xis-flex-grow-1 has-text-centered">
          <span class="icon-text">
            <a target="_blank" href="https://discord.gg/aUeSjsN8Tx"><Icon name="Discord" /></a>&nbsp;
            <a target="_blank" href="https://discord.gg/aUeSjsN8Tx">Discord</a>
          </span>
        </div>
        <div class="xis-flex-grow-1 has-text-centered">
          <span class="icon-text">
            <a target="_blank" href="https://github.com/TheRougeProject"><Icon name="Github" /></a>&nbsp;
            <a target="_blank" href="https://github.com/TheRougeProject">GitHub</a>
          </span>
        </div>
        {#if dev}
          <div class="xis-flex-grow-1 has-text-centered">
            <span class="icon-text">
              <a href="/explorer/">Explorer</a>
            </span>
          </div>
          <div class="xis-flex-grow-1 has-text-centered">
            <span class="icon-text">
              <a target="_blank" href="/theme/">Theme</a>
            </span>
          </div>
          <div class="xis-flex-grow-1 has-text-centered">
            <span class="icon-text">
              <a target="_blank" href="/i/scan/">Ticket check</a>
            </span>
          </div>
        {/if}
      </nav>

    </div>

  </div>

</AppContext>


<style lang="scss">

  @import "../../scss/_variables.scss";
  @import "bulma/sass/utilities/_all";

  nav.navbar, main, .footer {
    background-color: $primary;
  }

  main {
    min-height: calc(100vh - 5rem);
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

    .navbar-item .is-large img {
      max-height: none;
    }

  }

  .footer {
    background-color: $primary;
    color: #fff;

    nav > div {
      margin-bottom: 3rem;
      width: 150px;
    }

    a {
      color: #fff;
    }
  }

</style>
