<script>
  import { onMount } from 'svelte'

  import Modal from '$components/Modal.svelte'
  import Cropper from '$components/Cropper/Cropper.svelte'

  export let active = false
  export let title
  export let image
  export let handler

  let crop = { x: 0, y: 0 };
  let cropSize = { width: 768, height: 432 };
  let zoom = 1
  let factor = 0.5

  const doCrop = async () => {
    const tmpCanvas = document.createElement('canvas')
    tmpCanvas.width = cropSize.width
    tmpCanvas.height = cropSize.height

    const ctx = tmpCanvas.getContext('2d')

    // TODO XXX just export el from cropper ?
    const { imgEl } = cropper.getData()
    console.log('before crop', crop )
    const { x, y, width, height } = crop.croppedAreaPixels

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    console.log({ x, y, width, height, safeArea });

    ctx.drawImage(
      imgEl, x, y, width, height, 0, 0, cropSize.width, cropSize.height
    )

    handler( tmpCanvas.toDataURL("image/png") )

    modal.close()
  }

  let width
  let height

  export const reset = () => {
    crop = { x: 0, y: 0 };
    cropSize = { width: 768, height: 432 };
    zoom = 1
    factor = 0.5
  }


  const onComplete = (e) => {
    // only log in this version
    void({ pixels: { width, height } } = e.detail)
    //console.log('on complete', e, e.detail, crop, cropSize, zoom)
  }

  let modal
  let cropper


</script>

<Modal bind:this={modal} bind:active={active} noCloseButton={true}>
  <div class="modal-card">
    <header class="modal-card-head  has-background-light">
      <p class="modal-card-title">{title} </p>
      <p style="color: #f00;"></p>
      <button class="delete" aria-label="close"  on:click={modal.close}></button>
    </header>
    <section class="modal-card-body  has-background-light" style="position: relative; min-height: 432px;">
      {#if true}
      <Cropper
        {image}
        bind:this={cropper}
        bind:crop
        bind:cropSize
        bind:factor
        bind:zoom
        on:cropcomplete={onComplete}
      />
      {/if}
    </section>
    <footer class="modal-card-foot">
      <p class="card-footer-item"><em>selection = {width}x{height}</em></p>
      <button class="button" on:click={() => {cropper.setZoom(zoom * 1.1)}}>Zoom in</button>
      <button class="button" on:click={() => {cropper.setZoom(zoom * 0.9)}}>Zoom out</button>
      <button class="button is-black" on:click={modal.close}>Cancel</button>
      <button class="button is-primary" on:click={doCrop}>Crop & Save</button>
    </footer>
  </div>
</Modal>
