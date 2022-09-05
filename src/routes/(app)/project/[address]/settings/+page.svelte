<script>
  import { onMount } from 'svelte'
  import { ethers } from 'ethers'

  import { abiEncodeAuth } from '@rouge/contracts/rouge'

  import { goto } from '$app/navigation'

  import blockchain from '$lib/blockchain.js'
  import { types } from '$lib/enums'

  import project from '$stores/project.js'
  import tracker from '$stores/tracker.js'

  import Icon from '$components/Icon.svelte'
  import Confirm from '$components/design/Confirm.svelte'

  export let data

  $: ({ address } = data)

  $: p = $project[address] || {}

  export let forget = () => {
    project.rm(address)

    goto('/')

  }

</script>



  <h2 class="title">Settings</h2>

    <article class="message is-primary">
      <div class="message-body">
        <h3 class="title is-size-4 mb-4">Forget this event</h3>
        <div class="content">
          <p>
            Since your event has already been deployed, it can not be deleted.
            But you may choose to forget it so it doesn't get listed automatically
            on this device when you sign-in.
          </p>
        </div>

      <div class="level-right">
        <div class="level-item">

          <Confirm
            let:activate
            title="Forget this event?"
            message="Are you sure you want to forget the draft event {p.name}?"
            confirmLabel="Forget"
            on:confirm={forget}
          >
            <h3><a class="button is-primary" on:click={activate}>Forget</a></h3>
          </Confirm>

        </div>
      </div>

      </div>
    </article>


