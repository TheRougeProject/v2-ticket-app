<script>
  import { onMount, onDestroy } from 'svelte'
  import { writable } from 'svelte/store'

  import dayjs from 'dayjs'
  import localizedFormat from 'dayjs/plugin/localizedFormat.js'

  import { signer, signerAddress, connected, chainId } from 'svelte-ethers-store'

  import Connected from '$components/Connected.svelte'
  import Icon from '$components/Icon.svelte'
  import Isolate from '$components/design/Isolate.svelte'
  import ScanQR from '$components/ScanQR.svelte'
  import QR from '$components/QR.svelte'

  import { decodeAnnotatedProof, abiEncodeCertificate } from '@rouge/contracts/rouge'

  import blockchain from '$lib/blockchain.js'

  import project from '$stores/project.js'
  import cache from '$stores/nft.js'
  import secret from '$stores/secret.js'

  dayjs.extend(localizedFormat)

  let scanner
  let recording = false
  let detected = false

  let proof
  let contract
  let bearer
  let tokenId

  $: p = $signerAddress ? ($project[contract] || {}) : {}
  $: nft = $signerAddress ? ($cache[`${contract}:${tokenId}`] || {}) : {}
  $: channel = p.channels ? (p.channels[nft.channelId] || {}) : {}

  const onQR = async ({ detail: { data } }) => {
    detected = true
    console.log('onQR', data)
    try {

      void({ contract, bearer, tokenId, proof } = await decodeAnnotatedProof(data))
      console.log('onQR', { contract, bearer, tokenId, proof })


    } catch (e) {
      console.log('fail onQR', e)
    }

  }

  const redeem = async () => {
    const params = [[
      [ tokenId, proof, abiEncodeCertificate() ]
    ]]
    console.log('xxx', proof, params)

    blockchain.rouge(contract).redeem({
      params,
      onTx: tx => {
        console.log('onTx', tx)
        //control.loadText = `the transaction ${tx.hash} has been submitted to the blockhain.`
      },
      onReceipt: rcpt => {
        console.log('onReceipt', rcpt)
        //control.loadText = `check in!`
        // goto(`/project/${proxy}/`)
      },
      onError: (err, rcpt = {}) => {
        console.log('tx error', err)
        //control.loadText = `Failed....`
      }
    })

  }

  const next = () => {
    tokenId = null
    proof = null
    scanner.start()
  }

  onMount( () => {

    const data = localStorage.getItem('rge:dev:qrData')
    if (data) {
      onQR({ detail: { data }})
    }

  })


</script>

<Connected>
  <Isolate>

    <div slot="cover">
      {#if p.visualSrc}
      <img src={p.visualSrc} style="object-fit: cover;">
      {:else}
      <img src="/empty_p.png" style="object-fit: cover;">
      {/if}
    </div>

    <div slot="header">

      {#if p.name}
    <h2 class="title">{ p.name }</h2>

    <h3 class="subtitle mb-1">
      from {dayjs(p.when[0]).format('LLLL')}
      <br />to {dayjs(p.when[1]).format('LLLL')}
    </h3>
    <p class="mb-4">
      <strong>
        <small><a>Add to Calendar</a></small>
      </strong>
    </p>

    <h3 class="subtitle">
      Location
    </h3>

    <h3 class="subtitle">
      Contact
    </h3>

    <h3 class="subtitle">
      Share
    </h3>
      {:else}
      <h2 class="title">Rouge QR scanner</h2>

      {#if detected}
      <h3 class="subtitle mb-1">detected!</h3>
      {:else if recording}
      <h3 class="subtitle mb-1">Waiting for QR code detection...</h3>
      {:else}
      <h3 class="subtitle mb-1">Camera is off!</h3>
      {/if}
      {/if}
    </div>

  </Isolate>


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
      <div class="content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <a href="#">#css</a> <a href="#">#responsive</a>
        <br>
        <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
      </div>
    </div>
  </div>
  {/if}

  <div class="buttons has-addons is-centered">
    {#if !proof && recording}
    <button class="button is-info" on:click={scanner.stop}>Turn off camera</button>
    {:else if !proof}
    <button class="button is-warning" on:click={scanner.start}>Turn on camera</button>
    {/if}
    {#if proof}
    <button class="button is-primary" on:click={redeem}>Redeem onchain</button>
    <button class="button is-danger"  on:click={next}>Ignore</button>
    {/if}
  </div>

  <ScanQR bind:this={scanner} bind:recording={recording} on:qr={onQR} />

  {#if false}
  <Project {p} />
  {/if}

 </Connected>


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
