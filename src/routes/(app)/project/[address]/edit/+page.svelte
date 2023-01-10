<script>
  import { onMount } from 'svelte'

  //import { goto } from '$app/navigation'

  import project from '$stores/project.js'

  import Project from '$components/form/Project.svelte'

  export let address

  let form
  let input

  export let data

  $: ({ address } = data)

  const control = {
    isLoading: false,
    error: {}
  }

  $: p = $project[address] || {}

  const save = async () => {
    if (!await form.validate()) return

    console.log('update ok', input)

    project.updateDraft(address, {
      ...input,
      channels: p.channels,
    })
    project.refresh(address)

    //goto(`/project/${address}/draft`)
    history.go(-1)

  }

  onMount( () => {
    input = JSON.parse(JSON.stringify($project[address]))
  })

</script>



  <h2 class="title">Edit your event</h2>

  {#if input?.when}
  <Project bind:this={form} bind:data={input} edit={true}/>
  {/if}

  <div class="level slate">
    <div class="level-left">
    </div>
    <div class="level-right">
      <div class="level-item">
        <h3><a class="button is-black"  on:click={() => history.go(-1)}>Cancel</a><h3>
      </div>
      <div class="level-item">
        <h3><a class="button is-primary" on:click={save}>Save</a><h3>
      </div>
    </div>
  </div>

