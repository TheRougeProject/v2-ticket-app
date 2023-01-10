<script>

  import { onMount, onDestroy } from 'svelte'
  import { utils, Wallet, constants } from 'ethers'

  import { signerAddress, chainId, chainData } from 'svelte-ethers-store'
  import { explorer, formatHash } from '$lib/utils.js'

  import dayjs from 'dayjs'
  import { generateCertificate, abiEncodeCertificate} from '@rouge/contracts/rouge'

  import wallet from '$lib/wallet.js'
  import blockchain from '$lib/blockchain.js'
  import { ipfs } from '$lib/actions/ipfs.js'

  import project from '$stores/project.js'
  import nft from '$stores/nft.js'
  import account from '$stores/account.js'

  import Modal from '$components/Modal.svelte'
  import Icon from '$components/Icon.svelte'
  import EmptyState from '$components/design/EmptyState.svelte'
  import Tickets from '$components/Tickets.svelte'
  import TxButton from '$components/TxAction/Button.svelte'

  const chain = 42170
  const address = '0xaFbe5Ea6b281ddCbb72273953293fE4A852Dbc00'

  $: p = $project[address] || {}

  $: validChain = $chainId === chain

  const bearer = '0x1F809a6131F81369157567062D48aeA6DD269E18'

  $: hash = utils.id(utils.getAddress(bearer))

  $: nfts = $nft.keys ? $nft.keys.filter(key => key.split(':')[0] === address && $nft[key].owner === bearer) : []

  $: balances = $signerAddress ? $account.balancesFor(address, bearer) : {}
  $: checksIn = $signerAddress ? $account.checksIn(address, bearer) : {}

  let walletLabel = null

  $: ok = walletLabel === 'FoxWallet'

  const loaders = {}
  const tickets = {}

  const control = {
    token: {},
    channel: {},
    busy: {}
  }

  let active = false
  let modal
  let selected

  const select = (i) => {
    if (!$signerAddress || !ok) return
    active = true
    selected = i
  }

  const place = tokenId => {
    if (!$signerAddress || !ok) return
    active = false
    control.token = { ...control.token, [selected]: tokenId }
      control.channel[selected] = $nft[`${address}:${tokenId}`].channelId
    control.busy[tokenId] = true
    console.log({ selected, tokenId})
  }

  const redeemCtx = async () => {
    // todo API ?
    const pkey = '0x17db264665862ece7600bd4a565ab5b618871de5cf0ded69f99d94806893d485'
    const signer = new Wallet(pkey)
    const auths = await Promise.all([1,2,3,4,5,6,7,8,9].map(async index => {
      const certificate = await generateCertificate({
        signer,
        contract: address,
        tokenId: control.token[index],
        selector: blockchain.rouge(address).interface.getSighash('redeem'),
        chainId: $chainId
      })
      return [ control.token[index], constants.HashZero, abiEncodeCertificate(certificate) ]
    }))
    return {
      call: blockchain.rouge(address).redeem,
      params: [ auths ],
      onError: (err, rcpt = {}) => {
        console.log('tx error', err)
        //control.loadText = `Failed....`
      },
      onReceipt: () => {
        // update redeem count & co
        project.refresh(p._address)
        //nft.refresh(`${p._address}:${tokenId}`)
      }
    }
  }

  const tiles = 9
  const count = 5
  const getChannel = i => parseInt(hash.slice(i+1, i+2), 16) % count

  let isWinner = false
  const status = (checkin) => {
    console.log('checkin', checkin )
    if (Object.keys(checkin).length !== 9) return false
    for (const tile of [1,2,3,4,5,6,7,8,9]) {
      console.log(`* tile ${tile} needs ${getChannel(tile)} => Id ${checkin[tile - 1]} has ${$nft[`${address}:${checkin[tile - 1]}`].channelId}`)
      if (getChannel(tile) !== $nft[`${address}:${checkin[tile - 1]}`].channelId) return false
    }
    isWinner = true
    return true
  }

  const unsub = signerAddress.subscribe($signerAddress => {
    if (!$signerAddress) return
    const { wallets } = wallet.onboard.state.get()
    walletLabel = wallets[0].label
  })

  let timer
  let hint
  onMount(() => {
    blockchain.initFallback(chain)
    //if (!$signerAddress) blockchain.autoConnect(chain)
    timer = window.setInterval(function () {
      if (hash) {
        hint = Math.floor(Math.random() * tiles) + 1
      }
    }, 1000)
  })
  onDestroy(() => { unsub() && clearInterval(timer) })

</script>

<Modal bind:this={modal} bind:active={active} noCloseButton={true}>
  <div class="modal-card">
    <section class="modal-card-body has-background-light">

      <h2 class="title">Which NFT ticket to place on the tile?</h2>

      {#each nfts.map(key => key.split(':')) as [ address, tokenId ]}
        {#if !$nft[`${address}:${tokenId}`].redeemed && !control.busy[tokenId]}
          <a class="button is-primary is-outlined m-3" on:click={() => place(tokenId)}>
            Place NFT tokenId #{tokenId}
            <figure class="image is-24x24 ml-4"><img data-ipfs={p.channels[$nft[`${address}:${tokenId}`].channelId].icon} use:ipfs /></figure>
          </a>
        {/if}
      {/each}

    </section>
    <footer class="modal-card-foot">
      <a class="button is-black" on:click={modal.close}>Cancel</a>
    </footer>
  </div>
</Modal>

<section class="sectionx">

  <h2 class="title">FoxWallet x Rouge Ticket Bingo</h2>
  <h3 class="subtitle is-size-6 mb-5">{bearer}</h3>

  {#if !$signerAddress || balances?.total < 1}
    <article class="message is-danger">
      <div class="message-body">
        <p><b>Important</b>, join us <a target="_blank" href="https://discord.gg/g9U7D7sU">on Discord</a> to read the instructions & know which tickets you need to buy!</p>
      </div>
    </article>
  {/if}

  {#if p.name}

    <div class="board">

      {#each [1,2,3,4,5,6,7,8,9] as i}
        <div class="btile">
          {#if control.token[i]}
            <figure class="image is-48x48">
              <img data-ipfs={p.channels[control.channel[i]].icon} use:ipfs />
            </figure>
          {:else if true && !active}
            <figure class="image is-48x48">
              <img data-ipfs={p.channels[getChannel(i)].icon} use:ipfs />
            </figure>
          {:else}
            <div class:is-selected={selected === i && active} class="tile-background" on:click={() => select(i)}></div>
            <figure class="image is-48x48">
              <img />
            </figure>
          {/if}
        </div>
      {/each}

    </div>

    {#if $signerAddress}
    {#key control.token}
      <p class="mx-auto mt-2 mb-6 has-text-centered">
        <TxButton disabled={!ok || Object.keys(control.token).length != 9} class="button is-black" submitCtx={redeemCtx} on:success={() => {}}>
          {#if !ok}
            You must use FoxWallet to play
          {:else if Object.keys(control.token).length === 9}
            Redeem your Bingo tickets!
          {:else}
            Complete all tiles to redeem the bingo!
          {/if}
        </TxButton>
      </p>
    {/key}
    {/if}

  {:else}

    <div class="filler">
      <p>loading game...</p>
      <progress class="progress is-warn" />
    </div>

  {/if}

  {#if $nft.keys}
  {#each Object.keys(checksIn) as hash}
  {#if /^0x/.test(hash)}
    <p>
    <span class="icon-text">
      <span>{status(checksIn[hash]) ? 'Winning' : 'Losing'} Bingo redeemed at</span>
      <a class="pl-2 is-size-7" target="_blank" href={explorer($chainData,'tx', hash)}>{formatHash(hash)}</a><Icon name="external-link" size="14" />
    </span>
    </p>
  {/if}
  {/each}
  {/if}

  {#if isWinner}
    <p>
      Well done! You are on the list to win the big 500&nbsp;DAI token big prize!
      <br />
      You are now also eligible to earn 50 thousand points. Enter the Rouge Journey to be able to claim them...
      (see details <a target="_blank" href="https://discord.gg/g9U7D7sU">in our discord channel #FoxWallet-Bingo</a>)
    </p>
  {/if}

  {#if !$signerAddress}

    <div class="columns is-centered is-vcentered mt-5">
      <div class="column is-narrow is-half">
        <h3 class="subtitle"><strong></strong></h3>
        <a class="button is-primary" on:click={() => blockchain.connect(chain)}>Connect Wallet</a>
        <p class="help is-info">Connect FoxWallet on Arbitrum Nova to play</p>
      </div>
      <div class="column is-narrow is-half">
        <img src="https://foxwallet.com/_nuxt/img/link.049be5e.png">
      </div>
    </div>

  {:else if balances.total}

    <hr />

    <div class="box level is-slate">

      <div class="level-left">

        <div class="level-item">
          <a href="/project/{address}/{ $project[address]._isDraft ? 'draft/' : ''}">
            <figure class="image xis-16by9" style="width: 150px;">
              {#if $project[address].visual}
                <img
                  data-ipfs={$project[address].visual}
                            src="/empty_p.png"
                  alt="Project main visual"
                  style="object-fit: cover;"
                  use:ipfs
                />
              {:else}
                <img
                  src="/empty_p.png"
                  alt="Project main visual"
                  style="object-fit: cover;"
                />
              {/if}
            </figure>
          </a>
        </div>

        <div class="level-item">
          <div class="flex is-flex-direction-column is-align-content-space-around summary">
            <div>
              <strong><a href="/i/ticket/{$chainData.shortName}:{address}/">{$project[address].name || '...'}</a></strong>
            </div>

            {#if $project[address].when && $project[address].when.length === 2}
              <small>
                from {dayjs($project[address].when[0]).format('LLLL')}<br /> to {dayjs($project[address].when[1]).format('LLLL')}
              </small>
            {/if}
          </div>
        </div>

      </div>

      <div class="level-right">

        <p class="level-item">
          <a
            on:click={() => tickets[address].load()} disabled={loaders[address] ? true : undefined}
            class="button is-small is-primary is-outlined"><Icon class="mr-1" name="Refresh" />Refresh
          </a>
        </p>
        <p class="level-item">
          <a href="/i/ticket/{$chainData.shortName}:{address}/" class="button is-small is-primary"><Icon class="mr-1" name="ticket" />Get Bingo tickets</a>
        </p>
      </div>

    </div>

    <h2 class="title">Available Bingo tickets</h2>
    <h3 class="subtitle is-size-6 mb-5"><b>Important</b>, check <a target="_blank" href="https://discord.gg/g9U7D7sU">Discord</a> for instructions or help!</h3>

    {#key addressesAsBearer.length}
      <Tickets {address} {bearer} bind:this={tickets[address]} bind:loading={loaders[address]} />
    {/key}

  {:else}

    <h2 class="title">Get Bingo tickets to play!</h2>

    <h3 class="subtitle is-size-6 mb-5"><b>Important</b>, join us <a target="_blank" href="https://discord.gg/g9U7D7sU">on Discord</a> to read the instructions & know tickets you need to buy!</h3>

    <div class="box level is-slate">

      <div class="level-left">

        <div class="level-item">
          <a href="/project/{address}/{ $project[address]._isDraft ? 'draft/' : ''}">
            <figure class="image xis-16by9" style="width: 150px;">
              {#if $project[address].visual}
                <img
                  data-ipfs={$project[address].visual}
                            src="/empty_p.png"
                  alt="Project main visual"
                  style="object-fit: cover;"
                  use:ipfs
                />
              {:else}
                <img
                  src="/empty_p.png"
                  alt="Project main visual"
                  style="object-fit: cover;"
                />
              {/if}
            </figure>
          </a>
        </div>
      </div>

      <div class="level-right">

        <p class="level-item">
          <a href="/i/ticket/{$chainData.shortName}:{address}/" class="button is-small is-primary"><Icon class="mr-1" name="ticket" />Get Bingo tickets</a>
        </p>

      </div>

    </div>



  {/if}

  {#if false}
    <div class="level-item">
      <a class="button is-secondary is-inverted" href="/rewards"><Icon class="mr-1" name="Award" />Rouge Journey</a>
    </div>
  {/if}

</section>

<style lang="scss">

  @import "../../../../../scss/_variables.scss";

  .summary {
    line-height: normal;
  }

  .board {
    margin: auto;
    display: flex;
    flex-wrap: wrap;
    align-content: stretch;
    justify-content: space-between;
    height: 200px;
    width: 200px;

    .btile {
      width: 30%;
      align-self: center;
      position: relative;

      .tile-background {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.5);
        z-index: 1;
        box-shadow: 0 0 0 2px rgba($primary, 0.3);
        &.is-selected {
          background-color: rgba(0, 0, 0, 1);
        }
      }

      figure {
        margin: auto;
      }
    }
  }

</style>
