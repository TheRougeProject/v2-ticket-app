<script>
  import { onMount } from 'svelte'
  import { ethers } from 'ethers'

  import { chainId, chainData } from 'svelte-ethers-store'

  import { goto } from '$app/navigation'

  import blockchain, { getChainTokens } from '$lib/blockchain.js'
  import { types } from '$lib/enums'

  import project from '$stores/project.js'

  import Channel from '$components/form/Channel.svelte'

  export let data;
  $: ({ address } = data);

  let form

  let input = {
    type: 'ticket',
    free: false,
  }

  $: p = $project[address] || {}
  $: tokens = $chainId ? getChainTokens($chainId, $chainData) : {}

  const add = async () => {
    if (!await form.validate()) return

    if (!p._isDraft) return

    const { symbol, price, free, ...channel } = input

    if (!free) {
      channel.amount = tokens[symbol].newAmount(price)
    }

    project.updateDraft(address, { ...p, channels: [ ...p.channels, channel ] })
    project.refresh(address)

    goto(`/project/${address}/draft`)
  }


</script>


    <h2 class="title">Add a ticket sales channel</h2>

    {#if p._isDraft}

    {#if input}<Channel bind:this={form} bind:data={input} />{/if}

    <div class="level slate">
      <div class="level-left">
      </div>

      <div class="level-right">
        <div class="level-item">
          <h3><a class="button is-black"  on:click={() => history.go(-1)}>Cancel</a><h3>
        </div>
        <div class="level-item">
          <h3><a class="button is-primary" on:click={add}>Add</a><h3>
        </div>
      </div>

    </div>
    {:else}

    <article class="message is-warning">
      <div class="message-body">
        You cannot add new channel after publishing in this beta version.
      </div>
    </article>

    {/if}
