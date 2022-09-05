<script>
  import { onMount } from 'svelte'
  import { ethers, constants } from 'ethers'

  import { signerAddress } from 'svelte-ethers-store'

  import blockchain from '$lib/blockchain.js'
  import { formatAmount } from '$lib/enums.js'
  import { formatAddress } from '$lib/utils'

  import project from '$stores/project.js'
  import nft from '$stores/nft.js'

  import { Identicon } from 'svelte-ethers-store/components'
  import EmptyState from '$components/design/EmptyState.svelte'
  import Slate from '$components/design/Slate.svelte'
  import Address from '$components/design/Address.svelte'
  import Icon from '$components/Icon.svelte'

  export let data

  $: ({ address } = data)

  $: p = $project[address] || {}

  let nfts = []

</script>



    <h2 class="title">Distribution channels</h2>

    {#if p.channels && p.channels.length}

    {#if true}
    <article class="message is-warning">
      <div class="message-body">
        You cannot edit channels after publishing in this beta version.
      </div>
    </article>
    {/if}

    {#each p.channels as channel, i}

    <Slate>
      <p class="subtitle">#{i} {channel.label}{#if channel.supply}&nbsp;x{channel.supply}{/if}</p>

      <div slot="info">
        {#if channel.amount?.token?.address}
        <Address address={channel.amount?.token?.address}>
          <span class="icon-text">
            <span>{channel.amount}</span><Icon name="ExternalLink" />
          </span>
        </Address>
        {:else}
          {channel.amount || 'free'}
        {/if}

      </div>

      <div slot="actions">
        <a disabled={true} class="button is-outlined is-primary" href="#">edit</a>
      </div>

    </Slate>

    {/each}

    {:else}

    <EmptyState svg="/empty-box.svg">
      <h3 class="subtitle"><strong>No channels.</strong></h3>
      <a class="button is-primary" href="/project/{address}/add-channel/">Add your first channel</a>
    </EmptyState>

    {/if}
