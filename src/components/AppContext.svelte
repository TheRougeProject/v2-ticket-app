<script>
  import { setContext } from 'svelte'

  import { writable } from 'svelte/store'

  const pressedKey = writable('')
  setContext('keys', pressedKey)
  const handleWindowKeyDown = key => {
    pressedKey.set(key.code)
  }

</script>

<svelte:window on:keydown={handleWindowKeyDown} />

<slot/>

<div class="version pr-1 is-size-7"><a>{__APP_NAME__} {__APP_VERSION__}</a></div>

<style lang="scss" global>

  @import "../scss/main.scss";

  body > div.app {
    position: relative;
  }

  .version {
    position: absolute;
    bottom: 0;
    right: 0;
    a {
      color: #ddd;
    }
  }

</style>
