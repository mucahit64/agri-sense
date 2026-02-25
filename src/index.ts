import type { Env } from './env'
import { login } from './routes/auth'
import { getDevices } from './routes/devices'

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url)

    if (url.pathname === '/auth/login' && req.method === 'POST')
      return login(req, env)

    if (url.pathname === '/devices' && req.method === 'GET')
      return getDevices(req, env)

    return new Response('Not Found', { status: 404 })
  },
}
