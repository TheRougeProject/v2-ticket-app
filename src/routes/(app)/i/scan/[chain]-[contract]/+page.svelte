<script>
  import { onMount, onDestroy } from 'svelte'
  import { writable } from 'svelte/store'

  dayjs.extend(localizedFormat)

  export let data;
  $: ({ chain, contract } = data);

  let scanner
  let recording = false

  let proof
  let bearer
  let tokenId

  const control = {
    detected: false
  }

  $: p = $project[contract] || {}
  $: nft = $signerAddress ? ($cache[`${contract}:${tokenId}`] || {}) : {}
  $: channel = p.channels ? (p.channels[nft.channelId] || {}) : {}

  const onQR = async ({ detail: { data } }) => {
    control.detected = true
    console.log('onQR', data)

    try {
      const decoded = await decodeAnnotatedProof(data)

      if (decoded.contract !== contract) {
        throw new Error('not a valid ticket [1]')
      }

      void({ bearer, tokenId, proof } = decoded)

      //void({ bearer, tokenId, proof, ...args } = await decodeAnnotatedProof(data))
      console.log('onQR', { bearer, tokenId, proof })

      // TODO function in contract to check proof...
      const x = await blockchain.rouge(contract).validTokenProof(tokenId, proof)
      console.log('valid proof ? ', x)

      // TODO already checkedin  getTokenInfos


      control.valid = true

    } catch (e) {
      console.log('fail onQR', e)
    }

  }

  const redeemCtx = async () => {
    const params = [[
      [ tokenId, proof, abiEncodeCertificate() ]
    ]]
    console.log('xxx', proof, params)

    return {
      call: blockchain.rouge(contract).redeem,
      params,
      onError: (err, rcpt = {}) => {
        console.log('tx error', err)
        //control.loadText = `Failed....`
      }
    }
  }

  const next = () => {
    control.detected = false
    tokenId = null
    proof = null
    scanner.start()
  }

  onMount( () => {

    const data = localStorage.getItem('rge:dev:qrData')
    if (data) {
      onQR({ detail: { data }})
      localStorage.removeItem('rge:dev:qrData')
    }

  })


</script>

{#if p && !p._isDraft}

<Project {p}>

  <h2 class="title">Check-In</h2>

  {#if control.detected}

  {#if p.name && tokenId}
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <QR text={proof} class="is-128x128"/>
        </div>
        <div class="media-content">
          <p class="title is-4">Ticket {channel.label}</p>
          <p class="subtitle is-5">tokenId #{parseInt(tokenId,16)}</p>
          <p class="subtitle is-7">{(nft?.owner||'')}</p>
        </div>
      </div>
      <!-- -
      <div class="content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <a href="#">#css</a> <a href="#">#responsive</a>
        <br>
        <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
      </div>
      -->
    </div>
  </div>
  {:else}
  <div class="card">

    <article class="message is-danger">
      <div class="message-body">
        Not a valid ticket
      </div>
    </article>

  </div>
  {/if}

  {/if}

  <div class="buttons has-addons is-centered mt-4">
    {#if proof}
    <TxButton class="button is-primary mt-4" submitCtx={redeemCtx} on:success={() => {}}>
      Redeem onchain
    </TxButton>
    <button class="button is-danger"  on:click={next}>Ignore</button>
    {:else}
    {#if recording}
    <div class="field" >
      <button class="button is-info" on:click={scanner.stop}>Turn off camera</button>
      <p class="help">Waiting for QR code detection...</p>
    </div>
    {:else if control.detected}
    <button class="button is-warning" on:click={next}>Restart camera</button>
    {:else}
    <button class="button is-warning" on:click={next}>Turn on camera</button>
    {/if}
    {/if}
  </div>

  <ScanQR bind:this={scanner} bind:recording={recording} on:qr={onQR} />

</Project>

{:else}

<p>nothing here</p>

{/if}

<style lang="scss">

.tabs .button {
  margin: 0 1em 0 1em;
}

.card {
  max-width: 500px;
  margin: auto;
}

figure {
  max-width: 100%;

  canvas {
    width: 100%;
    heigth: 500px;
    background: #000;
  }

}

</style>
