<script>
  import { onMount } from 'svelte'
  import { ethers } from 'ethers'

  import { signerAddress } from 'svelte-ethers-store'
  import { Jazzicon, Identicon } from 'svelte-ethers-store/components'

  import { abiEncodeAuth } from '@rouge/contracts/rouge'

  import blockchain from '$lib/blockchain.js'
  import { types } from '$lib/enums'

  import project from '$stores/project.js'
  import tracker from '$stores/tracker.js'

  import Account from '$components/design/Account.svelte'
  import Slate from '$components/design/Slate.svelte'

  import Icon from '$components/Icon.svelte'
  import TxButton from '$components/TxAction/Button.svelte'

  export let data

  $: ({ address } = data)

  let calls = []
  const control = {}

  $: p = $project[address] || {}

  $: ready = $signerAddress && p.setupManager
  $: updatable = ready ? $signerAddress === p.setupManager : false

  const actions = {}

  // loop txaction & reset them after receiving invalidation (from propagated event)
  // XXX is there a cleaner lifecyle ?
  $: if (ready) {
    for (const k of Object.keys(selectors)) {
      // console.log('test invalidation', k)
      if (actions[k]) actions[k].reset()
    }
  }

  const selectors = {
    acquire: { icon: 'ticket', label: 'Ticket sales [acquisition]', delegated: true },
    //addChannels: { icon: '', label: '', delegated: true },
    //updateAuthorizations: { icon: '', label: ', delegated: true' },
    //widthdraw: { icon: '', label: '', delegated: true },
    //widthdrawToken: { icon: '', label: '', delegated: true },
    //approveToken: { icon: '', label: '', delegated: true },
    redeem: { icon: 'scanQr', label: 'Ticket scanner [redemption]', delegated: true },
  }

  const authorizeCtx = (selector, grant) => {
    const contract = blockchain.rouge(address)
    const auths = [
      { scope: contract.interface.getSighash(selector), grant }
    ].map(a => abiEncodeAuth(a))
    return {
      label: 'Transaction tracker...',
      call: contract.updateAuthorizations,
      params: [ auths ],
    }
  }

  const dismiss = callId => {
    calls = calls.filter(c => c !== callId)
  }


</script>



  <h2 class="title">State</h2>

  <Slate>
    <span class="icon-text">
      <Icon name="UserExclamation" size="24" />
      <span>Manager at creation</span>
    </span>

    <div slot="info">
      <Account address={p.setupManager} />
    </div>
  </Slate>

  {#if ready && !updatable}
  <article class="message is-danger">
    <div class="message-body">
      You are not a manager of this event, so you cannot change its state
    </div>
  </article>
  {/if}

  {#each Object.keys(selectors) as k}

  <Slate>
    <span class="icon-text">
      <Icon name={selectors[k].icon} size="24" />
      <span>{selectors[k].label}</span>
    </span>

    <div slot="info">
      {#if p.state.enabled[k]}
      <span class="icon-text has-text-success">
        <Icon name="check" size="24" />
        <p class="subtitle heading pl-2">enabled</p>
      </span>
      {:else}
      <span class="icon-text has-text-danger">
        <Icon name="lock" size="24" />
        <p class="subtitle heading pl-2">disabled</p>
      </span>
      {/if}
    </div>

    <div slot="actions">
      <TxButton bind:this={actions[k]} class="button is-outlined is-primary" disabled={!updatable} disabledHelp="no permissions" submitCtx={() => authorizeCtx(k, !p.state.enabled[k])}>
        {#if p.state.enabled[k]}Disable{:else}Enable{/if}
      </TxButton>
    </div>
  </Slate>

  {/each}

  {#each calls as callId}
  <TxSteps {callId} on:close={() => dismiss(callId)}/>
  {/each}
