<script>
  import { onMount } from 'svelte'

  import { chainId, chainData } from 'svelte-ethers-store'

  import { getChainTokens } from '$lib/blockchain.js'
  import backend from '$lib/backend.js'

  import { ipfs } from '$lib/actions/ipfs.js'

  import DropZone from '$components/DropZone.svelte'
  import CropperModal from '$components/CropperModal.svelte'
  import Waiting from '$components/Waiting.svelte'
  import Icon from '$components/Icon.svelte'
  import Accordion from '$components/design/Accordion.svelte'

  export let data
  export let edit = false

  const control = {
    isWaiting: false,
    isLoading: false,
    error: {}
  }

  const assets = []


  let cropper
  let cropActive = false

  const handleUpload = event => {
    const file = event.detail.acceptedFiles[0]
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const image = new Image()
      image.src = e.target.result
      image.onload = ({ target }) => {
        if (target.width < 96) {
          control.error.icon = `Icon dimensions (${target.width} x ${target.height} px) is too small: a minimum 96px width is required`
          return
        }
        if (target.height < 96) {
          control.error.icon = `Icon dimensions (${target.width} x ${target.height} px) is too small: a minimum 96px height is required`
          return
        }
        delete control.error.icon
        data.icon = target.src
        // XXX repace by activate ?
        cropper.reset()
        cropActive = true
      }
    }
  }

  export const validate = async () => {
    control.error = {}

    if (!data.label) {
      control.error.label = 'This field is required'
    }

    if (data.supply < 1) {
      control.error.supply = 'Minimum supply is 1 (leave empty for infinite)'
    }

    if (!data.free) {
      if (!data.price) {
        control.error.price = 'This field is required unless ticket is free'
      }
    }

    if (Object.keys(control.error).length > 0) return false

    if (/^data:image/.test(data.icon)) {

      control.isWaiting = true
      control.loadText = edit ? 'Updating your channel media...' : 'Uploading your channel media...'

      // XXX better naming ?
      const upload = await backend.uploadFile(control.croppedIcon || data.icon)
      console.log('upload answer', upload)

      if (upload && upload.success) {
        data.icon = `ipfs://${upload.cids[0].cid}`
        control.isWaiting = false
        return true
      }

      cropper.reset()
      control.error.icon = 'Server error, please retry later'
      control.isWaiting = false
      return false
    }

    return true
  }

  $: tokens = $chainId ? getChainTokens($chainId, $chainData) : {}

  let opened

  onMount(() => {
    if (data.icon || data.max) opened = true
  })

</script>

<CropperModal
  bind:this={cropper}
  bind:active={cropActive}
  minWidth={96}
  minHeight={96}
  title="Resize & Crop your Icon"
  image={data.icon}
  handler={cropped => { control.croppedIcon = cropped  }}
/>

<div class="columns is-multiline">

  <div class="column is-one-third">
    <div class="field" >
      <label class="label">Channel type</label>
      <p class="control">
        <span class="select">
          <select bind:value={data.type}>
            {#each ['ticket'] as type}
            <option>{type}</option>
            {/each}
          </select>
        </span>
      </p>
    </div>
  </div>

  <div class="column is-two-thirds">
    <div class="field" >
      <label class="label">Label</label>
      <p class="control">
        <input class="input" class:is-danger={control.error.label} type="text" placeholder="Standard Rate, Early Bird, VIP, etc" bind:value={data.label}>
      </p>
      {#if control.error.label}<p class="help is-danger">{control.error.label}</p>{/if}
    </div>
  </div>

  <div class="column is-one-third">
    <div class="field" >
      <label class="label">Supply available</label>
      <p class="control">
        <input class="input" type="text" placeholder="default = no limit" bind:value={data.supply}>
      </p>
      {#if control.error.supply}<p class="help is-danger">{control.error.supply}</p>{/if}
    </div>
  </div>


  <div class="column is-one-quarter">
    <div class="field">
      <label class="label">Free?</label>
      <input id="isFree" type="checkbox" class="switch is-rtl is-outlined" bind:checked={data.free}>
      <label for="isFree" />
    </div>
  </div>

  {#if !data.free}
  <div class="column xis-one-quarter">
    <div class="field" >
      <label class="label">Price</label>
      <p class="control">
        <input class="input" class:is-danger={control.error.price} type="text" placeholder="Selling price" bind:value={data.price}>
      </p>
      {#if control.error.price}<p class="help is-danger">{control.error.price}</p>{/if}
    </div>
  </div>

  <div class="column xis-one-quarter">
    <div class="field" >
      <label class="label">Asset</label>
      <p class="control">
        <span class="select">
          <select bind:value={data.symbol}>
            {#each Object.keys(tokens) as symbol}
            <option>{symbol}</option>
            {/each}
          </select>
        </span>
      </p>
    </div>
  </div>
  {/if}

</div>


<Accordion bind:opened label={opened? "Hide advanced channel settings" : "Show advanced channel settings"}>

  <div class="columns is-multiline">

    <div class="column is-two-thirds">
      <div class="field">
        <label class="label">Channel icon</label>
        {#if data.icon}
          <div class="columns is-vcentered">
            <div class="column is-half">
              <figure class="image is-96x96" style="overflow: hidden;">
                {#if /^ipfs:/.test(data.icon) && !control.croppedIcon}
                  <img data-ipfs={data.icon} use:ipfs>
                {:else}
                  <img src={control.croppedIcon || data.icon}>
                {/if}
              </figure>
            </div>
            <div class="column is-half">
              <a class="button is-small mb-3" disabled={!/^data/.test(data.icon) || undefined} on:click={() => {cropActive = true}}>Crop/Resize</a>
              <br />
              <a class="button is-small " on:click={() => {data.icon = null}}>Remove</a>
            </div>
          </div>
        {:else}
          <DropZone multiple={false} on:drop={handleUpload} buttonLabel="Upload a file" buttonClass="is-small">
            <p class="mb-3 is-size-7">
              PNG or JPEG
              (min. size 96x96 pixels, square ratio)
            </p>
          </DropZone>
        {/if}
        {#if control.error.icon}<p class="help is-danger">{control.error.icon}</p>{/if}
      </div>
    </div>

    <div class="column is-two-thirds">
    </div>

    <div class="column is-two-thirds">
      <div class="field" >
        <label class="label">Max tickets per unique address</label>
        <p class="control">
          <input class="input" type="text" placeholder="default = no limit" bind:value={data.max}>
        </p>
        {#if control.error.max}
          <p class="help is-danger">{control.error.max}</p>
        {:else}
          <p class="help is-info">Front-end only. Not enforced onchain...</p>
        {/if}
      </div>
    </div>


  </div>

</Accordion>

<Waiting active={control.isWaiting}>
  {#if !control.loadClose}
    <progress class="progress is-small is-primary" max="100"></progress>
  {/if}
  <p class="content">{control.loadText}</p>
  <footer class="modal-card-foot">
    {#if control.loadCancel}
      <a class="button is-black">Cancel</a>
    {/if}
    {#if control.loadClose}
      <a class="button is-primary" on:click={() => {control.isWaiting = false}}>Close</a>
    {/if}
  </footer>
</Waiting>
