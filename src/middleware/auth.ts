import type { Env } from '../env'
import { verify } from '../lib/jwt'

export async function requireAuth(request: Request, env: Env) {
  const auth = request.headers.get('authorization')
  if (!auth)
    return null

  const token = auth.replace('Bearer ', '')
  const valid = await verify(token, env.JWT_SECRET)

  if (!valid)
    return null

  return JSON.parse(atob(token.split('.')[1]))
}
