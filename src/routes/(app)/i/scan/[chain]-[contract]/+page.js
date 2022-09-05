export const prerender = false

export const load = async ({ params }) => {
  return {
  type: params.type,
  chain: parseInt(params.chain),
  contract: params.contract
}
}

