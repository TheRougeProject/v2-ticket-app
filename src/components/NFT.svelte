<script>
  import { onMount } from 'svelte'

  import { dev } from '$app/env'

  import { utils, ethers } from 'ethers'

  import { provider, signer, signerAddress } from 'svelte-ethers-store'

  import { calculateStampProof, encodeAnnotatedProof } from '@rouge/contracts/rouge'

  import Rouge from '@rouge/contracts/Rouge.json'

  import blockchain from '$lib/blockchain.js'

  import project from '$stores/project.js'
  import cache from '$stores/nft.js'
  import secret from '$stores/secret.js'

  import { ipfs } from '$lib/actions/ipfs.js'

  import Icon from '$components/Icon.svelte'
  import Modal from '$components/Modal.svelte'
  import QR from '$components/QR.svelte'
  import ClipboardCopy from '$components/tools/ClipboardCopy.svelte'

  export let address
  export let tokenId
  export let noattributes = false
  export let noowner = false

  $: p = $project[address] || {}
  $: nft = $cache[`${address}:${tokenId}`] || {}
  $: channel = p.channels ? (p.channels[nft.channelId] || {}) : {}

  let modal
  let qrActive = false
  let qrData

  const saveLocal = async () => {
    localStorage.setItem('rge:dev:qrData', qrData)
  }

  const openQR = async () => {
    // proxy doesn't work here...
    const rougeContract = new ethers.Contract(
      address,
      Rouge.abi,
      $provider
    )

    const proof = await calculateStampProof({
      contract: blockchain.rouge(address),
      signer: $signer,
      tokenId,
      secret: $secret
    })

    qrData = encodeAnnotatedProof({
      contract: address,
      bearer: $signerAddress,
      tokenId,
      proof,
    })

    // console.log('xxxxxxx', qrData)

    qrActive = true

  }

  let src

</script>

<Modal bind:this={modal} bind:active={qrActive} noCloseButton={true}>
  <div class="modal-card">
    <header class="modal-card-head has-background-light">
      <p class="modal-card-title">{ p.name } x{address}x
        <span class="heading">#{tokenId} Ticket {channel.label}</span>
      </p>
      <button class="delete" aria-label="close" on:click={modal.close}></button>
    </header>
    <section class="modal-card-body" style="position: relative; min-height: 432px;">
      <article class="message is-info">
        <div class="message-body">
          Use this QR code to enter the event
        </div>
      </article>
      <QR text={qrData} bind:src={src}/>
    </section>
    <footer class="modal-card-foot">
      <a class="button is-info" href={src} download={`${p.name}#${tokenId}.png` }>Download</a>
      <ClipboardCopy let:copy text={qrData} tootipLabel="QR code copied!">
        <button class="button" on:click={copy}>Copy as text</button>
      </ClipboardCopy>
      <!-- -
           <button class="button" on:click={() => saveLocal(qrData)}>Send by email</button>
           <button class="button" on:click={modal.close}>Share</button>
      -->
      {#if dev}
      <button class="button" on:click={() => saveLocal(qrData)}>Push2Scanner</button>
      {/if}
    </footer>
  </div>
</Modal>

<div class="card mb-2">
  {#if !noowner}
  <footer class="card-header">
    <p class="card-footer-item is-size-7">owner: {(nft?.owner||'').slice(0,20)}...</p>
  </footer>
  {/if}

  <div class="card-content p-0">
    <div class="media">
      <div class="media-left" style="width: 50%;">
        <figure class="image is-16:9">
          <img alt="main visual" data-ipfs={p.visual} use:ipfs>
        </figure>
      </div>
      <div class="media-content is-size-7">
        <p class="is-size-7">Ticket {channel.label}</p>
        <p class="is-size-7">#{tokenId}</p>
        <p class="is-size-7">{nft.redeemed ? 'used' : 'not used'}</p>
        <a on:click={openQR}>
          <span class="icon">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clip-rule="evenodd"></path><path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z"></path></svg>
          </span>
        </a>
      </div>
    </div>
  </div>

  {#if !noowner}
  <footer class="card-footer">
    <p class="card-footer-item is-size-7">{(nft?.description||'').slice(0,200)}...</p>
  </footer>
  {/if}

  {#if !noattributes && nft?.attributes}

  <footer class="card-footer">
    <p class="has-text-centered">
      {#each nft.attributes as attribut}

      <span class="tag m-1">
        {attribut.trait_type} = {attribut.value}
      </span>

      {/each}

    </p>
  </footer>
  {/if}

</div>

