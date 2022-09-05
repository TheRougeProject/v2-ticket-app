
import { utils } from 'ethers'

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat.js'

dayjs.extend(localizedFormat)

export const formatDate = date => {
  return date ? dayjs(date).format('LLLL') : ''
}

export const dataURLtoBlob = dataurl => {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

export const setClipboard = value => {
  const tempInput = document.createElement('input')
  tempInput.style = 'position: absolute; left: -1000px; top: -1000px'
  tempInput.value = value
  document.body.appendChild(tempInput)
  tempInput.select()
  document.execCommand('copy')
  document.body.removeChild(tempInput)
}

export const formatIpfsHash = h => {
  // 46 chars
  if (/^ipfs:/.test(h)) h = h.slice(7)
  return  h ? '#' + h.substr(0, 8) : ''
}

export const formatAddress = (a = '', short = true) => {
  try {
    a = utils.getAddress(a)
    return short && a ? a.substr(0, 6) + '...' + a.substr(38, 4) : a
  } catch (e) {
    return ''
  }
}


export const explorer = (chainData, type, id) => {
  if (chainData.explorers && chainData.explorers.length) {
    return `${chainData.explorers[0]?.url}/${type}/${id}`
  } else {
    return '#'
  }
}
