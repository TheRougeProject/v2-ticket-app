<script>
  import { onMount } from 'svelte'

  import { defaultEvmStores as evm, signerAddress, chainId, chainData } from 'svelte-ethers-store'

  import blockchain from '$lib/blockchain.js'
  import backend, { authed } from '$lib/backend.js'

  import { formatAddress } from '$lib/utils'
  import { getSupportedChainIds } from '$lib/enums.js'

  //import { goto } from '$app/navigation'
  import { goto } from '$lib/utils'

  import project from '$stores/project.js'
  import registry from '$stores/registry.js'

  import { ipfs } from '$lib/actions/ipfs.js'

  import LoadEvent from '$components/form/LoadEvent.svelte'
  import Address from '$components/design/Address.svelte'
  import Authed from '$components/Authed.svelte'

  import Icon from '$components/Icon.svelte'

  let loadActive = false
  let searchActive = false
  let testnets = false

  const openLoad = () => {
    if (!$signerAddress) return
    loadActive = true
  }

  const load = ({ detail }) => {
    project.add(detail)
    return false
  }

  const search = async () => {
    if (!$authed) {
      searchActive = true
      return
    }

    // TODO old factories ..

    const projects = await backend.getProjects({
      from: $signerAddress,
      chainId: $chainId,
      address: blockchain.factory(evm.$chainId).address,
    })
    all = projects.logs.map(({ a }) => a.proxy)

    console.log({ projects, all })
}

  let all = []

  $: supportedChainIds = getSupportedChainIds($registry.includeTestnets)

  onMount( () => {
    if (!$signerAddress || !supportedChainIds.includes($chainId)) goto('/')
  })


</script>

<LoadEvent bind:active={loadActive} on:success={load} />

{#if searchActive}
  <Authed on:close={() => {searchActive = false; if ($authed) search()}}></Authed>
{/if}


<nav class="breadcrumb has-succeeds-separator my-0" aria-label="breadcrumbs">
  <ul>
    <li><a href="/">Events manager</a></li>
    <li class="is-active"><a href="#" aria-current="page">Search</a></li>
  </ul>
</nav>


<section class="section has-background-white is-rounded">

  {#if !all.length}

    <h2 class="title">Search events help</h2>

    <div class="columns is-centered is-vcentered">
      <div class="column is-narrow is-half">

        <article class="message is-info">
          <div class="message-body content">
            <p>
              You cannot find an event in your browser which has been deployed
              on-chain? That happens if you connect to a new device, a new browser
              or if you clear the site data of your browser.
            </p>
            <h4>
              Don't panic, this tool is here to help!
            </h4>
            <p>
              If you have any of the event QR code, a ticket QR code, the event contract
              address or the "get tickets" page link, use them <a on:click={openLoad}>to load the event</a>.
            </p>
            <p>
              If not, switch to the account that deployed the event on-chain and
              <a on:click={search}>search all events deployed by the connected account</a>...
            </p>
        </article>

          </div>
          <div class="column is-narrow is-half v-centered  has-text-centered">

            <div class="buttons has-text-centered">
              <button class="button is-primary is-inverted" disabled={!$signerAddress} on:click={openLoad}>Load event with QR code, address or share link</button>
              <button class="button is-primary is-inverted" disabled={!$signerAddress} on:click={search}>Search all events deployed by {formatAddress($signerAddress)}</button>
            </div>

          </div>
      </div>

  {:else}

      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <h2 class="title">Events deployed by {formatAddress($signerAddress)}</h2>
          </div>
          <div class="level-item">
            <a class="button is-secondary is-inverted" href="/"><span class="icon-text"><span>Back home</span></a>
          </div>
        </div>
      </div>

      {#each all as address}

        <div class="box level is-slate">

          <div class="level-left">

            <div class="level-item">
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

            </div>

            <div class="level-item">
              <div class="flex is-flex-direction-column is-align-content-space-around summary">
                <div>
                  <strong>{$project[address].name || '...'}</strong>
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
            {#if $project.addresses.includes(address)}
            <p class="level-item"><small>
              <span class="icon-text"><span>Loaded</span>
            </small></p>
            {:else}
            <p class="level-item"><small><a on:click={() => load({ detail: address})}>
              <span class="icon-text"><Icon name="SquarePlus" /><span>Load in events manager</span>
            </a></small></p>
            {/if}
          </div>
        </div>

      {/each}

  {/if}

</section>

<style lang="scss">

  @import "../../../scss/_variables.scss";
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
