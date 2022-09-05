<script>
  import { onMount } from 'svelte'
  import { createPopper } from '@popperjs/core'

  import { setClipboard } from '$lib/utils.js'

  export let text = ''
  export let tootipLabel = 'copied!'

  let show = false

  let next, tooltip

  export const copy = () => {
    createPopper(next.previousElementSibling, tooltip, {
      placement: 'top',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 5],
          },
        },
      ],
    })
    setClipboard(text)
    show = true
    setTimeout(() => {show = false}, 1000)
  }

</script>

<div
  bind:this={tooltip}
  class:xvisible={show}
  class:xhidden={!show}
  class="tooltip" id="tooltip" role="tooltip">
  {tootipLabel}
  <div id="arrow" data-popper-arrow></div>
</div>

<slot {copy} /><span class="next" bind:this={next}></span>

<style lang="scss">

.xvisible {
  visibility: visible !important;
  opacity: 1 !important;
}

.xhidden {
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s 1s, opacity 1s linear;
}

.xtooltip {
  visibility: hidden;
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 13px;
}
.next {
  display: none;
}

#tooltip {
  position: absolute;
  background: #333;
  color: white;
  font-weight: bold;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 4px;
}

#arrow,
#arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
}
#tooltip[data-popper-placement^='top'] > #arrow {
  bottom: -4px;
}

#tooltip[data-popper-placement^='bottom'] > #arrow {
  top: -4px;
}

#tooltip[data-popper-placement^='left'] > #arrow {
  right: -4px;
}

#tooltip[data-popper-placement^='right'] > #arrow {
  left: -4px;
}
</style>
