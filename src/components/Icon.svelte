<script>
  import { onMount } from 'svelte'

  import { icons as feather } from 'feather-icons'
  // import * as tabler from 'tabler-icons-svelte'
  // importing all icons is just too slow
  import * as tabler from '$icons/tabler.js'
  import * as icons from '$icons/index.js'

  export let name
  export let size = "100%"
  export let color = 'currentColor'
  export let stroke = 2

  let importedClasses = ''
  export { importedClasses as class }

  onMount(() => {
    if (!icons[name] && tabler[name] && feather[name]) {
      console.warn(`*** UNSUPPORTED ICON NAME *** ${name}`)
    }
  })

</script>

<span class="icon {importedClasses}">
  {#if icons[name]}
  <svelte:component this={icons[name]} />
  {:else if tabler && tabler[name]}
  <svelte:component this={tabler[name]} {color} strokeWidth={stroke} />
  {:else if feather && feather[name]}
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" class="feather feather-{name}">
    {@html feather[name].contents }
  </svg>
  {/if}
</span>

<style lang="scss" global>

  .icon.is-superlarge {
    height: 4rem;
    width: 4rem;
  }

  .icon-tabler {
    height: 100%;
    width: 100%;
  }

</style>
