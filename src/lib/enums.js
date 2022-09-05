import { utils, constants } from 'ethers'
import { dev } from '$app/env'

const baseChainIds = JSON.parse(import.meta.env.VITE_MAINCHAIN_IDS)
const baseTestnetChainIds = JSON.parse(import.meta.env.VITE_TESTCHAIN_IDS)
export const supportedChainIds = dev ? [ ...baseChainIds, 1337 ] : baseChainIds

export const getSupportedChainIds = testnets  => {
  if (!testnets) return baseChainIds
  return dev ? [ ...baseChainIds,  ...baseTestnetChainIds, 1337 ] : [ ...baseChainIds,  ...baseTestnetChainIds ]
}


// purely informational
export const categories = [
  'Concert',
  'Conference',
  'Convention',
  'Class',
  'Exhibition',
  'Expo',
  'Festival',
  'Fair',
  'Gala',
  'Seminar',
  'Show',
  'Sport',
  'Trade show',
  'Performance',
  'Party',
  'Hackathon',
  'Networking Event',
  'Meet up',
  'Signing',
  'Workshop',
  'Other event',
]

export const themes = [
  'Business',
  'Crypto',

]


// some ux template differ
export const types = [
  'Registration',
  'Ticket',
  'Discount Coupon',
  'Proof Of Attendance',
  'IOU',
]

// TODO support https://tokenlists.org/



// XXX move to utils ?

export const f = decimals => s => utils.commify(utils.formatUnits((s+'').split(' ').join(''), decimals))
export const f6 = f(6)
export const f18 = f(18)

export const formatAmount = ({ decimals = 18, amount = '0', symbol }) => {
  return f(parseInt(decimals))(amount) + ` ${symbol}`
}
