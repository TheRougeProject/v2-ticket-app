<script>
  import { onMount } from 'svelte'

  import { defaultEvmStores as evm, signerAddress, chainId, chainData } from 'svelte-ethers-store'

  import blockchain from '$lib/blockchain.js'
  import backend, { authed } from '$lib/backend.js'

  import { formatAddress } from '$lib/utils'
  import { getSupportedChainIds } from '$lib/enums.js'

  import { goto } from '$app/navigation'

  import account from '$stores/account.js'
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

  const bookmark = ({ detail }) => {
    project.addBearer(detail)
    return false
  }

  const unbookmark = ({ detail }) => {
    project.rmBearer(detail)
    return false
  }

  const search = async () => {
    if (!$authed) {
      searchActive = true
      return
    }
    const projects = (await backend.getAcquired($signerAddress)).logs.reduce((acc, { a }) => ({ ...acc, [a]: true}), {})
    all = Object.keys(projects)
  }

  let all = []

  $: supportedChainIds = getSupportedChainIds($registry.includeTestnets)

  onMount( () => {
    if (!$signerAddress || !supportedChainIds.includes($chainId)) goto('/')
  })


</script>

<LoadEvent title="Bookmark any existing event" actionLabel="Bookmark" bind:active={loadActive} on:success={bookmark} />

<section class="sectionx">

{#if searchActive}
  <Authed on:close={() => {searchActive = false; if ($authed) search()}}></Authed>
{/if}


  <div class="level">
    <div class="level-left">
      <div class="level-item">
        <a class="button is-secondary is-inverted" href="/book"><span class="icon-text"><Icon name="Book" size="24" /><span>Back to your tickets book</span></a>
      </div>
    </div>
  </div>

  {#if !all.length}

    <h2 class="title">Search missing tickets or event in your book</h2>

    <article class="section message is-info">
      <div class="message-body content">
        <p>
          You cannot find a ticket you possess in your book? First,
          don't worry, your tickets are still securely on the blokchain and in your
          wallet and this tool will help you bring it back in your tickets book.
        </p>
        <p>
          Please check the following points:
        </p>
        <ul>
          <li>
            Are you logged on the correct chain ? The current chain is <b>{$chainData.name}</b>.
            Switch to the correct chain if your ticket was issued on another chain...
          </li>
          <li>
            Are you connected with the right account ? The current connected account is <b>{formatAddress($signerAddress)}</b>.
            Switch to the correct account if your ticket was bought with another account...
          </li>
          <li>
            You can also search them in all events for which you ever bought at least one ticket. Your tickets book is saved in your browser
            localstorage so it is not automatically transfered to other device or browser and is reset if your clear the site data of your browser.
            <br/><button class="button  my-3" disabled={!$signerAddress} on:click={search}>Search events</button>
          </li>
          <li>
            If you have any of an event id, an event link, a contract address or ticket code or any connected QR code,
            you can also bookmark that respective event so it is listed in your ticket book...
            <br/><button class="button my-3" disabled={!$signerAddress} on:click={openLoad}>Bookmark any event</button>
          </li>
          <!--
               todo wallet load
          -->
        </ul>
    </article>


  {:else}

      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <h2 class="title">Unbookmarked events you have tickets</h2>
          </div>
        </div>
      </div>

      {#each all as address}

        {#if $project.addressesAsBearer && !$project.addressesAsBearer.includes(address)}

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

                <small>
                  {$account.balancesFor(address).total} tickets
                </small>

              </div>
            </div>

          </div>

          <div class="level-right">
            <p class="level-item"><small><a on:click={() => bookmark({ detail: address})}>
              <span class="icon-text"><Icon name="Bookmark" /><span>Bookmark</span>
            </a></small></p>
          </div>
        </div>

            {/if}
      {/each}

  {/if}

</section>

<style lang="scss">

  @import "../../../../scss/_variables.scss";
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
