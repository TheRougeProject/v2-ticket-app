<script>
  import { onMount } from 'svelte'
  import { ethers } from 'ethers'

  import { chainId, chainData } from 'svelte-ethers-store'
  import blockchain, { getChainTokens } from '$lib/blockchain.js'

  import { types } from '$lib/enums'

  export let data
  export let edit = false

  const control = {
    isLoading: false,
    error: {}
  }

  const assets = []

  export const validate = () => {
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

    return true
  }

  $: tokens = $chainId ? getChainTokens($chainId, $chainData) : {}

</script>

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
