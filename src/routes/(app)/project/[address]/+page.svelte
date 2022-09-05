<script>
  import { onMount } from 'svelte'

  import dayjs from 'dayjs'
  import localizedFormat from 'dayjs/plugin/localizedFormat.js'

  import { chainId } from 'svelte-ethers-store'

  import Icon from '$components/Icon.svelte'
  import Project from '$components/Project.svelte'

  import blockchain from '$lib/blockchain.js'
  import { formatAmount } from '$lib/enums.js'

  import project from '$stores/project.js'

  export let data

  $: ({ address } = data)

  dayjs.extend(localizedFormat)

  $: p = $project[address] || {}

</script>



  <Project {p}  />

  <nav class="level">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Channels</p>
        <p class="title">{p.channels?.length || 0}</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Tickets distributed/sold</p>
        <p class="title">{p.state?.acquired || 0}</p>
      </div>
    </div>
    <!-- -
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Holdings</p>
        <p class="subtitle">
          {#each Object.keys(p.balances||{}) as token}
          {p.balances[token]}<br />
          {/each}
        </p>
      </div>
    </div>
    -->
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Attendees checked-in</p>
        <p class="title">{p.state?.redeemed || 0}</p>
      </div>
    </div>
  </nav>



<style lang="scss">

@import "../../../../scss/_variables.scss";

.subtitle {
  font-weight: $weight-semibold;
  color: hsl(0, 0%, 48%);
}


.notification {
  background-color: #fff;
  color: #333;
  .title {
    font-size: 1.5em;
  }
}


</style>
