<script>
  import { signerAddress, chainId, chainData } from 'svelte-ethers-store'

  import dayjs from 'dayjs'
  import localizedFormat from 'dayjs/plugin/localizedFormat.js'

  import blockchain from '$lib/blockchain.js'
  import { ipfs } from '$lib/actions/ipfs.js'

  import project from '$stores/project.js'

  import Icon from '$components/Icon.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'
  import Tickets from '$components/Tickets.svelte'
  import LoadEvent from '$components/form/LoadEvent.svelte'

  $: addressesAsBearer = $project.addressesAsBearer || []

  const loaders = {}
  const tickets = {}

  let loadActive = false

  const openLoad = () => {
    if (!$signerAddress) return
    loadActive = true
  }

  const success = ({ detail }) => {
    project.addBearer(detail)
  }

</script>

{#if !$signerAddress}

  <EmptyState svg="/bad-connection.svg">
    <h3 class="subtitle"><strong>Not connected!</strong></h3>
    <a class="button is-primary" on:click={() => blockchain.connect()}>Connect Wallet</a>
    <p class="help is-info">Connect your wallet to to see your tickets</p>
  </EmptyState>

{:else}

  <LoadEvent bind:active={loadActive} actionLabel="Add" title="Add a missing event in your wallet" on:success={success} />
        <h2 class="title"><span class="icon-text"><Icon name="wallet" size="24" /><span>Your NFT tickets on {$chainData.name}</span></h2>

  <div class="level">
    <div class="level-left">
      <div class="level-item">
      </div>
      <div class="level-item">
        <button class="button is-secondary is-inverted" disabled={!$signerAddress} on:click={openLoad}>Missing tickets?</button>
      </div>
      <div class="level-item">
        <a class="button is-secondary is-inverted" href="/">Events</a>
      </div>
      <div class="level-item">
        <a class="button is-secondary is-inverted" href="/rewards"><Icon class="mr-1" name="Award" />Rewards & Achievements</a>
      </div>

    </div>
  </div>

  {#if addressesAsBearer && addressesAsBearer.length}

    {#each addressesAsBearer as address}

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
                <strong><a href="/i/ticket/{$chainId}-{address}/">{$project[address].name || '...'}</a></strong>
              </div>

              {#if $project[address].when && $project[address].when.length === 2}
              <small>
                from {dayjs($project[address].when[0]).format('LLLL')}<br /> to {dayjs($project[address].when[1]).format('LLLL')}
              </small>
              {/if}

            </div>
          </div>

        </div>

        <div class="level-right">

          <p class="level-item">
            <button on:click={() => tickets[address].load()} disabled={loaders[address] ? true : undefined}  class="button is-small is-primary is-outlined is-pulled-right clearfix" >Refresh</button>
          </p>
          <p class="level-item">
            <a href="/i/ticket/{$chainId}-{address}/" disabled={loaders[address] ? true : undefined}  class="button is-small is-primary is-outlined is-pulled-right clearfix" >Get tickets</a>
          </p>
          <!--
          <p class="level-item">
            <a href="/i/ticket/{$chainId}-{address}/" disabled={loaders[address] ? true : undefined}  class="button is-small is-primary is-outlined is-pulled-right clearfix" >Add ERC721</a>
          </p>
          -->
        </div>

      </div>

      <Tickets {address} bind:this={tickets[address]} bind:loading={loaders[address]} />

    {/each}

  {:else}
    <EmptyState svg="/no-records.svg">
      <h3 class="subtitle"><strong>No tickets found!</strong></h3>
      <p class="help is-info">Switch network to see your tickets on other chains.</p>
    </EmptyState>
  {/if}

{/if}
