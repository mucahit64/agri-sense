import jwt from '@tsndr/cloudflare-worker-jwt'

export function sign(payload: object, secret: string) {
  return jwt.sign(payload, secret)
}

export function verify(token: string, secret: string) {
  return jwt.verify(token, secret)
}
