<script>
  import { onMount } from 'svelte'

  import { getChainDataByChainId, signerAddress, chainId, chainData } from 'svelte-ethers-store'

  import blockchain from '$lib/blockchain.js'
  import { formatAddress } from '$lib/utils'
  import { getSupportedChainIds } from '$lib/enums.js'

  import project from '$stores/project.js'
  import registry from '$stores/registry.js'

  import { ipfs } from '$lib/actions/ipfs.js'

  import EmptyState from '$components/design/EmptyState.svelte'
  import Confirm from '$components/design/Confirm.svelte'
  import Create from '$components/form/Create.svelte'
  import LoadEvent from '$components/form/LoadEvent.svelte'
  import Address from '$components/design/Address.svelte'

  import Icon from '$components/Icon.svelte'

  let createActive = false
  let loadActive = false
  let testnets = false

  const openCreate = () => {
    if (!$signerAddress) return
    createActive = true
  }

  const openLoad = () => {
    if (!$signerAddress) return
    loadActive = true
  }

  const load = ({ detail }) => project.add(detail)

  $: all = $project.addresses || []

  $: supportedChainIds = getSupportedChainIds($registry.includeTestnets)

  $: valid = $signerAddress && supportedChainIds.includes($chainId)

  let confirm

</script>


{#if $signerAddress}
<Create bind:active={createActive} />
<LoadEvent bind:active={loadActive} on:success={load} />
{/if}

<nav class="breadcrumb has-succeeds-separator my-0" aria-label="breadcrumbs">
  <ul>
    {#if valid}
    <li class="is-active"><a href="#" aria-current="page">Events</a></li>
    {:else}
    <li class="is-active"><a href="#" aria-current="page">Home</a></li>
    {/if}
  </ul>
</nav>

<section class="section has-background-white is-rounded">

  {#if valid}

  <div class="level">
    <div class="level-left">
      <div class="level-item">
        <h2 class="title">Events</h2>
      </div>
      <div class="level-item">
        <button class="button is-primary is-inverted" disabled={!$signerAddress} on:click={openCreate}>Create event</button>
      </div>
      <div class="level-item">
        <button class="button is-secondary is-inverted" disabled={!$signerAddress} on:click={openLoad}>Load existing event</button>
      </div>
      <div class="level-item">
        <a class="button is-secondary is-inverted" href="/wallet/"><span class="icon-text"><Icon name="wallet" size="24" /><span>NFT tickets</span></a>
      </div>
      <div class="level-item">
        <button class="button is-secondary is-inverted" disabled={!$signerAddress} on:click={blockchain.disconnect}>Disconnect</button>
      </div>
    </div>
  </div>

  {#if !all.length}
    <EmptyState svg="/no-records.svg">
      <h3 class="subtitle"><strong>No events on {$chainData.name}!</strong></h3>
      <a class="button is-primary" on:click={openCreate}>Create event</a>
      <p class="help is-info">Switch network to see your events on other chains.</p>
    </EmptyState>
    {/if}

    {#each all as address}

    <div class="box level is-slate">

      <div class="level-left">

        <div class="level-item">
          <a href="/project/{address}/{ $project[address]._isDraft ? 'draft/' : ''}">
            <figure class="image xis-16by9" style="width: 150px;">
              {#if $project[address].visual}
              <img
                data-ipfs={$project[address].visual}
                src="/empty_p.png"
                alt="Project main visual"
                style="object-fit: cover;"
                use:ipfs
              />
              {:else}
              <img
                src="/empty_p.png"
                alt="Project main visual"
                style="object-fit: cover;"
              />
              {/if}
            </figure>
          </a>
        </div>

        <div class="level-item">
          <div class="flex is-flex-direction-column is-align-content-space-around summary">
          <div>
            <strong><a href="/project/{address}/{ $project[address]._isDraft ? 'draft/' : ''}">{$project[address].name || '...'}</a></strong>
            {#if $project[address]._isDraft}<span class="tag is-primary">Draft</span>{/if}
          </div>

          <div>
            {#if !$project[address]._isDraft}<Address noIdenticon={true } {address} /> · {/if}{$project[address].channels?.length} channels
          </div>
          {#if !$project[address]._isDraft}
          <small>
              {$project[address].state?.acquired || '0'} attendees · {$project[address].state?.redeemed || '0'} checked-in
          </small>
          {/if}
        </div>
        </div>

      </div>

      <div class="level-right">
        {#if $project[address]._isDraft}
        <p class="level-item"><small><a href="/project/{address}/draft/">
          <span class="icon-text"><Icon name="edit" /><span>Edit</span>
        </a></small></p>
        <p class="level-item is-hidden-mobile"><small>·</small></p>
        <Confirm
          let:activate
          let:close
          title="Delete the draft event?"
          message="Are you sure you want to delete the draft event «{$project[address].name}» and everything you set up? There is no going back."
          confirmLabel="Delete"
          on:confirm={() => project.deleteDraft(address) && close()}
        >
          <p class="level-item"><small><a on:click={activate}>
            <span class="icon-text"><Icon name="trash" /><span>Delete draft</span>
          </a></small></p>
        </Confirm>
        {:else}
        <p class="level-item"><small><a href="/i/ticket/{$chainId}-{address}/">
          <span class="icon-text"><Icon name="ticket" /><span>Tickets page</span>
        </a></small></p>
        <p class="level-item is-hidden-mobile"><small>·</small></p>
        <p class="level-item"><small><a href="/project/{address}/scan/">
          <span class="icon-text"><Icon name="scanQr" /><span>Check-In</span>
        </a></small></p>
        {/if}
      </div>
    </div>

    {/each}

    {:else}

    <h2 class="title">Welcome to Rouge Ticket</h2>

    <article class="message is-danger">
      <div class="message-body">
        Beta version using the new Rouge V2 Protocol.
        <ul>
          <li>Check our <a target="_blank" href="https://docs.rouge.network">documentation</a> website.</li>
          <li>Join us <a target="_blank" href="https://discord.gg/aUeSjsN8Tx">on Discord</a> for feedback, bug reports and help.</li>
        </ul>
      </div>
    </article>

    <article class="message is-info">
      <div class="message-body">
    <div class="columns is-multiline">
      <div class="column is-half">
        <p class="subtitle is-5">
          <strong>Supported networks:</strong>
          <span class="field ml-2">
            <input id="testnets" type="checkbox" name="testnets" class="switch is-rtl" bind:checked={$registry.includeTestnets}>
            <label class="has-text-grey-light" for="testnets">Include testnets?</label>
          </span>
        </p>
      </div>
      <div class="column is-half">
        <p class="is-flex is-flex-wrap-wrap">
          {#each supportedChainIds as id}
            <a target="_blank" href="{getChainDataByChainId(id).infoURL}">
              <span class="tag is-grey mr-2 mb-2">{getChainDataByChainId(id).name}</span>
            </a>
          {/each}
        </p>
      </div>
    </div>
      </div>
    </article>

    {#if $signerAddress}

    <EmptyState svg="/bad-connection.svg">
      <h3 class="subtitle"><strong>Sorry, the network «{$chainData.name}» is not yet supported.</strong></h3>
      {#each supportedChainIds as id}
      <a class="button is-primary mb-1 mr-1" on:click={() => blockchain.connect(id)}>Switch to {getChainDataByChainId(id).name}</a>
      {/each}
      <p class="help is-info">This app in still beta and we only support a few networks for now.
        Do you want us to support {$chainData.name} in the future, let us know in our discord.</p>
    </EmptyState>

    {:else}

    <EmptyState svg="/bad-connection.svg">
      <h3 class="subtitle"><strong>Not connected!</strong></h3>
      <a class="button is-primary" on:click={() => blockchain.connect()}>Connect Wallet</a>
      <p class="help is-info">In order to view your events or create an event, you need to connect.</p>
    </EmptyState>

    {/if}

    {/if}

    <!-- -
         <p><a>Still can't find your event ?</a></p>
    -->

</section>

<style lang="scss">

  @import "../../scss/_variables.scss";
  @import "bulma/sass/utilities/_all";

  .box {
    background-color: $grey-lightest;
    border-radius: $radius-large;
  }

  .summary {
    line-height: 1.5rem;

    @include mobile {
      text-align: center;
    }

  }

  .networks {
    :not(:last-child):after {
         content: " | ";
    }

  }


</style>
