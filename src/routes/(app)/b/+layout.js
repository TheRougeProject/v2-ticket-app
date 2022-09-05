
import { error, redirect } from '@sveltejs/kit'

export function load({ locals }) {
  throw redirect(307, '/wallet')
}
