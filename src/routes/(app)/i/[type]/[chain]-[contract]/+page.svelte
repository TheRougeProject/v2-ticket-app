<script>
  import { onMount, onDestroy } from 'svelte'
  import { writable } from 'svelte/store'

  import { getChainDataByChainId, connected, chainId, provider, signerAddress, signer } from 'svelte-ethers-store'

  import { setLogger, abiEncodeAcquire } from '@rouge/contracts/rouge'
  import { Token, TokenAmount, TokenAmountSet } from '@rouge/contracts/Token'

  import { dev, browser } from '$app/env'

  import blockchain from '$lib/blockchain.js'

  import { formatAmount } from '$lib/enums.js'

  import project from '$stores/project.js'
  import secret from '$stores/secret.js'
  import nft from '$stores/nft.js'

  import Icon from '$components/Icon.svelte'
  import Approve from '$components/ApproveERC20.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'
  import TxButton from '$components/TxAction/Button.svelte'
  import Project from '$components/Project.svelte'

  export let data;
  $: ({ type, chain, contract } = data);

  $: p = $project[contract] || {}

  $: validChain = $chainId === chain

  // TODO need also to check chain ...
  $: isOur = $project.addresses && $project.addresses.includes(contract) || false

  // XXX reroute if type not correct ? or remove type from param ?

  // 1 = choosing, 2 connecting, 3 checkout, 4 submitted
  let step = 1
  let success = false

  const cart = writable({})
  const allowed = writable({})

  $: ready = !Object.values($allowed).includes(false)

  const unsub = cart.subscribe(selection => {
    const tokenSet = TokenAmountSet.from([])
    let totalQty = 0
    for (const i of Object.keys(selection)) {
      if (/^\d+$/.test(i)) {
        if (p.channels[i].amount && selection[i]) {
          tokenSet.add( p.channels[i].amount.mul(selection[i]) )
        }
        totalQty += selection[i]
      }
    }
    /* selection.approve = Object.keys(total).map(
     *   symbol => ({ ...token[symbol], amount: total[symbol] })
     * )
     * selection.totalText = Object.keys(total).map(
     *   symbol => formatAmount({ ...token[symbol], amount: total[symbol] })
     * ).join(' + ') || 'free' */

    selection.total = tokenSet.toString(' + ')
    selection.tokenSet = tokenSet
    selection.totalQty = totalQty
  })

  onMount(async () => {
    blockchain.initFallback(chain)
    if (!$signerAddress) blockchain.autoConnect(chain)
  })

  const validate = async () => {
    if (!$signerAddress) return
    const { chainId  } = await $provider.getNetwork()
    if (chainId !== chain) {
      step = step < 2 ? step : 2
      return
    }
    console.log({ chain, chainId })
    step = step === 2 ? 3 : step
  }
  const unsub2 = signerAddress.subscribe(validate)

  onDestroy(() => { unsub(); unsub2() })

  // TODO test approve & approve
  const buyCtx = async () => {
    if (!ready) return

    success = false

    const acquisitions = []
    Object.keys($cart).forEach(channelId => {
      if (!/^\d+$/.test(channelId)) return
      acquisitions.push({ channelId, qty: $cart[channelId] })
    })
    console.log({ channels: p.channels, acquisitions })
    const params = await abiEncodeAcquire({
      channels: p.channels,
      contract: blockchain.rouge(contract),
      signer: $signer,
      secret: $secret,
      acquisitions
    })

    step = 4

    return {
      call: blockchain.rouge(contract).acquire,
      params,
      onError: rcpt => {
        step = 3
      },
      onReceipt: rcpt => {
        const { from, to, tokenId } = rcpt.events[0].args
        console.log('final on rcpt', { from, to, tokenId } )
        project.addBearer(contract)
        nft.add(`${contract}:${tokenId}`)
      }
    }
  }

  // had robots in head?
  //     name="robots"      content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"

 // https://stackoverflow.com/questions/43095312/ogevent-eventstart-time-not-working

</script>

<svelte:head>
   <title>{p.name}</title>
  <meta name="description" content={p.name} />
  <meta property="og:title" content="{ p.name }" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content={ p.name } />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta property="twitter:title" content="{ p.name }" />
</svelte:head>

<!--
     <title>x</title>
     <link rel="canonical" href="x/" />
     <meta property="og:url" content={ browser ? window.location+'' : 'xx' } />
-->


{#if p._isDraft}

<article class="message is-primary">
  <div class="message-body">
    Preview of your draft event tickets page.<br />
    Publish it on chain & share it to start the ticket distribution.
  </div>
</article>

{/if}

{#if isOur}

<div class="level">
  <div class="level-left">
    <div class="level-item">
      <a class="button is-secondary is-inverted" href="/project/{contract}/{ $project[contract]._isDraft ? 'draft/' : ''}">Manager view</a>
    </div>
  </div>
</div>
{/if}


<Project {p}>

    <h3 class="title">
      Get tickets
    </h3>

    <div class="tabs is-centered xis-boxed is-fullwidth">
      <ul>
        <li on:click={() => {step = 1}} class:is-active={step === 1}>
          <a>
            <Icon name="select" size="20" />
            <span>1. Select</span>
          </a>
        </li>
        <li class:is-active={step === 2 || (step > 2 && !validChain)}>
          <a>
            <Icon name="connect" size="20" />
            <span>2. Connect</span>
          </a>
        </li>
        <li class:is-active={step >= 3 && validChain}>
          <a>
            <Icon name="checkout" size="20" />
            <span>3. Checkout</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- ##################################################################  -->
    {#if p && step === 1}

    {#if !p.channels}

    <EmptyState svg="/empty-box.svg">
      <h3 class="subtitle"><strong>No tickets available</strong></h3>
      <p class="help is-info">Sorry, no tickets are available for this event...</p>
    </EmptyState>

    {:else if p.state && !p.state.enabled.acquire}

    <EmptyState svg="/empty-box.svg">
      <h3 class="subtitle"><strong>No tickets available</strong></h3>
      <p class="help is-info">Sorry, sales is closed for this event...</p>
    </EmptyState>

    {:else}

    <table class="table is-striped is-fullwidth is-hoverable">
      <thead class="classic">
        <tr>
          <th colspan="4">Description</th>
          <th colspan="2" class="has-text-right">Price</th>
          <th class="has-text-right">Quantity</th>
        </tr>
      </thead>
      <tbody>
        {#each (p.channels||[]) as channel, i}
        <tr>
          <th colspan="4">{channel.label}</th>
          <td colspan="2" class="has-text-right">
            {channel?.amount || 'Free'}
          </td>
          <td class="has-text-right">
            <input class="input is-narrow" type="number" min="0" bind:value={$cart[i]}>
          </td>
        </tr>
        {/each}
      </tbody>
      <thead>
        <tr>
          <th colspan="4"></th>
          <th colspan="2" class="has-text-right">Total = {$cart.total || 'tx gas only'}</th>
        </tr>
      </thead>
      <tfoot >
        <tr>
          <th class="mt-3 has-text-right" colspan="7">
            <a class="button is-primary" disabled={$cart.totalQty < 1 ? true: undefined} on:click={() => {if ($cart.totalQty < 1) return; step = 2; validate()}}>Next</a>
          </th>
        </tr>
      </tfoot>
    </table>

    {/if}

    {#if !p._isDraft}
      <p class="icon-text">
        <span>Already have tickets ? Find them in your<span><a href="/wallet/"><Icon name="wallet" size="24" /><span>Rouge wallet</span></a>...
      </p>
    {/if}

    {/if}

    <!-- ##################################################################  -->
    {#if step === 2 || (step > 2 && !validChain)}

    <EmptyState svg="/bad-connection.svg">
      {#if !validChain}
      <h3 class="subtitle"><strong>Not connected to {getChainDataByChainId(chain).name}</strong></h3>
      {:else}
      <h3 class="subtitle"><strong>Not yet connected!</strong></h3>
      {/if}
      <a class="button is-primary" on:click={() => blockchain.connect(chain)}>Connect Wallet</a>
      <p class="help is-info">Connect your wallet to {getChainDataByChainId(chain).name} to complete your order.</p>
    </EmptyState>

    {/if}

    <!-- ##################################################################  -->
    {#if step >= 3 && validChain}

    <h3 class="heading has-text-centered mb-3">Order summary</h3>

    {#each Object.keys($cart) as entry}
    {#if /^\d+$/.test(entry) && $cart[entry]}

    <div class="box level slate">
      <div class="level-left">
        <div class="level-item">
          <p class="subtitle">
            <span class="icon-text">
              <span>{$cart[entry]} x {p.channels[entry].label}</span>
            </span>
          </p>
        </div>
      </div>
      <div class="level-right">
        <p class="level-item">
          {p.channels[entry].amount || 'free'}
        </p>
      </div>
    </div>
    {/if}
    {/each}


    <div class="box m-6 has-text-right">

      {#if !ready}
      <article class="message is-danger">
        <div class="message-body">
          In order to buy your ticket(s), you must first approve token spending.
        </div>
      </article>
      {/if}

      {#each $cart.tokenSet.values() as amount}
      {#if amount.token.type === 'ERC20'}
      <Approve {contract} {amount} max={false} bind:allowed={$allowed[amount.token.address]}>
        {JSON.stringify(amount)}
      </Approve>
      {/if}
      {/each}

      {#if success}
      <p>
        Well done, ticket(s) have been issued...
        <a href="/wallet/">See your ticket(s) in your Rouge wallet</a>
      </p>

      {:else}
      <TxButton disabled={!ready} class="button is-primary mt-4" submitCtx={buyCtx} on:success={() => success = true}>
        Checkout {#if $cart.total}(total={$cart.total}){/if}
      </TxButton>
      <p>After payment, each purchased ticket will be delivered as an NFT directly in your wallet.</p>
      {/if}

      <!--
           <p>I trust this device, store proof of ownership on this device for quick redemption</p>
      -->

    </div>

    {/if}



</Project>


<style lang="scss">

@import "../../../../../scss/_variables.scss";
@import "bulma/sass/utilities/_all";

input.is-narrow {
  max-width: 7rem;
  width: auto;
  diplay: in-line;
}

.tabs li.is-active a {
  border-bottom-width: 2px;
  border-bottom-color: $brand;
  color: $brand;
}

@include mobile {

  .tabs > ul {
    flex-direction: column;

    li {
      width: 100%;
    }

    li.is-active a {
      border-bottom-color: $brand;
      color: $brand;
    }
  }

  table, thead, tbody, th, td, tr {
	display: block;
  }

  thead.classic tr {
	position: absolute;
	top: -9999px;
	left: -9999px;
  }

  tbody  tr { border: 1px solid #ccc; }

  td {
	/* Behave  like a "row" */
	border: none;
	border-bottom: 1px solid #eee;
	position: relative;
	padding-left: 30%;
  }

  td:before {
	/* Now like a table header */
	position: absolute;
	/* Top/left values mimic padding */
	top: 6px;
	left: 6px;
	width: 45%;
	padding-right: 10px;
	white-space: nowrap;
	}

  td:nth-of-type(1):before { content: "Price"; }
  td:nth-of-type(2):before { content: "Qty"; }

}

</style>
