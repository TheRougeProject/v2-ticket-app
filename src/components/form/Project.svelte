<script>
  import { onMount } from 'svelte'

  import { defaultEvmStores as evm } from 'svelte-ethers-store'

  import { dev } from '$app/env'

  import backend from '$lib/backend.js'
  import { categories, types } from '$lib/enums.js'

  import { ipfs } from '$lib/actions/ipfs.js'

  import Calendar from '$components/Calendar/index.svelte'
  import DropZone from '$components/DropZone.svelte'
  import CropperModal from '$components/CropperModal.svelte'
  import Waiting from '$components/Waiting.svelte'

  export let data = {}
  export let edit = false

  const control = {
    isWaiting: false,
    error: {}
  }

  let cropper

  // new uploaded image
  const handleUpload = event => {
    const file = event.detail.acceptedFiles[0]
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const image = new Image()
      image.src = e.target.result
      image.onload = ({ target }) => {
        // console.log(target.width, target.height)
        if (target.width < 768) {
          control.error.visual = `Image dimensions (${target.width} x ${target.height} px) is too small: a minimum 768px width is required`
          return
        }
        if (target.height < 432) {
          control.error.visual = `Image dimensions (${target.width} x ${target.height} px) is too small: a minimum 432px height is required`
          return
        }
        delete control.error.visual
        data.visual = target.src
        // XXX repace by activate ?
        cropper.reset()
        cropActive = true
      }
    }
  }

  export const validate = async () => {
    control.error = {}

    if (!data.name) {
      control.error.name = 'This field is required'
    }

    if (mobile) {
      data.when = [ data.when1, data.when2 ]
    }

    if (!data.when[0] || !data.when[1]) {
      control.error.when = 'Event starting and ending date and time are all required'
    }

    if (!data.online) {
      if (!data.address) {
        control.error.address = 'This field is required'
      }
      if (!data.postalCode) {
        control.error.postalCode = 'This field is required'
      }
      if (!data.city) {
        control.error.city = 'This field is required'
      }
      if (!data.country) {
        control.error.country = 'This field is required'
      }
    }

    if (data.url && !/^(https?|ipfs):/.test(data.url)) {
      data.url = 'http://' + data.url
    }

    console.log('control', control)

    if (Object.keys(control.error).length > 0) return false

    control.isWaiting = true
    control.loadText = edit ? 'Updating your draft event...' : 'Creating your draft event...'

    if (control.croppedVisual) data.visual = control.croppedVisual

    if (/^data:image/.test(data.visual)) {

      const upload = await backend.uploadMeta(data)
      console.log('upload answer', upload)

      if (upload && upload.success) {
        if (data._isDraft) {
          data.visual = `ipfs://${upload.cids[0].cid}`
          return true
        } else {
          // todo
        }
      }
      cropper.reset()
      control.error.visual = 'Server error, please retry later'
      control.isWaiting = false
      return false
    }

    return true
  }

  let cropActive = false
  let cropHandler = cropped => {
    console.log('received cropped visual', cropped.width)
    control.croppedVisual = cropped
  }

  onMount( () => {
    // console.log('bind data', JSON.stringify(data))
  })

  let innerWidth
  $: mobile = innerWidth < 769

</script>

<svelte:window bind:innerWidth={innerWidth}/>

<CropperModal
  bind:this={cropper}
  bind:active={cropActive}
  title="Resize & Crop your visual"
  image={data.visual}
  handler={cropHandler}
/>

<h3 class="subtitle mt-4">When?</h3>
<div class="columns is-multiline">

  {#if mobile}
    <div class="column is-full">
      <div class="field" >
        <label class="label">From</label>
        <p class="control" class:has-error={control.error.when} >
          <input class:is-danger={control.error.when} class="input" type="datetime-local"
                 placeholder="Event start date & time"
                 bind:value={data.when1}>
        </p>
      </div>
    </div>
    <div class="column is-full">
      <div class="field" >
        <label class="label">To</label>
        <p class="control" class:has-error={control.error.when} >
          <input class:is-danger={control.error.when} class="input" type="datetime-local"
                 placeholder="Evenr end date & time"
                 bind:value={data.when2}>
        </p>
      </div>
    </div>
  {:else}
    <div class="column is-full">
      <div class="field" >
        <label class="label">Date & time</label>
        <p class="control" class:has-error={control.error.when} >
          <Calendar type="datetime" bind:value={data.when} isRange={true} />
        </p>
        {#if control.error.when}<p class="help is-danger">{control.error.when}</p>{/if}
      </div>
    </div>
  {/if}

</div>

<!-- - todo timezone  -->

<h3 class="subtitle mt-4">What?</h3>

<div class="columns is-multiline">

  <div class="column is-two-thirds">
    <div class="field" >
      <label class="label">Name of your event</label>
      <p class="control">
        <input class:is-danger={control.error.name} class="input" type="text"
               placeholder="A not too long description title for your event (required)"
               bind:value={data.name}>
      </p>
      {#if control.error.name}<p class="help is-danger">{control.error.name}</p>{/if}
    </div>
  </div>

  <div class="column is-one-third">
    <div class="field">
      <label class="label">Category</label>
      <p class="control">
        <span class="select">
          <select bind:value={data.category}>
            <option></option>
            {#each categories as category}
              <option>{category}</option>
            {/each}
          </select>
        </span>
      </p>
    </div>
  </div>

  <div class="column is-two-thirds">
    <div class="field">
      <label class="label">Main visual</label>
      {#if data.visual}
        <div class="columns is-vcentered">
          <div class="column is-half">
            <figure class="image is-16by9 viewer">
              <div class="has-background-grey-lighter has-ratio">
                {#if /^ipfs:/.test(data.visual) && !control.croppedVisual}
                  <img data-ipfs={data.visual} style="object-fit: cover;" use:ipfs>
                {:else}
                  <img src={control.croppedVisual || data.visual} style="object-fit: cover;">
                {/if}
              </div>
            </figure>
          </div>
          <div class="column is-half">
            <a class="button mb-3" disabled={!/^data/.test(data.visual) || undefined} on:click={() => {cropActive = true}}>Crop/Resize</a>
            <br />
            <a class="button" on:click={() => {data.visual = null}}>Remove</a>
          </div>
        </div>
      {:else}
        <DropZone multiple={false}
                           on:drop={handleUpload}
                  buttonLabel="Upload a file"
        >
          <p class="mb-3">
            Upload or drop your event visual (PNG or JPEG) here<br />
            (min. recommended size 768x432 pixels, 16:9 ratio)
          </p>
        </DropZone>
      {/if}
      {#if control.error.visual}<p class="help is-danger">{control.error.visual}</p>{/if}
    </div>
  </div>

  <div class="column is-one-third">
    <div class="field">
      <label for="isOnline" class="label">Online?</label>
      <input id="isOnline" type="checkbox" class="switch is-rtl is-outlined" bind:checked={data.online}>
      <label for="isOnline" />
    </div>
  </div>

</div>


<h3 class="subtitle mt-4">Where?</h3>
<div class="columns is-multiline">

  {#if !data.online}
    <div class="column is-one-third">
      <div class="field" >
        <label for="venue"  class="label">Venue</label>
        <p class="control">
          <input id="venue" class="input" type="text" bind:value={data.venue}>
        </p>
        {#if control.error.venue}<p class="help is-danger">{control.error.venue}</p>{/if}
      </div>
    </div>

    <div class="column is-two-thirds">
      <div class="field" >
        <label class="label">Address</label>
        <p class="control">
          <input class:is-danger={control.error.address} class="input" type="text" bind:value={data.address}>
        </p>
        {#if control.error.address}<p class="help is-danger">{control.error.address}</p>{/if}
      </div>
    </div>

    <div class="column is-one-third">
      <div class="field" >
        <label class="label">Postal code</label>
        <p class="control">
          <input class:is-danger={control.error.postalCode} class="input" type="text" bind:value={data.postalCode}>
        </p>
        {#if control.error.postalCode}<p class="help is-danger">{control.error.postalCode}</p>{/if}
      </div>
    </div>

    <div class="column is-one-third">
      <div class="field" >
        <label class="label">City</label>
        <p class="control">
          <input class:is-danger={control.error.city} class="input" type="text" bind:value={data.city}>
        </p>
        {#if control.error.city}<p class="help is-danger">{control.error.city}</p>{/if}
      </div>
    </div>

    <div class="column is-one-third">
      <div class="field" >
        <label class="label">Country</label>
        <p class="control">
          <input class:is-danger={control.error.country} class="input" type="text" bind:value={data.country}>
        </p>
        {#if control.error.country}<p class="help is-danger">{control.error.country}</p>{/if}
      </div>
    </div>

  {:else}

    <div class="column is-full">
      <div class="field" >
        <label class="label">URL</label>
        <p class="control">
          <input class:is-danger={control.error.url} class="input" type="text" bind:value={data.url}>
        </p>
        {#if control.error.url}<p class="help is-danger">{control.error.url}</p>{/if}
      </div>
    </div>

  {/if}
</div>

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

<style>

  .viewer {
    border: 1px solid #ddd;
  }

</style>
