<script>
  import { onMount } from 'svelte'
  import { ethers } from 'ethers'

  import { chainId, chainData } from 'svelte-ethers-store'

  import { goto } from '$app/navigation'

  import blockchain, { getChainTokens } from '$lib/blockchain.js'
  import { types } from '$lib/enums'

  import project from '$stores/project.js'

  import Channel from '$components/form/Channel.svelte'

  export let data

  $: ({ address, index } = data);

  const control = {
    isLoading: false,
    error: {}
  }

  $: p = $project[address] || {}
  $: tokens = $chainId ? getChainTokens($chainId, $chainData) : {}

  let form
  let input

  const save = async () => {
    if (!await form.validate()) return

    const { symbol, price, free, ...channel } = input

    if (!free) {
      channel.amount = tokens[symbol].newAmount(price)
    }
    const updated = [ ...p.channels ]
    updated[index] = channel

    project.updateDraft(address, { ...p, channels: updated })
    project.refresh(address)

    goto(`/project/${address}/draft`)
  }

  onMount(() => {
    const channel = $project[address].channels[index]
    if (channel.amount) {
      input = {
        ...channel,
        price: channel.amount.toFormat(),
        symbol: channel.amount.token.symbol,
      }
    } else {
      input = {
        ...channel,
        free: true,
      }
    }
    console.log('input sent', input)
  })

</script>

<section class="section">
  <div class="container">

    {#if p._isDraft}

    {#if index != null}
    <h2 class="title">Update ticket sales channel</h2>
    {:else}
    <h2 class="title">Add a ticket sales channel</h2>
    {/if}

    {#if input}<Channel bind:this={form} bind:data={input} />{/if}

    <div class="level slate">
      <div class="level-left">
       </div>
       <div class="level-right">
         <div class="level-item">
           <a class="button is-black" on:click={() => history.go(-1)}>Cancel</a>
         </div>
         <div class="level-item">
           <a class="button is-primary" on:click={save}>Save</a>
         </div>
       </div>
    </div>

    {:else}

    <article class="message is-primary">
      <div class="message-body">
        You cannot yet add new channel in this beta version.
      </div>
    </article>

    {/if}

  </div>
</section>
