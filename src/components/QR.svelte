<script>
  import { onMount } from 'svelte'

  import { AwesomeQR } from 'awesome-qr'

  export let text
  export let src

  let importedClasses = 'is-square'
  export { importedClasses as class }

  let img

  onMount(() => {
    new AwesomeQR({
      text
      //size: 500,
    }).draw().then(dataURL => { img.src = dataURL; src = dataURL })
  })

</script>

<div>
  <figure class="image {importedClasses}">
    <img bind:this={img} src="">
  </figure>
</div>

<style>

div {
  max-width: 500px;
  margin: auto;
}

</style>
