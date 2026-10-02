import { createAnonymousToken } from './anonymous-token'

const authUrl = import.meta.env.VITE_NEON_PUBLIC_AUTH_URL
// Module memory shares one guest-token request across feeds. No localStorage.
const getAnonymousToken = authUrl ? createAnonymousToken(authUrl) : undefined
export const browserPublicApi = {
  url: import.meta.env.VITE_NEON_DATA_API_URL ?? '',
  getAnonymousToken,
}
