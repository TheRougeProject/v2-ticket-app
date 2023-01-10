<script>
  import { onMount } from 'svelte'

  import { defaultEvmStores as evm } from 'svelte-ethers-store'

  import { dev } from '$app/environment'

  //import { goto } from '$app/navigation'
  import { goto } from '$lib/utils'

  import Modal from '$components/Modal.svelte'
  import Project from '$components/form/Project.svelte'
  import Authed from '$components/Authed.svelte'

  import project from '$stores/project.js'

  export let active = false

  let data
  let form
  let modal

  const create = async () => {
    if (!await form.validate()) return

    const address = await project.createDraft(data)
    goto(`/project/${address}/draft#new`)
    modal.close()
  }

  onMount( () => {
    if (dev && evm.$chainId === 13370) {
      data = {
        online: true,
        template: 'event',
        category: 'Conference',
        when: ["2022-07-13T22:00:00.000Z","2022-07-22T21:59:59.999Z"],
        name: "The Rouge Protocol Conf",
        url: "https://en.wikipedia.org/wiki/Monty_Python%27s_Flying_Circus",
        visual: "ipfs://QmZvarkZhFWK5LA8XUrwWJEjrEgwB2LU3ng5BufekDqqcy",
        channels: [],
        _isDraft: true,
      }
    } else {
      data = {
        template: 'event',
        online: true,
        channels: [],
        _isDraft: true,
      }
    }
  })

</script>

{#if active}
<Authed on:close={() => {active = false}}>
  <Modal bind:this={modal} bind:active={active} noCloseButton={true}>
    <div class="modal-card is-large">
      <section class="modal-card-body has-background-light">

        <h2 class="title">Create an event</h2>

        {#if data}<Project bind:this={form} bind:data={data} />{/if}

      </section>
      <footer class="modal-card-foot">
        <a class="button is-black" on:click={modal.close}>Cancel</a>
        <a class="button is-primary" on:click={create}>Create</a>
      </footer>
    </div>
  </Modal>
</Authed>
{/if}
